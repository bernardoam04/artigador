export interface Event {
  id: string;
  name: string;
  shortName: string; // e.g., "SBES" for "Brazilian Symposium on Software Engineering"
  description: string;
  website?: string;
  organizer: string;
  field: string; // e.g., "Software Engineering", "Computer Science"
  topics: string[]; // related topics/keywords
  categories: string[]; // reference to category IDs
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface EventEdition {
  id: string;
  eventId: string; // reference to parent event
  year: number;
  location: {
    city: string;
    country: string;
    venue?: string; // conference center, university, etc.
  };
  dates: {
    start: string;
    end: string;
  };
  deadlines: {
    submission?: string;
    notification?: string;
    cameraReady?: string;
  };
  website?: string;
  description?: string;
  chairpersons: {
    name: string;
    affiliation: string;
    email?: string;
  }[];
  tracks: string[]; // main track, workshop track, etc.
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventStats {
  totalEvents: number;
  totalEditions: number;
  totalArticles: number;
  articlesPerYear: Record<number, number>;
}

// Extended Article type to include event information
export interface ArticleWithEvent {
  id: string;
  title: string;
  abstract: string;
  authors: {
    id: string;
    name: string;
    affiliation: string;
    email?: string;
  }[];
  eventEditionId?: string; // reference to event edition
  event?: {
    name: string;
    shortName: string;
    year: number;
  };
  categories: {
    id: string;
    name: string;
  }[];
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
  track?: string; // which track in the event
  pages?: {
    start: number;
    end: number;
  };
}