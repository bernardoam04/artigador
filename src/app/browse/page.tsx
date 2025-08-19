import { Suspense } from 'react';
import BrowseContent from './BrowseContent';

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <BrowseContent />
      </Suspense>
    </div>
  );
}