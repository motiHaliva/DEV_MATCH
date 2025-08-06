import BaseModel from "./BaseModel.js";

const fields = [
  "user_id",
  "content",
  "image_url",
  "post_type",
  "likes_count",
  "comments_count",
  "created_at",
  "updated_at",
  "deleted_at"
];

const PostModel = new BaseModel("posts", fields);

export default PostModel;