import Link from 'next/link';
import { Trophy, ExternalLink, Calendar, Download, Award } from 'lucide-react';
import { realArticles } from '@/data/realArticles';

export default function RankingPage() {
  // Sort articles by impact (using citation count as a proxy)
  const rankedArticles = [...realArticles].sort((a, b) => b.citationCount - a.citationCount);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-amber-800';
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-12 w-12 text-yellow-500 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">
              Most Influential Computer Science Papers
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A ranking of the most important computer science papers since 1930, 
            based on their lasting impact on the field and citation counts.
          </p>
          <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
            <Award className="h-4 w-4 mr-2" />
            <span>Ranked by citation count and historical significance</span>
          </div>
        </div>

        {/* Methodology */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Ranking Methodology</h2>
          <p className="text-gray-600 mb-3">
            This ranking combines citation counts with historical significance to identify the papers 
            that have had the greatest impact on computer science. Each paper represents a fundamental 
            breakthrough that shaped the field&apos;s development.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span>Citation impact</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Historical significance</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Field influence</span>
            </div>
          </div>
        </div>

        {/* Rankings */}
        <div className="space-y-4">
          {rankedArticles.map((article, index) => {
            const rank = index + 1;
            return (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Rank Badge */}
                    <div className={`flex-shrink-0 w-16 h-16 ${getRankColor(rank)} text-white rounded-full flex items-center justify-center font-bold text-lg`}>
                      {getRankIcon(rank)}
                    </div>

                    {/* Article Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link 
                            href={`/article/${article.id}`}
                            className="text-xl font-bold text-gray-900 hover:text-blue-600 line-clamp-2"
                          >
                            {article.title}
                          </Link>
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">
                              {article.authors.map(author => author.name).join(', ')}
                            </span>
                            {article.venue && (
                              <span className="ml-2">
                                • {article.venue.name} ({article.venue.year})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <div className="text-right text-sm text-gray-500">
                            <div className="flex items-center mb-1">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(article.publishedDate).getFullYear()}
                            </div>
                            <div className="flex items-center">
                              <Download className="h-4 w-4 mr-1" />
                              {article.citationCount.toLocaleString()} citations
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="mt-3 text-gray-700 line-clamp-2">
                        {article.abstract}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {article.categories.slice(0, 2).map(category => (
                            <span
                              key={category.id}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                            >
                              {category.name}
                            </span>
                          ))}
                          {article.keywords.slice(0, 3).map(keyword => (
                            <span
                              key={keyword}
                              className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            href={`/article/${article.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                          >
                            View Details <ExternalLink className="h-3 w-3 ml-1" />
                          </Link>
                          <a
                            href={article.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                          >
                            PDF <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Historical Context */}
        <div className="mt-12 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Historical Context</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1930s</div>
              <div className="text-sm text-gray-600">Theoretical Foundations</div>
              <div className="text-xs text-gray-500 mt-1">Turing&apos;s work on computability</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1940s-70s</div>
              <div className="text-sm text-gray-600">Core Systems</div>
              <div className="text-xs text-gray-500 mt-1">Information theory, databases, networks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1980s-2000s</div>
              <div className="text-sm text-gray-600">Internet & Web</div>
              <div className="text-xs text-gray-500 mt-1">TCP/IP, WWW, search engines</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">2010s-Present</div>
              <div className="text-sm text-gray-600">AI Renaissance</div>
              <div className="text-xs text-gray-500 mt-1">Deep learning, transformers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}