import nodemailer from 'nodemailer';

// Create email transporter
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password',
  },
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"Artigador" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Email templates
export const emailTemplates = {
  newArticleNotification: (authorName: string, articleTitle: string, articleUrl: string) => ({
    subject: `New article by ${authorName} - ${articleTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Article Available</h2>
        <p>A new article by <strong>${authorName}</strong> has been published:</p>
        <h3 style="color: #374151;">${articleTitle}</h3>
        <p>
          <a href="${articleUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Article
          </a>
        </p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          You received this email because you subscribed to notifications for ${authorName}'s articles.
          <br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color: #6b7280;">Unsubscribe</a>
        </p>
      </div>
    `,
    text: `New article by ${authorName}: ${articleTitle}\n\nView at: ${articleUrl}`
  }),

  eventArticleNotification: (eventName: string, articleTitle: string, articleUrl: string) => ({
    subject: `New article in ${eventName} - ${articleTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Article in ${eventName}</h2>
        <p>A new article has been published in <strong>${eventName}</strong>:</p>
        <h3 style="color: #374151;">${articleTitle}</h3>
        <p>
          <a href="${articleUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Article
          </a>
        </p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          You received this email because you subscribed to notifications for ${eventName}.
          <br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color: #6b7280;">Unsubscribe</a>
        </p>
      </div>
    `,
    text: `New article in ${eventName}: ${articleTitle}\n\nView at: ${articleUrl}`
  }),

  welcomeEmail: (name: string) => ({
    subject: 'Welcome to Artigador.com',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Artigador.com!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for joining Artigador.com, your academic article library. You can now:</p>
        <ul>
          <li>Search and browse thousands of research articles</li>
          <li>Subscribe to get notified about new articles from your favorite authors</li>
          <li>Follow conferences and events for the latest publications</li>
          <li>Create your author profile and showcase your work</li>
        </ul>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Start Exploring
          </a>
        </p>
      </div>
    `,
    text: `Welcome to Artigador.com, ${name}! Start exploring at: ${process.env.NEXT_PUBLIC_APP_URL}`
  }),

  subscriptionConfirmation: (email: string, confirmToken: string) => {
    const confirmUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/subscriptions/confirm?token=${confirmToken}`;
    return {
      subject: 'Confirm your subscription to Artigador',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
          <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to Artigador!</h1>
            <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Your gateway to academic excellence</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #374151; margin-top: 0;">Confirm Your Subscription</h2>
            <p style="color: #6B7280; margin-bottom: 25px;">
              Thank you for subscribing to Artigador! We're excited to keep you updated with the latest research articles and academic content.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Confirm Subscription
              </a>
            </div>
            
            <p style="color: #9CA3AF; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${confirmUrl}" style="color: #3B82F6; word-break: break-all;">${confirmUrl}</a>
            </p>
          </div>
          
          <div style="background: #F9FAFB; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; color: #6B7280; font-size: 14px;">© 2024 Artigador. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `
        Welcome to Artigador!
        
        Thank you for subscribing to our newsletter. To confirm your subscription, please visit:
        ${confirmUrl}
        
        If you didn't subscribe, you can safely ignore this email.
      `
    };
  },

  subscriptionWelcome: (email: string) => ({
    subject: 'Welcome to Artigador - Your subscription is confirmed!',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 You're All Set!</h1>
          <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Your subscription is now active</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #374151; margin-top: 0;">Welcome to the Artigador Community!</h2>
          
          <p style="color: #6B7280; margin-bottom: 20px;">
            Your subscription has been confirmed! You'll now receive our curated newsletter with:
          </p>
          
          <ul style="color: #6B7280; padding-left: 20px;">
            <li style="margin-bottom: 8px;">📚 Latest research articles and publications</li>
            <li style="margin-bottom: 8px;">🎯 Updates on academic events and conferences</li>
            <li style="margin-bottom: 8px;">👥 Featured authors and their work</li>
            <li style="margin-bottom: 8px;">🔍 New tools and features on Artigador</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-right: 10px;">
              Browse Articles
            </a>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/events" style="display: inline-block; background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              View Events
            </a>
          </div>
        </div>
        
        <div style="background: #F9FAFB; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="margin: 0; color: #6B7280; font-size: 14px;">
            © 2024 Artigador. All rights reserved.<br>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #6B7280; text-decoration: underline;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `,
    text: `
      Welcome to Artigador!
      
      Your subscription has been confirmed! You'll now receive our newsletter with the latest research articles, academic events, and platform updates.
      
      Start exploring: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}
    `
  })
};