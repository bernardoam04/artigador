import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/events/shortname/[shortName]/[year] - Get event edition by shortName and year with articles
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortName: string; year: string }> }
) {
  try {
    const { shortName: rawShortName, year: rawYear } = await params;
    const shortName = rawShortName.toUpperCase();
    const year = parseInt(rawYear);

    if (isNaN(year)) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
    }

    // First find the event by shortName
    const event = await prisma.event.findFirst({
      where: { 
        shortName: shortName
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Then find the edition for that year
    const edition = await prisma.eventEdition.findFirst({
      where: {
        eventId: event.id,
        year: year
      },
      include: {
        event: true,
        articles: {
          include: {
            authors: {
              include: {
                author: true
              },
              orderBy: { order: 'asc' }
            },
            categories: {
              include: {
                category: true
              }
            }
          },
          orderBy: { title: 'asc' }
        },
        _count: {
          select: { articles: true }
        }
      }
    });

    if (!edition) {
      return NextResponse.json({ error: 'Edition not found' }, { status: 404 });
    }

    return NextResponse.json(edition);
  } catch (error) {
    console.error('Error fetching event edition by shortName and year:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}