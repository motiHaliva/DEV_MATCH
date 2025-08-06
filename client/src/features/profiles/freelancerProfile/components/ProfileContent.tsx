import React, { useState, useEffect } from "react";
import EditProfile from "./EditProfile";
import ViewProfile from "./ViweProfile";
import HeaderProfile from "./HeaderProfileFreelancer";
import { saveFreelancerProfile ,fetchAllSkillsAndTitles } from '../../../../api/freelancersApi'
import type { ProfileContentProps ,Skill,Title } from "../../type";





const ProfileContent: React.FC<ProfileContentProps> = ({
  profile,
  setProfile,
  myTitles,
  mySkills,
  setMyTitles,
  setMySkills,
  hasFreelancerProfile,
  setHasFreelancerProfile,
  isOwnProfile,
  currentUser,
  editMode,
  setEditMode
}) => {
  const [allTitles, setAllTitles] = useState<Title[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedTitles, setSelectedTitles] = useState<{ label: string; value: number }[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    if (editMode && isOwnProfile) {
      loadAllSkillsAndTitles();
      setSelectedTitles(myTitles.map(t => ({ label: t.name, value: t.id })));
      setSelectedSkills(mySkills.map(s => ({ label: s.name, value: s.id })));
    }
  }, [editMode, myTitles, mySkills, isOwnProfile]);

  const loadAllSkillsAndTitles = async () => {
    try {
      const { titles, skills } = await fetchAllSkillsAndTitles();
      setAllTitles(titles);
      setAllSkills(skills);
    } catch (error) {
      console.error("Error loading all skills and titles:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    const newValue = type === "checkbox" ? checked : type === "number" ? Number(value) : value;
    setProfile(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSave = async () => {
    try {
      const titleIds = selectedTitles.map(t => t.value);
      const skillIds = selectedSkills.map(s => s.value);
      const currentTitleIds = myTitles.map(t => t.id);
      const currentSkillIds = mySkills.map(s => s.id);

      const response = await saveFreelancerProfile(
        profile,
        hasFreelancerProfile,
        titleIds,
        skillIds,
        currentTitleIds,
        currentSkillIds
      );

      if (response && !hasFreelancerProfile) {
        setProfile(prev => ({ ...prev, ...response.data.freelancer, ...response.data.user }));
        setHasFreelancerProfile(true);
      }

      setMyTitles(selectedTitles.map(t => ({ id: t.value, name: t.label })));
      setMySkills(selectedSkills.map(s => ({ id: s.value, name: s.label })));
      setEditMode(false);

    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  return (
    <>
      <HeaderProfile
        profile={profile}
        setProfile={setProfile}
        editMode={editMode}
        setEditMode={setEditMode}
        isOwnProfile={isOwnProfile}
        hasFreelancerProfile={hasFreelancerProfile}
        currentUser={currentUser}
      />

      {!editMode ? (
        <ViewProfile 
          profile={profile} 
          myTitles={myTitles} 
          mySkills={mySkills}
          hasFreelancerProfile={hasFreelancerProfile}
        />
      ) : (
        <EditProfile
          profile={profile}
          allTitles={allTitles}
          allSkills={allSkills}
          isNewProfile={!hasFreelancerProfile}
          selectedTitles={selectedTitles}
          selectedSkills={selectedSkills}
          handleChange={handleChange}
          setSelectedTitles={setSelectedTitles}
          setSelectedSkills={setSelectedSkills}
          handleSave={handleSave}
        />
      )}
    </>
  );
};

export default ProfileContent;