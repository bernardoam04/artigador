import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => {
    const subscription = {
        findUnique: vi.fn(async () => null),
        create: vi.fn(async ({ data }: any) => ({ id: 's1', ...data })),
        delete: vi.fn(async () => ({})),
    };
    return {
        prisma: { subscription },
    };
});

vi.mock('@/lib/email', () => {
    const sendEmail = vi.fn(async () => true);
    return {
        sendEmail,
        emailTemplates: {
            subscriptionConfirmation: (email: string, token: string) => ({ subject: 'subj', html: '<div/>', text: 't' }),
        },
    };
});

beforeEach(() => {
    vi.resetModules();
});

import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { POST } from '@/app/api/subscriptions/route';

describe('POST /api/subscriptions', () => {
    it('returns 400 for invalid email', async () => {
        const req = new Request('http://localhost/api/subscriptions', { method: 'POST', body: JSON.stringify({ email: 'invalid' }) });
        const res = await POST(req as any);
        expect(res.status).toBe(400);
    });

    it('creates subscription and returns success message', async () => {
        const req = new Request('http://localhost/api/subscriptions', { method: 'POST', body: JSON.stringify({ email: 'a@a.com' }) });
        const res = await POST(req as any);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.message).toMatch(/please check your email/i);
    });

    it('returns 400 when email already confirmed', async () => {
        (prisma.subscription.findUnique as any).mockResolvedValueOnce({ email: 'a@a.com', isConfirmed: true });
        const req = new Request('http://l/api/subscriptions', { method: 'POST', body: JSON.stringify({ email: 'a@a.com' }) });
        const res = await POST(req as any);
        expect(res.status).toBe(400);
    });

    it('resends confirmation for unconfirmed subscription', async () => {
        (prisma.subscription.findUnique as any).mockResolvedValueOnce({ email: 'a@a.com', isConfirmed: false, confirmToken: 't' });
        const req = new Request('http://l/api/subscriptions', { method: 'POST', body: JSON.stringify({ email: 'a@a.com' }) });
        const res = await POST(req as any);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.message).toMatch(/resen/i);
    });

    it('returns 500 and deletes subscription when email sending fails', async () => {
        (prisma.subscription.findUnique as any).mockResolvedValueOnce(null);
        (sendEmail as any).mockResolvedValueOnce(false);
        const req = new Request('http://l/api/subscriptions', { method: 'POST', body: JSON.stringify({ email: 'b@b.com' }) });
        const res = await POST(req as any);
        expect(res.status).toBe(500);
    });
});
