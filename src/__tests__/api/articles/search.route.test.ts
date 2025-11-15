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
                findMany: vi.fn().mockResolvedValue([]),
                count: vi.fn().mockResolvedValue(0),
            },
            event: {
                findMany: vi.fn().mockResolvedValue([]),
                count: vi.fn().mockResolvedValue(0),
            },
        }
    };
});

vi.mock('@/lib/prisma', () => ({
    prisma: mockPrisma,
}));

// Import after mocking
import { GET } from '@/app/api/articles/search/route';

beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.article.findMany.mockResolvedValue([]);
    mockPrisma.article.count.mockResolvedValue(0);
    mockPrisma.author.findMany.mockResolvedValue([]);
    mockPrisma.event.findMany.mockResolvedValue([]);
});

describe('GET /api/articles/search', () => {
    it('returns empty suggestions for queries shorter than 2 characters', async () => {
        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles/search?q=a'
        });

        const response = await GET(request);
        const data = await getResponseJSON(response);

        expect(data).toEqual({ suggestions: [] });
    });

    it('returns empty suggestions for missing query', async () => {
        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles/search'
        });

        const response = await GET(request);
        const data = await getResponseJSON(response);

        expect(data).toEqual({ suggestions: [] });
    });

    it('searches articles and returns suggestions', async () => {
        const mockArticles = [
            {
                id: 'a1',
                title: 'Machine Learning Paper',
                abstract: 'About ML',
                keywords: 'machine learning, AI',
                authors: [
                    { author: { name: 'John Doe' }, order: 1 }
                ],
                eventEdition: {
                    year: 2024,
                    event: { shortName: 'ICML' }
                }
            },
            {
                id: 'a2',
                title: 'Another ML Study',
                abstract: 'ML research',
                keywords: 'deep learning, neural networks',
                authors: [
                    { author: { name: 'Jane Smith' }, order: 1 }
                ],
                eventEdition: null
            }
        ];

        const mockAuthors = [
            { name: 'Machine Author', _count: { articles: 5 } }
        ];

        const mockEvents = [
            { name: 'Machine Learning Conference', shortName: 'MLC', _count: { editions: 3 } }
        ];

        mockPrisma.article.findMany.mockResolvedValueOnce(mockArticles);
        mockPrisma.author.findMany.mockResolvedValueOnce(mockAuthors);
        mockPrisma.event.findMany.mockResolvedValueOnce(mockEvents);

        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles/search?q=machine'
        });

        const response = await GET(request);
        const data = await getResponseJSON(response);

        expect(data.suggestions).toBeDefined();
        expect(data.total).toBe(2);
        expect(data.suggestions.length).toBeGreaterThan(0);

        // Check article suggestions
        const articleSuggestions = data.suggestions.filter((s: any) => s.type === 'article');
        expect(articleSuggestions.length).toBeGreaterThan(0);
        expect(articleSuggestions[0]).toMatchObject({
            type: 'article',
            value: 'Machine Learning Paper',
            id: 'a1',
            authors: ['John Doe']
        });

        // Check author suggestions
        const authorSuggestions = data.suggestions.filter((s: any) => s.type === 'author');
        expect(authorSuggestions.length).toBeGreaterThan(0);
        expect(authorSuggestions[0]).toMatchObject({
            type: 'author',
            value: 'Machine Author',
            count: 5
        });

        // Check event suggestions
        const eventSuggestions = data.suggestions.filter((s: any) => s.type === 'event');
        expect(eventSuggestions.length).toBeGreaterThan(0);
        expect(eventSuggestions[0]).toMatchObject({
            type: 'event',
            value: 'Machine Learning Conference',
            shortName: 'MLC',
            count: 3
        });
    });

    it('extracts and suggests keywords from articles', async () => {
        const mockArticles = [
            {
                id: 'a1',
                title: 'Paper 1',
                keywords: 'machine learning, deep learning, AI',
                authors: [{ author: { name: 'A' }, order: 1 }],
                eventEdition: null
            },
            {
                id: 'a2',
                title: 'Paper 2',
                keywords: 'machine learning, neural networks',
                authors: [{ author: { name: 'B' }, order: 1 }],
                eventEdition: null
            }
        ];

        mockPrisma.article.findMany.mockResolvedValueOnce(mockArticles);
        mockPrisma.author.findMany.mockResolvedValueOnce([]);
        mockPrisma.event.findMany.mockResolvedValueOnce([]);

        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles/search?q=machine'
        });

        const response = await GET(request);
        const data = await getResponseJSON(response);

        const keywordSuggestions = data.suggestions.filter((s: any) => s.type === 'keyword');
        expect(keywordSuggestions.length).toBeGreaterThan(0);
        expect(keywordSuggestions[0]).toMatchObject({
            type: 'keyword',
            value: 'machine learning',
            count: 2
        });
    });

    it('respects limit parameter with max of 50', async () => {
        mockPrisma.article.findMany.mockResolvedValueOnce([]);
        mockPrisma.author.findMany.mockResolvedValueOnce([]);
        mockPrisma.event.findMany.mockResolvedValueOnce([]);

        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles/search?q=test&limit=100'
        });

        await GET(request);

        expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                take: 50 // Should be capped at 50
            })
        );
    });

    it('uses default limit of 10 when not specified', async () => {
        mockPrisma.article.findMany.mockResolvedValueOnce([]);
        mockPrisma.author.findMany.mockResolvedValueOnce([]);
        mockPrisma.event.findMany.mockResolvedValueOnce([]);

        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles/search?q=test'
        });

        await GET(request);

        expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                take: 10
            })
        );
    });

    it('limits suggestions to 8 total items', async () => {
        // Create 10 articles to ensure we have more than 8 items
        const mockArticles = Array.from({ length: 10 }, (_, i) => ({
            id: `a${i}`,
            title: `Test Article ${i}`,
            keywords: 'test',
            authors: [{ author: { name: `Author ${i}` }, order: 1 }],
            eventEdition: null
        }));

        mockPrisma.article.findMany.mockResolvedValueOnce(mockArticles);
        mockPrisma.author.findMany.mockResolvedValueOnce([]);
        mockPrisma.event.findMany.mockResolvedValueOnce([]);

        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles/search?q=test'
        });

        const response = await GET(request);
        const data = await getResponseJSON(response);

        expect(data.suggestions.length).toBeLessThanOrEqual(8);
    });

    it('handles database errors gracefully', async () => {
        mockPrisma.article.findMany.mockRejectedValueOnce(new Error('DB connection failed'));

        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles/search?q=test'
        });

        const response = await GET(request);
        const data = await getResponseJSON(response);

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Internal server error' });
    });

    it('performs case-insensitive search', async () => {
        mockPrisma.article.findMany.mockResolvedValueOnce([]);
        mockPrisma.author.findMany.mockResolvedValueOnce([]);
        mockPrisma.event.findMany.mockResolvedValueOnce([]);

        const request = createMockRequest({
            url: 'http://localhost:3000/api/articles/search?q=TeSt'
        });

        await GET(request);

        // Verify that search uses lowercase
        expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.arrayContaining([
                        expect.objectContaining({ title: { contains: 'test' } })
                    ])
                })
            })
        );
    });
});
