'use client';
import React, { useRef, ChangeEvent } from 'react';
import { X, Upload } from 'lucide-react';
import { GuideSection } from './types';
import { useCreateGuideContentMutation, useUpdateContentMutation } from '@/redux/services/api';

interface GuideModalProps {
  isOpen: boolean;
  editingGuideId: number | null;
  guideTitle: string;
  guideDescription: string;
  guideImageUrl: string;
  guideResetTime: string;
  guideSections: GuideSection[];
  onClose: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onImageUrlChange: (url: string) => void;
  onResetTimeChange: (time: string) => void;
  onSectionsChange: (sections: GuideSection[]) => void;
  onSubmit: () => void;
}

export default function GuideModal({
  isOpen,
  editingGuideId,
  guideTitle,
  guideDescription,
  guideImageUrl,
  guideResetTime,
  guideSections,
  onClose,
  onTitleChange,
  onDescriptionChange,
  onImageUrlChange,
  onResetTimeChange,
  onSectionsChange,
  onSubmit
}: GuideModalProps) {
  const [updateContent] = useUpdateContentMutation();
  const [createGuideContent] = useCreateGuideContentMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSectionChange = (index: number, field: 'title' | 'content', value: string) => {
    const newSections = [...guideSections];
    newSections[index] = { ...newSections[index], [field]: value };
    onSectionsChange(newSections);
  };

  const addNewSection = () => {
    // Fixed: Extract IDs safely, filtering out any undefined/null values
    const ids = guideSections.map(s => s.id).filter((id): id is number => id !== undefined);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const newId = maxId + 1;
    onSectionsChange([...guideSections, { id: newId, title: '', content: '' }]);
  };

  const removeSection = (index: number) => {
    if (guideSections.length > 1) {
      const newSections = guideSections.filter((_, i) => i !== index);
      onSectionsChange(newSections);
    }
  };

  // ── Image upload handler ──
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // You can add size/type validation here if needed
    if (file.size > 5 * 1024 * 1024) { // example: max 5MB
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onImageUrlChange(base64); // ← storing base64 in state
      // Alternative (recommended): upload to server → get real URL
      // uploadImage(file).then(url => onImageUrlChange(url));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!guideTitle.trim() || !guideDescription.trim() || !guideResetTime.trim()) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const formattedSections = guideSections
        .filter(section => section.title.trim() && section.content.trim())
        .map(section => ({
          title: section.title.trim(),
          content: section.content.trim()
        }));

      if (formattedSections.length === 0) {
        alert('Please add at least one section with title and content');
        return;
      }

      const requestData = {
        title: guideTitle.trim(),
        description: guideDescription.trim(),
        read_time: guideResetTime.trim(),
        sections: formattedSections,
        thumbnail_url: guideImageUrl.trim() || null
        // Note: if you're sending base64 → backend must handle it
        // Better → upload file separately & send only URL
      };

      console.log('Submitting guide data:', requestData);

      let response;
      if (editingGuideId) {
        response = await updateContent({ id: editingGuideId, data: requestData }).unwrap();
      } else {
        response = await createGuideContent(requestData).unwrap();
      }

      console.log('Success response:', response);
      onSubmit();

    } catch (error: any) {
      console.error('Error saving guide:', error);
      const errorMessage = error?.data?.message || error?.data?.detail || 'Failed to save guide.';
      alert(`Error: ${errorMessage}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-semibold mb-4">
          {editingGuideId ? 'Edit Guide' : 'Add New Guide'}
        </h3>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guide Title *</label>
            <input
              type="text"
              placeholder="Enter guide title"
              value={guideTitle}
              onChange={e => onTitleChange(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <input
              type="text"
              placeholder="Brief description of the guide"
              value={guideDescription}
              onChange={e => onDescriptionChange(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ── Replaced with image-upload style ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guide Thumbnail (Optional)
            </label>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${guideImageUrl ? 'border-blue-300 bg-blue-50/30' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
            >
              {guideImageUrl ? (
                <div className="space-y-3">
                  <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 rounded-lg overflow-hidden border shadow-sm">
                    <img
                      src={guideImageUrl}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/160?text=Error';
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">Click to change image</p>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onImageUrlChange('');
                    }}
                    className="text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <Upload className="mx-auto h-10 w-10 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Read Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Read Time *</label>
            <input
              type="text"
              placeholder="e.g., 5 min read"
              value={guideResetTime}
              onChange={e => onResetTimeChange(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sections */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guide Sections</label>
            {guideSections.map((section, index) => (
              <div key={section.id || index} className="mb-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Section {index + 1}</label>
                  {guideSections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder={`Section Title ${index + 1}`}
                  value={section.title}
                  onChange={e => handleSectionChange(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <textarea
                  rows={3}
                  placeholder={`Content for section ${index + 1}`}
                  value={section.content}
                  onChange={e => handleSectionChange(index, 'content', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addNewSection}
              className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              + Add Section
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!guideTitle.trim() || !guideDescription.trim() || !guideResetTime.trim()}
            className="px-5 py-2 bg-[#507493] text-white rounded-lg hover:bg-[#507493]/80 transition-colors disabled:bg-[#507493]/60 disabled:cursor-not-allowed"
          >
            {editingGuideId ? 'Update' : 'Publish Guide'}
          </button>
        </div>
      </div>
    </div>
  );
}