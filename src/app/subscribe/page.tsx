'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react';
import Link from 'next/link';

export default function SubscribePage() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    interests: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const availableInterests = [
    'Computer Science',
    'Artificial Intelligence',
    'Machine Learning',
    'Software Engineering',
    'Data Science',
    'Cybersecurity',
    'Networks',
    'Databases',
    'Human-Computer Interaction',
    'Distributed Systems',
    'Algorithms',
    'Programming Languages'
  ];

  // Handle URL parameters for status messages
  useEffect(() => {
    const confirmed = searchParams.get('confirmed');
    const error = searchParams.get('error');

    if (confirmed === 'true') {
      setMessage('🎉 Your subscription has been confirmed! Welcome to Artigador.');
      setMessageType('success');
    } else if (error) {
      switch (error) {
        case 'missing_token':
          setMessage('Missing confirmation token. Please check your email link.');
          setMessageType('error');
          break;
        case 'invalid_token':
          setMessage('Invalid or expired confirmation token. Please subscribe again.');
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

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

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
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setMessageType('success');
        setFormData({ email: '', name: '', interests: [] });
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Stay Updated with Artigador
          </h1>
          <p className="text-gray-600 text-lg">
            Get the latest research articles, academic events, and platform updates delivered to your inbox.
          </p>
        </div>

        {/* Status Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {messageType === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 mr-2" />
              )}
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Subscription Form */}
        <div className="bg-white rounded-lg border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (Optional)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your Name"
              />
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Research Interests (Optional)
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Select topics you're interested in to receive more relevant content.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableInterests.map((interest) => (
                  <label key={interest} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes(interest)}
                      onChange={() => handleInterestToggle(interest)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Subscribe to Newsletter
                </>
              )}
            </button>

            {/* Privacy Notice */}
            <div className="text-xs text-gray-500 text-center">
              <p>
                By subscribing, you agree to receive periodic emails from Artigador. 
                You can unsubscribe at any time. We respect your privacy and will never share your email.
              </p>
            </div>
          </form>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 bg-white rounded-lg border p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">What you'll receive:</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600">📚</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Latest Articles</h4>
                <p className="text-sm text-gray-600">Get notified about new research publications and papers in your areas of interest.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600">🎯</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Conference Updates</h4>
                <p className="text-sm text-gray-600">Stay informed about upcoming academic conferences and events.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600">👥</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Featured Authors</h4>
                <p className="text-sm text-gray-600">Discover prominent researchers and their latest contributions to academia.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600">🔍</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Platform Updates</h4>
                <p className="text-sm text-gray-600">Be the first to know about new features and improvements to Artigador.</p>
              </div>
            </div>
          </div>
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