import type { CurrentUser } from "../../api/typs";
export type FreelancerProfileData = {
  id: number;
  user_id: number;
  firstname: string;
  lastname: string;
  email: string;
  created_at?: string;
  headline?: string;
  bio?: string;
  experience_years?: number;
  is_available?: boolean;
  location?: string;
  profile_image?: string;
};

export type Project = {
  id: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  profile_image?: string;
  client_id?: number;
  title: string;
  description: string;
  deadline: string;
  is_open: boolean;
  created_at?: string;
  project_type: string;
};


export type ClientProfileData = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  created_at?: string;
  profile_image?: string;
  role?:"freelancer"|"client"|"admin"
  projects?: Project[]; 
};

export type HeaderProfilePropsFreelance = {
    profile: FreelancerProfileData,
    setProfile: React.Dispatch<React.SetStateAction<FreelancerProfileData>>
    editMode: boolean
    setEditMode: React.Dispatch<React.SetStateAction<boolean>>
    isOwnProfile: boolean | null;
    hasFreelancerProfile: boolean;
    currentUser: CurrentUser | null;
}
export type Title = { id: number; name: string };
export type Skill = { id: number; name: string };

export type EditProfilePropsFreelance = {
  profile: FreelancerProfileData;
  allTitles: Title[];
  allSkills: Skill[];
  selectedTitles: { label: string; value: number }[];
  selectedSkills: { label: string; value: number }[];
  isNewProfile: Boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setSelectedTitles: (titles: { label: string; value: number }[]) => void;
  setSelectedSkills: (skills: { label: string; value: number }[]) => void;
  handleSave: () => Promise<void>;
}

export type ProfileContentProps ={
  profile: FreelancerProfileData;
  setProfile: React.Dispatch<React.SetStateAction<FreelancerProfileData>>;
  myTitles: Title[];
  mySkills: Skill[];
  setMyTitles: React.Dispatch<React.SetStateAction<Title[]>>;
  setMySkills: React.Dispatch<React.SetStateAction<Skill[]>>;
  hasFreelancerProfile: boolean;
  setHasFreelancerProfile: React.Dispatch<React.SetStateAction<boolean>>;
  isOwnProfile: boolean|null;
  currentUser: CurrentUser;
  editMode:boolean;
  setEditMode:React.Dispatch<React.SetStateAction<boolean>>

}

export type Review = {
  id?: number;
  rating: number;
  comment: string | null;
  created_at: string;
  firstname: string;
  lastname: string;
  user_avatar?: string;
  user_id?: number;
};

export type ReviewsSectionProps = {
  userId: number;
};

export type ViewProfileProps = {
  profile: FreelancerProfileData;
  myTitles: Title[];
  mySkills: Skill[];
  hasFreelancerProfile: boolean;
}

export type PostsSectionProps = {
  currentUser: CurrentUser | null;
  userId?: string;
  isOwnProfile: boolean|null;
}
export type ProjectsListProps ={
  projects: Project[];
  loading: boolean;
  onDelete?: (projectId: number) => Promise<void>;
  onUpdate?: (projectId: number, updatedData: Partial<Project>) => Promise<void>;
  isOwnProfile: boolean;
}
export type HeaderProfilePropsProject = {
  profile: ClientProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ClientProfileData>>;
  addProjectMode: boolean;
  setAddProjectMode: React.Dispatch<React.SetStateAction<boolean>>;
  editProfileMode: boolean;
  setEditProfileMode: React.Dispatch<React.SetStateAction<boolean>>;
  isOwnProfile: boolean;
  currentUser: CurrentUser | null;
};

export type EditProfilePropsProject= {
  profile: ClientProfileData;
  onProfileUpdated: (updatedProfile: ClientProfileData) => void;
  onCancel: () => void;
}
 export type ClientProfileContentProps= {
    profile: ClientProfileData;
    setProfile: React.Dispatch<React.SetStateAction<ClientProfileData>>;
    projects: Project[];
    loading: boolean;
    addProjectMode: boolean;
    setAddProjectMode: React.Dispatch<React.SetStateAction<boolean>>;
    editProfileMode: boolean;
    setEditProfileMode: React.Dispatch<React.SetStateAction<boolean>>;
    isOwnProfile: boolean;
    currentUser: CurrentUser;
    onProjectAdded: () => Promise<void>;
    onProjectDelete?: (projectId: number) => Promise<void>;
    onProjectUpdate?: (projectId: number, updatedData: Partial<Project>) => Promise<void>;
  }
  export type ClientPostsSectionProps= {
    currentUser: CurrentUser | null;
    clientId?: string;
    isOwnProfile: boolean;
  }
  export type AddProjectFormProps = {
  onProjectAdded: () => void;
  onCancel: () => void;
}

export type  UseUserPostsParams = {
  currentUser: CurrentUser | null;
  userId?: string;
  isOwnProfile: boolean|null;
}
  






