import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/events/[id]/editions - Get all editions for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const editions = await prisma.eventEdition.findMany({
      where: { eventId: params.id },
      orderBy: { year: 'desc' },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });

    return NextResponse.json(editions);
  } catch (error) {
    console.error('Error fetching editions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/events/[id]/editions - Create new edition
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      year, 
      title, 
      description, 
      location, 
      website, 
      startDate, 
      endDate, 
      submissionDeadline,
      notificationDate,
      cameraReadyDeadline 
    } = body;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: params.id }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if edition with this year already exists for this event
    const existingEdition = await prisma.eventEdition.findFirst({
      where: {
        eventId: params.id,
        year: parseInt(year)
      }
    });

    if (existingEdition) {
      return NextResponse.json({ error: 'Edition for this year already exists' }, { status: 400 });
    }

    const edition = await prisma.eventEdition.create({
      data: {
        eventId: params.id,
        year: parseInt(year),
        title,
        description,
        location,
        website,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        submissionDeadline: submissionDeadline ? new Date(submissionDeadline) : null,
        notificationDate: notificationDate ? new Date(notificationDate) : null,
        cameraReadyDeadline: cameraReadyDeadline ? new Date(cameraReadyDeadline) : null
      },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });

    return NextResponse.json(edition, { status: 201 });
  } catch (error) {
    console.error('Error creating edition:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}