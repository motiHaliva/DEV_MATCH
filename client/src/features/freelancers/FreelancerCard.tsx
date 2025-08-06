
import { useState } from "react";
import { Link } from "react-router-dom";
import RatingModal from "./RatingModal";
import { FaMapMarkerAlt, FaClock, FaStar, FaCalendarAlt } from "react-icons/fa";
import { getUserInitials } from "../../utils/userInitials";
import { YMdate } from "../../utils/formatDate";
import type { FreelancerCardProps } from "./type";
import Button from "../../ui/Button";
import { toast } from "react-toastify";

const FreelancerCard = ({ freelancer, onRatingSubmit, currentUserId }: FreelancerCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

const handleRatingSubmit = async (rating: number, comment: string) => {
    if (!onRatingSubmit || !freelancer.id) return;

    setIsSubmittingRating(true);
    try {
      await onRatingSubmit(freelancer.id, rating, comment);
      setIsRatingModalOpen(false);
      toast.success("הדירוג נשלח בהצלחה!");
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error("שליחת הדירוג נכשלה");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const canRate = currentUserId !== freelancer.user_id;
  const formattedDate = YMdate(freelancer.created_at);

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden max-w-full">
        <div className="relative h-24 bg-black/10 overflow-hidden" />

        <Link to={`/freelancerProfile/${freelancer.user_id}`}>
          <div className="relative">
            <div className="absolute -top-9 left-6">
              {freelancer.profile_image ? (
                <img
                  src={freelancer.profile_image}
                  alt="Freelancer avatar"
                  className="w-16 h-16 rounded-full border-4 border-white shadow-lg hover:scale-105 transition-transform duration-200 object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-gradient-to-r from-brand-blueLight to-brand-blue flex items-center justify-center text-white font-bold text-lg hover:scale-105 transition-transform duration-200">
                  {getUserInitials(freelancer.firstname, freelancer.lastname)}
                </div>
              )}
            </div>
          </div>
        </Link>

        <div className="pt-10 px-6 pb-6 overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Link to={`/freelancerProfile/${freelancer.user_id}`}>
                <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200 mb-1 break-words">
                  {freelancer.firstname} {freelancer.lastname}
                </h2>
              </Link>
              <p className="text-blue-600 font-medium text-sm break-words">{freelancer.headline}</p>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${freelancer.is_available ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${freelancer.is_available ? "bg-green-400" : "bg-red-400"}`} />
              {freelancer.is_available ? "Available" : "Unavailable"}
            </span>
          </div>

          <div className="mb-4">
            <p className={`text-gray-600 text-sm leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
              {freelancer.bio}
            </p>
            {freelancer.bio.length > 80 && (
              <Button
                onClick={() => setExpanded(!expanded)}
                text={expanded ? "Show less ▲" : "Show more ▼"}
                variant="text"
                className="mt-2"
              />

            )}
          </div>

          <div className="flex gap-4 mb-4 p-3 bg-gray-50 rounded-lg justify-between">
            <div className="flex items-center gap-2 text-gray-700 text-sm">
              <FaMapMarkerAlt className="text-blue-600" />
              <span className="truncate font-medium">{freelancer.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 text-sm">
              <FaClock className="text-purple-600" />
              <span className="font-medium">{freelancer.experience_years} years exp.</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-100">
            <div className="flex items-center gap-3 ">
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-sm">
                <FaStar className="text-yellow-400 text-sm" />
                <span className="font-bold text-gray-900 text-sm">{freelancer.rating}</span>
                <span className="text-gray-500 text-xs">({freelancer.rating_count})</span>
              </div>
              {canRate && (
                <Button
                  text="Rate"
                  variant="blue"
                  icon={<FaStar size={12} />}
                  onClick={() => setIsRatingModalOpen(true)}
                  className="text-xs  text-white  rounded-full hover:bg-blue-600"
                />
              )}
            </div>
            <div className="flex items-center gap-1 text-gray-600 text-xs bg-white px-2 py-1 rounded-full shadow-sm">
              <FaCalendarAlt className="text-gray-400" />
              <span className="font-medium">Joined {formattedDate}</span>
            </div>
          </div>

          <Link to={`/freelancerProfile/${freelancer.user_id}`} className="flex justify-center">
            <div className="w-2/3 bg-gradient-to-r from-brand-blueLight to-brand-blue text-white px-6 py-3 rounded-xl font-semibold text-center hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg">
              VIEW PROFILE
            </div>
          </Link>
        </div>
      </div>

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
        freelancerName={`${freelancer.firstname} ${freelancer.lastname}`}
        isLoading={isSubmittingRating}
      />
    </>
  );
};

export default FreelancerCard;
