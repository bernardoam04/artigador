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
    //
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
// POST /api/admin/articles - Create new article
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
      url,          // vem do front
      pdfPath,      // vem do front (vamos ignorar como coluna, só usar para pdfUrl se útil)
      pages,        // vem do front ("1-200" etc.)
      eventEditionId,
      authors,
      categories,
      publishedDate,   // se existir no seu schema como obrigatório, valide
      submittedDate,   // idem: ajuste conforme seu schema
      language,
      track,
      status,          // se tiver enum ArticleStatus
    } = body;

    if (!title || !eventEditionId) {
      return NextResponse.json(
        { error: 'Title and event edition are required' },
        { status: 400 }
      );
    }

    // Confirma que a edição existe
    const eventEdition = await prisma.eventEdition.findUnique({ where: { id: eventEditionId } });
    if (!eventEdition) {
      return NextResponse.json({ error: 'Event edition not found' }, { status: 404 });
    }

    // ======= MAPEAMENTOS PARA O SCHEMA ATUAL =======

    // pdfUrl: use "url" do front; se não tiver, caia para pdfPath
    const pdfUrl: string | null = url ?? pdfPath ?? null;

    // arxivId: se o pdfUrl for do arXiv, extraia o id (opcional)
    let arxivId: string | null = null;
    if (pdfUrl) {
      const m =
        /arxiv\.org\/(?:abs|pdf)\/([0-9]{4}\.[0-9]{4,5})(?:v\d+)?/i.exec(pdfUrl);
      if (m?.[1]) arxivId = m[1];
    }

    // pages: converter "1-200" -> startPage=1, endPage=200, pageCount=200
    let startPage: number | null = null;
    let endPage: number | null = null;
    let pageCount: number | null = null;
    if (typeof pages === 'string' && pages.trim()) {
      const range = pages.trim();
      const m = /^(\d+)\s*-\s*(\d+)$/.exec(range);
      if (m) {
        startPage = parseInt(m[1], 10);
        endPage = parseInt(m[2], 10);
        if (!Number.isNaN(startPage) && !Number.isNaN(endPage) && endPage >= startPage) {
          pageCount = endPage - startPage + 1;
        }
      } else {
        // se vier só um número, use como pageCount
        const single = parseInt(range, 10);
        if (!Number.isNaN(single)) {
          pageCount = single;
        }
      }
    }

    // Datas opcionais conforme schema (ajuste conforme seu modelo real)
    const pub = publishedDate ? new Date(publishedDate) : null;
    const subm = submittedDate ? new Date(submittedDate) : null;

    // Se seu schema exigir publishedDate como NOT NULL, valide:
    // if (!pub || Number.isNaN(+pub)) {
    //   return NextResponse.json({ error: 'publishedDate is required/invalid' }, { status: 400 });
    // }

    // ================================================

    const article = await prisma.$transaction(async (tx) => {
      const newArticle = await tx.article.create({
        data: {
          title,
          abstract: abstract ?? null,
          keywords: keywords ?? null,
          doi: doi ?? null,

          // CAMPOS QUE EXISTEM NO SCHEMA (conforme o log):
          pdfUrl,                // <- no lugar de "url"/"pdfPath"
          arxivId,               // <- extraído do link, se aplicável
          pageCount,
          startPage,
          endPage,
          publishedDate: pub,    // se seu model permitir null
          submittedDate: subm,   // idem
          language: language ?? null,
          track: track ?? null,
          status: status ?? null,  // se seu model tiver enum ArticleStatus

          eventEditionId,
        },
      });

      // Autores
      if (Array.isArray(authors) && authors.length > 0) {
        for (let i = 0; i < authors.length; i++) {
          const a = authors[i];
          const author = await tx.author.upsert({
            where: { email: a.email },
            update: { name: a.name, affiliation: a.affiliation },
            create: { name: a.name, email: a.email, affiliation: a.affiliation }
          });
          await tx.articleAuthor.create({
            data: { articleId: newArticle.id, authorId: author.id, order: i + 1 }
          });
        }
      }

      // Categorias
      if (Array.isArray(categories) && categories.length > 0) {
        await tx.articleCategory.createMany({
          data: categories.map((categoryId: string) => ({
            articleId: newArticle.id,
            categoryId
          }))
        });
      }

      return newArticle;
    });

    // Retorna com relações
    const completeArticle = await prisma.article.findUnique({
      where: { id: article.id },
      include: {
        authors: { include: { author: true }, orderBy: { order: 'asc' } },
        eventEdition: { include: { event: true } },
        categories: { include: { category: true } }
      }
    });

    return NextResponse.json(completeArticle, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
