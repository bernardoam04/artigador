import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/events/[id]/editions
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }  // 👈 params como Promise
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = verifyToken(token);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;        // 👈 AQUI
    const editions = await prisma.eventEdition.findMany({
      where: { eventId: id },                   // 👈 usa a string resolvida
      orderBy: { year: 'desc' },
      include: { _count: { select: { articles: true } } }
    });

    return NextResponse.json(editions);
  } catch (e) {
    console.error('Error fetching editions:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/events/[id]/editions
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }  // 👈 Promise
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = verifyToken(token);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;        // 👈 AQUI
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
      cameraReadyDeadline,
      city, // opcional, se existir no schema
    } = body;

    if (!year || !title) {
      return NextResponse.json({ error: 'year and title are required' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const dup = await prisma.eventEdition.findFirst({
      where: { eventId: id, year: parseInt(year) }
    });
    if (dup) return NextResponse.json({ error: 'Edition for this year already exists' }, { status: 400 });

    const data: any = {
      eventId: id,
      year: parseInt(year),
      title,
      description: description ?? null,
      location: location ?? null,
      website: website ?? null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      submissionDeadline: submissionDeadline ? new Date(submissionDeadline) : null,
      notificationDate: notificationDate ? new Date(notificationDate) : null,
      cameraReadyDeadline: cameraReadyDeadline ? new Date(cameraReadyDeadline) : null,
    };
    if (typeof city === 'string') data.city = city;  // só envia se vier string válida

    const edition = await prisma.eventEdition.create({
      data,
      include: { _count: { select: { articles: true } } }
    });

    return NextResponse.json(edition, { status: 201 });
  } catch (e) {
    console.error('Error creating edition:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

//DELETE /api/admin/events/[id]

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
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
    const { id } = context.params;

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Event deleted successfully' });

  } catch (e: any) {
    if (e.code === 'P2025') {
       return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    console.error('Error deleting event:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}