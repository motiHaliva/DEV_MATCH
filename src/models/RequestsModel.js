import BaseModel from "./BaseModel.js";

const fields = [
  "id",
  "from_user_id",
  "to_user_id",
  "project_id",
  "created_at",
  "status",
];

const RequestsModel = new BaseModel("requests", fields);

export default RequestsModel;
