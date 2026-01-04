/* eslint-disable */
import axios from 'axios';

module.exports = async function () {
  // Configure axios for tests to use.
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? '3000';
  axios.defaults.baseURL = `http://${host}:${port}`;

  // Ensure super admin exists for tests
  // Try to login first, if it fails, the super admin doesn't exist
  // The seed script should have created the super admin
  try {
    await axios.post('/api/auth/login', {
      email: 'super-admin@dev.co',
      password: 'Password123!',
    });
    console.log('✓ Super admin exists and is ready for tests');
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.warn('⚠ Super admin login failed - please run the seed script:');
      console.warn('  npx ts-node tools/database/seed.ts');
    } else {
      console.warn('⚠ Could not verify super admin:', error.message);
    }
  }
};
