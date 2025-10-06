import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

// ----------------- helpers -----------------
function extractArxivId(input?: string | null): string | null {
  if (!input) return null;
  const m = /arxiv\.org\/(?:abs|pdf)\/([0-9]{4}\.[0-9]{4,5})(?:v\d+)?/i.exec(input);
  return m?.[1] ?? null;
}

function parsePages(pages?: string | null): { startPage: number | null; endPage: number | null; pageCount: number | null } {
  if (!pages || typeof pages !== 'string') return { startPage: null, endPage: null, pageCount: null };
  const range = pages.trim();
  const m = /^(\d+)\s*-\s*(\d+)$/.exec(range);
  if (m) {
    const start = parseInt(m[1], 10);
    const end = parseInt(m[2], 10);
    if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
      return { startPage: start, endPage: end, pageCount: end - start + 1 };
    }
  }
  const single = parseInt(range, 10);
  if (!Number.isNaN(single)) return { startPage: null, endPage: null, pageCount: single };
  return { startPage: null, endPage: null, pageCount: null };
}

async function findOrCreateAuthor(tx: any, a: any) {
  // Se houver ORCID (único no schema), usamos upsert com orcid
  if (a?.orcid && typeof a.orcid === 'string' && a.orcid.trim() !== '') {
    return tx.author.upsert({
      where: { orcid: a.orcid },
      update: {
        name: a.name,
        affiliation: a.affiliation ?? null,
        email: a.email ?? null,
        website: a.website ?? null,
      },
      create: {
        orcid: a.orcid,
        name: a.name,
        affiliation: a.affiliation ?? null,
        email: a.email ?? null,
        website: a.website ?? null,
      },
    });
  }

  // Sem ORCID: tentativa por email (não-único). Se achar, atualiza; senão cria.
  let existing = null;
  if (a?.email && typeof a.email === 'string' && a.email.trim() !== '') {
    existing = await tx.author.findFirst({ where: { email: a.email } });
  }
  if (existing) {
    return tx.author.update({
      where: { id: existing.id },
      data: {
        name: a.name,
        affiliation: a.affiliation ?? null,
        website: a.website ?? null,
        email: a.email ?? existing.email ?? null,
      },
    });
  }
  return tx.author.create({
    data: {
      name: a.name,
      affiliation: a.affiliation ?? null,
      website: a.website ?? null,
      email: a.email ?? null,
    },
  });
}

// ----------------- GET -----------------
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;

    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


// ----------------- PUT -----------------
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = verifyToken(token);
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await context.params;
    const body = await request.json();

    // Campos vindos do front (alguns serão mapeados pro schema real)
    const {
      title,
      abstract,
      keywords,
      doi,
      url,        // front -> pdfUrl
      pdfPath,    // front (fallback) -> pdfUrl
      pages,      // front "1-200" -> startPage/endPage/pageCount
      eventEditionId,
      authors,
      categories,
      publishedDate,
      submittedDate,
      language,
      track,
      status,
    } = body;

    if (!title || !eventEditionId) {
      return NextResponse.json({ error: 'Title and event edition are required' }, { status: 400 });
    }

    // Mapear para campos do schema:
    const pdfUrl: string | null = url ?? pdfPath ?? null;
    const arxivId = extractArxivId(pdfUrl ?? undefined);
    const { startPage, endPage, pageCount } = parsePages(pages ?? null);
    const pub = publishedDate ? new Date(publishedDate) : null;
    const subm = submittedDate ? new Date(submittedDate) : null;

    // Transaction: atualiza artigo + recria vínculos
    const article = await prisma.$transaction(async (tx) => {
      // Atualiza o artigo
      const updatedArticle = await tx.article.update({
        where: { id },
        data: {
          title,
          abstract: abstract ?? null,
          keywords: keywords ?? null,
          doi: doi ?? null,

          pdfUrl,                 // <- no lugar de url/pdfPath
          arxivId,

          pageCount,
          startPage,
          endPage,

          publishedDate: pub,
          submittedDate: subm,
          language: language ?? null,
          track: track ?? null,
          status: status ?? null,

          eventEditionId,
        },
      });

      // Zera autores existentes
      await tx.articleAuthor.deleteMany({ where: { articleId: id } });
      // Recria autores
      if (Array.isArray(authors) && authors.length > 0) {
        for (let i = 0; i < authors.length; i++) {
          const a = authors[i];
          const author = await findOrCreateAuthor(tx, a);
          await tx.articleAuthor.create({
            data: { articleId: id, authorId: author.id, order: i + 1 },
          });
        }
      }

      // Zera categorias existentes
      await tx.articleCategory.deleteMany({ where: { articleId: id } });
      // Recria categorias
      if (Array.isArray(categories) && categories.length > 0) {
        await tx.articleCategory.createMany({
          data: categories.map((categoryId: string) => ({
            articleId: id,
            categoryId,
          })),
        });
      }

      return updatedArticle;
    });

    // Retorna completo
    const complete = await prisma.article.findUnique({
      where: { id: article.id },
      include: {
        authors: { include: { author: true }, orderBy: { order: 'asc' } },
        eventEdition: { include: { event: true } },
        categories: { include: { category: true } },
      },
    });

    return NextResponse.json(complete);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ----------------- DELETE -----------------
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = verifyToken(token);
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await context.params;

    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
