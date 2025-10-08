import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: AuthUser): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      name: user.name,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    return {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
}

export async function authenticateUser(username: string, password: string): Promise<AuthUser | null> {
  try {
    console.log('Attempting to authenticate user:', username);
    
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      console.log('User not found:', username);
      return null;
    }

    console.log('User found, verifying password...');
    const isValid = await verifyPassword(password, user.password);
    console.log('Password verification result:', isValid);
    
    if (!isValid) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function createUser(userData: {
  username: string;
  email: string;
  name: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}): Promise<AuthUser | null> {
  try {
    const hashedPassword = await hashPassword(userData.password);
    
    const user = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: userData.role || 'USER'
      }
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role
    };
  } catch (error) {
    console.error('User creation error:', error);
    return null;
  }
}

// Initialize admin user if it doesn't exist
export async function initializeAdminUser(): Promise<void> {
  try {
    console.log('Checking for admin user...');
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminExists) {
      console.log('No admin user found, creating one...');
      const adminUser = await createUser({
        username: 'admin',
        email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@artigador.com',
        name: 'Administrator',
        password: 'admin123', // Change this in production!
        role: 'ADMIN'
      });
      
      if (adminUser) {
        console.log('Admin user created successfully with username: admin, password: admin123');
      } else {
        console.error('Failed to create admin user');
      }
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Failed to initialize admin user:', error);
  }
}