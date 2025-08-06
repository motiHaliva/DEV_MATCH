import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import PostCard from "./PostCard";
import type { Post } from "./type";
import { getPosts } from "../../api/postsApi";
import Feed from "../../ui/Feed";
import Header from "../../ui/Header";
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

interface GetPostsResponse {
  data: Post[];
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize?: number;
}

const ListPosts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
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
    
    return {
      search: urlSearch,
      page: urlPage
    };
  }, [searchParams]);

  // פונקציה לעדכון ה-URL
  const updateURL = useCallback((newSearch: string, page: number = 1) => {
    const params = new URLSearchParams();
    
    // הוסף חיפוש אם קיים
    if (newSearch.trim()) {
      params.set('search', newSearch.trim());
    }
    
    // הוסף עמוד אם לא הראשון
    if (page > 1) {
      params.set('page', page.toString());
    }
    
    setSearchParams(params);
  }, [setSearchParams]);

  // פונקציה לטעינת פוסטים עם חיפוש ופגינציה
  const fetchPosts = useCallback(async (
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
      const filters = {
        ...(searchTerm.trim() && { search: searchTerm.trim() }),
        page: page.toString(),
        limit: "10"
      };

      console.log("📋 Loading posts with filters:", filters);
      const response = await getPosts(filters) as GetPostsResponse;

      console.log("📊 Response from server:", response);

      setPosts(prev => page === 1
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
        updateURL(searchTerm, page);
      }

    } catch (error) {
      console.error("❌ Error fetching posts:", error);
      toast.error("Failed to fetch posts. Please try again.");

      if (page === 1) {
        setPosts([]);
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

  // טיפול בשינוי חיפוש
  const handleSearchChange = useCallback((searchText: string) => {
    console.log("🔍 Search changed:", searchText);
    setSearch(searchText);
    setPagination(prev => ({ ...prev, current_page: 1 }));
    fetchPosts(1, searchText);
  }, [fetchPosts]);

  // טיפול בטעינת עמוד נוסף
  const handleLoadMore = useCallback(() => {
    const nextPage = pagination.current_page + 1;
    console.log("📄 Loading more posts - page:", nextPage);
    fetchPosts(nextPage, search);
  }, [fetchPosts, search, pagination.current_page]);

  // טעינה ראשונית מURL
  useEffect(() => {
    console.log("🚀 Initial load from URL");
    const { search: urlSearch, page: urlPage } = getStateFromURL();
    
    setSearch(urlSearch);
    setPagination(prev => ({ ...prev, current_page: urlPage }));
    
    fetchPosts(urlPage, urlSearch, false);
  }, [getStateFromURL, fetchPosts]);

  return (
    <div className="">
      <Header onSearch={handleSearchChange} />
      <Feed />

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex flex-wrap justify-around ">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="w-full lg:w-2/3 mb-4">
                  <PostCard post={post} />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-8">
                <div className="text-gray-500">
                  {search
                    ? "No posts found matching your search."
                    : "No posts found"
                  }
                </div>
              </div>
            )}
          </div>

          {!loading && posts.length > 0 && (
            <LoadMore
              currentPage={pagination.current_page}
              totalPages={pagination.total_pages}
              hasNext={pagination.has_next}
              totalCount={pagination.total_count}
              currentCount={posts.length}
              onLoadMore={handleLoadMore}
              loading={loadingMore}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ListPosts;