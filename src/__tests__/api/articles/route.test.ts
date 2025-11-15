import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, getResponseJSON } from '@/__tests__/mocks/nextRequest';

// Use vi.hoisted to create mocks that can be referenced in vi.mock factory
const { mockPrisma } = vi.hoisted(() => {
    return {
        mockPrisma: {
            article: {
                findMany: vi.fn().mockResolvedValue([]),
                count: vi.fn().mockResolvedValue(0),
            },
            author: {
                count: vi.fn().mockResolvedValue(0),
            },
            event: {
                count: vi.fn().mockResolvedValue(0),
            },
            eventEdition: {
                count: vi.fn().mockResolvedValue(0),
            },
        }
    };
});

vi.mock('@/lib/prisma', () => ({
    prisma: mockPrisma,
}));

// Import after mocking
import { GET } from '@/app/api/articles/route';

beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.article.findMany.mockResolvedValue([]);
    mockPrisma.article.count.mockResolvedValue(0);
    mockPrisma.author.count.mockResolvedValue(0);
    mockPrisma.event.count.mockResolvedValue(0);
    mockPrisma.eventEdition.count.mockResolvedValue(0);
});

describe('GET /api/articles', () => {
    it('returns paginated articles with default settings', async () => {
        const mockArticles = [
            {
                id: 'a1',
                title: 'Article 1',
                abstract: 'Abstract 1',
                keywords: 'test',
                authors: [{ author: { name: 'Author 1' }, order: 1 }],
                eventEdition: null,
                categories: []
            }
        ];

        mockPrisma.article.findMany.mockResolvedValueOnce(mockArticles);
        mockPrisma.article.count.mockResolvedValueOnce(1);
        // Mock stats for homepage (page 1, no search) - first count is for stats.articles
        mockPrisma.article.count.mockResolvedValueOnce(1);
        mockPrisma.author.count.mockResolvedValueOnce(10);
        mockPrisma.event.count.mockResolvedValueOnce(5);
        mockPrisma.eventEdition.count.mockResolvedValueOnce(15);

        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles'
        });

        const response = await GET(request);
        const data = await getResponseJSON(response);

        expect(data.articles).toEqual(mockArticles);
        expect(data.pagination).toMatchObject({
            page: 1,
            limit: 20,
            total: 1,
            pages: 1
        });
        expect(data.stats).toMatchObject({
            articles: 1,
            authors: 10,
            events: 5,
            editions: 15
        });
    });

    it('handles pagination parameters', async () => {
        mockPrisma.article.findMany.mockResolvedValueOnce([]);
        mockPrisma.article.count.mockResolvedValueOnce(100);

        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles',
            searchParams: {
                page: '2',
                limit: '10'
            }
        });

        await GET(request);

        expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                skip: 10, // (page 2 - 1) * limit 10
                take: 10
            })
        );
    });

    it('filters articles by search query', async () => {
        mockPrisma.article.findMany.mockResolvedValueOnce([]);
        mockPrisma.article.count.mockResolvedValueOnce(0);

        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles',
            searchParams: { q: 'machine learning' }
        });

        await GET(request);

        expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.arrayContaining([
                        expect.objectContaining({ title: { contains: 'machine learning' } }),
                        expect.objectContaining({ abstract: { contains: 'machine learning' } }),
                        expect.objectContaining({ keywords: { contains: 'machine learning' } })
                    ])
                })
            })
        );
    });

    it('filters articles by eventId', async () => {
        mockPrisma.article.findMany.mockResolvedValueOnce([]);
        mockPrisma.article.count.mockResolvedValueOnce(0);

        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles',
            searchParams: { eventId: 'event123' }
        });

        await GET(request);

        expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    eventEdition: { eventId: 'event123' }
                })
            })
        );
    });

    it('filters articles by categoryId', async () => {
        mockPrisma.article.findMany.mockResolvedValueOnce([]);
        mockPrisma.article.count.mockResolvedValueOnce(0);

        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles',
            searchParams: { categoryId: 'cat123' }
        });

        await GET(request);

        expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    categories: { some: { categoryId: 'cat123' } }
                })
            })
        );
    });

    it('filters articles by authorId', async () => {
        mockPrisma.article.findMany.mockResolvedValueOnce([]);
        mockPrisma.article.count.mockResolvedValueOnce(0);

        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles',
            searchParams: { authorId: 'author123' }
        });

        await GET(request);

        expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    authors: { some: { authorId: 'author123' } }
                })
            })
        );
    });

    it('sorts by title when sort=title', async () => {
        mockPrisma.article.findMany.mockResolvedValueOnce([]);
        mockPrisma.article.count.mockResolvedValueOnce(0);

        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles',
            searchParams: { sort: 'title' }
        });

        await GET(request);

        expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                orderBy: { title: 'asc' }
            })
        );
    });

    it('sorts by createdAt when sort=recent (default)', async () => {
        mockPrisma.article.findMany.mockResolvedValueOnce([]);
        mockPrisma.article.count.mockResolvedValueOnce(0);

        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles',
            searchParams: { sort: 'recent' }
        });

        await GET(request);

        expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                orderBy: { createdAt: 'desc' }
            })
        );
    });

    it('does not include stats when search query is present', async () => {
        mockPrisma.article.findMany.mockResolvedValueOnce([]);
        mockPrisma.article.count.mockResolvedValueOnce(0);

        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles',
            searchParams: { q: 'test' }
        });

        const response = await GET(request);
        const data = await getResponseJSON(response);

        expect(data.stats).toBeUndefined();
    });

    it('does not include stats when page > 1', async () => {
        mockPrisma.article.findMany.mockResolvedValueOnce([]);
        mockPrisma.article.count.mockResolvedValueOnce(0);

        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles',
            searchParams: { page: '2' }
        });

        const response = await GET(request);
        const data = await getResponseJSON(response);

        expect(data.stats).toBeUndefined();
    });

    it('handles database errors', async () => {
        mockPrisma.article.findMany.mockRejectedValueOnce(new Error('DB error'));

        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles'
        });

        const response = await GET(request);
        const data = await getResponseJSON(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Internal server error' });
    });
});
