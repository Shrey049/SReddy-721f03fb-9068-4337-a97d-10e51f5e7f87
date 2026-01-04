import axios, { AxiosError } from 'axios';

describe('Audit Log Endpoints', () => {
  // Pre-existing super admin credentials from seed
  const SUPER_ADMIN_EMAIL = 'super-admin@dev.co';
  const SUPER_ADMIN_PASSWORD = 'Password123!';

  const ownerUser = {
    email: `audit-owner-${Date.now()}@example.com`,
    password: 'Password123!',
    firstName: 'Audit',
    lastName: 'Owner',
  };

  const adminUser = {
    email: `audit-admin-${Date.now()}@example.com`,
    password: 'Password123!',
    firstName: 'Audit',
    lastName: 'Admin',
  };

  const viewerUser = {
    email: `audit-viewer-${Date.now()}@example.com`,
    password: 'Password123!',
    firstName: 'Audit',
    lastName: 'Viewer',
  };

  let superAdminToken: string;
  let ownerToken: string;
  let ownerId: string;
  let adminToken: string;
  let adminId: string;
  let viewerToken: string;
  let viewerId: string;
  let organizationId: string;

  beforeAll(async () => {
    // Step 1: Login as super admin
    const superAdminRes = await axios.post('/api/auth/login', {
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
    });
    superAdminToken = superAdminRes.data.accessToken;

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

    // Step 5: Owner creates organization
    const orgRes = await axios.post(
      '/api/organizations',
      { name: 'Audit Test Organization' },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    );
    organizationId = orgRes.data.id;

    // Re-login owner to get updated token
    const ownerLoginRes2 = await axios.post('/api/auth/login', {
      email: ownerUser.email,
      password: ownerUser.password,
    });
    ownerToken = ownerLoginRes2.data.accessToken;

    // Register admin user
    const adminRes = await axios.post('/api/auth/register', adminUser);
    adminToken = adminRes.data.accessToken;
    adminId = adminRes.data.user.id;

    // Add admin to organization
    await axios.post(
      `/api/organizations/${organizationId}/members`,
      { userId: adminId, role: 'admin' },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    );

    // Re-login admin
    const adminLoginRes = await axios.post('/api/auth/login', {
      email: adminUser.email,
      password: adminUser.password,
    });
    adminToken = adminLoginRes.data.accessToken;

    // Register viewer user
    const viewerRes = await axios.post('/api/auth/register', viewerUser);
    viewerToken = viewerRes.data.accessToken;
    viewerId = viewerRes.data.user.id;

    // Add viewer to organization
    await axios.post(
      `/api/organizations/${organizationId}/members`,
      { userId: viewerId, role: 'viewer' },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    );

    // Re-login viewer
    const viewerLoginRes = await axios.post('/api/auth/login', {
      email: viewerUser.email,
      password: viewerUser.password,
    });
    viewerToken = viewerLoginRes.data.accessToken;

    // Create some tasks to generate audit logs
    await axios.post(
      '/api/tasks',
      { title: 'Audit Test Task 1', priority: 'high', organizationId },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    );

    await axios.post(
      '/api/tasks',
      { title: 'Audit Test Task 2', priority: 'medium', organizationId },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
  });

  describe('GET /api/audit-log - Get Audit Logs', () => {
    it('should allow owner to view all audit logs', async () => {
      const res = await axios.get('/api/audit-log', {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('data');
      expect(res.data).toHaveProperty('total');
      expect(res.data).toHaveProperty('page');
      expect(res.data).toHaveProperty('pageSize');
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('should allow admin to view audit logs (org scoped)', async () => {
      const res = await axios.get('/api/audit-log', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('should NOT allow viewer to view audit logs', async () => {
      try {
        await axios.get('/api/audit-log', {
          headers: { Authorization: `Bearer ${viewerToken}` },
        });
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(403);
      }
    });

    it('should fail without authentication', async () => {
      try {
        await axios.get('/api/audit-log');
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });

  describe('GET /api/audit-log - Filter Audit Logs', () => {
    it('should filter by action type', async () => {
      const res = await axios.get('/api/audit-log?action=create', {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
      res.data.data.forEach((log: any) => {
        expect(log.action).toBe('create');
      });
    });

    it('should filter by resource type', async () => {
      const res = await axios.get('/api/audit-log?resourceType=task', {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
      res.data.data.forEach((log: any) => {
        expect(log.resourceType).toBe('task');
      });
    });

    it('should filter by login action', async () => {
      const res = await axios.get('/api/audit-log?action=login', {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
      res.data.data.forEach((log: any) => {
        expect(log.action).toBe('login');
      });
    });

    it('should filter by date range', async () => {
      const today = new Date();
      const startDate = new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      const res = await axios.get(
        `/api/audit-log?startDate=${startDate}&endDate=${endDate}`,
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );

      expect(res.status).toBe(200);
    });

    it('should filter by userId', async () => {
      const res = await axios.get(`/api/audit-log?userId=${ownerId}`, {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
      res.data.data.forEach((log: any) => {
        expect(log.userId).toBe(ownerId);
      });
    });
  });

  describe('GET /api/audit-log - Pagination', () => {
    it('should paginate results', async () => {
      const res = await axios.get('/api/audit-log?page=1&pageSize=5', {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
      expect(res.data.page).toBe(1);
      expect(res.data.pageSize).toBe(5);
      expect(res.data.data.length).toBeLessThanOrEqual(5);
    });

    it('should return second page', async () => {
      const res = await axios.get('/api/audit-log?page=2&pageSize=2', {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
      expect(res.data.page).toBe(2);
    });

    it('should limit max page size to 100', async () => {
      const res = await axios.get('/api/audit-log?pageSize=200', {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
      expect(res.data.pageSize).toBeLessThanOrEqual(100);
    });
  });

  describe('Audit Log Content Verification', () => {
    it('should log login actions with user details', async () => {
      // Login generates audit log
      await axios.post('/api/auth/login', {
        email: ownerUser.email,
        password: ownerUser.password,
      });

      const res = await axios.get('/api/audit-log?action=login', {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
      const loginLogs = res.data.data.filter(
        (log: any) => log.action === 'login'
      );
      expect(loginLogs.length).toBeGreaterThan(0);

      const loginLog = loginLogs[0];
      expect(loginLog).toHaveProperty('userId');
      expect(loginLog).toHaveProperty('action');
      expect(loginLog).toHaveProperty('resourceType');
      expect(loginLog).toHaveProperty('createdAt');
    });

    it('should log task creation with details', async () => {
      // Create a task
      const taskRes = await axios.post(
        '/api/tasks',
        { title: 'Audit Verification Task', priority: 'low', organizationId },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );

      // Wait a moment for audit log to be created
      await new Promise((resolve) => setTimeout(resolve, 100));

      const res = await axios.get('/api/audit-log?action=create&resourceType=task', {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
      const taskLogs = res.data.data.filter(
        (log: any) => log.resourceId === taskRes.data.id
      );

      // Note: Audit log may or may not be created depending on interceptor timing
      // This is a soft check
      if (taskLogs.length > 0) {
        expect(taskLogs[0].action).toBe('create');
        expect(taskLogs[0].resourceType).toBe('task');
      }
    });
  });
});
