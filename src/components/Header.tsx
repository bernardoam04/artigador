'use client';

import { Menu, Book, User, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import SearchWithSuggestions from './SearchWithSuggestions';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Book className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Artigador.com</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <SearchWithSuggestions
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
              iconClassName="text-gray-400"
              onSearch={(query) => {
                window.location.href = `/browse?q=${encodeURIComponent(query)}`;
              }}
            />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/browse" className="text-gray-700 hover:text-blue-600 font-medium">
              Browse
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-blue-600 font-medium">
              Categories
            </Link>
            <Link href="/ranking" className="text-gray-700 hover:text-blue-600 font-medium">
              Rankings
            </Link>
            <Link href="/submit" className="text-gray-700 hover:text-blue-600 font-medium">
              Submit
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">
              About
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-gray-700 hover:text-blue-600 font-medium">
                <Settings className="h-5 w-5 inline mr-1" />
                Admin
              </Link>
            )}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600"
                >
                  <User className="h-5 w-5" />
                  <span>{user?.name}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                <User className="h-5 w-5" />
                <span>Login</span>
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <Link href="/browse" className="block px-2 py-2 text-gray-700 hover:text-blue-600">
                Browse
              </Link>
              <Link href="/categories" className="block px-2 py-2 text-gray-700 hover:text-blue-600">
                Categories
              </Link>
              <Link href="/ranking" className="block px-2 py-2 text-gray-700 hover:text-blue-600">
                Rankings
              </Link>
              <Link href="/submit" className="block px-2 py-2 text-gray-700 hover:text-blue-600">
                Submit
              </Link>
              <Link href="/about" className="block px-2 py-2 text-gray-700 hover:text-blue-600">
                About
              </Link>
              {isAdmin && (
                <Link href="/admin" className="block px-2 py-2 text-gray-700 hover:text-blue-600">
                  Admin
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  <Link href="/profile" className="block px-2 py-2 text-gray-700 hover:text-blue-600">
                    Profile ({user?.name})
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-2 py-2 text-gray-700 hover:text-blue-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="block px-2 py-2 text-gray-700 hover:text-blue-600">
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}