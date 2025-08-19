import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/subscriptions/unsubscribe - Unsubscribe email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find and delete subscription
    const subscription = await prisma.subscription.findUnique({
      where: { email }
    });

    if (!subscription) {
      return NextResponse.json({ 
        message: 'Email not found in our subscription list' 
      });
    }

    await prisma.subscription.delete({
      where: { email }
    });

    return NextResponse.json({ 
      message: 'You have been successfully unsubscribed from our newsletter' 
    });

  } catch (error) {
    console.error('Error unsubscribing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/subscriptions/unsubscribe - Unsubscribe via URL (for email links)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.redirect(
        new URL('/unsubscribe?error=missing_email', request.url)
      );
    }

    // Find and delete subscription
    const subscription = await prisma.subscription.findUnique({
      where: { email }
    });

    if (!subscription) {
      return NextResponse.redirect(
        new URL('/unsubscribe?status=not_found', request.url)
      );
    }

    await prisma.subscription.delete({
      where: { email }
    });

    return NextResponse.redirect(
      new URL('/unsubscribe?status=success', request.url)
    );

  } catch (error) {
    console.error('Error unsubscribing:', error);
    return NextResponse.redirect(
      new URL('/unsubscribe?error=server_error', request.url)
    );
  }
}