import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        authors: {
          include: { author: true },
          orderBy: { order: 'asc' },
        },
        categories: {
          include: { category: true },
        },
        eventEdition: {
          include: { event: true },
        },
        user: true,
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
