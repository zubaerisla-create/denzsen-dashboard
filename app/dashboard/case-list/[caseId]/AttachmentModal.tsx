'use client';

import { FileText, Image as ImageIcon, XCircle, Download } from 'lucide-react';

interface Evidence {
  filename: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
}

interface AttachmentModalProps {
  attachment: Evidence | null;
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
}

export default function AttachmentModal({ 
  attachment, 
  isOpen, 
  onClose,
  caseId
}: AttachmentModalProps) {
  if (!isOpen || !attachment) return null;

  const handleDownload = () => {
    // Construct full URL for the file
    const fileUrl = `https://clubby-andy-irksomely.ngrok-free.dev${attachment.file_url}`;
    window.open(fileUrl, '_blank');
  };

  const getFileSize = () => {
    // Since API doesn't provide file size, we can estimate or display generic info
    return attachment.file_type === 'image' ? 'Approx. 2-5 MB' : 'Approx. 100-500 KB';
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-start md:items-center justify-center p-0 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-none md:rounded-xl w-full md:max-w-4xl max-h-screen md:max-h-[90vh] overflow-hidden min-h-screen md:min-h-0">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3 md:gap-4 max-w-[80%]">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {attachment.file_type === 'pdf' ? (
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              ) : (
                <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 truncate">{attachment.filename}</h3>
              <p className="text-sm md:text-base text-gray-600">{getFileSize()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 md:p-2 rounded-full hover:bg-gray-100 transition flex-shrink-0"
          >
            <XCircle className="w-6 h-6 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 md:p-6 overflow-auto max-h-[calc(100vh-180px)] md:max-h-[60vh]">
          {attachment.file_type === 'image' ? (
            <div className="space-y-4 md:space-y-6">
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={`https://clubby-andy-irksomely.ngrok-free.dev${attachment.file_url}`}
                  alt={attachment.filename}
                  className="w-full h-auto max-h-[300px] md:max-h-[400px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 bg-gray-50 rounded-lg">
                <div className="break-words">
                  <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">Case ID:</p>
                  <p className="font-semibold text-gray-800 text-sm md:text-base">{caseId}</p>
                </div>
                <div className="break-words">
                  <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">File Type:</p>
                  <p className="font-semibold text-gray-800 text-sm md:text-base capitalize">{attachment.file_type}</p>
                </div>
                <div className="break-words sm:col-span-2 md:col-span-1">
                  <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">Uploaded:</p>
                  <p className="font-semibold text-gray-800 text-sm md:text-base">{attachment.uploaded_at}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              <div className="bg-gray-100 rounded-lg p-6 md:p-12 flex flex-col items-center justify-center">
                <FileText className="w-16 h-16 md:w-20 md:h-20 text-gray-400 mb-3 md:mb-4" />
                <p className="text-sm md:text-base text-gray-600 text-center">PDF document preview not available</p>
                <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2 text-center">Click download to view the full document</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 bg-gray-50 rounded-lg">
                <div className="break-words">
                  <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">Case ID:</p>
                  <p className="font-semibold text-gray-800 text-sm md:text-base">{caseId}</p>
                </div>
                <div className="break-words">
                  <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">File Type:</p>
                  <p className="font-semibold text-gray-800 text-sm md:text-base capitalize">{attachment.file_type}</p>
                </div>
                <div className="break-words sm:col-span-2 md:col-span-1">
                  <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">Uploaded :</p>
                  <p className="font-semibold text-gray-800 text-sm md:text-base">{attachment.uploaded_at}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 md:p-6 border-t bg-gray-50 gap-3 sticky bottom-0 bg-white">
          <div className="text-xs md:text-sm text-gray-600 order-2 sm:order-1">
            <p className="text-center sm:text-left">Uploaded at {attachment.uploaded_at}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 order-1 sm:order-2 w-full sm:w-auto">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex-1 sm:flex-none text-sm md:text-base"
            >
              <Download className="w-4 h-4" />
              <span className="hidden xs:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex-1 sm:flex-none text-sm md:text-base"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}