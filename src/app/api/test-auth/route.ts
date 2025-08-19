import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth';

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);

    // Test password hashing
    const testPassword = 'admin123';
    const hashedPassword = await hashPassword(testPassword);
    const isValid = await verifyPassword(testPassword, hashedPassword);
    
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    let adminPasswordValid = false;
    if (adminUser) {
      adminPasswordValid = await verifyPassword('admin123', adminUser.password);
    }

    return NextResponse.json({
      userCount,
      passwordHashTest: {
        original: testPassword,
        hashed: hashedPassword,
        verification: isValid
      },
      adminUser: adminUser ? {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        passwordValid: adminPasswordValid
      } : null
    });
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}