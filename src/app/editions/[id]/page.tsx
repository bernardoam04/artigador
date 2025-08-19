'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, ExternalLink, Book, ArrowLeft, Globe, Clock } from 'lucide-react';
import ArticleCard from '@/components/ArticleCard';

interface Edition {
  id: string;
  year: number;
  title: string;
  description?: string;
  location?: string;
  website?: string;
  startDate?: string;
  endDate?: string;
  submissionDeadline?: string;
  notificationDate?: string;
  cameraReadyDeadline?: string;
  event: {
    id: string;
    name: string;
    shortName: string;
    field: string;
    organizer: string;
  };
  _count: {
    articles: number;
  };
}

interface Article {
  id: string;
  title: string;
  abstract?: string;
  keywords?: string;
  doi?: string;
  url?: string;
  pdfPath?: string;
  pages?: string;
  createdAt: string;
  authors: Array<{
    order: number;
    author: {
      id: string;
      name: string;
      email: string;
      affiliation?: string;
    };
  }>;
  categories: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
}

export default function EditionPage() {
  const params = useParams();
  const [edition, setEdition] = useState<Edition | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    const fetchEdition = async () => {
      try {
        const response = await fetch(`/api/editions/${params.id}?page=${pagination.page}&limit=${pagination.limit}`);
        if (response.ok) {
          const data = await response.json();
          setEdition(data.edition);
          setArticles(data.articles);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error('Error fetching edition:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEdition();
  }, [params.id, pagination.page]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Convert article format for ArticleCard compatibility
  const convertArticle = (article: Article) => ({
    id: article.id,
    title: article.title,
    abstract: article.abstract || '',
    authors: article.authors.map(a => ({
      name: a.author.name,
      affiliation: a.author.affiliation || ''
    })),
    publishedDate: article.createdAt,
    venue: edition ? `${edition.event.shortName} ${edition.year}` : '',
    pdfUrl: article.pdfPath || '',
    categories: article.categories.map(c => ({
      id: c.category.id,
      name: c.category.name
    })),
    keywords: article.keywords ? article.keywords.split(',').map(k => k.trim()) : [],
    doi: article.doi,
    url: article.url,
    citationCount: 0, // Not implemented yet
    downloads: 0 // Not implemented yet
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!edition) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Edition not found</h3>
            <Link href="/events" className="text-blue-600 hover:text-blue-800">
              ← Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center space-x-2 text-sm">
          <Link href="/events" className="text-blue-600 hover:text-blue-800">
            Events
          </Link>
          <span className="text-gray-400">/</span>
          <Link href={`/events/${edition.event.id}`} className="text-blue-600 hover:text-blue-800">
            {edition.event.shortName}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{edition.year}</span>
        </div>

        {/* Edition Header */}
        <div className="bg-white rounded-lg border p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{edition.title}</h1>
              <div className="flex items-center space-x-3 mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  {edition.event.shortName} {edition.year}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-600">{edition.event.field}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {edition.website && (
                <a
                  href={edition.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Edition Website
                </a>
              )}
              <Link
                href={`/events/${edition.event.id}`}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Event Page
              </Link>
            </div>
          </div>

          {edition.description && (
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">{edition.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <div className="font-medium">Year</div>
                <div>{edition.year}</div>
              </div>
            </div>

            {edition.location && (
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">Location</div>
                  <div>{edition.location}</div>
                </div>
              </div>
            )}

            <div className="flex items-center text-gray-600">
              <Book className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <div className="font-medium">Articles</div>
                <div>{edition._count.articles} published</div>
              </div>
            </div>
          </div>

          {/* Event Dates */}
          {(edition.startDate || edition.endDate) && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium text-gray-900 mb-3">Event Dates</h3>
              <div className="text-gray-600">
                {formatDate(edition.startDate)}
                {edition.endDate && formatDate(edition.endDate) !== formatDate(edition.startDate) && 
                  ` - ${formatDate(edition.endDate)}`}
              </div>
            </div>
          )}

          {/* Important Deadlines */}
          {(edition.submissionDeadline || edition.notificationDate || edition.cameraReadyDeadline) && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium text-gray-900 mb-3">Important Deadlines</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {edition.submissionDeadline && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium">Submission</div>
                      <div className="text-sm">{formatDate(edition.submissionDeadline)}</div>
                    </div>
                  </div>
                )}
                {edition.notificationDate && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium">Notification</div>
                      <div className="text-sm">{formatDate(edition.notificationDate)}</div>
                    </div>
                  </div>
                )}
                {edition.cameraReadyDeadline && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium">Camera Ready</div>
                      <div className="text-sm">{formatDate(edition.cameraReadyDeadline)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Articles */}
        <div className="bg-white rounded-lg border p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Published Articles ({pagination.total})
            </h2>
          </div>
          
          {articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map(article => (
                  <ArticleCard key={article.id} article={convertArticle(article)} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {[...Array(Math.min(pagination.pages, 5))].map((_, idx) => {
                      const pageNum = Math.max(1, pagination.page - 2) + idx;
                      if (pageNum > pagination.pages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 rounded-md ${
                            pageNum === pagination.page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Book className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles published</h3>
              <p className="text-gray-500">This edition doesn't have any published articles yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}