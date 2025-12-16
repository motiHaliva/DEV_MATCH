import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProjects } from "../../api/projectsApi"
import ProjectCard from "./ProjectCard";
import type { Project } from "./type";
import type { ProjectFilters } from "../../api/typs"
import Header from "../../ui/Header";
import Feed from "../../ui/Feed";
import LoadMore from "../../ui/LoadMore";
import { toast } from "react-toastify";
import Loader from "../../ui/Louder";

interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface FetchProjectsResponse {
  data: Project[];
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize?: number;
}

const ListProjects = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    has_next: false,
    has_prev: false
  });

  // פונקציה להמיר URL params למצב
  const getStateFromURL = useCallback(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlPage = parseInt(searchParams.get('page') || '1');
    
    const urlFilters: ProjectFilters = {};
    
    // מסננים לפי הטייפ שלך
    const type = searchParams.get('type');
    if (type) urlFilters.type = type;
    
    const isOpen = searchParams.get('is_open');
    if (isOpen) urlFilters.is_open = isOpen;
    
    const sort = searchParams.get('sort');
    if (sort) urlFilters.sort = sort;

    return {
      search: urlSearch,
      filters: urlFilters,
      page: urlPage
    };
  }, [searchParams]);

  // פונקציה לעדכון ה-URL
  const updateURL = useCallback((newSearch: string, newFilters: ProjectFilters, page: number = 1) => {
    const params = new URLSearchParams();
    
    // הוסף חיפוש אם קיים
    if (newSearch.trim()) {
      params.set('search', newSearch.trim());
    }
    
    // הוסף עמוד אם לא הראשון
    if (page > 1) {
      params.set('page', page.toString());
    }
    
    // הוסף מסננים
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });
    
    setSearchParams(params);
  }, [setSearchParams]);

  // פונקציה לטעינת פרויקטים עם סינונים ופגינציה
  const loadProjects = useCallback(async (
    filtersToUse: ProjectFilters = {}, 
    page: number = 1,
    searchTerm: string = "",
    updateUrl: boolean = true
  ) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const combinedFilters = {
        ...filtersToUse,
        ...(searchTerm.trim() && { search: searchTerm.trim() }),
        page,
        limit: 10
      };
      
      console.log("📋 Loading projects with filters:", combinedFilters);
      const response = await fetchProjects(combinedFilters) as FetchProjectsResponse;
      
      console.log("📊 Response from server:", response);
      
      setProjects(prev => 
        page === 1 
          ? (response.data || [])
          : [...prev, ...(response.data || [])]
      );

      setPagination({
        current_page: response.page || page,
        total_pages: response.totalPages || 1,
        total_count: response.totalCount || 0,
        has_next: (response.page || page) < (response.totalPages || 1),
        has_prev: (response.page || page) > 1
      });

      if (updateUrl) {
        updateURL(searchTerm, filtersToUse, page);
      }
      
    } catch (error) {
      console.error("❌ Error loading projects:", error);
      toast.error("Failed to load projects.");
      setErrorMessage("Failed to load projects");
      
      if (page === 1) {
        setProjects([]);
        setPagination({
          current_page: 1,
          total_pages: 1,
          total_count: 0,
          has_next: false,
          has_prev: false
        });
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [updateURL]);

  // טיפול בשינוי סינונים מהפיד
  const handleFiltersChange = useCallback((newFilters: ProjectFilters) => {
    console.log("🔍 Filters changed:", newFilters);
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current_page: 1 }));
    loadProjects(newFilters, 1, search);
  }, [loadProjects, search]);

  // טיפול בשינוי חיפוש
  const handleSearchChange = useCallback((searchText: string) => {
    console.log("🔍 Search changed:", searchText);
    setSearch(searchText);
    setPagination(prev => ({ ...prev, current_page: 1 }));
    loadProjects(filters, 1, searchText);
  }, [loadProjects, filters]);

  // טיפול בטעינת עמוד נוסף
  const handleLoadMore = useCallback(() => {
    const nextPage = pagination.current_page + 1;
    console.log("📄 Loading more projects - page:", nextPage);
    loadProjects(filters, nextPage, search);
  }, [loadProjects, filters, search, pagination.current_page]);

  // ניקוי הודעת שגיאה
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // טעינה ראשונית מה-URL
  useEffect(() => {
    console.log("🚀 Initial load projects from URL");
    const { search: urlSearch, filters: urlFilters, page: urlPage } = getStateFromURL();
    
    // עדכן state מה-URL
    setSearch(urlSearch);
    setFilters(urlFilters);
    setPagination(prev => ({ ...prev, current_page: urlPage }));
    
    // טען נתונים (ללא עדכון URL כי אנו כבר קוראים ממנו)
    loadProjects(urlFilters, urlPage, urlSearch, false);
  }, [getStateFromURL, loadProjects]);

  return (
    <div className="">
      <Header onSearch={handleSearchChange} />
      <Feed 
        pageType="projects"
        onFiltersChange={handleFiltersChange}
      />

      {errorMessage && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 my-4 text-center z-30">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex flex-wrap justify-around gap-4 mt-3 lg:justify-start lg:p-6 lg:ml-5">
            {projects.length > 0 ? (
              projects.map((project) => (
                <div key={project.id} className="w-full lg:w-2/3">
                  <ProjectCard project={project} />
                </div>
              ))
            ) : (
              <p className="text-center w-full py-10 text-gray-500">
                {search || Object.keys(filters).length > 0 
                  ? "No projects found matching your criteria." 
                  : "No projects found."
                }
              </p>
            )}
          </div>
  <div className="mx-auto lg:mr-72">

          {!loading && projects.length > 0 && (
            <LoadMore
              currentPage={pagination.current_page}
              totalPages={pagination.total_pages}
              hasNext={pagination.has_next}
              totalCount={pagination.total_count}
              currentCount={projects.length}
              onLoadMore={handleLoadMore}
              loading={loadingMore}
            />
          )}
          </div>
        </>
      )}
    </div>
  );
};

export default ListProjects;