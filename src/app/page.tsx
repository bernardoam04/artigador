'use client';

import Link from 'next/link';
import { TrendingUp, Clock, Star } from 'lucide-react';
import ArticleCard from '@/components/ArticleCard';
import SearchWithSuggestions from '@/components/SearchWithSuggestions';
import NewsletterSignup from '@/components/NewsletterSignup';
import { realArticles } from '@/data/realArticles';
import { categories } from '@/data/categories';

export default function Home() {
  const featuredArticles = realArticles.slice(0, 3);
  const recentArticles = realArticles.slice(3, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Academic Excellence
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Access thousands of research articles across multiple disciplines
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchWithSuggestions
              className="w-full pl-12 pr-4 py-4 text-lg rounded-lg border-0 text-gray-900 placeholder-white focus:ring-2 focus:ring-blue-300"
              iconClassName="text-white"
              showButton={true}
              buttonText="Search"
              onSearch={(query) => {
                window.location.href = `/browse?q=${encodeURIComponent(query)}`;
              }}
            />
          </div>
          <div className="mt-8 text-blue-100">
            <span className="text-sm">Popular searches: </span>
            <Link href="/browse?q=machine+learning" className="text-blue-200 hover:text-white mx-2">machine learning</Link>
            <Link href="/browse?q=quantum+computing" className="text-blue-200 hover:text-white mx-2">quantum computing</Link>
            <Link href="/browse?q=software+engineering" className="text-blue-200 hover:text-white mx-2">software engineering</Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">2.4M+</div>
              <div className="text-gray-600">Articles</div>
            </div>
            <Link href="/authors" className="block hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <div className="text-3xl font-bold text-blue-600">150K+</div>
              <div className="text-gray-600">Authors</div>
            </Link>
            <div>
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-gray-600">Institutions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">50+</div>
              <div className="text-gray-600">Disciplines</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <Star className="h-8 w-8 text-yellow-500 mr-3" />
              Featured Articles
            </h2>
            <Link href="/browse" className="text-blue-600 hover:text-blue-800 font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Articles */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <Clock className="h-8 w-8 text-green-500 mr-3" />
              Recent Publications
            </h2>
            <Link href="/recent" className="text-blue-600 hover:text-blue-800 font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
              Browse by Category
            </h2>
            <Link href="/categories" className="text-blue-600 hover:text-blue-800 font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(category => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {category.description}
                </p>
                <div className="text-sm text-blue-600">
                  {category.subcategories?.length} subcategories
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSignup />
        </div>
      </section>
    </div>
  );
}
