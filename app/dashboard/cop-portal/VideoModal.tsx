'use client';
import React from 'react';
import { X, Upload } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  editingVideoId: number | null;
  videoTitle: string;
  videoDescription: string;
  videoFile: File | null;
  videoPreview: string | null;
  onClose: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onFileChange: (file: File | null, preview: string | null) => void;
  onSubmit: () => void;
}

export default function VideoModal({
  isOpen,
  editingVideoId,
  videoTitle,
  videoDescription,
  videoFile,
  videoPreview,
  onClose,
  onTitleChange,
  onDescriptionChange,
  onFileChange,
  onSubmit
}: VideoModalProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onFileChange(file, previewUrl);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-semibold mb-4">{editingVideoId ? 'Edit Video' : 'Add New Video'}</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              placeholder="Enter video title"
              value={videoTitle}
              onChange={e => onTitleChange(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Video *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                id="video-upload"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 mb-1">
                  {videoFile ? videoFile.name : 'Click to upload video file'}
                </span>
                <span className="text-xs text-gray-500">MP4, AVI, MOV, etc. (Max 100MB)</span>
              </label>
            </div>
            {videoPreview && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Preview:</p>
                <video
                  className="w-full max-h-48 object-contain rounded-lg border"
                  controls
                >
                  <source src={videoPreview} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              rows={4}
              placeholder="Write description..."
              value={videoDescription}
              onChange={e => onDescriptionChange(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-5 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!videoTitle.trim() || !videoDescription.trim() || (!videoFile && !editingVideoId)}
            className="px-5 py-2 bg-[#507493] text-white rounded-lg hover:bg-[#507493]/80 transition-colors disabled:bg-[#507493]/60 disabled:cursor-not-allowed"
          >
            {editingVideoId ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}