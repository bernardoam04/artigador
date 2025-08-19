'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info' | ''>('');

  // Handle URL parameters for status messages
  useEffect(() => {
    const status = searchParams.get('status');
    const error = searchParams.get('error');
    const emailParam = searchParams.get('email');

    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }

    if (status === 'success') {
      setMessage('You have been successfully unsubscribed from our newsletter.');
      setMessageType('success');
    } else if (status === 'not_found') {
      setMessage('This email was not found in our subscription list.');
      setMessageType('info');
    } else if (error) {
      switch (error) {
        case 'missing_email':
          setMessage('Email parameter is missing from the unsubscribe link.');
          setMessageType('error');
          break;
        case 'server_error':
          setMessage('Server error occurred. Please try again later.');
          setMessageType('error');
          break;
        default:
          setMessage('An error occurred. Please try again.');
          setMessageType('error');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch('/api/subscriptions/unsubscribe', {
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

  const getIcon = () => {
    switch (messageType) {
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-600" />;
      case 'info':
        return <AlertTriangle className="h-8 w-8 text-blue-600" />;
      default:
        return <Mail className="h-8 w-8 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {getIcon()}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Unsubscribe
          </h1>
          <p className="text-gray-600">
            We're sorry to see you go. Unsubscribe from our newsletter below.
          </p>
        </div>

        {/* Status Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : messageType === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {messageType === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : messageType === 'info' ? (
                <AlertTriangle className="h-5 w-5 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 mr-2" />
              )}
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Unsubscribe Form */}
        <div className="bg-white rounded-lg border p-8">
          {messageType === 'success' ? (
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                You have been removed from our mailing list. You will no longer receive newsletters from us.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                If you change your mind, you can always subscribe again from our homepage.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter the email address you want to unsubscribe from our newsletter.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                ) : (
                  'Unsubscribe'
                )}
              </button>
            </form>
          )}

          {/* Alternative Actions */}
          <div className="mt-8 pt-6 border-t">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                Instead of unsubscribing, you might want to:
              </p>
              <div className="space-y-1">
                <Link 
                  href="/subscribe" 
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  Update your subscription preferences
                </Link>
                <Link 
                  href="/contact" 
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  Contact us about email frequency
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mt-8 bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Why are you leaving?</h3>
          <p className="text-sm text-gray-600 mb-4">
            We'd love to hear your feedback to improve our newsletter:
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <div>• Too many emails</div>
            <div>• Content not relevant</div>
            <div>• No longer interested in academic content</div>
            <div>• Never signed up</div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Your feedback helps us serve our community better.
          </p>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}