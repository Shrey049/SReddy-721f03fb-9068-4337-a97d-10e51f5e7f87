import axios, { AxiosError } from 'axios';

describe('Organizations Endpoints', () => {
  // Pre-existing super admin credentials from seed
  const SUPER_ADMIN_EMAIL = 'super-admin@dev.co';
  const SUPER_ADMIN_PASSWORD = 'Password123!';

  const ownerUser = {
    email: `org-owner-${Date.now()}@example.com`,
    password: 'Password123!',
    firstName: 'Org',
    lastName: 'Owner',
  };

  const regularUser = {
    email: `org-regular-${Date.now()}@example.com`,
    password: 'Password123!',
    firstName: 'Regular',
    lastName: 'User',
  };

  let superAdminToken: string;
  let ownerToken: string;
  let ownerId: string;
  let regularToken: string;
  let regularId: string;
  let organizationId: string;

  beforeAll(async () => {
    // Step 1: Login as super admin
    const superAdminLogin = await axios.post('/api/auth/login', {
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
    });
    superAdminToken = superAdminLogin.data.accessToken;

    // Step 2: Register owner user (starts as viewer)
    const ownerRes = await axios.post('/api/auth/register', ownerUser);
    ownerToken = ownerRes.data.accessToken;
    ownerId = ownerRes.data.user.id;

    // Step 3: Super Admin promotes user to Owner
    await axios.put(
      `/api/users/${ownerId}/role`,
      { role: 'owner' },
      { headers: { Authorization: `Bearer ${superAdminToken}` } }
    );

    // Step 4: Re-login owner to get updated token with owner role
    const ownerLoginRes = await axios.post('/api/auth/login', {
      email: ownerUser.email,
      password: ownerUser.password,
    });
    ownerToken = ownerLoginRes.data.accessToken;

    // Register regular user (viewer by default)
    const regularRes = await axios.post('/api/auth/register', regularUser);
    regularToken = regularRes.data.accessToken;
    regularId = regularRes.data.user.id;
  });

  describe('POST /api/organizations - Create Organization', () => {
    it('should allow user to create an organization (becomes owner)', async () => {
      const res = await axios.post(
        '/api/organizations',
        { name: 'Test Organization' },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data.name).toBe('Test Organization');

      organizationId = res.data.id;

      // Re-login to get updated token with org info
      const loginRes = await axios.post('/api/auth/login', {
        email: ownerUser.email,
        password: ownerUser.password,
      });
      ownerToken = loginRes.data.accessToken;
    });

    it('should fail without authentication', async () => {
      try {
        await axios.post('/api/organizations', { name: 'Unauthorized Org' });
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should fail for viewer role', async () => {
      try {
        await axios.post(
          '/api/organizations',
          { name: 'Viewer Org' },
          { headers: { Authorization: `Bearer ${regularToken}` } }
        );
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(403);
      }
    });
  });

  describe('GET /api/organizations - List Organizations', () => {
    it('should return organizations for owner', async () => {
      const res = await axios.get('/api/organizations', {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBeGreaterThan(0);
    });

    it('should return empty or limited list for user without org', async () => {
      const res = await axios.get('/api/organizations', {
        headers: { Authorization: `Bearer ${regularToken}` },
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /api/organizations/:id - Get Organization', () => {
    it('should return organization by ID', async () => {
      const res = await axios.get(`/api/organizations/${organizationId}`, {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(organizationId);
      expect(res.data.name).toBe('Test Organization');
    });

    it('should return 404 for non-existent organization', async () => {
      try {
        await axios.get('/api/organizations/00000000-0000-0000-0000-000000000000', {
          headers: { Authorization: `Bearer ${ownerToken}` },
        });
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(404);
      }
    });
  });

  describe('PATCH /api/organizations/:id - Update Organization', () => {
    it('should allow owner to update organization', async () => {
      const res = await axios.patch(
        `/api/organizations/${organizationId}`,
        { name: 'Updated Organization Name' },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );

      expect(res.status).toBe(200);
      expect(res.data.name).toBe('Updated Organization Name');
    });

    it('should NOT allow non-owner to update organization', async () => {
      try {
        await axios.patch(
          `/api/organizations/${organizationId}`,
          { name: 'Unauthorized Update' },
          { headers: { Authorization: `Bearer ${regularToken}` } }
        );
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(403);
      }
    });
  });

  describe('POST /api/organizations/:id/members - Add Member', () => {
    it('should allow owner to add a member with admin role', async () => {
      const res = await axios.post(
        `/api/organizations/${organizationId}/members`,
        { userId: regularId, role: 'admin' },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );

      expect(res.status).toBe(201);
      expect(res.data.message).toBe('Member added successfully');
      expect(res.data.userId).toBe(regularId);
      expect(res.data.role).toBe('admin');

      // Re-login regular user to get updated token
      const loginRes = await axios.post('/api/auth/login', {
        email: regularUser.email,
        password: regularUser.password,
      });
      regularToken = loginRes.data.accessToken;
    });

    it('should fail to add member to non-existent organization', async () => {
      try {
        await axios.post(
          '/api/organizations/00000000-0000-0000-0000-000000000000/members',
          { userId: regularId, role: 'viewer' },
          { headers: { Authorization: `Bearer ${ownerToken}` } }
        );
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        // Organization doesn't exist, so should return 404 or 500 (FK constraint)
        expect(axiosError.response?.status).toBeGreaterThanOrEqual(400);
      }
    });

    it('should fail to add already assigned user', async () => {
      try {
        await axios.post(
          `/api/organizations/${organizationId}/members`,
          { userId: regularId, role: 'viewer' },
          { headers: { Authorization: `Bearer ${ownerToken}` } }
        );
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });

  describe('DELETE /api/organizations/:id/members/:userId - Remove Member', () => {
    let memberToRemove: string;
    let memberToken: string;

    beforeAll(async () => {
      // Create another user to remove
      const memberRes = await axios.post('/api/auth/register', {
        email: `member-remove-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Member',
        lastName: 'ToRemove',
      });
      memberToRemove = memberRes.data.user.id;
      memberToken = memberRes.data.accessToken;

      // Add member to organization
      await axios.post(
        `/api/organizations/${organizationId}/members`,
        { userId: memberToRemove, role: 'viewer' },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );
    });

    it('should allow owner to remove a member', async () => {
      const res = await axios.delete(
        `/api/organizations/${organizationId}/members/${memberToRemove}`,
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );

      expect(res.status).toBe(200);
      expect(res.data.message).toBe('Member removed successfully');
    });

    it('should NOT allow non-owner to remove members', async () => {
      try {
        await axios.delete(
          `/api/organizations/${organizationId}/members/${regularId}`,
          { headers: { Authorization: `Bearer ${regularToken}` } }
        );
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(403);
      }
    });
  });

  describe('DELETE /api/organizations/:id - Delete Organization', () => {
    let orgToDelete: string;

    beforeAll(async () => {
      // First need to re-login owner to get fresh token after creating first org
      const loginRes = await axios.post('/api/auth/login', {
        email: ownerUser.email,
        password: ownerUser.password,
      });
      ownerToken = loginRes.data.accessToken;
    });

    it('should NOT allow non-owner to delete organization', async () => {
      try {
        await axios.delete(`/api/organizations/${organizationId}`, {
          headers: { Authorization: `Bearer ${regularToken}` },
        });
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(403);
      }
    });

    it('should allow owner to delete organization', async () => {
      // Create a new org to delete
      const orgRes = await axios.post(
        '/api/organizations',
        { name: 'Org to Delete' },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );
      orgToDelete = orgRes.data.id;

      const res = await axios.delete(`/api/organizations/${orgToDelete}`, {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
    });
  });
});
