import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('q')?.trim();

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { affiliation: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [authors, total] = await Promise.all([
      prisma.author.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: offset,
        take: limit,
        include: {
          _count: {
            select: { articles: true }
          },
          articles: {
            take: 3, // Get a few recent articles for preview
            orderBy: { article: { createdAt: 'desc' } },
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
          }
        }
      }),
      prisma.author.count({ where })
    ]);

    return NextResponse.json({
      authors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}