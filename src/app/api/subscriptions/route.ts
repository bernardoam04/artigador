import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';
import crypto from 'crypto';

// POST /api/subscriptions - Create new subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, interests = [] } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Check if subscription already exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { email }
    });

    if (existingSubscription) {
      if (existingSubscription.isConfirmed) {
        return NextResponse.json({ 
          error: 'This email is already subscribed to our newsletter' 
        }, { status: 400 });
      } else {
        // Resend confirmation email for unconfirmed subscription
        const confirmationEmail = emailTemplates.subscriptionConfirmation(
          email, 
          existingSubscription.confirmToken
        );
        
        await sendEmail({
          to: email,
          ...confirmationEmail
        });

        return NextResponse.json({ 
          message: 'Confirmation email resent. Please check your inbox.' 
        });
      }
    }

    // Create new subscription with confirmation token
    const confirmToken = crypto.randomBytes(32).toString('hex');
    
    const subscription = await prisma.subscription.create({
      data: {
        email,
        name: name || null,
        interests: interests.join(','),
        confirmToken,
        isConfirmed: false
      }
    });

    // Send confirmation email
    const confirmationEmail = emailTemplates.subscriptionConfirmation(email, confirmToken);
    
    const emailSent = await sendEmail({
      to: email,
      ...confirmationEmail
    });

    if (!emailSent) {
      // Delete the subscription if email failed to send
      await prisma.subscription.delete({ where: { id: subscription.id } });
      return NextResponse.json({ 
        error: 'Failed to send confirmation email. Please try again.' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Please check your email to confirm your subscription.' 
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/subscriptions - Get all subscriptions (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // This would need admin authentication in a real app
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const offset = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          interests: true,
          isConfirmed: true,
          createdAt: true,
          confirmedAt: true
        }
      }),
      prisma.subscription.count()
    ]);

    return NextResponse.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}