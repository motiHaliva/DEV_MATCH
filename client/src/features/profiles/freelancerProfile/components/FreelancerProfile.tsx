import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { FreelancerProfileData, Title, Skill } from "../../type";
import { emptyFreelancerProfile,fetchMyFreelancerProfile ,fetchPublicFreelancerProfile } from "../../../../api/freelancersApi";
import ProfileContent from "./ProfileContent";
import PostsSection from "./PostsSection";
import { useAuth } from "../../../auth/AuthContext";
import { toast } from "react-toastify"; // <-- add this import

const FreelancerProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState<FreelancerProfileData>(emptyFreelancerProfile);
  const [myTitles, setMyTitles] = useState<Title[]>([]);
  const [mySkills, setMySkills] = useState<Skill[]>([]);
  const [hasFreelancerProfile, setHasFreelancerProfile] = useState(false);
  const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false); 

  const isOwnProfile = !userId || (currentUser && userId === currentUser.id.toString());

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      setLoading(true);
      try {
        let result;

        if (isOwnProfile) {
          result = await fetchMyFreelancerProfile();
        } else {
          try {
            result = await fetchPublicFreelancerProfile(userId!);
          } catch (error: any) {
            if (error.response?.status === 404) {
              toast.error("Profile not found");
              setLoading(false);
              return;
            }
            throw error;
          }
        }

        setProfile(result.profile);
        setMyTitles(result.titles);
        setMySkills(result.skills);
        setHasFreelancerProfile(result.hasFreelancerProfile);

      } catch (error: any) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, userId, isOwnProfile]);

  return (
    <div className="bg-white min-h-screen shadow-lg justify-center p p-4">
      <div className="flex flex-col gap-7 justify-center">
     

  {!loading && currentUser && (
  <>
    <ProfileContent
      profile={profile}
      setProfile={setProfile}
      myTitles={myTitles}
      mySkills={mySkills}
      setMyTitles={setMyTitles}
      setMySkills={setMySkills}
      hasFreelancerProfile={hasFreelancerProfile}
      setHasFreelancerProfile={setHasFreelancerProfile}
      isOwnProfile={isOwnProfile}
      currentUser={currentUser}
      editMode={editMode}
      setEditMode={setEditMode}
    />
  

        
   {!editMode && (                   
              <PostsSection
                currentUser={currentUser}
                userId={userId}
                isOwnProfile={isOwnProfile}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FreelancerProfile;