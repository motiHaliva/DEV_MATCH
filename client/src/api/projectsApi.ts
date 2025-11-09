import type { ClientProfileData } from "../features/profiles/type";
import type { Project } from "../features/projects/type";
import axiosInstance from "./axiosInstance";
import type { NewProjectPayload, ProjectFilters, ProjectsResponse } from "./typs";

export const emptyClientProfile: ClientProfileData = {
  id: 0,
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  profile_image: '',
  created_at: '',
  projects: []
};

export const fetchProjects = async (filters: ProjectFilters = {}) => {
  try {
    const response = await axiosInstance.get<ProjectsResponse>("/projects", { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const fetchMyProjects = async (): Promise<Project[]> => {
  try {
    const res = await axiosInstance.get('/projects/me');
    return res.data.data || [];
  } catch (error) {
    console.error("Error loading user projects:", error);
    return [];
  }
};

export const createProject = async (payload: NewProjectPayload) => {
  try {
    const response = await axiosInstance.post('/projects', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const updateProject = async (projectId: number, updatedData: Partial<Project>) => {
  try {
    const response = await axiosInstance.put(`/projects/${projectId}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

export const deleteProject = async (projectId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/projects/${projectId}`);
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};



export const fetchMyClientProfile = async () => {
  try {
    const userRes = await axiosInstance.get('/users/me');
    return {
      ...emptyClientProfile,
      ...userRes.data,
      projects: [],
    };
  } catch (error) {
    console.error('Error fetching client profile:', error);
    return emptyClientProfile;
  }
};

export const fetchPublicClientProfile = async (clientId: string) => {
  try {
    const response = await axiosInstance.get(`/projects/public/${clientId}`);
    const { id, firstname, lastname, email, profile_image, created_at, projects: projectResult } = response.data;
    
    return {
      id,
      firstname,
      lastname,
      email,
      profile_image,
      created_at,
      projects: projectResult?.data || [],
    };
  } catch (error) {
    console.error('Error fetching public client profile:', error);
    throw error;
  }
};

