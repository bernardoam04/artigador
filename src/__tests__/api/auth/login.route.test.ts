import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/login/route';
import { createMockRequest, getResponseJSON } from '@/__tests__/mocks/nextRequest';

// Mock the auth module
vi.mock('@/lib/auth', () => ({
    authenticateUser: vi.fn(),
    generateToken: vi.fn(),
    initializeAdminUser: vi.fn(),
}));

import { authenticateUser, generateToken, initializeAdminUser } from '@/lib/auth';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('POST /api/auth/login', () => {
    it('returns 400 when username is missing', async () => {
        const request = createMockRequest({
            method: 'POST',
            body: { password: 'test123' }
        });

        const response = await POST(request);
        const data = await getResponseJSON(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Username and password are required' });
    });

    it('returns 400 when password is missing', async () => {
        const request = createMockRequest({
            method: 'POST',
            body: { username: 'testuser' }
        });

        const response = await POST(request);
        const data = await getResponseJSON(response);

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'Username and password are required' });
    });

    it('returns 401 when credentials are invalid', async () => {
        vi.mocked(authenticateUser).mockResolvedValueOnce(null);

        const request = createMockRequest({
            method: 'POST',
            body: { username: 'wronguser', password: 'wrongpass' }
        });

        const response = await POST(request);
        const data = await getResponseJSON(response);

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Invalid credentials' });
        expect(authenticateUser).toHaveBeenCalledWith('wronguser', 'wrongpass');
    });

    it('returns user and token on successful login', async () => {
        const mockUser = {
            id: 'user123',
            username: 'testuser',
            email: 'test@example.com',
            name: 'Test User',
            role: 'USER' as const
        };

        const mockToken = 'jwt-token-12345';

        vi.mocked(authenticateUser).mockResolvedValueOnce(mockUser);
        vi.mocked(generateToken).mockReturnValueOnce(mockToken);

        const request = createMockRequest({
            method: 'POST',
            body: { username: 'testuser', password: 'correctpass' }
        });

        const response = await POST(request);
        const data = await getResponseJSON(response);

        expect(response.status).toBe(200);
        expect(data).toEqual({
            user: mockUser,
            token: mockToken
        });
        expect(authenticateUser).toHaveBeenCalledWith('testuser', 'correctpass');
        expect(generateToken).toHaveBeenCalledWith(mockUser);
    });

    it('initializes admin user on login attempt', async () => {
        const mockUser = {
            id: 'user123',
            username: 'admin',
            email: 'admin@example.com',
            name: 'Admin',
            role: 'ADMIN' as const
        };

        vi.mocked(authenticateUser).mockResolvedValueOnce(mockUser);
        vi.mocked(generateToken).mockReturnValueOnce('token');

        const request = createMockRequest({
            method: 'POST',
            body: { username: 'admin', password: 'admin123' }
        });

        await POST(request);

        expect(initializeAdminUser).toHaveBeenCalled();
    });

    it('returns 500 on internal server error', async () => {
        vi.mocked(authenticateUser).mockRejectedValueOnce(new Error('Database error'));

        const request = createMockRequest({
            method: 'POST',
            body: { username: 'testuser', password: 'password' }
        });

        const response = await POST(request);
        const data = await getResponseJSON(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Internal server error' });
    });

    it('handles malformed JSON request body', async () => {
        // Create a request with invalid JSON
        const request = new Request('http://localhost:3000/api/auth/login', {
            method: 'POST',
            body: 'invalid json{',
            headers: { 'Content-Type': 'application/json' }
        });

        const response = await POST(request as any);
        const data = await getResponseJSON(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Internal server error' });
    });
});
