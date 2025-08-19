import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/articles - Get all articles with filtering
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const eventId = searchParams.get('eventId');
    const editionId = searchParams.get('editionId');

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { abstract: { contains: search, mode: 'insensitive' } },
        { keywords: { contains: search, mode: 'insensitive' } },
        {
          authors: {
            some: {
              author: {
                name: { contains: search, mode: 'insensitive' }
              }
            }
          }
        }
      ];
    }

    if (eventId) {
      where.eventEdition = {
        eventId: eventId
      };
    }

    if (editionId) {
      where.eventEditionId = editionId;
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
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
      prisma.article.count({ where })
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/articles - Create new article
export async function POST(request: NextRequest) {
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
      title,
      abstract,
      keywords,
      doi,
      url,
      pdfPath,
      pages,
      eventEditionId,
      authors,
      categories
    } = body;

    // Validate required fields
    if (!title || !eventEditionId) {
      return NextResponse.json({ 
        error: 'Title and event edition are required' 
      }, { status: 400 });
    }

    // Check if event edition exists
    const eventEdition = await prisma.eventEdition.findUnique({
      where: { id: eventEditionId }
    });

    if (!eventEdition) {
      return NextResponse.json({ error: 'Event edition not found' }, { status: 404 });
    }

    // Create article with transaction for data consistency
    const article = await prisma.$transaction(async (tx) => {
      // Create article
      const newArticle = await tx.article.create({
        data: {
          title,
          abstract,
          keywords,
          doi,
          url,
          pdfPath,
          pages,
          eventEditionId
        }
      });

      // Create author associations
      if (authors && authors.length > 0) {
        for (let i = 0; i < authors.length; i++) {
          const authorData = authors[i];
          
          // Find or create author
          const author = await tx.author.upsert({
            where: { email: authorData.email },
            update: {
              name: authorData.name,
              affiliation: authorData.affiliation
            },
            create: {
              name: authorData.name,
              email: authorData.email,
              affiliation: authorData.affiliation
            }
          });

          // Create article-author association
          await tx.articleAuthor.create({
            data: {
              articleId: newArticle.id,
              authorId: author.id,
              order: i + 1
            }
          });
        }
      }

      // Create category associations
      if (categories && categories.length > 0) {
        await tx.articleCategory.createMany({
          data: categories.map((categoryId: string) => ({
            articleId: newArticle.id,
            categoryId
          }))
        });
      }

      return newArticle;
    });

    // Fetch complete article with relations
    const completeArticle = await prisma.article.findUnique({
      where: { id: article.id },
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
    });

    return NextResponse.json(completeArticle, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}