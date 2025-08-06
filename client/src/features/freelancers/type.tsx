// components/FreelancerCard/type.ts

export type Freelancer = {
  id?: number;
  user_id: number;
  is_available: boolean;
  headline: string;
  bio: string;
  location: string;
  experience_years: number;
  rating: number;
  rating_count: number;
  update_at: string;
  created_at: string;
  firstname: string;
  lastname: string;
  email?: string;
  profile_image?: string;
};

export type FreelancerCardProps = {
  freelancer: Freelancer;
  onRatingSubmit?: (freelancerId: number, rating: number, comment: string) => Promise<void>;
  currentUserId?: number;
};

export type RatingModalProps= {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  freelancerName: string;
  isLoading?: boolean;
}