
import type { Freelancer } from "../features/freelancers/type";
import type { Project } from "../features/projects/type";
import type {  Review } from "../features/profiles/type";



export type CurrentUser = {
  id: number;
  role: "freelancer" | "client" | "admin"| null;
  firstname: string;
  lastname: string;
  email: string;
  created_at: string;
  profile_image: string;
};

export type SignUpProps = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: "freelancer" | "client" | "admin"|null;
};


export type FreelancerFilters = {
  search?: string;
  is_available?: string;
  min_experience?: string;
  max_experience?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

export type ProjectFilters = {
  search?: string;
  type?: string;
  is_open?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

export type PostFilters = {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

export type NewProjectPayload = {
  title: string;
  description: string;
  deadline: string;
  project_type: string;
  client_id?: number;
};

export type ReviewsResponse = {
  data: Review[];
  totalCount: number;
};

export type FreelanceResponse = {
  data: Freelancer[];
};

export type ProjectsResponse = {
  data: Project[];
};