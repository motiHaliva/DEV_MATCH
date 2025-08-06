import React from "react";
import HeaderProfileProject from "./HeaderProfileProject";
import EditProfile from "./EditProfile";
import ProjectsList from "./ProjectsList";
import AddProjectForm from "./AddProject";
import type { ClientProfileData, ClientProfileContentProps } from "../../type"



const ClientProfileContent: React.FC<ClientProfileContentProps> = ({
  profile,
  setProfile,
  projects,
  loading,
  addProjectMode,
  setAddProjectMode,
  editProfileMode,
  setEditProfileMode,
  isOwnProfile,
  currentUser,
  onProjectAdded,
  onProjectDelete,
  onProjectUpdate
}) => {
  const handleProjectAdded = async () => {
    setAddProjectMode(false);
    await onProjectAdded();
  };

  const handleProfileUpdated = (updatedProfile: ClientProfileData) => {
    setProfile(updatedProfile);
    setEditProfileMode(false);
  };

  return (
    <>
      <HeaderProfileProject
        profile={profile}
        setProfile={setProfile}
        addProjectMode={addProjectMode}
        setAddProjectMode={setAddProjectMode}
        editProfileMode={editProfileMode}
        setEditProfileMode={setEditProfileMode}
        isOwnProfile={isOwnProfile}
        currentUser={currentUser}
      />
      
      <div className="mt-8 space-y-10 mb-8">
        {isOwnProfile && addProjectMode ? (
          <AddProjectForm
            onProjectAdded={handleProjectAdded}
            onCancel={() => setAddProjectMode(false)}
          />
        ) : editProfileMode ? (
          <EditProfile
            profile={profile}
            onProfileUpdated={handleProfileUpdated}
            onCancel={() => setEditProfileMode(false)}
          />
        ) : (
          <ProjectsList
            projects={projects}
            loading={loading}
            isOwnProfile={isOwnProfile}
            onDelete={isOwnProfile ? onProjectDelete : undefined}
            onUpdate={isOwnProfile ? onProjectUpdate : undefined}
          />
        )}
      </div>
    </>
  );
};

export default ClientProfileContent;