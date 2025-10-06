import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/events/shortname/[shortName] - Get event by shortName with editions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortName: string }> }
) {
  try {
    const { shortName: rawShortName } = await params;
    const shortName = rawShortName.toUpperCase();

    const event = await prisma.event.findFirst({
      where: { 
        shortName: shortName
      },
      include: {
        editions: {
          include: {
            _count: {
              select: { articles: true }
            }
          },
          orderBy: { year: 'desc' }
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
    console.error('Error fetching event by shortName:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}