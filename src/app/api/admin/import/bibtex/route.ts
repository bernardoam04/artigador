import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { parseBibTeX, bibtexEntryToArticle } from '@/lib/bibtex';

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
    const { bibtexContent, eventEditionId, defaultCategories = [] } = body;

    if (!bibtexContent || !eventEditionId) {
      return NextResponse.json({ 
        error: 'BibTeX content and event edition are required' 
      }, { status: 400 });
    }

    // Verify event edition exists
    const eventEdition = await prisma.eventEdition.findUnique({
      where: { id: eventEditionId },
      include: { event: true }
    });

    if (!eventEdition) {
      return NextResponse.json({ error: 'Event edition not found' }, { status: 404 });
    }

    // Parse BibTeX content
    let bibtexEntries;
    try {
      bibtexEntries = parseBibTeX(bibtexContent);
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid BibTeX format', 
        details: error instanceof Error ? error.message : 'Unknown parsing error'
      }, { status: 400 });
    }

    if (bibtexEntries.length === 0) {
      return NextResponse.json({ 
        error: 'No valid BibTeX entries found' 
      }, { status: 400 });
    }

    const importResults = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      articles: [] as any[]
    };

    // Process each BibTeX entry
    for (const bibtexEntry of bibtexEntries) {
      try {
        const articleData = bibtexEntryToArticle(bibtexEntry);

        // Create article with transaction
        const article = await prisma.$transaction(async (tx) => {
          // Create article
          const newArticle = await tx.article.create({
            data: {
              title: articleData.title,
              abstract: articleData.abstract,
              keywords: articleData.keywords,
              doi: articleData.doi,
              url: articleData.url,
              pages: articleData.pages,
              eventEditionId: eventEditionId
            }
          });

          // Create authors
          if (articleData.authors && articleData.authors.length > 0) {
            for (let i = 0; i < articleData.authors.length; i++) {
              const authorData = articleData.authors[i];
              
              // Generate email if not provided
              const email = authorData.email || 
                `${authorData.name.toLowerCase().replace(/\s+/g, '.')}@unknown.edu`;
              
              // Find or create author
              const author = await tx.author.upsert({
                where: { email },
                update: {
                  name: authorData.name,
                  affiliation: authorData.affiliation
                },
                create: {
                  name: authorData.name,
                  email,
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

          // Add default categories
          if (defaultCategories.length > 0) {
            await tx.articleCategory.createMany({
              data: defaultCategories.map((categoryId: string) => ({
                articleId: newArticle.id,
                categoryId
              }))
            });
          }

          return newArticle;
        });

        importResults.success++;
        importResults.articles.push({
          id: article.id,
          title: articleData.title,
          bibtexKey: bibtexEntry.key
        });

      } catch (error) {
        importResults.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        importResults.errors.push(
          `Entry "${bibtexEntry.key}" (${bibtexEntry.title || 'Untitled'}): ${errorMessage}`
        );
      }
    }

    return NextResponse.json({
      message: `Import completed: ${importResults.success} success, ${importResults.failed} failed`,
      results: importResults
    });

  } catch (error) {
    console.error('Error importing BibTeX:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}