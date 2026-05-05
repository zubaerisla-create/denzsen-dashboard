// COPPortal.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { GuideItem, GuideSection, Tab, VideoItem, ContentItem } from '@/app/dashboard/cop-portal/types';
import VideoTab from '@/app/dashboard/cop-portal/videoTab';
import GuideTab from '@/app/dashboard/cop-portal/GuideTab';
import GuideModal from '@/app/dashboard/cop-portal/GuideModal';
import VideoModal from '@/app/dashboard/cop-portal/VideoModal';
import { useCreateGuideContentMutation, useCreateVideoContentMutation, useDeleteContentMutation, useGetContentQuery, useUpdateContentMutation } from '@/redux/services/api';

export default function COPPortal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('video');

  // RTK Query hooks
  const { data: contentData, refetch: refetchContent, isLoading } = useGetContentQuery({});
  const [createVideoContent] = useCreateVideoContentMutation();
  const [createGuideContent] = useCreateGuideContentMutation();
  const [updateContent] = useUpdateContentMutation();
  const [deleteContent] = useDeleteContentMutation();

  // Transform API data to local state format
  const videos: VideoItem[] = React.useMemo(() => {
    if (!contentData) return [];
    return contentData
      .filter(item => item.type === 'Video')
      .map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        duration: item.duration || '--:--',
        video_url: item.media_url || '#',
        fileName: item.title.replace(/\s+/g, '-').toLowerCase() + '.mp4',
        fileSize: 'N/A', // You might need to get this from the API
      }));
  }, [contentData]);

  const guides: GuideItem[] = React.useMemo(() => {
    if (!contentData) return [];
    return contentData
      .filter(item => item.type === 'Guide')
      .map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        sections: item.sections.map((section, index) => ({
          id: index + 1,
          title: section.title,
          content: section.content,
        })),
        image_url: item.thumbnail_url || undefined,
        resetTime: item.read_time || 'N/A',
      }));
  }, [contentData]);

  // Video Modal States
  const [videoTitle, setVideoTitle] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDescription, setVideoDescription] = useState('');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<number | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // Guide Modal States
  const [guideTitle, setGuideTitle] = useState('');
  const [guideDescription, setGuideDescription] = useState('');
  const [guideImageUrl, setGuideImageUrl] = useState<string>('');
  const [guideResetTime, setGuideResetTime] = useState('30 month');
  const [guideSections, setGuideSections] = useState<GuideSection[]>([
    { id: 1, title: '', content: '' },
    { id: 2, title: '', content: '' }
  ]);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [editingGuideId, setEditingGuideId] = useState<number | null>(null);

  useEffect(() => {
    const storedTab = localStorage.getItem('cop-portal-active-tab');
    if (storedTab === 'guide' || storedTab === 'video') {
      setActiveTab(storedTab as Tab);
    }
  }, []);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    localStorage.setItem('cop-portal-active-tab', tab);
  };

  const handleAddOrEditVideo = async () => {
    try {
      if (!videoTitle.trim() || !videoDescription.trim()) {
        Swal.fire('Error', 'Please fill in all required fields.', 'error');
        return;
      }

      const videoData = {
        title: videoTitle.trim(),
        description: videoDescription.trim(),
        media_url: videoPreview || 'https://www.w3schools.com/html/mov_bbb.mp4', // Default or from upload
        thumbnail_url: 'https://placehold.co/600x400/png', // You can generate this or use a placeholder
        duration: '10:15', // You might want to calculate this from the video file
      };

      if (editingVideoId !== null) {
        // Edit existing video
        await updateContent({
          id: editingVideoId,
          data: videoData,
        }).unwrap();
        
        Swal.fire('Success', 'Video updated successfully!', 'success');
      } else {
        // Add new video
        await createVideoContent(videoData).unwrap();
        Swal.fire('Success', 'Video created successfully!', 'success');
      }

      // Reset form
      setVideoTitle('');
      setVideoFile(null);
      setVideoDescription('');
      setVideoPreview(null);
      setEditingVideoId(null);
      setIsVideoModalOpen(false);
      
      // Refetch content
      refetchContent();
    } catch (error) {
      console.error('Error saving video:', error);
      Swal.fire('Error', 'Failed to save video. Please try again.', 'error');
    }
  };

  const handleAddOrEditGuide = async () => {
    try {
      if (!guideTitle.trim() || !guideDescription.trim() || !guideResetTime.trim()) {
        Swal.fire('Error', 'Please fill in all required fields.', 'error');
        return;
      }

      const hasValidSections = guideSections.some(section => 
        section.title.trim() !== '' || section.content.trim() !== ''
      );

      if (!hasValidSections) {
        Swal.fire('Error', 'Please add at least one section with title and content.', 'error');
        return;
      }

      const guideData = {
        title: guideTitle.trim(),
        description: guideDescription.trim(),
        read_time: guideResetTime.trim(),
        sections: guideSections
          .filter(s => s.title.trim() !== '' || s.content.trim() !== '')
          .map(s => ({
            title: s.title.trim(),
            content: s.content.trim(),
          })),
        thumbnail_url: guideImageUrl.trim() || undefined,
      };

      if (editingGuideId !== null) {
        // Edit existing guide
        await updateContent({
          id: editingGuideId,
          data: guideData,
        }).unwrap();
        
        Swal.fire('Success', 'Guide updated successfully!', 'success');
      } else {
        // Add new guide
        await createGuideContent(guideData).unwrap();
        Swal.fire('Success', 'Guide created successfully!', 'success');
      }

      // Reset form
      setGuideTitle('');
      setGuideDescription('');
      setGuideImageUrl('');
      setGuideResetTime('30 month');
      setGuideSections([
        { id: 1, title: '', content: '' },
        { id: 2, title: '', content: '' }
      ]);
      setEditingGuideId(null);
      setIsGuideModalOpen(false);
      
      // Refetch content
      refetchContent();
    } catch (error) {
      console.error('Error saving guide:', error);
      Swal.fire('Error', 'Failed to save guide. Please try again.', 'error');
    }
  };

  const handleDeleteVideo = async (id: number, title: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the video "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deleteContent(id).unwrap();
        Swal.fire('Deleted!', 'The video has been deleted.', 'success');
        refetchContent();
      } catch (error) {
        console.error('Error deleting video:', error);
        Swal.fire('Error', 'Failed to delete video. Please try again.', 'error');
      }
    }
  };

  const handleDeleteGuide = async (id: number, title: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the guide "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deleteContent(id).unwrap();
        Swal.fire('Deleted!', 'The guide has been deleted.', 'success');
        refetchContent();
      } catch (error) {
        console.error('Error deleting guide:', error);
        Swal.fire('Error', 'Failed to delete guide. Please try again.', 'error');
      }
    }
  };

  const handleEditVideo = (video: VideoItem) => {
    setVideoTitle(video.title);
    setVideoDescription(video.description);
    setEditingVideoId(video.id);
    setVideoPreview(video.video_url);
    setIsVideoModalOpen(true);
  };

  const handleEditGuide = (guide: GuideItem) => {
    setGuideTitle(guide.title);
    setGuideDescription(guide.description);
    setGuideImageUrl(guide.image_url || '');
    setGuideResetTime(guide.resetTime);
    setGuideSections(guide.sections.length > 0 ? guide.sections : [
      { id: 1, title: '', content: '' },
      { id: 2, title: '', content: '' }
    ]);
    setEditingGuideId(guide.id);
    setIsGuideModalOpen(true);
  };

