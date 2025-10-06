import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const byYear = searchParams.get('byYear') === 'true'; // Flag for year-based grouping

    const offset = (page - 1) * limit;
    
    // Await params to get the ID
    const { id } = await params;

    // Determine if the parameter is an ID (UUID/CUID) or a name (hyphenated string)
    const isId = /^[a-z0-9]{25}$/.test(id) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    let author;
    let articlesQuery;

    if (isId) {
      // Original ID-based lookup
      author = await prisma.author.findUnique({
        where: { id },
        include: {
          _count: {
            select: { articles: true }
          }
        }
      });
      articlesQuery = { authorId: id };
    } else {
      // Name-based lookup - convert hyphenated name to proper format
      const authorName = decodeURIComponent(id)
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // First, try to find the author by exact name match
      author = await prisma.author.findFirst({
        where: { 
          name: authorName
        },
        include: {
          _count: {
            select: { articles: true }
          }
        }
      });

      // If not found, try alternative formats
      if (!author) {
        // Try with the original encoded name as-is
        const originalName = decodeURIComponent(id).replace(/-/g, ' ');
        author = await prisma.author.findFirst({
          where: { 
            name: originalName
          },
          include: {
            _count: {
              select: { articles: true }
            }
          }
        });
      }

      // If still not found, try fuzzy search with contains
      if (!author) {
        const searchTerms = authorName.split(' ');
        author = await prisma.author.findFirst({
          where: {
            AND: searchTerms.map(term => ({
              name: {
                contains: term
              }
            }))
          },
          include: {
            _count: {
              select: { articles: true }
            }
          }
        });
      }

      if (!author) {
        return NextResponse.json({ error: 'Author not found' }, { status: 404 });
      }

      articlesQuery = { authorId: author.id };
    }

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    // For name-based requests with byYear flag, return all articles grouped by year
    if (!isId && byYear) {
      const articlesData = await prisma.articleAuthor.findMany({
        where: articlesQuery,
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
      });

      const articles = articlesData.map(aa => aa.article);

      return NextResponse.json({
        author,
        articles
      });
    }

    // Original paginated response for ID-based requests
    const [articlesData] = await Promise.all([
      prisma.articleAuthor.findMany({
        where: articlesQuery,
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

    const totalArticles = await prisma.articleAuthor.count({
      where: articlesQuery
    });

    // Get unique events and venues the author has published in (only for ID-based requests)
    const authorEvents = isId ? await prisma.articleAuthor.findMany({
      where: articlesQuery,
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
    }) : [];

    // Group by events and count
    const eventStats = authorEvents.reduce((acc: any, articleAuthor: any) => {
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