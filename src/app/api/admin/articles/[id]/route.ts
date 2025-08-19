import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/articles/[id] - Get specific article
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

    const article = await prisma.article.findUnique({
      where: { id: params.id },
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

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/articles/[id] - Update article
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

    // Update article with transaction
    const article = await prisma.$transaction(async (tx) => {
      // Update article
      const updatedArticle = await tx.article.update({
        where: { id: params.id },
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

      // Delete existing author associations
      await tx.articleAuthor.deleteMany({
        where: { articleId: params.id }
      });

      // Create new author associations
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
              articleId: params.id,
              authorId: author.id,
              order: i + 1
            }
          });
        }
      }

      // Delete existing category associations
      await tx.articleCategory.deleteMany({
        where: { articleId: params.id }
      });

      // Create new category associations
      if (categories && categories.length > 0) {
        await tx.articleCategory.createMany({
          data: categories.map((categoryId: string) => ({
            articleId: params.id,
            categoryId
          }))
        });
      }

      return updatedArticle;
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

    return NextResponse.json(completeArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/articles/[id] - Delete article
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

    // Delete article (cascading deletes will handle relations)
    await prisma.article.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}