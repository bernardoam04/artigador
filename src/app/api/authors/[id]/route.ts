import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const offset = (page - 1) * limit;

    const [author, articlesData] = await Promise.all([
      prisma.author.findUnique({
        where: { id: params.id },
        include: {
          _count: {
            select: { articles: true }
          }
        }
      }),
      prisma.articleAuthor.findMany({
        where: { authorId: params.id },
        orderBy: { article: { createdAt: 'desc' } },
        skip: offset,
        take: limit,
        include: {
          article: {
            include: {
              authors: {
                include: {
                  author: true
                },
                orderBy: { order: 'asc' }
              },
              eventEdition: {
                include: {
                  event: true
                }
              },
              categories: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      })
    ]);

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    const totalArticles = await prisma.articleAuthor.count({
      where: { authorId: params.id }
    });

    // Get unique events and venues the author has published in
    const authorEvents = await prisma.articleAuthor.findMany({
      where: { authorId: params.id },
      include: {
        article: {
          include: {
            eventEdition: {
              include: {
                event: true
              }
            }
          }
        }
      }
    });

    // Group by events and count
    const eventStats = authorEvents.reduce((acc, articleAuthor) => {
      const event = articleAuthor.article.eventEdition.event;
      const key = event.id;
      if (!acc[key]) {
        acc[key] = {
          event,
          count: 0,
          years: new Set()
        };
      }
      acc[key].count++;
      acc[key].years.add(articleAuthor.article.eventEdition.year);
      return acc;
    }, {} as any);

    const venues = Object.values(eventStats).map((stat: any) => ({
      event: stat.event,
      articleCount: stat.count,
      years: Array.from(stat.years).sort((a, b) => (b as number) - (a as number))
    }));

    return NextResponse.json({
      author,
      articles: articlesData.map(aa => aa.article),
      venues,
      pagination: {
        page,
        limit,
        total: totalArticles,
        pages: Math.ceil(totalArticles / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching author:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}