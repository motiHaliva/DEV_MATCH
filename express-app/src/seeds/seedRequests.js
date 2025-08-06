import pool from '../db.js';
import { faker } from '@faker-js/faker';

export async function seedRequests() {
  // ניקוי הטבלה לפני הכנסת נתונים (כבר התבצע ב־--fresh)
  await pool.query('DELETE FROM requests');

  for (let i = 1; i <= 10; i++) {
    let from_user_id = faker.number.int({ min: 1, max: 5 });
    let to_user_id = faker.number.int({ min: 6, max: 10 });

    // לוודא שfrom ו־to לא זהים
    if (from_user_id === to_user_id) {
      to_user_id = (to_user_id % 10) + 1;
    }

    const project_id = faker.number.int({ min: 1, max: 10 });
    const statusOptions = ['pending', 'matched', 'declined'];
    const status = faker.helpers.arrayElement(statusOptions);
    const created_at = faker.date.past();

    await pool.query(
      `INSERT INTO requests (from_user_id, to_user_id, project_id, status, created_at)
       VALUES ($1, $2, $3, $4, $5);`,
      [from_user_id, to_user_id, project_id, status, created_at]
    );
  }

  console.log('✅ Seeded 10 requests');
}
