import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import CategoryManagement from '../components/admin/CategoryManagement';

interface AdminCategoriesPageProps {
  className?: string;
}

export default function AdminCategoriesPage({ className = '' }: AdminCategoriesPageProps) {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kasuwa-primary-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access category management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <CategoryManagement />
    </div>
  );
}