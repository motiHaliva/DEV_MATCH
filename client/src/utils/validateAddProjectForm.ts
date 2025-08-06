export type ProjectFormInput = {
  title: string;
  description: string;
  deadline: string;
  project_type: string;
  is_open: boolean;
};
export const validateAddProjectForm = (formData: ProjectFormInput): string | null => {
  if (!formData.title.trim() || formData.title.length < 3) {
    return "Title must be at least 3 characters.";
  }

  if (!formData.description.trim() || formData.description.length < 10) {
    return "Description must be at least 10 characters.";
  }

  const allowedTypes = ["website", "app", "ecommerce"];
  if (!allowedTypes.includes(formData.project_type)) {
    return "Invalid project type.";
  }

  if (formData.deadline) {
    const deadlineDate = new Date(formData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to ignore time
    if (deadlineDate < today) {
      return "Deadline cannot be in the past.";
    }
  }

  return null;
};
