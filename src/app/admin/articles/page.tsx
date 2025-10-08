'use client';

import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, ExternalLink, Search, Filter } from 'lucide-react';
import Link from 'next/link';

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
  eventEdition: {
    id: string;
    year: number;
    title: string;
    event: {
      id: string;
      name: string;
      shortName: string;
    } | null;
  } | null;
  categories: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents();
    fetchArticles();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [pagination.page, search, eventFilter]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('artigador_token');
      const response = await fetch('/api/admin/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('artigador_token');
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(eventFilter && { eventId: eventFilter })
      });

      const response = await fetch(`/api/admin/articles?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const token = localStorage.getItem('artigador_token');
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setArticles(articles.filter(article => article.id !== id));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Error deleting article');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchArticles();
  };

  const formatAuthors = (authors: Article['authors']) => {
    return authors
      .sort((a, b) => a.order - b.order)
      .map(a => a.author.name)
      .join(', ');
  };

  if (loading && articles.length === 0) {
    return (
      <AdminLayout title="Articles">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Articles Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">All Articles</h2>
            <p className="text-sm text-gray-500">Manage research articles and papers</p>
          </div>
          <Link
            href="/admin/articles/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search articles, authors, keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>
            </form>

            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="">All Events</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.shortName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Articles List */}
        {articles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first article</p>
            <Link
              href="/admin/articles/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Article
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title & Authors
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categories
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Links
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {articles.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatAuthors(article.authors)}
                            </p>
                            {article.pages && (
                              <p className="text-xs text-gray-400 mt-1">
                                Pages: {article.pages}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {article.eventEdition ? (
                              <>
                                <div className="font-medium text-gray-900">
                                  {article.eventEdition.event?.shortName || 'N/A'} {article.eventEdition.year}
                                </div>
                                <div className="text-gray-500 text-xs">
                                  {article.eventEdition.title}
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-400 text-xs">No event assigned</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {article.categories.slice(0, 2).map((cat) => (
                              <span
                                key={cat.category.id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {cat.category.name}
                              </span>
                            ))}
                            {article.categories.length > 2 && (
                              <span className="text-xs text-gray-400">
                                +{article.categories.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {article.doi && (
                              <a
                                href={`https://doi.org/${article.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-xs"
                              >
                                DOI
                              </a>
                            )}
                            {article.url && (
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800 text-xs"
                              >
                                URL
                              </a>
                            )}
                            {article.pdfPath && (
                              <a
                                href={article.pdfPath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                PDF
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/admin/articles/${article.id}/edit`}
                              className="text-gray-400 hover:text-blue-600"
                              title="Edit article"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => deleteArticle(article.id)}
                              className="text-gray-400 hover:text-red-600"
                              title="Delete article"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border">
                <div className="flex items-center text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} articles
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}