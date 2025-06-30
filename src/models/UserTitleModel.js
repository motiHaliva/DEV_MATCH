import BaseModel from './BaseModel.js';

const fields = [
  'user_id',
  'title_id'
];

const UserTitleModel = new BaseModel('user_titles', fields);

export default UserTitleModel;
