import { FaMapMarkerAlt, FaCheckCircle, FaBriefcase, FaUser, FaStar } from "react-icons/fa";
import type { ViewProfileProps } from "../../type";
import RatingsAndReviews from './RatingsAndReviews';




const ViewProfile = ({ profile, myTitles, mySkills, hasFreelancerProfile }: ViewProfileProps) => {
  return (
    <div className="space-y-8 max-w-full overflow-hidden">
      {hasFreelancerProfile && (
        <>
          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 px-6 py-3 rounded-full text-base font-semibold transition-all duration-200
                ${profile.is_available
                  ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                  : "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200"
                }`}>
                <FaCheckCircle className={`${profile.is_available ? "text-green-600" : "text-red-600"} w-5 h-5`} />
                <span className="break-words">{profile.is_available ? "Available for work" : "Not available"}</span>
              </div>
            </div>
          </div>

          {(profile.headline || profile.bio) && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <FaUser className="text-blue-600 text-xl flex-shrink-0" />
                <h2 className="text-2xl font-bold text-gray-900 break-words">About</h2>
              </div>

              {profile.headline && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200 break-words overflow-wrap-anywhere">
                    {profile.headline}
                  </h3>
                </div>
              )}

              {profile.bio && (
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base break-words overflow-wrap-anywhere">
                    {profile.bio}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <FaBriefcase className="text-blue-600 text-xl flex-shrink-0" />
              <h2 className="text-2xl font-bold text-gray-900">Professional Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl min-w-0">
                <FaMapMarkerAlt className="text-blue-500 text-xl flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500 font-medium">Location</p>
                  <p className="text-gray-800 font-semibold break-words overflow-wrap-anywhere">{profile.location || "Not specified"}</p>
                </div>
              </div>

              {profile.experience_years && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl min-w-0">
                  <FaStar className="text-yellow-500 text-xl flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500 font-medium">Experience</p>
                    <p className="text-gray-800 font-semibold">{profile.experience_years} years</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {myTitles.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 overflow-hidden">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">T</span>
                </div>
                <span className="break-words">Specializations</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myTitles.map((title) => (
                  <div
                    key={title.id}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 min-w-0"
                  >
                    <span className="font-semibold text-base block text-center break-words overflow-wrap-anywhere">
                      {title.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mySkills.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 overflow-hidden">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-600 font-bold text-sm">S</span>
                </div>
                <span className="break-words">Skills</span>
              </h2>
              <div className="flex flex-wrap gap-3">
                {mySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-300 px-5 py-3 text-yellow-800 rounded-full font-semibold shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 text-base break-words overflow-wrap-anywhere min-w-0 max-w-full"
                  >
                    {skill.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <RatingsAndReviews userId={profile.user_id} />
        </>
      )}
    </div>
  );
};

export default ViewProfile;
