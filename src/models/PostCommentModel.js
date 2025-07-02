// src/models/PostCommentModel.ts
import BaseModel from "./BaseModel.js";

const fields = [
  "post_id",
  "user_id",
  "content",
  "created_at",
  "updated_at",
  "deleted_at",
];

const PostCommentModel = new BaseModel("post_comments", fields);

export default PostCommentModel;
