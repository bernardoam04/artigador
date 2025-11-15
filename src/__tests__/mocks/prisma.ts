import { vi } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Create mock functions for common Prisma operations
const createMockModel = () => ({
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  findMany: vi.fn().mockResolvedValue([]),
  create: vi.fn(),
  createMany: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  upsert: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  count: vi.fn().mockResolvedValue(0),
  aggregate: vi.fn(),
  groupBy: vi.fn(),
});

// Create mock Prisma client with all models
export const mockPrisma = {
  user: createMockModel(),
  article: createMockModel(),
  author: createMockModel(),
  event: createMockModel(),
  eventEdition: createMockModel(),
  category: createMockModel(),
  articleAuthor: createMockModel(),
  articleCategory: createMockModel(),
  eventCategory: createMockModel(),
  subscription: createMockModel(),
  emailSubscription: createMockModel(),
  importLog: createMockModel(),
  $transaction: vi.fn((callback: any) => {
    if (typeof callback === 'function') {
      return callback(mockPrisma);
    }
    return Promise.all(callback);
  }),
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $executeRaw: vi.fn(),
  $queryRaw: vi.fn(),
} as unknown as PrismaClient;

// Helper to reset all mocks
export const resetPrismaMocks = () => {
  Object.values(mockPrisma).forEach((model: any) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((fn: any) => {
        if (typeof fn?.mockReset === 'function') {
          fn.mockReset();
        }
      });
    }
  });

  // Reset default values
  mockPrisma.article.findMany.mockResolvedValue([]);
  mockPrisma.article.count.mockResolvedValue(0);
  mockPrisma.author.count.mockResolvedValue(0);
  mockPrisma.event.count.mockResolvedValue(0);
  mockPrisma.eventEdition.count.mockResolvedValue(0);
};

// Mock the prisma module
vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

export default mockPrisma;
