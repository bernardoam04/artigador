import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { parseBibTeX, bibtexEntryToArticle, BibTeXEntry } from '@/lib/bibtex';
import AdmZip from 'adm-zip';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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

    // Parse multipart form data
    const formData = await request.formData();
    const bibtexFile = formData.get('bibtexFile') as File | null;
    const pdfZip = formData.get('pdfZip') as File | null;
    const eventEditionId = formData.get('eventEditionId') as string;
    const defaultCategoriesStr = formData.get('defaultCategories') as string;
    const defaultCategories = defaultCategoriesStr ? JSON.parse(defaultCategoriesStr) : [];

    if (!bibtexFile || !eventEditionId) {
      return NextResponse.json({
        error: 'BibTeX file and event edition are required'
      }, { status: 400 });
    }

    // Read BibTeX content
    const bibtexContent = await bibtexFile.text();

    // Verify event edition exists
    const eventEdition = await prisma.eventEdition.findUnique({
      where: { id: eventEditionId },
      include: { event: true }
    });

    if (!eventEdition) {
      return NextResponse.json({ error: 'Event edition not found' }, { status: 404 });
    }

    // Parse BibTeX content
    let bibtexEntries: BibTeXEntry[];
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

    // Process ZIP file if provided
    const pdfMap = new Map<string, Buffer>();
    if (pdfZip) {
      try {
        const zipBuffer = Buffer.from(await pdfZip.arrayBuffer());
        const zip = new AdmZip(zipBuffer);
        const zipEntries = zip.getEntries();

        for (const entry of zipEntries) {
          if (!entry.isDirectory && entry.entryName.toLowerCase().endsWith('.pdf')) {
            const fileName = path.basename(entry.entryName);
            const keyName = fileName.replace(/\.pdf$/i, '');
            pdfMap.set(keyName, entry.getData());
          }
        }
      } catch (error) {
        return NextResponse.json({
          error: 'Invalid ZIP file',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 400 });
      }
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'imports');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const importResults = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      articles: [] as any[]
    };

    // Check if location field is required (if at least one entry has it)
    const hasAnyLocation = bibtexEntries.some(entry => entry.location);

    // Process each BibTeX entry
    for (const bibtexEntry of bibtexEntries) {
      try {
        // Validate required fields
        const missingFields: string[] = [];

        if (!bibtexEntry.author) missingFields.push('author');
        if (!bibtexEntry.title) missingFields.push('title');
        if (!bibtexEntry.year) missingFields.push('year');
        // if (!bibtexEntry.booktitle) missingFields.push('booktitle');
        // if (!bibtexEntry.pages) missingFields.push('pages');
        // if (!bibtexEntry.publisher) missingFields.push('publisher');

        // If any entry has location, then all must have it
        if (hasAnyLocation && !bibtexEntry.location) {
          missingFields.push('location');
        }

        if (missingFields.length > 0) {
          importResults.failed++;
          importResults.errors.push(
            `Entry "${bibtexEntry.key}" skipped: missing required field(s): ${missingFields.join(', ')}`
          );
          continue;
        }

        // Check if PDF exists in ZIP
        let pdfUrl: string | null = null;
        const pdfBuffer = pdfMap.get(bibtexEntry.key);

        if (pdfZip && !pdfBuffer) {
          // ZIP was provided but PDF is missing
          importResults.failed++;
          importResults.errors.push(
            `Entry "${bibtexEntry.key}" skipped: PDF file "${bibtexEntry.key}.pdf" not found in ZIP`
          );
          continue;
        }

        // Save PDF if exists
        if (pdfBuffer) {
          const timestamp = Date.now();
          const pdfFileName = `${bibtexEntry.key}.pdf`;
          const pdfPath = path.join(uploadDir, `${timestamp}_${pdfFileName}`);
          await writeFile(pdfPath, pdfBuffer);
          pdfUrl = `/uploads/imports/${timestamp}_${pdfFileName}`;
        }

        const articleData = bibtexEntryToArticle(bibtexEntry);

        // Parse pages for database fields
        let startPage: number | null = null;
        let endPage: number | null = null;
        let pageCount: number | null = null;

        if (articleData.pages) {
          const pageMatch = articleData.pages.match(/^(\d+)\s*[-–—]+\s*(\d+)$/);
          if (pageMatch) {
            startPage = parseInt(pageMatch[1]);
            endPage = parseInt(pageMatch[2]);
            pageCount = endPage - startPage + 1;
          }
        }

        // Create article with transaction
        const article = await prisma.$transaction(async (tx) => {
          // Create article
          const newArticle = await tx.article.create({
            data: {
              title: articleData.title,
              abstract: articleData.abstract || '',
              keywords: articleData.keywords || '',
              doi: bibtexEntry.doi || null,
              pdfUrl: pdfUrl,
              startPage,
              endPage,
              pageCount,
              publishedDate: bibtexEntry.year ? new Date(bibtexEntry.year, 0, 1) : null,
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
                  affiliation: authorData.affiliation || ''
                },
                create: {
                  name: authorData.name,
                  email,
                  affiliation: authorData.affiliation || ''
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