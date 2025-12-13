import type { FreelancerProfileData } from "../features/profiles/type";
import axiosInstance from "./axiosInstance";
import type { FreelanceResponse, FreelancerFilters, ReviewsResponse } from "./typs";

export const emptyFreelancerProfile: FreelancerProfileData = {
  id: 0,
  user_id: 0,
  firstname: "",
  lastname: "",
  email: "",
  phone: "",  
  created_at: "",
  headline:  "",
  bio: "",
  experience_years: 0,
  is_available: false,
  location: "",
  profile_image: "",
};
export const fetchFreelancers = async (filters: FreelancerFilters = {}) => {
  try {
    const response = await axiosInstance.get<FreelanceResponse>("/freelancers", { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching freelancers:', error);
    throw error;
  }
};

export const fetchMyFreelancerProfile = async () => {
  try {
    const res = await axiosInstance.get(`/freelancers/me`);
    const data = res.data;
    
    const hasFreelancerData = data.freelancer && (
      data.freelancer.id || 
      data.freelancer.headline || 
      data.freelancer.bio || 
      data.freelancer.location
    );

    if (!hasFreelancerData) {
      const profileData = data.user || {};
      return {
        profile: { ...emptyFreelancerProfile, ...profileData },
        hasFreelancerProfile: false,
        titles: [],
        skills: []
      };
    }

    return {
      profile: { ...emptyFreelancerProfile, ...data.user, ...data.freelancer },
      hasFreelancerProfile: true,
      titles: data.titles || [],
      skills: data.skills || []
    };
  } catch (error) {
    const userRes = await axiosInstance.get(`/users/me`);
    const profileData = userRes.data;
    return {
      profile: { ...emptyFreelancerProfile, ...profileData },
      hasFreelancerProfile: false,
      titles: [],
      skills: []
    };
  }
};

export const fetchPublicFreelancerProfile = async (userId: string) => {
  const res = await axiosInstance.get(`/freelancers/public/${userId}`);
  const data = res.data;
  
  return {
    profile: { ...emptyFreelancerProfile, ...data.user, ...data.freelancer },
    hasFreelancerProfile: true,
    titles: data.titles || [],
    skills: data.skills || []
  };
};

export const saveFreelancerProfile = async (
  profile: FreelancerProfileData,
  hasFreelancerProfile: boolean,
  titleIds: number[],
  skillIds: number[],
  currentTitleIds: number[],
  currentSkillIds: number[]
) => {
  const userUpdates = {
    firstname: profile.firstname,
    lastname: profile.lastname,
    email: profile.email,
    profile_image: profile.profile_image,
  };

  const freelancerData = {
    headline: profile.headline,
    bio: profile.bio,
    location: profile.location,
    experience_years: profile.experience_years,
    is_available: profile.is_available,
  };

  let response;
  if (!hasFreelancerProfile) {
    response = await axiosInstance.post("/freelancers", {
      ...userUpdates,
      ...freelancerData,
    });
  } else {
    await axiosInstance.put("/freelancers/me", {
      ...userUpdates,
      ...freelancerData,
    });
  }

  // Remove old titles and skills
  const titlesToRemove = currentTitleIds.filter(id => !titleIds.includes(id));
  for (const titleId of titlesToRemove) {
    await axiosInstance.delete(`/titles/${titleId}`);
  }

  const skillsToRemove = currentSkillIds.filter(id => !skillIds.includes(id));
  for (const skillId of skillsToRemove) {
    await axiosInstance.delete(`/skills/${skillId}`);
  }


  await axiosInstance.post("/titles", { titles: titleIds });
  await axiosInstance.post("/skills", { skills: skillIds });

  return response;
};

export const updateFreelancerProfile = async (profileData: Partial<FreelancerProfileData>) => {
  const response = await axiosInstance.put('/freelancers/me', profileData);
  return response.data;
};

export const fetchFreelancerReviews = async (userId: number): Promise<ReviewsResponse> => {
  const response = await axiosInstance.get<ReviewsResponse>(`/freelancers/reviews/${userId}`);
  return response.data;
};

export const rateFreelancer = async (
  freelancerId: number,
  rating: number,
  comment: string
) => {
  const response = await axiosInstance.post(`/freelancer-reviews/${freelancerId}`, {
    rating,
    comment,
  });
  return response.data;
};
export const fetchAllSkillsAndTitles = async () => {
  const [titlesRes, skillsRes] = await Promise.all([
    axiosInstance.get("/titles"),
    axiosInstance.get("/skills"),
  ]);
  
  return {
    titles: titlesRes.data,
    skills: skillsRes.data
  };
};