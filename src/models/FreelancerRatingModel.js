import BaseModel from "./BaseModel.js";

const fields = [
  "freelancer_id",
  "client_id",
  "rating",
  "comment",
  "created_at"
];

const FreelancerRatingModel = new BaseModel("freelancer_ratings", fields);

export default FreelancerRatingModel;
