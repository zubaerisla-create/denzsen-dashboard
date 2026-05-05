'use client';
import React from 'react';
import { Play, Pencil, Trash2 } from 'lucide-react';
import { VideoItem } from './types';

interface VideoTabProps {
  videos: VideoItem[];
  onEditVideo: (video: VideoItem) => void;
  onDeleteVideo: (id: number, title: string) => void;
}

export default function VideoTab({ videos, onEditVideo, onDeleteVideo }: VideoTabProps) {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Play className="w-6 h-6 text-gray-700" />
        <h2 className="text-2xl font-semibold">Videos</h2>
      </div>

      {videos.length === 0 ? (
        <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
          <p className="text-gray-500 text-lg">No videos added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {videos.map(video => (
            <div key={video.id} className="bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative aspect-video">
                {video.video_url ? (
                  <video
                    className="w-full h-full object-cover"
                    controls
                  >
                    <source src={video.video_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Play className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{video.description}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">File: {video.fileName}</span>
                  <span className="text-xs text-gray-500">{video.fileSize}</span>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => onEditVideo(video)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Edit video"
                  >
                    <Pencil className="w-5 h-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => onDeleteVideo(video.id, video.title)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Delete video"
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