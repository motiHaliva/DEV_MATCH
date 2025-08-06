import { faker } from '@faker-js/faker';
import FreelancerModel from '../models/FreelancerModel.js';

export async function seedFreelancers(users) {
  const freelancers = [];

  for (const user of users.filter(u => u.role === 'freelancer')) {
    // מספר שלם בין 1 ל־5
    const rating = faker.number.int({ min: 1, max: 5 });

    // כמות מדרגים
    const rating_count = faker.number.int({ min: 0, max: 100 });

    const freelancer = await FreelancerModel.create({
      user_id: user.id,
      is_available: faker.datatype.boolean(),
      headline: `${faker.person.jobType()} Developer`,
  bio: faker.lorem.paragraph().slice(0, 100), // ✅ מגבלה של 100 תווים
      experience_years: faker.number.int({ min: 0, max: 15 }),
      location: faker.location.city(),
      rating,
      rating_count,
    });

    freelancers.push(freelancer);
  }

  console.log(`✅ Seeded ${freelancers.length} freelancers`);
  return freelancers;
}
