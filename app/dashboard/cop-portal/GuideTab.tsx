// GuideTab.tsx
'use client';
import React from 'react';
import { FileText, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { GuideItem } from './types';

interface GuideTabProps {
  guides: GuideItem[];
  onViewGuide: (id: number) => void;
  onEditGuide: (guide: GuideItem) => void;
  onDeleteGuide: (id: number, title: string) => void;
}

export default function GuideTab({ guides, onViewGuide, onEditGuide, onDeleteGuide }: GuideTabProps) {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-gray-700" />
        <h2 className="text-2xl font-semibold">Guides</h2>
      </div>

      {guides.length === 0 ? (
        <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
          <p className="text-gray-500 text-lg">No guides added yet.</p>
          <p className="text-gray-400 mt-2">Click "Add New" to create your first guide.</p>
        </div>   
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <div key={guide.id} className="bg-white rounded-lg border shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
              {guide.image_url && (
                <div className="mb-4">
                  <img
                    src={guide.image_url}
                    alt={guide.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{guide.title}</h3>
              <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
                {guide.description}
              </p>
              <div className="text-sm text-gray-500 mb-2">
                Reset Time: {guide.resetTime}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                Sections: {guide.sections.length}
              </div>
              <div className="border-t pt-4 mt-auto flex justify-between items-center">
                <button
                  onClick={() => onViewGuide(guide.id)}
                  className="flex gap-2 items-center text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <div>View</div>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => onEditGuide(guide)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Edit guide"
                  >
                    <Pencil className="w-5 h-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => onDeleteGuide(guide.id, guide.title)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Delete guide"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}