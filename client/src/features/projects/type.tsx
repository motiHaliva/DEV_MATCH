// type.ts או באותו קובץ
export type Project = {
  id: number;
  title: string;
  description: string;
  deadline: string;
  is_open: boolean;
  project_type: string;
  created_at: string;
  client_firstname: string;
  client_lastname: string;
  client_email: string;
  client_avatar?: string;
  client_id?: number;
};

export type ProjectCardProps = {
  project: Project;
};
