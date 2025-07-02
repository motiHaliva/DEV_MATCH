import { faker } from "@faker-js/faker";
import PostCommentModel from "../models/PostCommentModel.js";
import BaseModel from "../models/BaseModel.js";

/**
 * יוצר תגובות פיקטיביות לפי רשימת משתמשים ורשימת פוסטים
 * @param {Array} users - רשימת משתמשים (user_id)
 * @param {Array} posts - רשימת פוסטים (post_id)
 * @param {number} count - כמה תגובות ליצור לכל פוסט
 */
export async function seedPostComments(users, posts, count = 5) {
  const comments = [];

  for (const post of posts) {
    for (let i = 0; i < count; i++) {
      const randomUser = faker.helpers.arrayElement(users);

      const comment = await PostCommentModel.create({
        post_id: post.id,
        user_id: randomUser.id,
        content: faker.lorem.sentence(),
      });

      comments.push(comment);
    }

    // עדכון comments_count לפוסט
    await BaseModel.runRawQuery(
      `UPDATE posts SET comments_count = $1 WHERE id = $2`,
      [count, post.id]
    );
  }

  console.log(`✅ Seeded ${comments.length} comments`);
  return comments;
}
