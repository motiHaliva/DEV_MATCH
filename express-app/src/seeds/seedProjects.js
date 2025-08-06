import { faker } from '@faker-js/faker';
import ProjectModel from '../models/ProjectModel.js';

/**
 * יוצרים פרויקטים פיקטיביים לפי users שייתנו להם להיות clients.
 * @param {Array} users - רשימת משתמשים (צריך שיהיו בעלי תפקיד client)
 * @param {number} count - כמה פרויקטים ליצור לכל client
 */
export async function seedProjects(users, count = 2) {
  const clients = users.filter(user => user.role === 'client');
  const projects = [];

  // טיפוסי פרויקט לפי enum שהגדרת
  const projectTypes = ['website', 'app', 'ecommerce'];

  for (const client of clients) {
    for (let i = 0; i < count; i++) {
      const project = await ProjectModel.create({
        client_id: client.id,
        title: faker.commerce.productName(),
        description: faker.lorem.paragraph().slice(0, 100),
        deadline: faker.date.soon(60), 
        is_open: faker.datatype.boolean(),
        project_type: faker.helpers.arrayElement(projectTypes)
      });
      projects.push(project);
    }
  }

  console.log(`✅ Seeded ${projects.length} projects`);
  return projects;
}
