import pool from '../db.js';
import { seedUsers } from './seedUsers.js';
import { seedFreelancers } from './seedFreelancers.js';
import { seedProjects } from './seedProjects.js';
import { seedRequests } from './seedRequests.js';

const fresh = process.argv.includes('--fresh');

async function clearTables() {
  await pool.query('TRUNCATE requests, projects, freelancers, users RESTART IDENTITY CASCADE;');
  console.log('🧹 Tables truncated');
}

async function run() {
  try {
    if (fresh) await clearTables();

    const users = await seedUsers(10);
    const freelancers = await seedFreelancers(users);
    const projects = await seedProjects(users);
    await seedRequests(projects, freelancers);

    console.log('🌱 Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

run();
