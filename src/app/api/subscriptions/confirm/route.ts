import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';

// GET /api/subscriptions/confirm - Confirm subscription via email token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        new URL('/subscribe?error=missing_token', request.url)
      );
    }

    // Find subscription by confirmation token
    const subscription = await prisma.subscription.findFirst({
      where: { 
        confirmToken: token,
        isConfirmed: false 
      }
    });

    if (!subscription) {
      return NextResponse.redirect(
        new URL('/subscribe?error=invalid_token', request.url)
      );
    }

    // Update subscription as confirmed
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        isConfirmed: true,
        confirmedAt: new Date(),
        confirmToken: null // Clear the token after confirmation
      }
    });

    // Send welcome email
    const welcomeEmail = emailTemplates.subscriptionWelcome(subscription.email);
    await sendEmail({
      to: subscription.email,
      ...welcomeEmail
    });

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/subscribe?confirmed=true', request.url)
    );

  } catch (error) {
    console.error('Error confirming subscription:', error);
    return NextResponse.redirect(
      new URL('/subscribe?error=server_error', request.url)
    );
  }
}