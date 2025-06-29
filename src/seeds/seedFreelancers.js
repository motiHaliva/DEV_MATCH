import { faker } from '@faker-js/faker';
import FreelancerModel from '../models/FreelancerModel.js';

export async function seedFreelancers(users) {
  const freelancers = [];

  for (const user of users.filter(u => u.role === 'freelancer')) {
    const freelancer = await FreelancerModel.create({
      user_id: user.id,
      is_available: faker.datatype.boolean(),
      headline: faker.person.jobTitle(),
      bio: faker.lorem.paragraph(),
      experience_years: faker.number.int({ min: 0, max: 15 }),
      location: faker.location.city()
    });
    freelancers.push(freelancer);
  }

  console.log(`✅ Seeded ${freelancers.length} freelancers`);
  return freelancers;
}
