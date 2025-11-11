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
    });

    it('generates subscriptionConfirmation with link', () => {
        const t = emailTemplates.subscriptionConfirmation('a@a.com', 'token123');
        expect(t.subject).toMatch(/confirm/i);
        expect(t.html).toMatch(/token123/);
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
});
