import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('q')?.trim().toLowerCase();
    const eventId = searchParams.get('eventId');
    const categoryId = searchParams.get('categoryId');
    const authorId = searchParams.get('authorId');
    const sort = searchParams.get('sort') || 'recent'; // recent, relevance, title

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search} },
        { abstract: { contains: search} },
        { keywords: { contains: search} },
        {
          authors: {
            some: {
              author: {
                name: { contains: search}
              }
            }
          }
        },
        // Enhanced search: event names
        {
          eventEdition: {
            event: {
              OR: [
                { name: { contains: search} },
                { shortName: { contains: search} }
              ]
            }
          }
        },
        // Enhanced search: edition titles
        {
          eventEdition: {
            title: { contains: search}
          }
        }
      ];
    }

    if (eventId) {
      where.eventEdition = {
        eventId: eventId
      };
    }

    if (categoryId) {
      where.categories = {
        some: {
          categoryId: categoryId
        }
      };
    }

    if (authorId) {
      where.authors = {
        some: {
          authorId: authorId
        }
      };
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' }; // default: recent
    if (sort === 'title') {
      orderBy = { title: 'asc' };
    }
    // Note: relevance sorting would require more complex logic with search ranking

    const [articles, total, stats] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
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
      }),
      prisma.article.count({ where }),
      // Get overall stats for the homepage
      !search && page === 1 ? Promise.all([
        prisma.article.count(),
        prisma.author.count(),
        prisma.event.count(),
        prisma.eventEdition.count()
      ]) : Promise.resolve([null, null, null, null])
    ]);

    const response: any = {
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };

    // Add stats for homepage
    if (stats[0] !== null) {
      response.stats = {
        articles: stats[0],
        authors: stats[1],
        events: stats[2],
        editions: stats[3]
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}