const handleViewGuide = (id: number) => {
  // Dynamically navigate to the guide detail page
  router.push(`/dashboard/cop-portal/guides/${id}`);
};

  const handleVideoFileChange = (file: File | null, preview: string | null) => {
    setVideoFile(file);
    setVideoPreview(preview);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#507493] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-9xl mx-auto">
        {/* Header Tabs */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => handleTabChange('video')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'video'
                ? 'bg-[#507493] text-white'
                : 'bg-white border text-gray-600 hover:bg-gray-50'
                }`}
            >
              Manage Video
            </button>
            <button
              onClick={() => handleTabChange('guide')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'guide'
                ? 'bg-[#507493] text-white'
                : 'bg-white border text-gray-600 hover:bg-gray-50'
                }`}
            >
              Manage Guide
            </button>
          </div>

          <button
            onClick={() => {
              if (activeTab === 'video') {
                setIsVideoModalOpen(true);
                setEditingVideoId(null);
                setVideoTitle('');
                setVideoFile(null);
                setVideoDescription('');
                setVideoPreview(null);
              } else {
                setIsGuideModalOpen(true);
                setEditingGuideId(null);
                setGuideTitle('');
                setGuideDescription('');
                setGuideImageUrl('');
                setGuideResetTime('30 month');
                setGuideSections([
                  { id: 1, title: '', content: '' },
                  { id: 2, title: '', content: '' }
                ]);
              }
            }}
            className="px-6 py-3 bg-[#507493] text-white rounded-lg flex items-center gap-2 hover:bg-[#507493]/80 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'video' ? (
          <VideoTab
            videos={videos}
            onEditVideo={handleEditVideo}
            onDeleteVideo={handleDeleteVideo}
          />
        ) : (
       <GuideTab
  guides={guides}
  onViewGuide={handleViewGuide}  // Pass the function to GuideTab
  onEditGuide={handleEditGuide}
  onDeleteGuide={handleDeleteGuide}
/>
        )}
      </div>

      {/* Modals */}
      <VideoModal
        isOpen={isVideoModalOpen}
        editingVideoId={editingVideoId}
        videoTitle={videoTitle}
        videoDescription={videoDescription}
        videoFile={videoFile}
        videoPreview={videoPreview}
        onClose={() => setIsVideoModalOpen(false)}
        onTitleChange={setVideoTitle}
        onDescriptionChange={setVideoDescription}
        onFileChange={handleVideoFileChange}
        onSubmit={handleAddOrEditVideo}
      />

      <GuideModal
        isOpen={isGuideModalOpen}
        editingGuideId={editingGuideId}
        guideTitle={guideTitle}
        guideDescription={guideDescription}
        guideImageUrl={guideImageUrl}
        guideResetTime={guideResetTime}
        guideSections={guideSections}
        onClose={() => setIsGuideModalOpen(false)}
        onTitleChange={setGuideTitle}
        onDescriptionChange={setGuideDescription}
        onImageUrlChange={setGuideImageUrl}
        onResetTimeChange={setGuideResetTime}
        onSectionsChange={setGuideSections}
        onSubmit={handleAddOrEditGuide}
      />
    </div>
  );
}