'use client';

import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Edit, Trash2, Calendar, ArrowLeft, ExternalLink, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

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
  _count: {
    articles: number;
  };
}

interface Event {
  id: string;
  name: string;
  shortName: string;
}

export default function EventEditionsPage() {
  const params = useParams();
  const [editions, setEditions] = useState<Edition[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
    fetchEditions();
  }, []);

  const fetchEvent = async () => {
    try {
      const token = localStorage.getItem('artigador_token');
      const response = await fetch(`/api/admin/events/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const fetchEditions = async () => {
    try {
      const token = localStorage.getItem('artigador_token');
      const response = await fetch(`/api/admin/events/${params.id}/editions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEditions(data);
      }
    } catch (error) {
      console.error('Error fetching editions:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEdition = async (id: string) => {
    if (!confirm('Are you sure you want to delete this edition?')) return;

    try {
      const token = localStorage.getItem('artigador_token');
      const response = await fetch(`/api/admin/editions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setEditions(editions.filter(edition => edition.id !== id));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error deleting edition');
      }
    } catch (error) {
      console.error('Error deleting edition:', error);
      alert('Error deleting edition');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Event Editions">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Event Editions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link
            href="/admin/events"
            className="text-gray-400 hover:text-gray-600 mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h2 className="text-lg font-medium text-gray-900">
              {event ? `${event.name} (${event.shortName})` : 'Event'} - Editions
            </h2>
            <p className="text-sm text-gray-500">Manage event editions and conferences</p>
          </div>
          <Link
            href={`/admin/events/${params.id}/editions/new`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Edition
          </Link>
        </div>

        {/* Editions List */}
        {editions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No editions found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first edition</p>
            <Link
              href={`/admin/events/${params.id}/editions/new`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Edition
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {editions.map((edition) => (
              <div key={edition.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {edition.title || ` ${edition.year}`}
                      </h3>
                    </div>

                    {edition.description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">{edition.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {edition.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          {edition.location}
                        </div>
                      )}
                      {(edition.startDate || edition.endDate) && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDate(edition.startDate)}
                          {edition.endDate && formatDate(edition.endDate) !== formatDate(edition.startDate) &&
                            ` - ${formatDate(edition.endDate)}`}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                        {edition._count.articles} article(s)
                      </div>
                    </div>

                    {/* Important Dates */}
                    {(edition.submissionDeadline || edition.notificationDate || edition.cameraReadyDeadline) && (
                      <div className="border-t pt-3 mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Important Dates</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-500">
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
                          {edition.cameraReadyDeadline && (
                            <div>
                              <span className="font-medium">Camera Ready:</span> {formatDate(edition.cameraReadyDeadline)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {edition.website && (
                      <a
                        href={edition.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <Link
                      href={`/admin/editions/${edition.id}/edit`}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => deleteEdition(edition.id)}
                      className="text-gray-400 hover:text-red-600"
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