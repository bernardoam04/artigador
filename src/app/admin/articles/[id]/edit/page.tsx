'use client';

import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Author {
  name: string;
  email: string;
  affiliation: string;
}

interface Event {
  id: string;
  name: string;
  shortName: string;
  editions: Array<{
    id: string;
    year: number;
    title: string;
  }>;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Article {
  id: string;
  title: string;
  abstract?: string;
  keywords?: string;
  doi?: string;
  url?: string;
  pdfPath?: string;
  pages?: string;
  eventEditionId: string;
  authors: Array<{
    order: number;
    author: {
      name: string;
      email: string;
      affiliation?: string;
    };
  }>;
  eventEdition: {
    id: string;
    event: {
      id: string;
    };
  };
  categories: Array<{
    category: {
      id: string;
    };
  }>;
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [article, setArticle] = useState<Article | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableEditions, setAvailableEditions] = useState<Event['editions']>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    keywords: '',
    doi: '',
    url: '',
    pdfPath: '',
    pages: '',
    eventEditionId: '',
    selectedCategories: [] as string[]
  });

  const [authors, setAuthors] = useState<Author[]>([
    { name: '', email: '', affiliation: '' }
  ]);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
    fetchArticle();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('artigador_token');
      const response = await fetch('/api/admin/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

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

  const fetchArticle = async () => {
    try {
      const token = localStorage.getItem('artigador_token');
      const response = await fetch(`/api/admin/articles/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const articleData = await response.json();
        setArticle(articleData);
        
        // Set form data
        setFormData({
          title: articleData.title,
          abstract: articleData.abstract || '',
          keywords: articleData.keywords || '',
          doi: articleData.doi || '',
          url: articleData.url || '',
          pdfPath: articleData.pdfPath || '',
          pages: articleData.pages || '',
          eventEditionId: articleData.eventEditionId,
          selectedCategories: articleData.categories?.map((cat: any) => cat.category.id) || []
        });

        // Set authors
        const articleAuthors = (articleData.authors || [])
          .sort((a: any, b: any) => a.order - b.order)
          .map((a: any) => ({
            name: a.author.name,
            email: a.author.email,
            affiliation: a.author.affiliation || ''
          }));
        setAuthors(articleAuthors.length > 0 ? articleAuthors : [{ name: '', email: '', affiliation: '' }]);

        // Set available editions for the current event
        const currentEvent = events.find(event => event.id === articleData.eventEdition.event.id);
        if (currentEvent) {
          setAvailableEditions(currentEvent.editions);
        }
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleEventChange = (eventId: string) => {
    const selectedEvent = events.find(event => event.id === eventId);
    setAvailableEditions(selectedEvent?.editions || []);
    setFormData(prev => ({ ...prev, eventEditionId: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('artigador_token');
      const response = await fetch(`/api/admin/articles/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          authors: authors.filter(author => author.name.trim() !== ''),
          categories: formData.selectedCategories
        })
      });

      if (response.ok) {
        router.push('/admin/articles');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error updating article');
      }
    } catch (error) {
      console.error('Error updating article:', error);
      alert('Error updating article');
    } finally {
      setLoading(false);
    }
  };

  const addAuthor = () => {
    setAuthors([...authors, { name: '', email: '', affiliation: '' }]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((_, i) => i !== index));
    }
  };

  const updateAuthor = (index: number, field: keyof Author, value: string) => {
    const updated = [...authors];
    updated[index] = { ...updated[index], [field]: value };
    setAuthors(updated);
  };

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }));
  };

  // Set available editions when events are loaded and we have article data
  useEffect(() => {
    if (events.length > 0 && article && article.eventEdition?.event?.id) {
      const currentEvent = events.find(event => event.id === article.eventEdition.event.id);
      if (currentEvent) {
        setAvailableEditions(currentEvent.editions);
      }
    }
  }, [events, article]);

  if (fetchLoading) {
    return (
      <AdminLayout title="Edit Article">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!article) {
    return (
      <AdminLayout title="Edit Article">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Article not found</h3>
          <Link
            href="/admin/articles"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Articles
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Article">
      <div className="max-w-4xl">
        <div className="flex items-center mb-6">
          <Link
            href="/admin/articles"
            className="text-gray-400 hover:text-gray-600 mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Edit Article</h2>
            <p className="text-sm text-gray-500">Update article information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg border p-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            
            <div className="space-y-4">
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
                  placeholder="Enter article title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Abstract
                </label>
                <textarea
                  rows={6}
                  value={formData.abstract}
                  onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Enter article abstract..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="machine learning, artificial intelligence, deep learning"
                />
                <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DOI
                  </label>
                  <input
                    type="text"
                    value={formData.doi}
                    onChange={(e) => setFormData(prev => ({ ...prev, doi: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="10.1000/182"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pages
                  </label>
                  <input
                    type="text"
                    value={formData.pages}
                    onChange={(e) => setFormData(prev => ({ ...prev, pages: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="1-10 or 45-67"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="https://example.com/article"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PDF Path/URL
                  </label>
                  <input
                    type="text"
                    value={formData.pdfPath}
                    onChange={(e) => setFormData(prev => ({ ...prev, pdfPath: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="/pdfs/article.pdf or https://example.com/paper.pdf"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Event and Edition */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event & Edition *</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event
                </label>
                <select
                  value={article?.eventEdition?.event?.id || ''}
                  onChange={(e) => handleEventChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="">Select an event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} ({event.shortName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edition
                </label>
                <select
                  required
                  value={formData.eventEditionId}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventEditionId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                  disabled={availableEditions.length === 0}
                >
                  <option value="">Select an edition</option>
                  {availableEditions.map((edition) => (
                    <option key={edition.id} value={edition.id}>
                      {edition.title} ({edition.year})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Authors */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Authors</h3>
            
            <div className="space-y-4">
              {authors.map((author, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Author {index + 1}</h4>
                    {authors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAuthor(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={author.name}
                        onChange={(e) => updateAuthor(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={author.email}
                        onChange={(e) => updateAuthor(index, 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="email@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Affiliation
                      </label>
                      <input
                        type="text"
                        value={author.affiliation}
                        onChange={(e) => updateAuthor(index, 'affiliation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Institution/Company"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addAuthor}
                className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Author
              </button>
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
              
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
              href="/admin/articles"
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
              {loading ? 'Updating...' : 'Update Article'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}