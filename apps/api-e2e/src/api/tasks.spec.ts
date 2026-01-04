import axios, { AxiosError } from 'axios';

describe('Tasks Endpoints', () => {
  // Pre-existing super admin credentials from seed
  const SUPER_ADMIN_EMAIL = 'super-admin@dev.co';
  const SUPER_ADMIN_PASSWORD = 'Password123!';

  // Test users with different roles
  const ownerUser = {
    email: `owner-${Date.now()}@example.com`,
    password: 'Password123!',
    firstName: 'Owner',
    lastName: 'User',
  };

  const adminUser = {
    email: `admin-${Date.now()}@example.com`,
    password: 'Password123!',
    firstName: 'Admin',
    lastName: 'User',
  };

  const viewerUser = {
    email: `viewer-${Date.now()}@example.com`,
    password: 'Password123!',
    firstName: 'Viewer',
    lastName: 'User',
  };

  let superAdminToken: string;
  let ownerToken: string;
  let ownerId: string;
  let adminToken: string;
  let adminId: string;
  let viewerToken: string;
  let viewerId: string;
  let organizationId: string;
  let taskId: string;

  beforeAll(async () => {
    // Step 1: Login as super admin (pre-existing in database)
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

    // Step 5: Owner creates organization
    const orgRes = await axios.post(
      '/api/organizations',
      { name: 'Test Organization' },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    );
    organizationId = orgRes.data.id;

    // Step 6: Re-login to get updated token with org info
    const ownerLoginRes2 = await axios.post('/api/auth/login', {
      email: ownerUser.email,
      password: ownerUser.password,
    });
    ownerToken = ownerLoginRes2.data.accessToken;

    // Step 7: Register admin user (starts as viewer)
    const adminRes = await axios.post('/api/auth/register', adminUser);
    adminToken = adminRes.data.accessToken;
    adminId = adminRes.data.user.id;

    // Step 8: Owner adds admin to organization with admin role
    await axios.post(
      `/api/organizations/${organizationId}/members`,
      { userId: adminId, role: 'admin' },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    );

    // Step 9: Re-login admin to get updated token
    const adminLoginRes = await axios.post('/api/auth/login', {
      email: adminUser.email,
      password: adminUser.password,
    });
    adminToken = adminLoginRes.data.accessToken;

    // Step 10: Register viewer user
    const viewerRes = await axios.post('/api/auth/register', viewerUser);
    viewerToken = viewerRes.data.accessToken;
    viewerId = viewerRes.data.user.id;

    // Step 11: Owner adds viewer to organization
    await axios.post(
      `/api/organizations/${organizationId}/members`,
      { userId: viewerId, role: 'viewer' },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    );

    // Step 12: Re-login viewer to get updated token
    const viewerLoginRes = await axios.post('/api/auth/login', {
      email: viewerUser.email,
      password: viewerUser.password,
    });
    viewerToken = viewerLoginRes.data.accessToken;
  });

  describe('POST /api/tasks - Create Task', () => {
    it('should allow owner to create a task', async () => {
      const taskData = {
        title: 'Owner Task',
        description: 'Task created by owner',
        status: 'todo',
        priority: 'high',
        dueDate: '2026-02-01T00:00:00Z',
        organizationId,
      };

      const res = await axios.post('/api/tasks', taskData, {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(201);
      expect(res.data.title).toBe(taskData.title);
      expect(res.data.description).toBe(taskData.description);
      expect(res.data.status).toBe(taskData.status);
      expect(res.data.priority).toBe(taskData.priority);
      expect(res.data).toHaveProperty('id');
      expect(res.data).toHaveProperty('createdAt');
      expect(res.data.organizationId).toBe(organizationId);

      taskId = res.data.id;
    });

    it('should allow admin to create a task', async () => {
      const taskData = {
        title: 'Admin Task',
        description: 'Task created by admin',
        status: 'todo',
        priority: 'medium',
        organizationId,
      };

      const res = await axios.post('/api/tasks', taskData, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(res.status).toBe(201);
      expect(res.data.title).toBe(taskData.title);
    });

    it('should NOT allow viewer to create a task', async () => {
      try {
        await axios.post(
          '/api/tasks',
          {
            title: 'Viewer Task',
            description: 'Should fail',
            organizationId,
          },
          { headers: { Authorization: `Bearer ${viewerToken}` } }
        );
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(403);
      }
    });

    it('should allow creating a task with assignment', async () => {
      const taskData = {
        title: 'Assigned Task',
        description: 'Task assigned to viewer',
        status: 'todo',
        priority: 'high',
        assignedToId: viewerId,
        organizationId,
      };

      const res = await axios.post('/api/tasks', taskData, {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(201);
      expect(res.data.assignedToId).toBe(viewerId);
    });

    it('should fail without authentication', async () => {
      try {
        await axios.post('/api/tasks', {
          title: 'Unauthorized Task',
          organizationId,
        });
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should fail with missing required title', async () => {
      try {
        await axios.post(
          '/api/tasks',
          { description: 'No title', organizationId },
          { headers: { Authorization: `Bearer ${ownerToken}` } }
        );
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should fail with invalid status value', async () => {
      try {
        await axios.post(
          '/api/tasks',
          {
            title: 'Invalid Status Task',
            status: 'invalid_status',
            organizationId,
          },
          { headers: { Authorization: `Bearer ${ownerToken}` } }
        );
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });

  describe('GET /api/tasks - List Tasks', () => {
    it('should return tasks for owner (all tasks)', async () => {
      const res = await axios.get('/api/tasks', {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('data');
      expect(res.data).toHaveProperty('total');
      expect(res.data).toHaveProperty('page');
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('should return tasks for admin (org scoped)', async () => {
      const res = await axios.get('/api/tasks', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('should return only assigned tasks for viewer', async () => {
      const res = await axios.get('/api/tasks', {
        headers: { Authorization: `Bearer ${viewerToken}` },
      });

      expect(res.status).toBe(200);
      // Viewer should only see tasks assigned to them
      res.data.data.forEach((task: any) => {
        expect(task.assignedToId).toBe(viewerId);
      });
    });

    it('should filter tasks by status', async () => {
      const res = await axios.get('/api/tasks?status=todo', {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
      res.data.data.forEach((task: any) => {
        expect(task.status).toBe('todo');
      });
    });

    it('should filter tasks by priority', async () => {
      const res = await axios.get('/api/tasks?priority=high', {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
      res.data.data.forEach((task: any) => {
        expect(task.priority).toBe('high');
      });
    });

    it('should paginate results', async () => {
      const res = await axios.get('/api/tasks?page=1&pageSize=2', {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
      expect(res.data.page).toBe(1);
      expect(res.data.data.length).toBeLessThanOrEqual(2);
    });

    it('should search tasks by title', async () => {
      const res = await axios.get('/api/tasks?search=Owner', {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/tasks/:id - Get Single Task', () => {
    it('should return a task by ID for owner', async () => {
      const res = await axios.get(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(taskId);
    });

    it('should return 404 for non-existent task', async () => {
      try {
        await axios.get('/api/tasks/00000000-0000-0000-0000-000000000000', {
          headers: { Authorization: `Bearer ${ownerToken}` },
        });
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(404);
      }
    });
  });

  describe('PUT /api/tasks/:id - Update Task', () => {
    it('should allow owner to update a task', async () => {
      const updateData = {
        title: 'Updated Owner Task',
        priority: 'urgent',
      };

      const res = await axios.put(`/api/tasks/${taskId}`, updateData, {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);
      expect(res.data.title).toBe(updateData.title);
      expect(res.data.priority).toBe(updateData.priority);
    });

    it('should allow admin to update a task', async () => {
      const updateData = {
        description: 'Updated by admin',
      };

      const res = await axios.put(`/api/tasks/${taskId}`, updateData, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(res.status).toBe(200);
      expect(res.data.description).toBe(updateData.description);
    });

    it('should NOT allow viewer to update task fields other than status', async () => {
      // First create a task assigned to viewer
      const taskRes = await axios.post(
        '/api/tasks',
        {
          title: 'Task for Viewer',
          assignedToId: viewerId,
          organizationId,
        },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );

      try {
        await axios.put(
          `/api/tasks/${taskRes.data.id}`,
          { title: 'Viewer trying to change title' },
          { headers: { Authorization: `Bearer ${viewerToken}` } }
        );
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(403);
      }
    });
  });

  describe('PATCH /api/tasks/:id/status - Update Task Status', () => {
    let viewerTaskId: string;

    beforeAll(async () => {
      // Create a task assigned to viewer
      const taskRes = await axios.post(
        '/api/tasks',
        {
          title: 'Viewer Status Task',
          assignedToId: viewerId,
          status: 'todo',
          organizationId,
        },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );
      viewerTaskId = taskRes.data.id;
    });

    it('should allow owner to update task status', async () => {
      const res = await axios.patch(
        `/api/tasks/${taskId}/status`,
        { status: 'in_progress' },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );

      expect(res.status).toBe(200);
      expect(res.data.status).toBe('in_progress');
    });

    it('should allow viewer to update status of assigned task', async () => {
      const res = await axios.patch(
        `/api/tasks/${viewerTaskId}/status`,
        { status: 'in_progress' },
        { headers: { Authorization: `Bearer ${viewerToken}` } }
      );

      expect(res.status).toBe(200);
      expect(res.data.status).toBe('in_progress');
    });

    it('should update to done status', async () => {
      const res = await axios.patch(
        `/api/tasks/${viewerTaskId}/status`,
        { status: 'done' },
        { headers: { Authorization: `Bearer ${viewerToken}` } }
      );

      expect(res.status).toBe(200);
      expect(res.data.status).toBe('done');
    });

    it('should fail with invalid status', async () => {
      try {
        await axios.patch(
          `/api/tasks/${taskId}/status`,
          { status: 'invalid' },
          { headers: { Authorization: `Bearer ${ownerToken}` } }
        );
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });

  describe('DELETE /api/tasks/:id - Delete Task', () => {
    let taskToDelete: string;

    beforeAll(async () => {
      const res = await axios.post(
        '/api/tasks',
        { title: 'Task to Delete', organizationId },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );
      taskToDelete = res.data.id;
    });

    it('should NOT allow viewer to delete a task', async () => {
      // Create task assigned to viewer
      const taskRes = await axios.post(
        '/api/tasks',
        { title: 'Viewer Cannot Delete', assignedToId: viewerId, organizationId },
        { headers: { Authorization: `Bearer ${ownerToken}` } }
      );

      try {
        await axios.delete(`/api/tasks/${taskRes.data.id}`, {
          headers: { Authorization: `Bearer ${viewerToken}` },
        });
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(403);
      }
    });

    it('should allow owner to delete a task', async () => {
      const res = await axios.delete(`/api/tasks/${taskToDelete}`, {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });

      expect(res.status).toBe(200);

      // Verify it's deleted
      try {
        await axios.get(`/api/tasks/${taskToDelete}`, {
          headers: { Authorization: `Bearer ${ownerToken}` },
        });
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(404);
      }
    });

    it('should allow admin to delete a task', async () => {
      const taskRes = await axios.post(
        '/api/tasks',
        { title: 'Admin Delete Task', organizationId },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      const res = await axios.delete(`/api/tasks/${taskRes.data.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(res.status).toBe(200);
    });
  });
});
