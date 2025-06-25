import BaseModel from "./BaseModel.js";

const fields = [
  'id',
  'title',
  'description',
  'deadline',
  'is_open',
  'created_at',
  'project_type'
];


const ProjectModel = new BaseModel('projects', fields);

export default ProjectModel;
