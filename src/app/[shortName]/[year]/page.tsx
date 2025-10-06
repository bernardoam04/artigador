'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, ExternalLink, Book, ArrowLeft, Globe, FileText, Download, User } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  abstract: string;
  keywords: string;
  publishedDate?: string;
  doi?: string;
  arxivId?: string;
  pdfUrl?: string;
  citationCount?: number;
  downloads?: number;
  pageCount?: number;
  startPage?: number;
  endPage?: number;
  track?: string;
  authors: Array<{
    order: number;
    author: {
      id: string;
      name: string;
      email?: string;
      affiliation: string;
      orcid?: string;
      website?: string;
    };
  }>;
  categories: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
}

interface EventEdition {
  id: string;
  year: number;
  title: string;
  description?: string;
  city?: string;
  country?: string;
  venue?: string;
  startDate?: string;
  endDate?: string;
  submissionDeadline?: string;
  notificationDate?: string;
  cameraReadyDate?: string;
  website?: string;
  chairpersons?: string;
  tracks?: string;
  event: {
    id: string;
    name: string;
    shortName: string;
    description: string;
    website?: string;
    organizer: string;
    field: string;
    topics: string;
  };
  articles: Article[];
  _count: {
    articles: number;
  };
}

export default function EventEditionPage() {
  const params = useParams();
  const [edition, setEdition] = useState<EventEdition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEdition = async () => {
      try {
        const response = await fetch(`/api/events/shortname/${params.shortName}/${params.year}`);
        if (response.ok) {
          const data = await response.json();
          setEdition(data);
        }
      } catch (error) {
        console.error('Error fetching edition:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEdition();
  }, [params.shortName, params.year]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatKeywords = (keywordsJson: string) => {
    try {
      return JSON.parse(keywordsJson);
    } catch {
      return [];
    }
  };

  const location = (edition: EventEdition) => {
    const parts = [edition.city, edition.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

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
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/events" className="hover:text-blue-600">Events</Link>
            <span>→</span>
            <Link 
              href={`/${edition.event.shortName.toLowerCase()}`}
              className="hover:text-blue-600"
            >
              {edition.event.shortName}
            </Link>
            <span>→</span>
            <span className="text-gray-900">{edition.year}</span>
          </div>
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
                {location(edition) && (
                  <>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {location(edition)}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              {edition.website && (
                <a
                  href={edition.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Visit Website
                </a>
              )}
              <Link
                href={`/${edition.event.shortName.toLowerCase()}`}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                All Editions
              </Link>
            </div>
          </div>

          {edition.description && (
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">{edition.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <div className="font-medium">Organized by</div>
                <div>{edition.event.organizer}</div>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <Book className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <div className="font-medium">Articles</div>
                <div>{edition._count.articles} published</div>
              </div>
            </div>

            {edition.venue && (
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">Venue</div>
                  <div>{edition.venue}</div>
                </div>
              </div>
            )}
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
          {(edition.submissionDeadline || edition.notificationDate || edition.cameraReadyDate) && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium text-gray-900 mb-3">Important Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                {edition.submissionDeadline && (
                  <div>
                    <span className="font-medium">Submission Deadline:</span><br />
                    {formatDate(edition.submissionDeadline)}
                  </div>
                )}
                {edition.notificationDate && (
                  <div>
                    <span className="font-medium">Notification Date:</span><br />
                    {formatDate(edition.notificationDate)}
                  </div>
                )}
                {edition.cameraReadyDate && (
                  <div>
                    <span className="font-medium">Camera Ready:</span><br />
                    {formatDate(edition.cameraReadyDate)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Articles */}
        <div className="bg-white rounded-lg border p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Published Articles ({edition._count.articles})
          </h2>
          
          {edition.articles.length > 0 ? (
            <div className="space-y-8">
              {edition.articles.map((article) => (
                <article key={article.id} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
                        {article.title}
                      </h3>
                      
                      {/* Authors */}
                      <div className="flex items-center text-gray-600 mb-3">
                        <User className="h-4 w-4 mr-2" />
                        <div className="flex flex-wrap">
                          {article.authors
                            .sort((a, b) => a.order - b.order)
                            .map((authorRel, index) => (
                              <span key={authorRel.author.id} className="mr-2">
                                {authorRel.author.name}
                                {authorRel.author.affiliation && (
                                  <span className="text-gray-500 text-sm"> ({authorRel.author.affiliation})</span>
                                )}
                                {index < article.authors.length - 1 && <span className="text-gray-400">,</span>}
                              </span>
                            ))}
                        </div>
                      </div>

                      {/* Article metadata */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        {article.publishedDate && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(article.publishedDate)}
                          </div>
                        )}
                        {article.pageCount && (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {article.pageCount} pages
                          </div>
                        )}
                        {article.track && (
                          <div>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {article.track}
                            </span>
                          </div>
                        )}
                        {(article.startPage && article.endPage) && (
                          <div>pp. {article.startPage}-{article.endPage}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {article.pdfUrl && (
                        <a
                          href={article.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </a>
                      )}
                      {article.doi && (
                        <a
                          href={`https://doi.org/${article.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          DOI
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Abstract */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Abstract</h4>
                    <p className="text-gray-600 leading-relaxed">{article.abstract}</p>
                  </div>

                  {/* Keywords */}
                  {article.keywords && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Keywords</h4>
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
                      <h4 className="font-medium text-gray-900 mb-2">Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {article.categories.map((cat) => (
                          <span key={cat.category.id} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                            {cat.category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  {(article.citationCount || article.downloads) && (
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      {article.citationCount !== undefined && article.citationCount > 0 && (
                        <div>Citations: {article.citationCount}</div>
                      )}
                      {article.downloads !== undefined && article.downloads > 0 && (
                        <div>Downloads: {article.downloads}</div>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Book className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles available</h3>
              <p className="text-gray-500">This edition doesn't have any published articles yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}