'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAuthorsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/authors');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to authors page...</p>
      </div>
    </div>
  );
}