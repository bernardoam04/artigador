'use client';

import { useParams } from 'next/navigation';
import { Calendar, Download, Heart, Share2, FileText, Users, Building } from 'lucide-react';
import { mockArticles } from '@/data/mockArticles';
import { format } from 'date-fns';
import { useState } from 'react';

export default function ArticlePage() {
  const params = useParams();
  const article = mockArticles.find(a => a.id === params.id);
  const [isPdfVisible, setIsPdfVisible] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Article Header */}
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
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Authors
                </h3>
                <div className="space-y-2">
                  {article.authors.map(author => (
                    <div key={author.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{author.name}</div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          {author.affiliation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Abstract */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Abstract</h3>
                <p className="text-gray-700 leading-relaxed">{article.abstract}</p>
              </div>

              {/* Keywords */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.map(keyword => (
                    <span
                      key={keyword}
                      className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Full Text</h3>
                  <button
                    onClick={() => setIsPdfVisible(!isPdfVisible)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {isPdfVisible ? 'Hide PDF' : 'View PDF'}
                  </button>
                </div>
                {isPdfVisible && (
                  <div className="border rounded-lg overflow-hidden bg-gray-100">
                    <div className="h-96 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p>PDF viewer would be embedded here</p>
                        <p className="text-sm mt-2">In a real implementation, you would use a PDF.js viewer or similar</p>
                        <a
                          href={article.pdfUrl}
                          className="text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download PDF
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Article Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Article Information</h3>
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Published:</span>
                  <span className="ml-2 font-medium text-gray-400">
                    {format(new Date(article.publishedDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Download className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Downloads:</span>
                  <span className="ml-2 font-medium text-gray-400">{article.downloads.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Heart className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Citations:</span>
                  <span className="ml-2 font-medium text-gray-400">{article.citationCount}</span>
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
                {article.venue && (
                  <div className="text-sm">
                    <span className="text-gray-600">Venue:</span>
                    <span className="ml-2 font-medium text-gray-400">{article.venue.name} {article.venue.year}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </button>
                <button className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Save to Library
                </button>
                <button className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Article
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {article.categories.map(category => (
                  <div
                    key={category.id}
                    className="bg-blue-100 text-blue-800 text-sm px-3 py-2 rounded"
                  >
                    {category.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}