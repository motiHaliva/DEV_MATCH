import BaseModel from './BaseModel.js';

const fields = [
  'user_id',
  'skill_id'
];

const UserSkillModel = new BaseModel('user_skills', fields);

export default UserSkillModel;
