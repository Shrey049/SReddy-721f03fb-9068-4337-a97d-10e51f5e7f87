import axios, { AxiosError } from 'axios';

describe('Users Endpoints', () => {
  // Pre-existing super admin credentials from seed
  const SUPER_ADMIN_EMAIL = 'super-admin@dev.co';
  const SUPER_ADMIN_PASSWORD = 'Password123!';

  const targetUser = {
    email: `target-${Date.now()}@example.com`,
    password: 'Password123!',
    firstName: 'Target',
    lastName: 'User',
  };

  const ownerUser = {
    email: `owner-user-${Date.now()}@example.com`,
    password: 'Password123!',
    firstName: 'Owner',
    lastName: 'User',
  };

  const regularUser = {
    email: `regular-user-${Date.now()}@example.com`,
    password: 'Password123!',
    firstName: 'Regular',
    lastName: 'User',
  };

  let superAdminToken: string;
  let targetToken: string;
  let targetId: string;
  let ownerToken: string;
  let ownerId: string;
  let regularToken: string;
  let regularId: string;

  beforeAll(async () => {
    // Login as pre-existing super admin
    const superAdminRes = await axios.post('/api/auth/login', {
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
    });
    superAdminToken = superAdminRes.data.accessToken;

    // Register target user
    const targetRes = await axios.post('/api/auth/register', targetUser);
    targetToken = targetRes.data.accessToken;
    targetId = targetRes.data.user.id;

    // Register owner user and promote to owner
    const ownerRes = await axios.post('/api/auth/register', ownerUser);
    ownerToken = ownerRes.data.accessToken;
    ownerId = ownerRes.data.user.id;

    // Promote to owner
    await axios.put(
      `/api/users/${ownerId}/role`,
      { role: 'owner' },
      { headers: { Authorization: `Bearer ${superAdminToken}` } }
    );

    // Re-login owner
    const ownerLoginRes = await axios.post('/api/auth/login', {
      email: ownerUser.email,
      password: ownerUser.password,
    });
    ownerToken = ownerLoginRes.data.accessToken;

    // Register regular user
    const regularRes = await axios.post('/api/auth/register', regularUser);
    regularToken = regularRes.data.accessToken;
    regularId = regularRes.data.user.id;
  });

  describe('PUT /api/users/:id/role - Update User Role', () => {
    it('should allow super admin to change user role to owner', async () => {
      // Create a new user to promote
      const newUserRes = await axios.post('/api/auth/register', {
        email: `promote-test-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Promote',
        lastName: 'Test',
      });

      const res = await axios.put(
        `/api/users/${newUserRes.data.user.id}/role`,
        { role: 'owner' },
        { headers: { Authorization: `Bearer ${superAdminToken}` } }
      );

      expect(res.status).toBe(200);
      expect(res.data.role).toBe('owner');
    });

    it('should NOT allow viewer to change roles', async () => {
      try {
        await axios.put(
          `/api/users/${targetId}/role`,
          { role: 'admin' },
          { headers: { Authorization: `Bearer ${regularToken}` } }
        );
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(403);
      }
    });

    it('should allow owner to change roles', async () => {
      // Create a new user to change role
      const newUserRes = await axios.post('/api/auth/register', {
        email: `owner-promote-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Owner',
        lastName: 'Promote',
      });

      const res = await axios.put(
        `/api/users/${newUserRes.data.user.id}/role`,
        { role: 'admin' },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );

      expect(res.status).toBe(200);
      expect(res.data.role).toBe('admin');
    });

    it('should fail with invalid role value', async () => {
      try {
        await axios.put(
          `/api/users/${targetId}/role`,
          { role: 'invalid_role' },
          { headers: { Authorization: `Bearer ${superAdminToken}` } }
        );
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        // Invalid role gets rejected - could be 400 (validation) or 403 (guard)
        expect([400, 403]).toContain(axiosError.response?.status);
      }
    });

    it('should fail without authentication', async () => {
      try {
        await axios.put(`/api/users/${targetId}/role`, { role: 'admin' });
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });
});
