'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, User, Mail, Building, BookOpen, Users } from 'lucide-react';
import SearchWithSuggestions from '@/components/SearchWithSuggestions';

interface Author {
  id: string;
  name: string;
  email: string;
  affiliation?: string;
  _count: {
    articles: number;
  };
  articles: Array<{
    article: {
      id: string;
      title: string;
      eventEdition: {
        year: number;
        event: {
          shortName: string;
        };
      };
    };
  }>;
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    const fetchAuthors = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString()
        });

        if (searchQuery) params.append('q', searchQuery);

        const response = await fetch(`/api/authors?${params}`);
        if (response.ok) {
          const data = await response.json();
          setAuthors(data.authors);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error('Error fetching authors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, [searchQuery, pagination.page, pagination.limit]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  if (loading && authors.length === 0) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Authors Directory</h1>
          <p className="text-gray-600 mb-6">
            Discover researchers and academics who have contributed to our collection.
          </p>
          
          {/* Search */}
          <div className="max-w-2xl">
            <SearchWithSuggestions
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search authors, affiliations, emails..."
              onSearch={handleSearch}
              initialValue={searchQuery}
            />
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6">
          <p className="text-gray-600">
            {pagination.total} authors found
            {searchQuery && <span> for "{searchQuery}"</span>}
          </p>
        </div>

        {/* Authors Grid */}
        {authors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authors.map((author) => (
              <div key={author.id} className="bg-white rounded-lg border hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Author Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/authors/${author.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors block truncate"
                      >
                        {author.name}
                      </Link>
                      {author.affiliation && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Building className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{author.affiliation}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                      <a 
                        href={`mailto:${author.email}`}
                        className="hover:text-blue-600 transition-colors truncate"
                      >
                        {author.email}
                      </a>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{author._count.articles} published article{author._count.articles !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Recent Articles Preview */}
                  {author.articles.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Publications</h4>
                      <div className="space-y-2">
                        {author.articles.slice(0, 2).map((articleAuthor, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            <Link 
                              href={`/article/${articleAuthor.article.id}`}
                              className="hover:text-blue-600 line-clamp-1"
                            >
                              {articleAuthor.article.title}
                            </Link>
                            <div className="text-gray-500">
                              {articleAuthor.article.eventEdition.event.shortName} {articleAuthor.article.eventEdition.year}
                            </div>
                          </div>
                        ))}
                        {author.articles.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{author.articles.length - 2} more articles
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* View Profile Button */}
                  <div className="mt-4 pt-4 border-t">
                    <Link
                      href={`/authors/${author.id}`}
                      className="w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium inline-block"
                    >
                      View Full Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading authors...</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No authors found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-12 flex justify-center">
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
      </div>
    </div>
  );
}