'use client';

import { useState } from 'react';
import { Mail, Send, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface NewsletterSignupProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export default function NewsletterSignup({ 
  variant = 'full', 
  className = '' 
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setMessageType('success');
        setEmail('');
      } else {
        setMessage(data.error || 'An error occurred');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <div className="flex items-center mb-4">
          <Mail className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Stay Updated</h3>
        </div>
        
        {message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center">
              {messageType === 'success' ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {message}
            </div>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-4">
          Get the latest research articles delivered to your inbox.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="your.email@example.com"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Subscribe
              </>
            )}
          </button>
        </form>
        
        <p className="text-xs text-gray-500 mt-2">
          <Link href="/subscribe" className="hover:text-blue-600">
            Manage preferences
          </Link> • No spam, unsubscribe anytime
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white ${className}`}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-6 w-6" />
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Never Miss the Latest Research</h2>
        <p className="text-blue-100 mb-6 text-lg">
          Join thousands of researchers and academics who receive our curated newsletter with the latest articles, events, and insights.
        </p>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
              : 'bg-red-500/20 text-red-100 border border-red-400/30'
          }`}>
            <div className="flex items-center justify-center">
              {messageType === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 mr-2" />
              )}
              {message}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white/20 border-0"
              placeholder="Enter your email address"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center disabled:opacity-50 min-w-[120px]"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Subscribe
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-blue-200">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            Weekly digest
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            No spam
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            Unsubscribe anytime
          </div>
        </div>

        <p className="mt-4 text-xs text-blue-200">
          Want more options? Visit our{' '}
          <Link href="/subscribe" className="underline hover:text-white">
            subscription page
          </Link>{' '}
          to customize your preferences.
        </p>
      </div>
    </div>
  );
}