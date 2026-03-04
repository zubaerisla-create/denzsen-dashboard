import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function CaseNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Case Not Found</h1>
        <p className="text-gray-600 mb-6">
          The case you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/dashboard/case-list"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Case List
        </Link>
      </div>
    </div>
  );
}