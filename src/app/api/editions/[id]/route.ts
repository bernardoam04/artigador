import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const offset = (page - 1) * limit;

    const [edition, articlesData] = await Promise.all([
      prisma.eventEdition.findUnique({
        where: { id: params.id },
        include: {
          event: true,
          _count: {
            select: { articles: true }
          }
        }
      }),
      prisma.article.findMany({
        where: { eventEditionId: params.id },
        orderBy: { title: 'asc' },
        skip: offset,
        take: limit,
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
        }
      })
    ]);

    if (!edition) {
      return NextResponse.json({ error: 'Edition not found' }, { status: 404 });
    }

    const totalArticles = await prisma.article.count({
      where: { eventEditionId: params.id }
    });

    return NextResponse.json({
      edition,
      articles: articlesData,
      pagination: {
        page,
        limit,
        total: totalArticles,
        pages: Math.ceil(totalArticles / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching edition:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}