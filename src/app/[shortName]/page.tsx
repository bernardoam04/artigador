'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, ExternalLink, Book, ArrowLeft, Globe } from 'lucide-react';

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
    description?: string;
    city?: string;
    country?: string;
    website?: string;
    startDate?: string;
    endDate?: string;
    submissionDeadline?: string;
    notificationDate?: string;
    cameraReadyDate?: string;
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

export default function EventByShortNamePage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/shortname/${params.shortName}`);
        if (response.ok) {
          const data = await response.json();
          setEvent(data);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.shortName]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTopics = (topicsJson: string) => {
    try {
      return JSON.parse(topicsJson);
    } catch {
      return [];
    }
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

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Event not found</h3>
            <Link href="/events" className="text-blue-600 hover:text-blue-800">
              ← Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const location = (edition: any) => {
    const parts = [edition.city, edition.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            href="/events" 
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Events
          </Link>
        </div>

        {/* Event Header */}
        <div className="bg-white rounded-lg border p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.name}</h1>
              <div className="flex items-center space-x-3 mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  {event.shortName}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-600">{event.field}</span>
              </div>
            </div>
            {event.website && (
              <a
                href={event.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Globe className="h-4 w-4 mr-2" />
                Visit Website
              </a>
            )}
          </div>

          <p className="text-gray-600 mb-6 text-lg leading-relaxed">{event.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <div className="font-medium">Organized by</div>
                <div>{event.organizer}</div>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <div className="font-medium">Editions</div>
                <div>{event._count.editions} edition{event._count.editions !== 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>

          {/* Topics */}
          {event.topics && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium text-gray-900 mb-3">Research Topics</h3>
              <div className="flex flex-wrap gap-2">
                {formatTopics(event.topics).map((topic: string, index: number) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {event.categories.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {event.categories.map((cat) => (
                  <span key={cat.category.id} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {cat.category.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Editions */}
        <div className="bg-white rounded-lg border p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Editions</h2>
          
          {event.editions.length > 0 ? (
            <div className="space-y-6">
              {event.editions.sort((a, b) => b.year - a.year).map((edition) => (
                <Link 
                  key={edition.id}
                  href={`/${event.shortName.toLowerCase()}/${edition.year}`}
                  className="block border rounded-lg p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {edition.title}
                      </h3>
                      <div className="flex items-center space-x-3 mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {edition.year}
                        </div>
                        {location(edition) && (
                          <>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {location(edition)}
                            </div>
                          </>
                        )}
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center">
                          <Book className="h-4 w-4 mr-1" />
                          {edition._count.articles} articles
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {edition.website && (
                        <a
                          href={edition.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <span className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Articles →
                      </span>
                    </div>
                  </div>

                  {edition.description && (
                    <p className="text-gray-600 mb-4">{edition.description}</p>
                  )}

                  {/* Event Dates */}
                  {(edition.startDate || edition.endDate) && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">Event Dates: </span>
                      <span className="text-sm text-gray-600">
                        {formatDate(edition.startDate)}
                        {edition.endDate && formatDate(edition.endDate) !== formatDate(edition.startDate) && 
                          ` - ${formatDate(edition.endDate)}`}
                      </span>
                    </div>
                  )}

                  {/* Important Deadlines */}
                  {(edition.submissionDeadline || edition.notificationDate || edition.cameraReadyDate) && (
                    <div className="mt-4 pt-4 border-t bg-gray-50 rounded-md p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Important Dates</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                        {edition.submissionDeadline && (
                          <div>
                            <span className="font-medium">Submission:</span> {formatDate(edition.submissionDeadline)}
                          </div>
                        )}
                        {edition.notificationDate && (
                          <div>
                            <span className="font-medium">Notification:</span> {formatDate(edition.notificationDate)}
                          </div>
                        )}
                        {edition.cameraReadyDate && (
                          <div>
                            <span className="font-medium">Camera Ready:</span> {formatDate(edition.cameraReadyDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No editions available</h3>
              <p className="text-gray-500">This event doesn't have any editions yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}