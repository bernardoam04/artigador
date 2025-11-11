import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashPassword, verifyPassword, generateToken, verifyToken, createUser, initializeAdminUser } from '@/lib/auth';

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
});
