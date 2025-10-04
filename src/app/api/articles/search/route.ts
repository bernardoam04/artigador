import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const searchTerm = query.toLowerCase();

    // Search for articles with enhanced search including event names
    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm} },
          { abstract: { contains: searchTerm} },
          { keywords: { contains: searchTerm} },
          {
            authors: {
              some: {
                author: {
                  name: { contains: searchTerm}
                }
              }
            }
          },
          // Search by event name
          {
            eventEdition: {
              event: {
                name: { contains: searchTerm}
              }
            }
          },
          // Search by event short name
          {
            eventEdition: {
              event: {
                shortName: { contains: searchTerm}
              }
            }
          },
          // Search by edition title
          {
            eventEdition: {
              title: { contains: searchTerm}
            }
          }
        ]
      },
      take: Math.min(limit, 50),
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
        }
      }
    });

    // Get unique authors that match the search
    const authors = await prisma.author.findMany({
      where: {
        name: { contains: searchTerm}
      },
      take: 5,
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });

    // Get unique events that match the search
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm} },
          { shortName: { contains: searchTerm} }
        ]
      },
      take: 3,
      include: {
        _count: {
          select: { 
            editions: {
              where: {
                articles: { some: {} }
              }
            }
          }
        }
      }
    });

    // Build suggestions
    type Suggestion =
      | { type: 'article'; value: string; id: string; authors: string[]; event: string | null }
      | { type: 'author'; value: string; count: number }
      | { type: 'event'; value: string; shortName: string; count: number }
      | { type: 'keyword'; value: string; count: number };

    // Inicializa array com tipo explícito
    const suggestions: Suggestion[] = [];

    // Add article suggestions
    articles.slice(0, 3).forEach(article => {
      suggestions.push({
        type: 'article',
        value: article.title,
        id: article.id,
        authors: article.authors.map(a => a.author.name),
        event: article.eventEdition ? `${article.eventEdition.event?.shortName ?? "?"} ${article.eventEdition.year ?? "?"}` : null

      });
    });

    // Add author suggestions
    authors.slice(0, 2).forEach(author => {
      suggestions.push({
        type: 'author',
        value: author.name,
        count: author._count.articles
      });
    });

    // Add event suggestions
    events.forEach(event => {
      suggestions.push({
        type: 'event',
        value: event.name,
        shortName: event.shortName,
        count: event._count.editions
      });
    });

    // Extract and add keyword suggestions from articles
    const keywordMap = new Map<string, number>();
    articles.forEach(article => {
      if (article.keywords) {
        const keywords = article.keywords.split(',').map(k => k.trim());
        keywords.forEach(keyword => {
          if (keyword.toLowerCase().includes(searchTerm)) {
            keywordMap.set(keyword, (keywordMap.get(keyword) || 0) + 1);
          }
        });
      }
    });

    // Add top keyword suggestions
    Array.from(keywordMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .forEach(([keyword, count]) => {
        suggestions.push({
          type: 'keyword',
          value: keyword,
          count
        });
      });

    return NextResponse.json({
      suggestions: suggestions.slice(0, 8),
      total: articles.length
    });

  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}