import { faker } from '@faker-js/faker';
import PostLikeModel from '../models/PostLikeModel.js';

/**
 * יוצרים לייקים פיקטיביים לפוסטים
 * @param {Array} users - רשימת משתמשים
 * @param {Array} posts - רשימת פוסטים
 * @param {number} maxLikesPerPost - מקסימום לייקים שייווצרו לכל פוסט
 */
export async function seedPostLikes(users, posts, maxLikesPerPost = 5) {
  const likes = [];

  for (const post of posts) {
    // בוחרים אקראית כמה לייקים ניצור לפוסט (עד maxLikesPerPost)
const likesCount = faker.number.int({ min: 0, max: maxLikesPerPost });

    // בוחרים אקראית משתמשים שיאהבו את הפוסט
    const shuffledUsers = faker.helpers.shuffle(users);

    for (let i = 0; i < likesCount; i++) {
      const user = shuffledUsers[i];

      if (!user) break;

      // יוצרים לייק חדש
      const like = await PostLikeModel.create({
        post_id: post.id,
        user_id: user.id,
        created_at: new Date(),
        deleted_at: null,
      });
      likes.push(like);
    }
  }

  console.log(`✅ Seeded ${likes.length} post likes`);
  return likes;
}
