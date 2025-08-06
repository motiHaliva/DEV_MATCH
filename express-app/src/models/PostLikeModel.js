// src/models/PostLikeModel.js
import BaseModel from "./BaseModel.js";

const fields = [
  "post_id",
  "user_id",
  "created_at",
  "deleted_at",
];

const PostLikeModel = new BaseModel("post_likes", fields);

export default PostLikeModel;
