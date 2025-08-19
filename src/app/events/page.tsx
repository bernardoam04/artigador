'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Calendar, MapPin, Users, ExternalLink, Book } from 'lucide-react';
import SearchWithSuggestions from '@/components/SearchWithSuggestions';

interface Event {
  id: string;
  name: string;
  shortName: string;
  description: string;
  website?: string;
  organizer: string;
  field: string;
  topics: string;
  editions: Array<{
    id: string;
    year: number;
    title: string;
    location?: string;
    _count: {
      articles: number;
    };
  }>;
  categories: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
  _count: {
    editions: number;
  };
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchEvents();
  }, [searchQuery, pagination.page]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (searchQuery) params.append('q', searchQuery);

      const response = await fetch(`/api/events?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  const formatTopics = (topicsJson: string) => {
    try {
      const topics = JSON.parse(topicsJson);
      return topics.slice(0, 3);
    } catch {
      return [];
    }
  };

  if (loading && events.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Academic Events & Conferences</h1>
          <p className="text-gray-600 mb-6">
            Explore academic events, conferences, and symposiums across various fields of research.
          </p>
          
          {/* Search */}
          <div className="max-w-2xl">
            <SearchWithSuggestions
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search events, organizers, fields..."
              onSearch={handleSearch}
              initialValue={searchQuery}
            />
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6">
          <p className="text-gray-600">
            {pagination.total} events found
            {searchQuery && <span> for "{searchQuery}"</span>}
          </p>
        </div>

        {/* Events Grid */}
        {events.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg border hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Event Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Link 
                        href={`/events/${event.id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {event.name}
                      </Link>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                          {event.shortName}
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">{event.field}</span>
                      </div>
                    </div>
                    {event.website && (
                      <a
                        href={event.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 ml-4"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                  {/* Organizer */}
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Users className="h-4 w-4 mr-1" />
                    <span>Organized by {event.organizer}</span>
                  </div>

                  {/* Topics */}
                  {event.topics && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {formatTopics(event.topics).map((topic: string, index: number) => (
                          <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            {topic}
                          </span>
                        ))}
                        {JSON.parse(event.topics).length > 3 && (
                          <span className="text-gray-500 text-xs">
                            +{JSON.parse(event.topics).length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{event._count.editions} edition{event._count.editions !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center">
                        <Book className="h-4 w-4 mr-1" />
                        <span>
                          {event.editions.reduce((total, edition) => total + edition._count.articles, 0)} articles
                        </span>
                      </div>
                    </div>
                    
                    <Link
                      href={`/events/${event.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>

                  {/* Recent Editions */}
                  {event.editions.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Editions</h4>
                      <div className="flex flex-wrap gap-2">
                        {event.editions.slice(0, 3).map((edition) => (
                          <Link
                            key={edition.id}
                            href={`/editions/${edition.id}`}
                            className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-2 py-1 rounded border"
                          >
                            {edition.year} • {edition._count.articles} articles
                            {edition.location && (
                              <span className="text-gray-500"> • {edition.location}</span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading events...</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
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