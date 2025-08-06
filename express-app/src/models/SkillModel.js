import BaseModel from './BaseModel.js';

const fields = [
  'id',
  'name',
  'created_at',
  'deleted_at',
];

const SkillModel = new BaseModel('skills', fields);

export default SkillModel;
