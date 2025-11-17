import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NewsletterSignup from '@/components/NewsletterSignup';

const originalFetch = global.fetch;

afterEach(() => {
    global.fetch = originalFetch as any;
});

describe('NewsletterSignup', () => {
    it('submits and shows success message', async () => {
        global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ message: 'Please check your email to confirm your subscription.' }) })) as any;

        render(<NewsletterSignup variant="compact" />);
        const input = screen.getByPlaceholderText(/your\.email@example\.com/i);
        fireEvent.change(input, { target: { value: 'test@example.com' } });

        const button = screen.getByRole('button', { name: /subscribe/i });
        fireEvent.click(button);
        expect(await screen.findByText(/please check your email/i)).toBeInTheDocument();
    });

    it('handles network error', async () => {
        global.fetch = vi.fn(async () => { throw new Error('network'); }) as any;

        render(<NewsletterSignup variant="compact" />);
        const input = screen.getByPlaceholderText(/your\.email@example\.com/i);
        fireEvent.change(input, { target: { value: 'test@example.com' } });

        fireEvent.click(screen.getByRole('button', { name: /subscribe/i }));
        expect(await screen.findByText(/network error/i)).toBeInTheDocument();
    });
});
