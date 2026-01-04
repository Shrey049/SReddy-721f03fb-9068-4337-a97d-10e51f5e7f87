import axios, { AxiosError } from 'axios';

describe('Auth Endpoints', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User',
  };

  let accessToken: string;
  let userId: string;

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await axios.post('/api/auth/register', testUser);

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('accessToken');
      expect(res.data).toHaveProperty('user');
      expect(res.data.user.email).toBe(testUser.email);
      expect(res.data.user.firstName).toBe(testUser.firstName);
      expect(res.data.user.lastName).toBe(testUser.lastName);
      expect(res.data.user).not.toHaveProperty('passwordHash');

      accessToken = res.data.accessToken;
      userId = res.data.user.id;
    });

    it('should fail to register with duplicate email', async () => {
      try {
        await axios.post('/api/auth/register', testUser);
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(500); // Or 409 if you handle duplicates
      }
    });

    it('should fail to register with invalid email', async () => {
      try {
        await axios.post('/api/auth/register', {
          ...testUser,
          email: 'invalid-email',
        });
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should fail to register with missing required fields', async () => {
      try {
        await axios.post('/api/auth/register', {
          email: 'another@example.com',
        });
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const res = await axios.post('/api/auth/login', {
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(201); // NestJS POST returns 201 by default
      expect(res.data).toHaveProperty('accessToken');
      expect(res.data).toHaveProperty('user');
      expect(res.data.user.email).toBe(testUser.email);

      accessToken = res.data.accessToken;
    });

    it('should fail with wrong password', async () => {
      try {
        await axios.post('/api/auth/login', {
          email: testUser.email,
          password: 'WrongPassword123!',
        });
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should fail with non-existent email', async () => {
      try {
        await axios.post('/api/auth/login', {
          email: 'nonexistent@example.com',
          password: 'Password123!',
        });
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile with valid token', async () => {
      const res = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      expect(res.status).toBe(200);
      expect(res.data.email).toBe(testUser.email);
    });

    it('should fail without token', async () => {
      try {
        await axios.get('/api/auth/me');
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should fail with invalid token', async () => {
      try {
        await axios.get('/api/auth/me', {
          headers: { Authorization: 'Bearer invalid-token' },
        });
        fail('Should have thrown an error');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });
});
