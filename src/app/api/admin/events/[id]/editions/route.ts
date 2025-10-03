import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/admin/events/[id]/editions
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = verifyToken(token);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;

    const editions = await prisma.eventEdition.findMany({
      where: { eventId: id },
      orderBy: { year: 'desc' },
      include: {
        _count: { select: { articles: true } }, // ok se existir relação
      },
    });

    return NextResponse.json(editions);
  } catch (error) {
    console.error('Error fetching editions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/events/[id]/editions
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = verifyToken(token);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const {
      year,
      // campos do SEU schema:
      city,
      country,
      venue,
      startDate,
      endDate,
      submissionDeadline,
      notificationDate,
      cameraReadyDate,
      website,
      description,
      chairpersons, // você anotou como "JSON array" mas está String? no schema
      tracks,       // idem
      isPublished,
    } = body;

    // Validações mínimas alinhadas ao schema
    if (!year) {
      return NextResponse.json({ error: 'year é obrigatório' }, { status: 400 });
    }
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'startDate e endDate são obrigatórios' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(+start) || Number.isNaN(+end)) {
      return NextResponse.json({ error: 'Datas inválidas' }, { status: 400 });
    }
    if (end < start) {
      return NextResponse.json({ error: 'endDate não pode ser anterior a startDate' }, { status: 400 });
    }

    // Garante que o evento existe
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    // Evita edição duplicada por ano para o mesmo evento
    const existing = await prisma.eventEdition.findFirst({
      where: { eventId: id, year: parseInt(String(year), 10) },
    });
    if (existing) {
      return NextResponse.json({ error: 'Edition for this year already exists' }, { status: 400 });
    }

    const edition = await prisma.eventEdition.create({
      data: {
        eventId: id,
        year: parseInt(String(year), 10),

        // campos do seu schema:
        city: city ?? null,
        country: country ?? null,
        venue: venue ?? null,

        startDate: start,
        endDate: end,

        submissionDeadline: submissionDeadline ? new Date(submissionDeadline) : null,
        notificationDate: notificationDate ? new Date(notificationDate) : null,
        cameraReadyDate: cameraReadyDate ? new Date(cameraReadyDate) : null,

        website: website ?? null,
        description: description ?? null,

        // OBS: você marcou "JSON array" mas no schema estão como String?
        // Se for JSON de verdade, mude no schema para Json.
        chairpersons: chairpersons ?? null,
        tracks: tracks ?? null,

        isPublished: typeof isPublished === 'boolean' ? isPublished : false,
      },
      include: {
        _count: { select: { articles: true } },
      },
    });

    return NextResponse.json(edition, { status: 201 });
  } catch (error) {
    console.error('Error creating edition:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
