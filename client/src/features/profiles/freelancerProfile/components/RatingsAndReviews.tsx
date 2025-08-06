import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import Button from "../../../../ui/Button";
import type { Review, ReviewsSectionProps } from '../../type'
import { fetchFreelancerReviews } from "../../../../api/freelancersApi";
import { toast } from "react-toastify"; // <-- add this import

const RatingsAndReviews = ({ userId }: ReviewsSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadReviews();
    } else {
      setLoading(false);
      setReviews([]);
    }
  }, [userId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const responseData = await fetchFreelancerReviews(userId);

      const reviewsArray: Review[] = Array.isArray(responseData?.data) ? responseData.data : [];

      const reviewsWithIds = reviewsArray.map((review, index) => ({
        ...review,
        id: review.id || index + 1,
      }));

      setReviews(reviewsWithIds);
      const totalFromResponse = responseData?.totalCount || reviewsWithIds.length;
      setTotalReviews(totalFromResponse);

      if (reviewsWithIds.length > 0) {
        const sum = reviewsWithIds.reduce((acc, review) => acc + review.rating, 0);
        setAverageRating(sum / reviewsWithIds.length);
      } else {
        setAverageRating(0);
        setTotalReviews(0);
      }
    } catch (error: any) {
      console.error("Error loading reviews:", error);

      if (error.response?.status === 404) {
        // setError("Freelancer profile not found");
        toast.error("Freelancer profile not found");
      } else if (error.response?.status >= 500) {
        setError("Server error. Please try again later.");
        toast.error("Server error. Please try again later.");
      } else {
        setError("Failed to load reviews");
        toast.error("Failed to load reviews");
      }

      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('he-IL');
    } catch {
      return 'Invalid date';
    }
  };


  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <Button
            text="Try Again"
            variant="primary"
            onClick={loadReviews}
            className="mt-2"
          />
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <FaStar size={48} />
          </div>
          <p className="text-gray-600 text-lg">No reviews yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Reviews will appear here once clients start rating this freelancer
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>

      <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-1 text-yellow-400">
          <FaStar />
          <span className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
        </div>
        <span className="text-gray-600">({totalReviews} reviews)</span>
      </div>

      <div className="space-y-6">
        {reviews.map((review, index) => (
          <div key={review.id ?? index} className="border-b border-gray-200 pb-6 last:border-b-0">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                {review.user_avatar ? (
                  <img
                    src={review.user_avatar}
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-gray-500 text-sm">${review.firstname[0]}${review.lastname[0]}</span>`;
                      }
                    }}
                  />
                ) : (
                  <span className="text-gray-500 text-sm">
                    {review.firstname?.[0] || '?'}{review.lastname?.[0] || '?'}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">
                    {review.firstname} {review.lastname}
                  </h4>
                  <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`text-sm ${star <= review.rating ? "text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>

                {review.comment && (
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalReviews > reviews.length && (
        <div className="text-center mt-6">
          <Button
            text="Load More Reviews"
            variant="blue"
            onClick={() => {
              console.log("Load more reviews clicked");
            }}
          />
        </div>
      )}
    </div>
  );
}

export default RatingsAndReviews;
