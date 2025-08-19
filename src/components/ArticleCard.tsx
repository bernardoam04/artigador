import Link from 'next/link';
import { Calendar, Download, Heart, ExternalLink } from 'lucide-react';
import { Article } from '@/types/article';
import { format } from 'date-fns';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Link 
            href={`/article/${article.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
          >
            {article.title}
          </Link>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {format(new Date(article.publishedDate), 'MMM dd, yyyy')}
            </span>
            <span className="flex items-center">
              <Download className="h-4 w-4 mr-1" />
              {article.downloads}
            </span>
            <span className="flex items-center">
              <Heart className="h-4 w-4 mr-1" />
              {article.citationCount}
            </span>
          </div>
        </div>
        {article.status === 'preprint' && (
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
            Preprint
          </span>
        )}
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-600 mb-2">
          {article.authors.map(author => author.name).join(', ')}
        </p>
        <p className="text-sm text-gray-700 line-clamp-3">
          {article.abstract}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {article.categories.slice(0, 2).map(category => (
            <span
              key={category.id}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
            >
              {category.name}
            </span>
          ))}
          {article.categories.length > 2 && (
            <span className="text-xs text-gray-500">
              +{article.categories.length - 2} more
            </span>
          )}
        </div>
        <Link
          href={`/article/${article.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
        >
          View <ExternalLink className="h-3 w-3 ml-1" />
        </Link>
      </div>
    </div>
  );
}