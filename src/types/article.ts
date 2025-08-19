export interface Author {
  id: string;
  name: string;
  affiliation: string;
  email?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  subcategories?: Category[];
}

export interface Article {
  id: string;
  title: string;
  abstract: string;
  authors: Author[];
  categories: Category[];
  keywords: string[];
  publishedDate: string;
  submittedDate: string;
  lastModified: string;
  doi?: string;
  arxivId?: string;
  pdfUrl: string;
  citationCount: number;
  downloads: number;
  venue?: {
    name: string;
    type: 'conference' | 'journal' | 'preprint';
    year: number;
  };
  status: 'published' | 'preprint' | 'under_review';
  language: string;
  pageCount: number;
  version: number;
}

export interface SearchFilters {
  query?: string;
  categories?: string[];
  authors?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  venue?: string[];
  status?: Article['status'][];
  sortBy?: 'relevance' | 'date' | 'citations' | 'downloads';
  sortOrder?: 'asc' | 'desc';
}