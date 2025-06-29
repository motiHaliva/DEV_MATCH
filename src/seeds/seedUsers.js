import { faker } from '@faker-js/faker';
import UserModel from '../models/UserModel.js';
import bcrypt from 'bcryptjs';

export async function seedUsers(count = 5) {
  const users = [];

  for (let i = 0; i < count; i++) {
    const password = await bcrypt.hash('password123', 10);
    const user = await UserModel.create({
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      email: faker.internet.email(),
      password,
      role: i % 2 === 0 ? 'client' : 'freelancer',
      bio: faker.lorem.paragraph(),
    });
    users.push(user);
  }

  console.log(`✅ Seeded ${users.length} users`);
  return users;
}
