
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchFreelancers } from "../../api/freelancersApi";
import FreelancerCard from "./FreelancerCard";
import type { Freelancer } from "./type";
import type { FreelancerFilters } from "../../api/typs";
import Header from "../../ui/Header";
import Feed from "../../ui/Feed";
import LoadMore from "../../ui/LoadMore"
import axios from "axios";
import { rateFreelancer } from "../../api/freelancersApi";
import { useAuth } from "../auth/AuthContext";
import Loader from "../../ui/Louder";

interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_prev: boolean;
}

interface FetchFreelancersResponse {
  data: Freelancer[];
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize?: number;
}

const ListFreelancers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FreelancerFilters>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    has_next: false,
    has_prev: false
  });
  const { currentUser } = useAuth();

  // פונקציה להמיר URL params למצב
  const getStateFromURL = useCallback(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlPage = parseInt(searchParams.get('page') || '1');
    
    const urlFilters: FreelancerFilters = {};
    
    // מסננים לפי הטייפ שלך
    const isAvailable = searchParams.get('is_available');
    if (isAvailable) urlFilters.is_available = isAvailable;
    
    const minExperience = searchParams.get('min_experience');
    if (minExperience) urlFilters.min_experience = minExperience;
    
    const maxExperience = searchParams.get('max_experience');
    if (maxExperience) urlFilters.max_experience = maxExperience;
    
    const sort = searchParams.get('sort');
    if (sort) urlFilters.sort = sort;

    return {
      search: urlSearch,
      filters: urlFilters,
      page: urlPage
    };
  }, [searchParams]);

  // פונקציה לעדכון ה-URL
  const updateURL = useCallback((newSearch: string, newFilters: FreelancerFilters, page: number = 1) => {
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

  const handleRatingSubmit = async (freelancerId: number, rating: number, comment: string) => {
    try {
      await rateFreelancer(freelancerId, rating, comment);
      await loadFreelancers(filters, 1, search);
      setErrorMessage("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const serverMessage = error.response.data?.error || 'Failed to submit rating';
        setErrorMessage(serverMessage);
        return;
      }
      setErrorMessage('Unexpected error occurred. Please try again.');
    }
  };

  const loadFreelancers = useCallback(async (
    filtersToUse: FreelancerFilters = {}, 
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

      const response = await fetchFreelancers(combinedFilters) as FetchFreelancersResponse;

      setFreelancers(prev => 
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

      // עדכן URL רק אם לא בטעינה ראשונית מURL
      if (updateUrl) {
        updateURL(searchTerm, filtersToUse, page);
      }
      
    } catch (error) {
      console.error("❌ Error loading freelancers:", error);
      setErrorMessage("Failed to load freelancers");

      if (page === 1) {
        setFreelancers([]);
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

  const handleFiltersChange = useCallback((newFilters: FreelancerFilters) => {
    console.log("🔍 Filters changed:", newFilters);
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current_page: 1 }));
    loadFreelancers(newFilters, 1, search);
  }, [loadFreelancers, search]);

  const handleSearchChange = useCallback((searchText: string) => {
    console.log("🔍 Search changed:", searchText);
    setSearch(searchText);
    setPagination(prev => ({ ...prev, current_page: 1 }));
    loadFreelancers(filters, 1, searchText);
  }, [loadFreelancers, filters]);

  const handleLoadMore = useCallback(() => {
    const nextPage = pagination.current_page + 1;
    console.log("📄 Loading more - page:", nextPage);
    loadFreelancers(filters, nextPage, search);
  }, [loadFreelancers, filters, search, pagination.current_page]);

  // ניקוי הודעת שגיאה
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);


  useEffect(() => {

    const { search: urlSearch, filters: urlFilters, page: urlPage } = getStateFromURL();
    
    setSearch(urlSearch);
    setFilters(urlFilters);
    setPagination(prev => ({ ...prev, current_page: urlPage }));
    
    loadFreelancers(urlFilters, urlPage, urlSearch, false);
  }, [getStateFromURL, loadFreelancers]);

  return (
    <div className="">
      <Header onSearch={handleSearchChange} />
      <Feed
        pageType="freelancers"
        onFiltersChange={handleFiltersChange}
      />

      {errorMessage && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 my-4 text-center z-30 w-full">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex flex-wrap justify-around gap-4 mt-3 lg:justify-start lg:p-6 lg:ml-5">
            {freelancers.length > 0 ? (
              freelancers.map((freelancer) => (
                <div key={freelancer.id} className="w-full lg:w-2/3">
                  <FreelancerCard
                    freelancer={freelancer}
                    onRatingSubmit={handleRatingSubmit}
                    currentUserId={currentUser?.id}
                  />
                </div>
                
              ))
      
            ) 
            
            
            
            : (
              <p className="text-center w-full py-10 text-gray-500">
                {search || Object.keys(filters).length > 0 
                  ? "No freelancers found matching your criteria." 
                  : "No freelancers found."
                }
              </p>
            )}

             
          </div>
           <div className="mx-auto lg:mr-72">
                 {!loading && freelancers.length > 0 && (
            <LoadMore
              currentPage={pagination.current_page}
              totalPages={pagination.total_pages}
              hasNext={pagination.has_next}
              totalCount={pagination.total_count}
              currentCount={freelancers.length}
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

export default ListFreelancers;