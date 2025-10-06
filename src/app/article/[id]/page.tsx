'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Download, Heart, Share2, FileText, Users, Building } from 'lucide-react';
import { format } from 'date-fns';

export default function ArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPdfVisible, setIsPdfVisible] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true);
      try {
        const res = await fetch(`/api/articles/${params.id}`);
        console.log('Fetching article with id:', params.id);
        if (!res.ok) throw new Error('Article not found');
        const data = await res.json();
        setArticle(data);
      } catch (err) {
        console.error(err);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [params.id]);

  if (loading) return <p>Loading...</p>;

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600">The article you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  // Parse keywords if stored as JSON string
  const keywords = Array.isArray(article.keywords)
    ? article.keywords
    : (() => {
        try {
          return JSON.parse(article.keywords || '[]');
        } catch {
          return [];
        }
      })();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {article.status === 'preprint' && (
                    <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full mb-3 inline-block">
                      Preprint
                    </span>
                  )}
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
                </div>
              </div>

              {/* Authors */}
              {article.authors?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Authors
                  </h3>
                  <div className="space-y-2">
                  {article.authors.map((author: any, index: number) => (
                    <div
                      key={author.id || author.author?.id || `author-${index}`}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{author.author.name}</div>
                        {author.affiliation && (
                          <div className="text-sm text-gray-600 flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            {author.affiliation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}

              {/* Abstract */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Abstract</h3>
                <p className="text-gray-700 leading-relaxed">{article.abstract}</p>
              </div>

              {/* Keywords */}
              {keywords.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword: string) => (
                      <span
                        key={keyword}
                        className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* PDF Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Full Text</h3>
                  {article.pdfUrl && (
                    <button
                      onClick={() => setIsPdfVisible(!isPdfVisible)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {isPdfVisible ? 'Hide PDF' : 'View PDF'}
                    </button>
                  )}
                </div>
                {isPdfVisible && article.pdfUrl && (
                  <div className="border rounded-lg overflow-hidden bg-gray-100">
                    {article.pdfUrl ? (
                      <iframe src={article.pdfUrl} className="w-full h-96" />
                    ) : (
                      <div className="h-96 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                          <p>No PDF available</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Article Information</h3>
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Published:</span>
                  <span className="ml-2 font-medium">
                    {article.publishedDate
                      ? format(new Date(article.publishedDate), 'MMM dd, yyyy')
                      : 'Not published'}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <Download className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Downloads:</span>
                  <span className="ml-2 font-medium">{article.downloads?.toLocaleString() || 0}</span>
                </div>

                <div className="flex items-center text-sm">
                  <Heart className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Citations:</span>
                  <span className="ml-2 font-medium">{article.citationCount || 0}</span>
                </div>

                {article.doi && (
                  <div className="text-sm">
                    <span className="text-gray-600">DOI:</span>
                    <a
                      href={`https://doi.org/${article.doi}`}
                      className="ml-2 text-blue-600 hover:text-blue-800 break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {article.doi}
                    </a>
                  </div>
                )}

                {article.eventEdition && (
                  <div className="text-sm">
                    <span className="text-gray-600">Event:</span>
                    <span className="ml-2 font-medium">
                      {article.eventEdition.name} ({article.eventEdition.year})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    if (!article.pdfUrl) {
                      alert('PDF not available for this article');
                      return;
                    }

                    try {
                      // For local files (starts with /), use fetch to download
                      if (article.pdfUrl.startsWith('/')) {
                        const response = await fetch(article.pdfUrl);
                        if (!response.ok) {
                          throw new Error('PDF not found');
                        }
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${article.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } else {
                        // For external URLs, open in new tab
                        window.open(article.pdfUrl, '_blank', 'noopener,noreferrer');
                      }
                    } catch (error) {
                      console.error('Error downloading PDF:', error);
                      alert('Failed to download PDF. Please try again.');
                    }
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!article.pdfUrl}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {article.pdfUrl ? 'Download PDF' : 'PDF Not Available'}
                </button>
                <button
                  onClick={() => navigator.share ? navigator.share({ title: article.title, url: window.location.href }) : console.log('Share clicked')}
                  className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Article
                </button>
              </div>
            </div>

            {/* Categories */}
            {article.categories?.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {article.categories.map((category: any) => (
                    <div
                      key={category.id}
                      className="bg-blue-100 text-blue-800 text-sm px-3 py-2 rounded"
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
