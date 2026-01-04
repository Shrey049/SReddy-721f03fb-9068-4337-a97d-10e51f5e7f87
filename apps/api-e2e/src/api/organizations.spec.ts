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

  const adminUser = {
    email: `org-admin-${Date.now()}@example.com`,
    password: 'Password123!',
    firstName: 'Org',
    lastName: 'Admin',
  };

  const viewerUser = {
    email: `org-viewer-${Date.now()}@example.com`,
    password: 'Password123!',
    firstName: 'Org',
    lastName: 'Viewer',
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
  let adminToken: string;
  let adminId: string;
  let viewerToken: string;
  let viewerId: string;
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

    // Register admin user (viewer by default)
    const adminRes = await axios.post('/api/auth/register', adminUser);
    adminToken = adminRes.data.accessToken;
    adminId = adminRes.data.user.id;

    // Register viewer user (viewer by default)
    const viewerRes = await axios.post('/api/auth/register', viewerUser);
    viewerToken = viewerRes.data.accessToken;
    viewerId = viewerRes.data.user.id;

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
        { userId: adminId, role: 'admin' },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );

      expect(res.status).toBe(201);
      expect(res.data.message).toBe('Member added successfully');
      expect(res.data.userId).toBe(adminId);
      expect(res.data.role).toBe('admin');

      // Re-login admin user to get updated token with org membership
      const loginRes = await axios.post('/api/auth/login', {
        email: adminUser.email,
        password: adminUser.password,
      });
      adminToken = loginRes.data.accessToken;
    });

    it('should allow owner to add a member with viewer role', async () => {
      const res = await axios.post(
        `/api/organizations/${organizationId}/members`,
        { userId: viewerId, role: 'viewer' },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );

      expect(res.status).toBe(201);
      expect(res.data.role).toBe('viewer');

      // Re-login viewer user to get updated token with org membership
      const loginRes = await axios.post('/api/auth/login', {
        email: viewerUser.email,
        password: viewerUser.password,
      });
      viewerToken = loginRes.data.accessToken;
    });

    it('should allow owner to add a member with owner role', async () => {
      // Create a new user to add as owner
      const newOwnerRes = await axios.post('/api/auth/register', {
        email: `new-owner-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'New',
        lastName: 'Owner',
      });

      const res = await axios.post(
        `/api/organizations/${organizationId}/members`,
        { userId: newOwnerRes.data.user.id, role: 'owner' },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );

      expect(res.status).toBe(201);
      expect(res.data.role).toBe('owner');
    });

    it('should allow admin to add a member with admin role', async () => {
      // Create a new user to add
      const newUserRes = await axios.post('/api/auth/register', {
        email: `admin-adds-admin-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Admin',
        lastName: 'Added',
      });

      const res = await axios.post(
        `/api/organizations/${organizationId}/members`,
        { userId: newUserRes.data.user.id, role: 'admin' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      expect(res.status).toBe(201);
      expect(res.data.role).toBe('admin');
    });

    it('should allow admin to add a member with viewer role', async () => {
      // Create a new user to add
      const newUserRes = await axios.post('/api/auth/register', {
        email: `admin-adds-viewer-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Viewer',
        lastName: 'Added',
      });

      const res = await axios.post(
        `/api/organizations/${organizationId}/members`,
        { userId: newUserRes.data.user.id, role: 'viewer' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      expect(res.status).toBe(201);
      expect(res.data.role).toBe('viewer');
    });

    it('should NOT allow admin to add a member with owner role', async () => {
      // Create a new user to add
      const newUserRes = await axios.post('/api/auth/register', {
        email: `admin-tries-owner-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Cannot',
        lastName: 'BeOwner',
      });

      try {
        await axios.post(
          `/api/organizations/${organizationId}/members`,
          { userId: newUserRes.data.user.id, role: 'owner' },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(403);
      }
    });

    it('should NOT allow viewer to add members', async () => {
      try {
        await axios.post(
          `/api/organizations/${organizationId}/members`,
          { userId: regularId, role: 'viewer' },
          { headers: { Authorization: `Bearer ${viewerToken}` } }
        );
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(403);
      }
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
          { userId: adminId, role: 'viewer' },
          { headers: { Authorization: `Bearer ${ownerToken}` } }
        );
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });

  describe('GET /api/organizations/:id/members - Get Members', () => {
    it('should allow owner to get members', async () => {
      const res = await axios.get(
        `/api/organizations/${organizationId}/members`,
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBeGreaterThan(0);
    });

    it('should allow admin to get members', async () => {
      const res = await axios.get(
        `/api/organizations/${organizationId}/members`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });

    it('should allow viewer to get members', async () => {
      const res = await axios.get(
        `/api/organizations/${organizationId}/members`,
        { headers: { Authorization: `Bearer ${viewerToken}` } }
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });

    it('should NOT allow non-member to get members', async () => {
      try {
        await axios.get(
          `/api/organizations/${organizationId}/members`,
          { headers: { Authorization: `Bearer ${regularToken}` } }
        );
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(403);
      }
    });
  });

  describe('PUT /api/organizations/:id/members/:userId - Update Member Role', () => {
    let memberToUpdate: string;
    let memberToken: string;

    beforeAll(async () => {
      // Create a user to update
      const memberRes = await axios.post('/api/auth/register', {
        email: `member-update-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Member',
        lastName: 'ToUpdate',
      });
      memberToUpdate = memberRes.data.user.id;
      memberToken = memberRes.data.accessToken;

      // Add member to organization as viewer
      await axios.post(
        `/api/organizations/${organizationId}/members`,
        { userId: memberToUpdate, role: 'viewer' },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );
    });

    it('should allow owner to update member role to admin', async () => {
      const res = await axios.put(
        `/api/organizations/${organizationId}/members/${memberToUpdate}`,
        { role: 'admin' },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );

      expect(res.status).toBe(200);
      expect(res.data.role).toBe('admin');
    });

    it('should allow owner to update member role to owner', async () => {
      const res = await axios.put(
        `/api/organizations/${organizationId}/members/${memberToUpdate}`,
        { role: 'owner' },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );

      expect(res.status).toBe(200);
      expect(res.data.role).toBe('owner');
    });

    it('should NOT allow admin to promote member to owner', async () => {
      // First demote the member back to viewer
      await axios.put(
        `/api/organizations/${organizationId}/members/${memberToUpdate}`,
        { role: 'viewer' },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );

      try {
        await axios.put(
          `/api/organizations/${organizationId}/members/${memberToUpdate}`,
          { role: 'owner' },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(403);
      }
    });

    it('should NOT allow viewer to update member roles', async () => {
      try {
        await axios.put(
          `/api/organizations/${organizationId}/members/${memberToUpdate}`,
          { role: 'admin' },
          { headers: { Authorization: `Bearer ${viewerToken}` } }
        );
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(403);
      }
    });
  });

  describe('DELETE /api/organizations/:id/members/:userId - Remove Member', () => {
    let memberToRemove: string;

    beforeAll(async () => {
      // Create another user to remove
      const memberRes = await axios.post('/api/auth/register', {
        email: `member-remove-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Member',
        lastName: 'ToRemove',
      });
      memberToRemove = memberRes.data.user.id;

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

    it('should allow admin to remove a viewer member', async () => {
      // Create a new member to remove
      const newMemberRes = await axios.post('/api/auth/register', {
        email: `admin-removes-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Admin',
        lastName: 'Removes',
      });

      // Add member
      await axios.post(
        `/api/organizations/${organizationId}/members`,
        { userId: newMemberRes.data.user.id, role: 'viewer' },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );

      const res = await axios.delete(
        `/api/organizations/${organizationId}/members/${newMemberRes.data.user.id}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      expect(res.status).toBe(200);
    });

    it('should NOT allow viewer to remove members', async () => {
      // Create a new member to try to remove
      const newMemberRes = await axios.post('/api/auth/register', {
        email: `viewer-removes-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Viewer',
        lastName: 'Removes',
      });

      // Add member
      await axios.post(
        `/api/organizations/${organizationId}/members`,
        { userId: newMemberRes.data.user.id, role: 'viewer' },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );

      try {
        await axios.delete(
          `/api/organizations/${organizationId}/members/${newMemberRes.data.user.id}`,
          { headers: { Authorization: `Bearer ${viewerToken}` } }
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
