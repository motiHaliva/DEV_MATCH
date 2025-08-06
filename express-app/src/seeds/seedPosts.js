import { faker } from "@faker-js/faker";
import PostModel from "../models/PostModel.js";

/**
 * יוצר פוסטים פיקטיביים עבור רשימת משתמשים (user_id נדרש)
 * @param {Array} users - רשימת משתמשים
 * @param {number} count - כמה פוסטים ליצור לכל משתמש
 */
export async function seedPosts(users, count = 3) {
  const posts = [];

  const postTypes = ["freelancer", "client"];

  for (const user of users) {
    for (let i = 0; i < count; i++) {
      const post = await PostModel.create({
        user_id: user.id,
        content:  faker.lorem.paragraph().slice(0, 100), 
        image_url: faker.image.urlLoremFlickr({ category: 'people' }),
        post_type: faker.helpers.arrayElement(postTypes),
        likes_count: faker.number.int({ min: 0, max: 50 }),
        comments_count: 0, // אפשר לעדכן אחר כך עם comments
      });
      posts.push(post);
    }
  }

  console.log(`✅ Seeded ${posts.length} posts`);
  return posts;
}
