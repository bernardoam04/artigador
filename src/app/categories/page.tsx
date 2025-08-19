import Link from 'next/link';
import { ChevronRight, BookOpen } from 'lucide-react';
import { categories } from '@/data/categories';

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h1>
          <p className="text-gray-600">
            Explore our collection of academic articles organized by research disciplines and topics.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="space-y-8">
          {categories.map(category => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                      <p className="text-gray-600 mt-1">{category.description}</p>
                    </div>
                  </div>
                  <Link
                    href={`/category/${category.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>

              {/* Subcategories */}
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Subcategories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.subcategories.map(subcategory => (
                      <Link
                        key={subcategory.id}
                        href={`/category/${subcategory.id}`}
                        className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                      >
                        <h4 className="font-medium text-gray-900 mb-2">{subcategory.name}</h4>
                        <p className="text-sm text-gray-600">{subcategory.description}</p>
                        <div className="mt-2 text-sm text-blue-600 font-medium">
                          Browse articles →
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-12 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Collection Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">24,567</div>
              <div className="text-sm text-gray-600">Computer Science</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">18,432</div>
              <div className="text-sm text-gray-600">Mathematics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">15,623</div>
              <div className="text-sm text-gray-600">Physics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">12,890</div>
              <div className="text-sm text-gray-600">Biology</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}