import { faker } from '@faker-js/faker';
import UserModel from '../models/UserModel.js';
import bcrypt from 'bcryptjs';

export async function seedUsers(count = 5) {
  const users = [];

  for (let i = 0; i < count; i++) {
    const password = await bcrypt.hash('password123', 10);
    const now = new Date();

    const user = await UserModel.create({
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      email: faker.internet.email().toLowerCase(),
      password,
      role: i % 2 === 0 ? 'client' : 'freelancer',
      bio: faker.lorem.paragraph(),
      profile_image: faker.image.avatar(),
      created_at: now,
      updated_at: now,
      deleted_at: null,
    });

    users.push(user);
  }

  console.log(`✅ Seeded ${users.length} users`);
  return users;
}
