'use client';

import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, ExternalLink, BookOpen, Eye } from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  name: string;
  shortName: string;
  description: string;
  website?: string;
  organizer: string;
  field: string;
  topics: string;
  isActive: boolean;
  editions: any[];
  categories: any[];
  createdAt: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    seedDatabase(); // Seed categories on first load
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    try {
      const token = localStorage.getItem('artigador_token');
      await fetch('/api/admin/seed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const token = localStorage.getItem('artigador_token');
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setEvents(events.filter(event => event.id !== id));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Events">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Events Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">All Events</h2>
            <p className="text-sm text-gray-500">Manage academic events and conferences</p>
          </div>
          <Link
            href="/admin/events/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Link>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first event</p>
            <Link
              href="/admin/events/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {event.shortName}
                      </span>
                      {!event.isActive && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Organizer:</span>
                        <p className="font-medium text-gray-800">{event.organizer}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Field:</span>
                        <p className="font-medium text-gray-800">{event.field}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Editions:</span>
                        <p className="font-medium text-gray-800">{event.editions.length} edition(s)</p>
                      </div>
                    </div>

                    {event.topics && (
                      <div className="mt-3">
                        <span className="text-gray-500 text-sm">Topics:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {JSON.parse(event.topics).slice(0, 3).map((topic: string, index: number) => (
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
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {event.website && (
                      <a
                        href={event.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600"
                        title="Visit website"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <Link
                      href={`/${event.shortName.toLowerCase()}`}
                      className="text-gray-400 hover:text-purple-600"
                      title="View public event page"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/events/${event.id}/editions`}
                      className="text-gray-400 hover:text-green-600"
                      title="Manage editions"
                    >
                      <BookOpen className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/events/${event.id}/edit`}
                      className="text-gray-400 hover:text-blue-600"
                      title="Edit event"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Delete event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}