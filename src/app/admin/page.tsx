'use client';

import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import { Calendar, FileText, Users, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalEvents: number;
  totalArticles: number;
  totalAuthors: number;
  recentImports: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalArticles: 0,
    totalAuthors: 0,
    recentImports: 0
  });

  useEffect(() => {
    // In a real app, this would fetch from API
    // For now, using mock data
    setStats({
      totalEvents: 12,
      totalArticles: 847,
      totalAuthors: 523,
      recentImports: 3
    });
  }, []);

  const quickActions = [
    {
      title: 'Create Event',
      description: 'Add a new academic event',
      href: '/admin/events/new',
      icon: Calendar,
      color: 'bg-blue-600'
    },
    {
      title: 'Add Article',
      description: 'Manually add a new article',
      href: '/admin/articles/new',
      icon: FileText,
      color: 'bg-green-600'
    },
    {
      title: 'Import Articles',
      description: 'Bulk import from BibTeX',
      href: '/admin/import',
      icon: TrendingUp,
      color: 'bg-purple-600'
    },
    {
      title: 'Manage Authors',
      description: 'View and edit authors',
      href: '/admin/authors',
      icon: Users,
      color: 'bg-orange-600'
    }
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 gap-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Articles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalArticles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Authors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAuthors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Recent Imports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentImports}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${action.color}`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">
                    New article added: <span className="font-medium">&quot;Deep Learning Advances&quot;</span>
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">
                    New event created: <span className="font-medium">ICML 2025</span>
                  </p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">
                    BibTeX import completed: <span className="font-medium">25 articles imported</span>
                  </p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}