'use client';

import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
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
  event: {
    id: string;
    name: string;
    shortName: string;
  };
}

export default function EditEditionPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [edition, setEdition] = useState<Edition | null>(null);
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
    fetchEdition();
  }, []);

  const fetchEdition = async () => {
    try {
      const token = localStorage.getItem('artigador_token');
      const response = await fetch(`/api/admin/editions/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const editionData = await response.json();
        setEdition(editionData);
        
        // Format dates for input fields
        const formatDate = (dateString?: string) => {
          if (!dateString) return '';
          return new Date(dateString).toISOString().split('T')[0];
        };

        setFormData({
          year: editionData.year,
          title: editionData.title,
          description: editionData.description || '',
          location: editionData.location || '',
          website: editionData.website || '',
          startDate: formatDate(editionData.startDate),
          endDate: formatDate(editionData.endDate),
          submissionDeadline: formatDate(editionData.submissionDeadline),
          notificationDate: formatDate(editionData.notificationDate),
          cameraReadyDeadline: formatDate(editionData.cameraReadyDeadline)
        });
      }
    } catch (error) {
      console.error('Error fetching edition:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('artigador_token');
      const response = await fetch(`/api/admin/editions/${params.id}`, {
        method: 'PUT',
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
        router.push(`/admin/events/${edition?.event.id}/editions`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error updating edition');
      }
    } catch (error) {
      console.error('Error updating edition:', error);
      alert('Error updating edition');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <AdminLayout title="Edit Edition">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!edition) {
    return (
      <AdminLayout title="Edit Edition">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Edition not found</h3>
          <Link
            href="/admin/events"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Events
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Edition">
      <div className="max-w-4xl">
        <div className="flex items-center mb-6">
          <Link
            href={`/admin/events/${edition.event.id}/editions`}
            className="text-gray-400 hover:text-gray-600 mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Edit Edition</h2>
            <p className="text-sm text-gray-500">
              Update {edition.event.name} ({edition.event.shortName}) - {edition.year}
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
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
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
              href={`/admin/events/${edition.event.id}/editions`}
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
              {loading ? 'Updating...' : 'Update Edition'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}