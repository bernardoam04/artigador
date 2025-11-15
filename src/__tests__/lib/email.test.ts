import { describe, it, expect, vi } from 'vitest';

const sendMailImpl = vi.fn(async (_opts?: any) => ({ messageId: 'x' }));
vi.mock('nodemailer', () => ({
    createTransport: () => ({ sendMail: (opts: any) => sendMailImpl(opts) }),
}));

import { emailTemplates, sendEmail } from '@/lib/email';

describe('email templates', () => {
    it('generates newArticleNotification', () => {
        const t = emailTemplates.newArticleNotification('Alice', 'Paper', 'http://x');
        expect(t.subject).toMatch(/Alice/);
        expect(t.text).toMatch(/Paper/);
        expect(t.html).toMatch(/Alice/);
        expect(t.html).toMatch(/Paper/);
        expect(t.html).toMatch(/http:\/\/x/);
    });

    it('generates subscriptionConfirmation with link', () => {
        const t = emailTemplates.subscriptionConfirmation('a@a.com', 'token123');
        expect(t.subject).toMatch(/confirm/i);
        expect(t.html).toMatch(/token123/);
        expect(t.text).toMatch(/token123/);
    });

    it('generates eventArticleNotification', () => {
        const t = emailTemplates.eventArticleNotification('ICML 2024', 'ML Paper', 'http://example.com');
        expect(t.subject).toMatch(/ICML 2024/);
        expect(t.subject).toMatch(/ML Paper/);
        expect(t.html).toMatch(/ICML 2024/);
        expect(t.html).toMatch(/ML Paper/);
        expect(t.html).toMatch(/http:\/\/example\.com/);
        expect(t.text).toMatch(/ICML 2024/);
        expect(t.text).toMatch(/ML Paper/);
    });

    it('generates welcomeEmail', () => {
        const t = emailTemplates.welcomeEmail('John Doe');
        expect(t.subject).toMatch(/Welcome/i);
        expect(t.html).toMatch(/John Doe/);
        expect(t.html).toMatch(/Artigador/);
        expect(t.text).toMatch(/John Doe/);
    });

    it('generates subscriptionWelcome', () => {
        const t = emailTemplates.subscriptionWelcome('user@example.com');
        expect(t.subject).toMatch(/confirmed/i);
        expect(t.html).toMatch(/subscription has been confirmed/i);
        // Email is URL-encoded in the unsubscribe link
        expect(t.html).toContain('user%40example.com');
        expect(t.text).toMatch(/confirmed/i);
    });
});

describe('sendEmail', () => {
    it('returns true when transporter sends', async () => {
        sendMailImpl.mockResolvedValueOnce({ messageId: 'ok' } as any);
        const ok = await sendEmail({ to: 'a@a.com', subject: 's', html: '<b>x</b>' });
        expect(ok).toBe(true);
    });

    it('returns false on transport error', async () => {
        sendMailImpl.mockRejectedValueOnce(new Error('smtp'));
        const ok = await sendEmail({ to: 'a@a.com', subject: 's', html: '<b>x</b>' });
        expect(ok).toBe(false);
    });

    it('handles multiple recipients', async () => {
        sendMailImpl.mockResolvedValueOnce({ messageId: 'multi' } as any);
        const ok = await sendEmail({
            to: ['user1@test.com', 'user2@test.com'],
            subject: 'Test',
            html: '<p>Multi</p>'
        });
        expect(ok).toBe(true);
    });

    it('includes text field when provided', async () => {
        sendMailImpl.mockResolvedValueOnce({ messageId: 'text' } as any);
        const ok = await sendEmail({
            to: 'a@a.com',
            subject: 's',
            html: '<b>x</b>',
            text: 'plain text'
        });
        expect(ok).toBe(true);
        expect(sendMailImpl).toHaveBeenCalledWith(
            expect.objectContaining({ text: 'plain text' })
        );
    });
});
