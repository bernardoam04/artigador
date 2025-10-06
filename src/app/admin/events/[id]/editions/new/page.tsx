'use client';

import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  name: string;
  shortName: string;
}

export default function NewEditionPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    title: '',
    description: '',
    location: '',
    website: '',
    startDate: '',
    endDate: '',
    submissionDeadline: '',
    notificationDate: '',
    cameraReadyDeadline: ''
  });

  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    try {
      const token = localStorage.getItem('artigador_token');
      const response = await fetch(`/api/admin/events/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const eventData = await response.json();
        setEvent(eventData);
        // Set default title based on event
        setFormData(prev => ({
          ...prev,
          title: `${eventData.shortName} ${prev.year}`
        }));
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('artigador_token');
      const response = await fetch(`/api/admin/events/${params.id}/editions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year.toString()),
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          submissionDeadline: formData.submissionDeadline || null,
          notificationDate: formData.notificationDate || null,
          cameraReadyDeadline: formData.cameraReadyDeadline || null
        })
      });

      if (response.ok) {
        router.push(`/admin/events/${params.id}/editions`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error creating edition');
      }
    } catch (error) {
      console.error('Error creating edition:', error);
      alert('Error creating edition');
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year: number) => {
    setFormData(prev => ({
      ...prev,
      year,
      title: event ? `${event.shortName} ${year}` : `${year}`
    }));
  };

  return (
    <AdminLayout title="Create New Edition">
      <div className="max-w-4xl">
        <div className="flex items-center mb-6">
          <Link
            href={`/admin/events/${params.id}/editions`}
            className="text-gray-400 hover:text-gray-600 mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Create New Edition</h2>
            <p className="text-sm text-gray-500">
              Add a new edition for {event ? `${event.name} (${event.shortName})` : 'this event'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg border p-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <input
                type="number"
                required
                min="1900"
                max="2100"
                value={formData.year}
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="e.g., SBES 2024"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Brief description of this edition..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="e.g., São Paulo, Brazil"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Event Dates */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>
            </div>
          </div>

          {/* Important Deadlines */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Important Deadlines</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Deadline
                </label>
                <input
                  type="date"
                  value={formData.submissionDeadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, submissionDeadline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Date
                </label>
                <input
                  type="date"
                  value={formData.notificationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, notificationDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Camera Ready Deadline
                </label>
                <input
                  type="date"
                  value={formData.cameraReadyDeadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, cameraReadyDeadline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Link
              href={`/admin/events/${params.id}/editions`}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Edition'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}