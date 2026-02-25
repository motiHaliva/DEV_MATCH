import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { FreelancerProfileData, Title, Skill } from "../../type";
import {
  emptyFreelancerProfile,
  fetchMyFreelancerProfile,
  fetchPublicFreelancerProfile,
} from "../../../../api/freelancersApi";
import { fetchMyProjects } from "../../../../api/projectsApi";
import { createRequest } from "../../../../api/requestsApi";
import ProfileContent from "./ProfileContent";
import PostsSection from "./PostsSection";
import { useAuth } from "../../../auth/AuthContext";
import { toast } from "react-toastify";
import Button from "../../../../ui/Button";

const FreelancerProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState<FreelancerProfileData>(emptyFreelancerProfile);
  const [myTitles, setMyTitles] = useState<Title[]>([]);
  const [mySkills, setMySkills] = useState<Skill[]>([]);
  const [hasFreelancerProfile, setHasFreelancerProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  const isOwnProfile =
    !userId || (currentUser && userId === currentUser.id.toString());

  /* =========================
     Fetch Profile
  ========================= */

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      setLoading(true);
      try {
        let result;

        if (isOwnProfile) {
          result = await fetchMyFreelancerProfile();
        } else {
          result = await fetchPublicFreelancerProfile(userId!);
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

  /* =========================
     Handle Match (Client → Freelancer)
  ========================= */

  const handleMatch = async () => {
    if (!currentUser) return;

    if (currentUser.role !== "client") {
      toast.warning("Only clients can send match requests.");
      return;
    }

    if (!userId) {
      toast.error("Invalid freelancer.");
      return;
    }

    if (isOwnProfile) {
      toast.warning("You cannot send match to yourself.");
      return;
    }

    try {
      setIsMatching(true);

      // שליפת הפרויקטים של הלקוח
      const projects = await fetchMyProjects();

      if (!projects || projects.length === 0) {
        toast.warning("You must create a project before sending a match.");
        return;
      }

      const firstProject = projects[0];

      await createRequest({
        to_user_id: Number(userId),
        project_id: firstProject.id,
      });

      toast.success(`Match sent for project: ${firstProject.title}`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.info("Request already exists.");
      } else {
        toast.error("Failed to send match request.");
      }
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="bg-white min-h-screen shadow-lg p-4">
      <div className="flex flex-col gap-7">

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

            {!isOwnProfile && currentUser?.role === "client" && (
              <div className="flex justify-center p-6 pt-0">
                <Button
                  text={isMatching ? "Sending..." : "MATCH"}
                  variant="blue"
                  className="px-8 py-3 text-base font-semibold"
                  onClick={handleMatch}
                  disabled={isMatching}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FreelancerProfile;