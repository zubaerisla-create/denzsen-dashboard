// /app/dashboard/cop-portal/guides/[id]/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import { useGetContentByIdQuery } from '@/redux/services/api';

interface GuideSection {
  title: string;
  content: string;
}

export default function GuideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const guideId = parseInt(params.id as string);

  const { data: content, isLoading, error } = useGetContentByIdQuery(guideId, {
    skip: isNaN(guideId),
  });

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load guide. Please try again.',
      }).then(() => {
        router.push('/dashboard/cop-portal');
      });
    }
  }, [error, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#507493] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading guide...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-9xl mx-auto">
          <button
            onClick={() => router.push('/dashboard/cop-portal')}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Guides
          </button>
          <div className="bg-white rounded-lg border shadow-sm p-8 text-center">
            <p className="text-gray-500 text-lg">Guide not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 pb-32">
      <div className="max-w-9xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/cop-portal')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Guides
        </button>

        {/* Guide Content */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Header */}
       <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-gray-700" />
                  <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
                </div>
                <p className="text-gray-600 mb-4">{content.description}</p>
              </div>
              
              {content.read_time && (
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Read Time: {content.read_time}</span>
                </div>
              )}
            </div>
          </div>


          {/* Image */}
          {content.thumbnail_url && (
            <div className="p-6">
              <img
                src={content.thumbnail_url}
                alt={content.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Sections */}
          <div className="p-6">
            <div className="space-y-2">
              {content.sections && content.sections.length > 0 ? (
                content.sections.map((section: GuideSection, index: number) => (
                  <div key={index} className=" py-2">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 text-black/50 rounded-full flex items-center justify-center font-bold text-lg">
                        {index + 1} .
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1 text-gray-800">
                          {section.title || `Step ${index + 1}`}
                        </h3>
                        <div className="text-[#707070] whitespace-pre-wrap">
                          {section.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No sections available for this guide.</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50">
            <div className="text-sm text-gray-500">
              Created on: {new Date(content.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}