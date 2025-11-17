'use client';

import { useState, useEffect } from 'react';
import { Filter, SortAsc, Grid, List, Search } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';
import SearchWithSuggestions from '@/components/SearchWithSuggestions';

interface Article {
  id: string;
  title: string;
  abstract?: string;
  keywords?: string;
  doi?: string;
  url?: string;
  pdfPath?: string;
  pages?: string;
  createdAt: string;
  authors: Array<{
    order: number;
    author: {
      id: string;
      name: string;
      email: string;
      affiliation?: string;
    };
  }>;
  eventEdition: {
    id: string;
    year: number;
    title: string;
    event: {
      id: string;
      name: string;
      shortName: string;
    };
  };
  categories: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Initialize search query from URL parameters
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [searchParams]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          sort: sortBy
        });

        if (searchQuery) params.append('q', searchQuery);
        if (selectedCategories.length > 0) {
          selectedCategories.forEach(cat => params.append('categoryId', cat));
        }

        const response = await fetch(`/api/articles?${params}`);
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [searchQuery, selectedCategories, sortBy, pagination.page]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
    // Update URL
    const newUrl = new URL(window.location.href);
    if (query) {
      newUrl.searchParams.set('q', query);
    } else {
      newUrl.searchParams.delete('q');
    }
    router.push(newUrl.pathname + newUrl.search);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  // Convert article format for ArticleCard compatibility
  const convertArticle = (article: Article) => ({
    id: article.id,
    title: article.title,
    abstract: article.abstract || '',
    authors: article.authors.map(a => ({
      id: a.author.id,
      name: a.author.name,
      affiliation: a.author.affiliation || ''
    })),
    publishedDate: article.createdAt,
    submittedDate: article.createdAt, // Using createdAt as fallback
    lastModified: article.createdAt, // Using createdAt as fallback
    status: 'published' as const, // Default status
    language: 'en' as const, // Default language
    venue: {
      name: article.eventEdition.event.name,
      type: 'conference' as const,
      year: article.eventEdition.year
    },
    pdfUrl: article.pdfPath || '',
    categories: article.categories.map(c => ({
      id: c.category.id,
      name: c.category.name,
      description: ''
    })),
    keywords: article.keywords ? article.keywords.split(',').map(k => k.trim()) : [],
    doi: article.doi,
    url: article.url,
    citationCount: 0, // Not implemented yet
    downloads: 0, // Not implemented yet
    pageCount: 0, // Default value
    version: 1 // Default value
  });

  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Articles</h1>
        <p className="text-gray-600">
          Discover and explore our collection of academic articles and research papers.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <SearchWithSuggestions
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
              iconClassName="text-gray-400"
              initialValue={searchQuery}
              onSearch={handleSearch}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
              <option value="citations">Citations</option>
              <option value="downloads">Downloads</option>
            </select>
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Filter by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {categories.map(category => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <button
                onClick={() => setSelectedCategories([])}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-gray-600">
          {pagination.total} articles found
          {searchQuery && (
            <span> for &quot;{searchQuery}&quot;</span>
          )}
        </div>
        <div className="flex items-center text-sm">
          <SortAsc className="h-4 w-4 mr-2" />
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm "
          >
            <option value="recent">Most Recent</option>
            <option value="title">Title (A-Z)</option>
            <option value="relevance">Relevance</option>
          </select>
        </div>
      </div>

      {/* Articles Grid/List */}
      {articles.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {articles.map(article => (
            <ArticleCard key={article.id} article={convertArticle(article)} />
          ))}
        </div>
      ) : loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading articles...</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium">No articles found</h3>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-12 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {[...Array(Math.min(pagination.pages, 5))].map((_, idx) => {
              const pageNum = Math.max(1, pagination.page - 2) + idx;
              if (pageNum > pagination.pages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 rounded-md ${pageNum === pagination.page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}