
import BaseModel from "./BaseModel.js";

const fields = [
  "user_id",
  "is_available",
  "headline",
  "bio",
  "experience_years",
  "location",
  "created_at"
];

const FreelancerModel = new BaseModel("freelancers", fields);

export default FreelancerModel;







