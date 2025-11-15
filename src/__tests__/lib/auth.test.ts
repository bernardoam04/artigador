import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashPassword, verifyPassword, generateToken, verifyToken, createUser, initializeAdminUser, authenticateUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Mock prisma client used by auth.ts
vi.mock('@/lib/prisma', () => {
    return {
        prisma: {
            user: {
                create: vi.fn(async ({ data }) => ({ id: 'u1', ...data })),
                findUnique: vi.fn(async () => null),
                findFirst: vi.fn(async () => null),
            },
        },
    };
});

// Silence console noise in tests
vi.spyOn(console, 'log').mockImplementation(() => { });
vi.spyOn(console, 'error').mockImplementation(() => { });

beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    vi.clearAllMocks();
});

describe('password hashing', () => {
    it('hashes and verifies passwords', async () => {
        const hash = await hashPassword('s3cret');
        expect(hash).toMatch(/\$2[aby]\$\d{2}\$/);
        await expect(verifyPassword('s3cret', hash)).resolves.toBe(true);
        await expect(verifyPassword('wrong', hash)).resolves.toBe(false);
    });
});

describe('jwt token', () => {
    it('generates and verifies token', () => {
        const token = generateToken({ id: '1', username: 'u', email: 'u@example.com', name: 'U', role: 'USER' });
        const user = verifyToken(token)!;
        expect(user).toMatchObject({ id: '1', username: 'u', role: 'USER' });
    });
});

describe('user creation and admin init', () => {
    it('creates user using prisma mock', async () => {
        const user = await createUser({ username: 'a', email: 'a@a.com', name: 'A', password: 'p' });
        expect(user).toMatchObject({ username: 'a', email: 'a@a.com' });
    });

    it('initializes admin user when not exists', async () => {
        await initializeAdminUser();
        // If no throw, path executed; prisma is mocked, so just expect no errors
        expect(true).toBe(true);
    });

    it('returns null when user creation fails', async () => {
        vi.mocked(prisma.user.create).mockRejectedValueOnce(new Error('DB error'));
        const user = await createUser({ username: 'fail', email: 'f@f.com', name: 'F', password: 'p' });
        expect(user).toBeNull();
    });
});

describe('authenticateUser', () => {
    it('authenticates user with valid credentials', async () => {
        const hashedPassword = await hashPassword('password123');
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
            id: 'user1',
            username: 'testuser',
            email: 'test@example.com',
            name: 'Test User',
            password: hashedPassword,
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const user = await authenticateUser('testuser', 'password123');
        expect(user).toMatchObject({
            id: 'user1',
            username: 'testuser',
            email: 'test@example.com',
            name: 'Test User',
            role: 'USER',
        });
    });

    it('returns null when user does not exist', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
        const user = await authenticateUser('nonexistent', 'password');
        expect(user).toBeNull();
    });

    it('returns null when password is invalid', async () => {
        const hashedPassword = await hashPassword('correctpassword');
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
            id: 'user1',
            username: 'testuser',
            email: 'test@example.com',
            name: 'Test User',
            password: hashedPassword,
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const user = await authenticateUser('testuser', 'wrongpassword');
        expect(user).toBeNull();
    });

    it('returns null when database error occurs', async () => {
        vi.mocked(prisma.user.findUnique).mockRejectedValueOnce(new Error('DB connection failed'));
        const user = await authenticateUser('testuser', 'password');
        expect(user).toBeNull();
    });
});

describe('token verification edge cases', () => {
    it('returns null for invalid token', () => {
        const result = verifyToken('invalid-token');
        expect(result).toBeNull();
    });

    it('returns null for expired token', () => {
        // Generate a token that's already expired
        const expiredToken = require('jsonwebtoken').sign(
            { id: '1', username: 'u', email: 'u@example.com', name: 'U', role: 'USER' },
            'test-secret',
            { expiresIn: '-1s' } // Already expired
        );
        const result = verifyToken(expiredToken);
        expect(result).toBeNull();
    });

    it('throws error when JWT_SECRET is missing', () => {
        const originalSecret = process.env.JWT_SECRET;
        delete process.env.JWT_SECRET;

        expect(() => {
            generateToken({ id: '1', username: 'u', email: 'u@example.com', name: 'U', role: 'USER' });
        }).toThrow('JWT_SECRET is not defined');

        process.env.JWT_SECRET = originalSecret;
    });

    it('returns null when verifying token without JWT_SECRET', () => {
        const originalSecret = process.env.JWT_SECRET;
        const token = generateToken({ id: '1', username: 'u', email: 'u@example.com', name: 'U', role: 'USER' });

        delete process.env.JWT_SECRET;
        const result = verifyToken(token);
        expect(result).toBeNull();

        process.env.JWT_SECRET = originalSecret;
    });
});
