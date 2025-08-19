import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { 
        id: params.id,
        isActive: true
      },
      include: {
        editions: {
          orderBy: { year: 'desc' },
          include: {
            _count: {
              select: { articles: true }
            }
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        _count: {
          select: { editions: true }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}