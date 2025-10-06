'use client';

import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  description: string;
}

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
  categories: Array<{
    categoryId: string;
    category: {
      id: string;
      name: string;
    };
  }>;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    description: '',
    website: '',
    organizer: '',
    field: '',
    topics: [''],
    selectedCategories: [] as string[]
  });

  useEffect(() => {
    fetchCategories();
    fetchEvent();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('artigador_token');
      const response = await fetch('/api/admin/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchEvent = async () => {
    try {
      const token = localStorage.getItem('artigador_token');
      const response = await fetch(`/api/admin/events/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const eventData = await response.json();
        setEvent(eventData);
        
        // Parse topics from JSON string
        const topics = eventData.topics ? JSON.parse(eventData.topics) : [''];
        
        // Get selected category IDs
        const selectedCategories = eventData.categories.map((cat: any) => cat.categoryId);
        
        setFormData({
          name: eventData.name,
          shortName: eventData.shortName,
          description: eventData.description,
          website: eventData.website || '',
          organizer: eventData.organizer,
          field: eventData.field,
          topics: topics.length > 0 ? topics : [''],
          selectedCategories
        });
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('artigador_token');
      const response = await fetch(`/api/admin/events/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          topics: formData.topics.filter(topic => topic.trim() !== ''),
          categories: formData.selectedCategories
        })
      });

      if (response.ok) {
        router.push('/admin/events');
      } else {
        alert('Error updating event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Error updating event');
    } finally {
      setLoading(false);
    }
  };

  const addTopic = () => {
    setFormData(prev => ({
      ...prev,
      topics: [...prev.topics, '']
    }));
  };

  const removeTopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }));
  };

  const updateTopic = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.map((topic, i) => i === index ? value : topic)
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }));
  };

  if (fetchLoading) {
    return (
      <AdminLayout title="Edit Event">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!event) {
    return (
      <AdminLayout title="Edit Event">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Event not found</h3>
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
    <AdminLayout title="Edit Event">
      <div className="max-w-4xl">
        <div className="flex items-center mb-6">
          <Link
            href="/admin/events"
            className="text-gray-400 hover:text-gray-600 mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Edit Event</h2>
            <p className="text-sm text-gray-500">Update event information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg border p-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="e.g., Brazilian Symposium on Software Engineering"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Name *
              </label>
              <input
                type="text"
                required
                value={formData.shortName}
                onChange={(e) => setFormData(prev => ({ ...prev, shortName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="e.g., SBES"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Brief description of the event..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organizer *
              </label>
              <input
                type="text"
                required
                value={formData.organizer}
                onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="e.g., Brazilian Computer Society (SBC)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field *
              </label>
              <input
                type="text"
                required
                value={formData.field}
                onChange={(e) => setFormData(prev => ({ ...prev, field: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="e.g., Software Engineering"
              />
            </div>
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

          {/* Topics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topics
            </label>
            <div className="space-y-2">
              {formData.topics.map((topic, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => updateTopic(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="e.g., software engineering"
                  />
                  {formData.topics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTopic(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTopic}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Topic
              </button>
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.selectedCategories.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Link
              href="/admin/events"
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
              {loading ? 'Updating...' : 'Update Event'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}