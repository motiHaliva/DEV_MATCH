import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ClientProfileData, Project } from '../../type';
import {
  emptyClientProfile,
  fetchMyClientProfile,
  fetchPublicClientProfile,
  fetchMyProjects,
  deleteProject,
  updateProject
} from '../../../../api/projectsApi'
import ClientProfileContent from '../components/ClientProfileContent'
import ClientPostsSection from './ClientPostsSection';
import { useAuth } from '../../../auth/AuthContext';
import { toast } from "react-toastify"; 

const ClientProfile = () => {
  const { clientId } = useParams<{ clientId?: string }>();
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState<ClientProfileData>(emptyClientProfile);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [addProjectMode, setAddProjectMode] = useState(false);

  const isOwnProfile = !clientId || (currentUser?.id?.toString() === clientId);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      setLoading(true);
      try {
        if (isOwnProfile) {
          const profileData = await fetchMyClientProfile();
          setProfile(profileData);
          await loadProjects();
        } else {
          const profileData = await fetchPublicClientProfile(clientId!);
          setProfile(profileData);
          setProjects(profileData.projects);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setProjects([]);
        toast.error("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, clientId, isOwnProfile]);

  const loadProjects = async () => {
    try {
      const projectsData = await fetchMyProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects.");
    }
  };

  const handleProjectAdded = async () => {
    await loadProjects();
  };

  const handleProjectDelete = async (projectId: number) => {
    try {
      await deleteProject(projectId);
      await loadProjects();
      toast.success("Project deleted successfully!");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project.");
    }
  };

  const handleProjectUpdate = async (projectId: number, updatedData: Partial<Project>) => {
    try {
      await updateProject(projectId, updatedData);
      await loadProjects();
      toast.success("Project updated successfully!");
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">

      {!loading && (
        <>
          <ClientProfileContent
            profile={profile}
            setProfile={setProfile}
            projects={projects}
            loading={loading}
            addProjectMode={addProjectMode}
            setAddProjectMode={setAddProjectMode}
            editProfileMode={editProfileMode}
            setEditProfileMode={setEditProfileMode}
            isOwnProfile={isOwnProfile}
            currentUser={currentUser}
            onProjectAdded={handleProjectAdded}
            onProjectDelete={handleProjectDelete}
            onProjectUpdate={handleProjectUpdate}
          />

          {!addProjectMode && !editProfileMode && (
            <ClientPostsSection
              currentUser={currentUser}
              clientId={clientId}
              isOwnProfile={isOwnProfile}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ClientProfile;