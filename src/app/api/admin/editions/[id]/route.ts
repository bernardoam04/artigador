import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/editions/[id] - Get specific edition
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

    const edition = await prisma.eventEdition.findUnique({
      where: { id: params.id },
      include: {
        event: true,
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
    console.error('Error fetching edition:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/editions/[id] - Update edition
export async function PUT(
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

    const edition = await prisma.eventEdition.update({
      where: { id: params.id },
      data: {
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
        event: true,
        _count: {
          select: { articles: true }
        }
      }
    });

    return NextResponse.json(edition);
  } catch (error) {
    console.error('Error updating edition:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/editions/[id] - Delete edition
export async function DELETE(
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

    // Check if edition has articles
    const edition = await prisma.eventEdition.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });

    if (!edition) {
      return NextResponse.json({ error: 'Edition not found' }, { status: 404 });
    }

    if (edition._count.articles > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete edition with articles. Delete articles first.' 
      }, { status: 400 });
    }

    await prisma.eventEdition.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Edition deleted successfully' });
  } catch (error) {
    console.error('Error deleting edition:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}