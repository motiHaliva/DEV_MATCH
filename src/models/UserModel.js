import BaseModel from "./BaseModel.js";


const fields = [
  "firstname",
  "lastname",
  "email",
  "role",
  "password",
  "bio",
  "created_at",
  "updated_at",
  "deleted_at",
  "profile_image"
];

const UserModel = new BaseModel("users", fields);

export default UserModel;


