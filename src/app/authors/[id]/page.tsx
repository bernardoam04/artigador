'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Building, BookOpen, ArrowLeft, Calendar, Award, MapPin } from 'lucide-react';
import ArticleCard from '@/components/ArticleCard';

interface Author {
  id: string;
  name: string;
  email: string;
  affiliation?: string;
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
  pdfUrl?: string;
  pages?: string;
  createdAt: string;
  publishedDate?: string;
  startPage?: number;
  endPage?: number;
  authors: Array<{
    order: number;
    author: {
      id: string;
      name: string;
      email?: string;
      affiliation?: string;
    };
  }>;
  eventEdition: {
    id: string;
    year: number;
    title: string;
    event: {
      id: string;
      name: string;
      shortName: string;
    };
  };
  categories: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
}

interface Venue {
  event: {
    id: string;
    name: string;
    shortName: string;
    field: string;
  };
  articleCount: number;
  years: number[];
}

export default function AuthorPage() {
  const params = useParams();
  const [author, setAuthor] = useState<Author | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [articlesByYear, setArticlesByYear] = useState<{[year: number]: Article[]}>({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Determine if this is an ID (UUID) or a name (hyphenated string)
  const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id as string);
  const isNameBased = !isId;

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        let url = `/api/authors/${params.id}`;
        
        if (isNameBased) {
          // For name-based requests, get all articles grouped by year
          url += '?byYear=true';
        } else {
          // For ID-based requests, use pagination
          url += `?page=${pagination.page}&limit=${pagination.limit}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setAuthor(data.author);
          
          if (isNameBased) {
            setArticles(data.articles);
            // Group articles by year for name-based display
            const grouped = data.articles.reduce((acc: {[year: number]: Article[]}, article: Article) => {
              const year = article.eventEdition.year;
              if (!acc[year]) {
                acc[year] = [];
              }
              acc[year].push(article);
              return acc;
            }, {});
            setArticlesByYear(grouped);
          } else {
            setArticles(data.articles);
            setVenues(data.venues);
            setPagination(data.pagination);
          }
        }
      } catch (error) {
        console.error('Error fetching author:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthor();
  }, [params.id, pagination.page, isNameBased]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  const formatAuthorName = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  const formatKeywords = (keywordsJson: string) => {
    try {
      return JSON.parse(keywordsJson);
    } catch {
      return [];
    }
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
      id: a.author.id,
      name: a.author.name,
      affiliation: a.author.affiliation || ''
    })),
    publishedDate: article.createdAt,
    submittedDate: article.createdAt,
    lastModified: article.createdAt,
    status: 'published' as const,
    language: 'en' as const,
    venue: {
      name: article.eventEdition.event.name,
      type: 'conference' as const,
      year: article.eventEdition.year
    },
    pdfUrl: article.pdfPath || '',
    categories: article.categories.map(c => ({
      id: c.category.id,
      name: c.category.name,
      description: ''
    })),
    keywords: article.keywords ? article.keywords.split(',').map(k => k.trim()) : [],
    doi: article.doi,
    url: article.url,
    citationCount: 0, // Not implemented yet
    downloads: 0, // Not implemented yet
    pageCount: 0,
    version: 1
  });

  // Get career statistics
  const getCareerStats = () => {
    if (!articles.length) return { firstYear: null, lastYear: null, yearsActive: 0 };
    
    const years = articles.map(article => article.eventEdition.year);
    const firstYear = Math.min(...years);
    const lastYear = Math.max(...years);
    const yearsActive = lastYear - firstYear + 1;
    
    return { firstYear, lastYear, yearsActive };
  };

  const careerStats = getCareerStats();

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

  if (!author) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Author not found</h3>
            <Link href="/authors" className="text-blue-600 hover:text-blue-800">
              ← Back to Authors
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
        <div className="mb-6">
          <Link 
            href="/authors" 
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Authors
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Author Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-8">
              {/* Profile Header */}
              <div className="text-center mb-6">
                <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-blue-600" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">{author.name}</h1>
                {author.affiliation && (
                  <p className="text-gray-600 mt-1">{author.affiliation}</p>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-5 w-5 mr-3 text-gray-400" />
                  <a 
                    href={`mailto:${author.email}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {author.email}
                  </a>
                </div>
                {author.affiliation && (
                  <div className="flex items-center text-gray-600">
                    <Building className="h-5 w-5 mr-3 text-gray-400" />
                    <span>{author.affiliation}</span>
                  </div>
                )}
              </div>

              {/* Statistics */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Career Statistics</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm">Publications</span>
                  </div>
                  <span className="font-semibold text-gray-900">{author._count.articles}</span>
                </div>

                {careerStats.firstYear && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">Active Since</span>
                      </div>
                      <span className="font-semibold text-gray-900">{careerStats.firstYear}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Award className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">Years Active</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {careerStats.yearsActive === 1 ? '1 year' : `${careerStats.yearsActive} years`}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm">Venues</span>
                  </div>
                  <span className="font-semibold text-gray-900">{venues.length}</span>
                </div>
              </div>

              {/* Publication Venues */}
              {venues.length > 0 && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Publication Venues</h3>
                  <div className="space-y-3">
                    {venues.slice(0, 5).map((venue, index) => (
                      <div key={index} className="text-sm">
                        <Link
                          href={`/events/${venue.event.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {venue.event.shortName}
                        </Link>
                        <div className="text-gray-500 text-xs">
                          {venue.articleCount} article{venue.articleCount !== 1 ? 's' : ''} • 
                          {venue.years.length > 1 
                            ? ` ${venue.years[venue.years.length - 1]}-${venue.years[0]}`
                            : ` ${venue.years[0]}`
                          }
                        </div>
                      </div>
                    ))}
                    {venues.length > 5 && (
                      <div className="text-xs text-gray-500">
                        +{venues.length - 5} more venues
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Publications */}
          <div className={isNameBased ? "lg:col-span-3" : "lg:col-span-2"}>
            <div className="bg-white rounded-lg border p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Publications</h2>
                <p className="text-gray-600">
                  All articles by {author?.name} {isNameBased ? 'organized by year' : ''} ({author?._count.articles || 0} total)
                </p>
              </div>

              {isNameBased ? (
                // Year-based view for name-based URLs
                Object.keys(articlesByYear).length > 0 ? (
                  <div className="space-y-12">
                    {Object.keys(articlesByYear)
                      .map(Number)
                      .sort((a, b) => b - a) // Most recent first
                      .map(year => (
                        <div key={year} className="relative">
                          {/* Year Header */}
                          <div className="sticky top-0 bg-white z-10 py-4 border-b border-gray-200 mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                              <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                              {year}
                              <span className="ml-2 text-sm font-normal text-gray-500">
                                ({articlesByYear[year].length} articles)
                              </span>
                            </h3>
                          </div>

                          {/* Articles for this year */}
                          <div className="space-y-8">
                            {articlesByYear[year].map(article => (
                              <article key={article.id} className="border-l-4 border-blue-200 pl-6 hover:border-blue-400 transition-colors">
                                <div className="mb-4">
                                  <Link href={`/article/${article.id}`}>
                                    <h4 className="text-xl font-semibold text-gray-900 mb-2 leading-tight hover:text-blue-600 transition-colors cursor-pointer">
                                      {article.title}
                                    </h4>
                                  </Link>
                                  
                                  {/* Authors */}
                                  <div className="flex items-center text-gray-600 mb-2">
                                    <User className="h-4 w-4 mr-2" />
                                    <div className="flex flex-wrap">
                                      {article.authors
                                        .sort((a, b) => a.order - b.order)
                                        .map((authorRel, index) => (
                                          <span key={authorRel.author.id} className="mr-2">
                                            <Link
                                              href={`/authors/${formatAuthorName(authorRel.author.name)}`}
                                              className={`hover:text-blue-600 transition-colors ${
                                                authorRel.author.name === author?.name ? 'font-semibold text-blue-600' : ''
                                              }`}
                                            >
                                              {authorRel.author.name}
                                            </Link>
                                            {authorRel.author.affiliation && (
                                              <span className="text-gray-500 text-sm"> ({authorRel.author.affiliation})</span>
                                            )}
                                            {index < article.authors.length - 1 && <span className="text-gray-400">,</span>}
                                          </span>
                                        ))}
                                    </div>
                                  </div>

                                  {/* Venue */}
                                  <div className="flex items-center text-gray-600 mb-3">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    <Link
                                      href={`/${article.eventEdition.event.shortName.toLowerCase()}/${article.eventEdition.year}`}
                                      className="hover:text-blue-600 transition-colors"
                                    >
                                      {article.eventEdition.event.shortName} {article.eventEdition.year}
                                    </Link>
                                    {article.eventEdition.title && (
                                      <span className="ml-2 text-gray-500">• {article.eventEdition.title}</span>
                                    )}
                                  </div>
                                </div>

                                {/* Abstract */}
                                {article.abstract && (
                                  <div className="mb-4">
                                    <p className="text-gray-600 leading-relaxed">{article.abstract}</p>
                                  </div>
                                )}

                                {/* Keywords */}
                                {article.keywords && (
                                  <div className="mb-4">
                                    <div className="flex flex-wrap gap-2">
                                      {formatKeywords(article.keywords).map((keyword: string, index: number) => (
                                        <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                                          {keyword}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Categories */}
                                {article.categories.length > 0 && (
                                  <div className="mb-4">
                                    <div className="flex flex-wrap gap-2">
                                      {article.categories.map((cat) => (
                                        <span key={cat.category.id} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                                          {cat.category.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center space-x-4 text-sm">
                                  {(article.pdfPath || article.pdfUrl) && (
                                    <a
                                      href={article.pdfPath || article.pdfUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center text-red-600 hover:text-red-800 transition-colors"
                                    >
                                      <BookOpen className="h-4 w-4 mr-1" />
                                      PDF
                                    </a>
                                  )}
                                  {article.doi && (
                                    <a
                                      href={`https://doi.org/${article.doi}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                      <ArrowLeft className="h-4 w-4 mr-1 rotate-45" />
                                      DOI
                                    </a>
                                  )}
                                  {article.publishedDate && (
                                    <span className="text-gray-500">{formatDate(article.publishedDate)}</span>
                                  )}
                                </div>
                              </article>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No publications found</h3>
                    <p className="text-gray-500">This author hasn't published any articles yet.</p>
                  </div>
                )
              ) : (
                // Original paginated view for ID-based URLs
                articles.length > 0 ? (
                  <>
                    <div className="space-y-6">
                      {articles.map(article => (
                        <div key={article.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                          <ArticleCard article={convertArticle(article)} />
                        </div>
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
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No publications found</h3>
                    <p className="text-gray-500">This author hasn't published any articles yet.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}