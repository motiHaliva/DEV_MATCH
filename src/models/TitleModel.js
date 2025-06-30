import BaseModel from './BaseModel.js';

const fields = [
  'id',
  'name',
  'created_at',
    'deleted_at',
];

const TitleModel = new BaseModel('titles', fields);

export default TitleModel;
