'use client';

import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

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
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  articles: Array<{
    id: string;
    title: string;
    bibtexKey: string;
  }>;
}

export default function ImportPage() {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableEditions, setAvailableEditions] = useState<Event['editions']>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const [formData, setFormData] = useState({
    eventEditionId: '',
    defaultCategories: [] as string[],
    bibtexContent: ''
  });

  const [bibFile, setBibFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
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

  const handleEventChange = (eventId: string) => {
    const selectedEvent = events.find(event => event.id === eventId);
    setAvailableEditions(selectedEvent?.editions || []);
    setFormData(prev => ({ ...prev, eventEditionId: '' }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBibFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFormData(prev => ({ ...prev, bibtexContent: content }));
      };
      reader.readAsText(file);
    }
  };

  const handleZipUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setZipFile(file);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      defaultCategories: prev.defaultCategories.includes(categoryId)
        ? prev.defaultCategories.filter(id => id !== categoryId)
        : [...prev.defaultCategories, categoryId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setImportResult(null);

    try {
      const token = localStorage.getItem('artigador_token');

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('eventEditionId', formData.eventEditionId);
      formDataToSend.append('defaultCategories', JSON.stringify(formData.defaultCategories));

      // Add BibTeX file or content
      if (bibFile) {
        formDataToSend.append('bibtexFile', bibFile);
      } else {
        // Create a blob from textarea content
        const blob = new Blob([formData.bibtexContent], { type: 'text/plain' });
        formDataToSend.append('bibtexFile', blob, 'upload.bib');
      }

      // Add ZIP file if provided
      if (zipFile) {
        formDataToSend.append('pdfZip', zipFile);
      }

      const response = await fetch('/api/admin/import/bibtex', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        setImportResult(data.results);
        // Clear form on success
        setFormData(prev => ({ ...prev, bibtexContent: '' }));
        setBibFile(null);
        setZipFile(null);
        // Reset file inputs
        const fileInput = document.getElementById('bibtex-file') as HTMLInputElement;
        const zipInput = document.getElementById('zip-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        if (zipInput) zipInput.value = '';
      } else {
        alert(data.error || 'Error importing BibTeX');
      }
    } catch (error) {
      console.error('Error importing BibTeX:', error);
      alert('Error importing BibTeX');
    } finally {
      setLoading(false);
    }
  };

  const resetImport = () => {
    setImportResult(null);
    setFormData(prev => ({ ...prev, bibtexContent: '' }));
    setBibFile(null);
    setZipFile(null);
    const fileInput = document.getElementById('bibtex-file') as HTMLInputElement;
    const zipInput = document.getElementById('zip-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    if (zipInput) zipInput.value = '';
  };

  return (
    <AdminLayout title="Import Articles">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900">BibTeX Import</h2>
          <p className="text-sm text-gray-500">
            Import multiple articles from a BibTeX file
          </p>
        </div>

        {/* Import Results */}
        {importResult && (
          <div className="mb-6 bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Import Results</h3>
              <button
                onClick={resetImport}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Start New Import
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <div className="font-medium text-green-900">{importResult.success}</div>
                  <div className="text-sm text-green-600">Imported</div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-red-50 rounded-lg">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                <div>
                  <div className="font-medium text-red-900">{importResult.failed}</div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-500 mr-2" />
                <div>
                  <div className="font-medium text-blue-900">
                    {importResult.success + importResult.failed}
                  </div>
                  <div className="text-sm text-blue-600">Total</div>
                </div>
              </div>
            </div>

            {/* Successful imports */}
            {importResult.articles.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Successfully Imported Articles</h4>
                <div className="max-h-40 overflow-y-auto">
                  {importResult.articles.map((article, index) => (
                    <div key={index} className="text-sm text-gray-600 py-1">
                      <span className="font-medium">{article.bibtexKey}:</span> {article.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {importResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-900 mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Import Errors
                </h4>
                <div className="max-h-40 overflow-y-auto bg-red-50 rounded-md p-3">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 mb-1">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Import Form */}
        {!importResult && (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg border p-6">
            {/* Event Selection */}
            <div className='text-black'>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Target Event & Edition</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event *
                  </label>
                  <select
                    required
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
                    Edition *
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

            {/* Default Categories */}
            {categories.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Default Categories</h3>
                <p className="text-sm text-gray-500 mb-3">
                  These categories will be applied to all imported articles
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.defaultCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* BibTeX Content */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">BibTeX Content</h3>

              <div className="space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload BibTeX File
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      id="bibtex-file"
                      type="file"
                      accept=".bib,.bibtex,.txt"
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a .bib file or paste BibTeX content below
                  </p>
                </div>

                {/* ZIP Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload ZIP with PDFs
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      id="zip-file"
                      type="file"
                      accept=".zip"
                      onChange={handleZipUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    PDFs must be named exactly as BibTeX keys (e.g., sbes-paper1.pdf)
                  </p>
                </div>

                {/* Text Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Paste BibTeX Content *
                  </label>
                  <textarea
                    rows={12}
                    value={formData.bibtexContent}
                    onChange={(e) => setFormData(prev => ({ ...prev, bibtexContent: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-700"
                    placeholder="@article{key2023,
  title={Article Title},
  author={John Doe and Jane Smith},
  year={2023},
  journal={Journal Name},
  pages={1--10},
  doi={10.1000/123}
}"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, bibtexContent: '' }))}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                {loading ? 'Importing...' : 'Import Articles'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}