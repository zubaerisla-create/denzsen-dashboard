'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, User, MapPin, Phone, Mail, FileText, Image as ImageIcon, X, Eye, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

import AttachmentModal from './AttachmentModal';
import { useGetCaseByIdQuery, useUpdateCaseStatusMutation } from '@/redux/services/api';

interface Evidence {
  filename: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
}

interface Reporter {
  name: string;
  phone?: string;
  email: string;
}

interface CaseData {
  id: number;
  case_number: string;
  description: string;
  date_reported: string;
  location: string;
  approved_by: string;
  status: string;
  evidence: Evidence[];
  reporter: Reporter;
}

export default function CaseDetails() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;
  
  const { data: caseData, isLoading, error, refetch } = useGetCaseByIdQuery(caseId);  
  const [updateCaseStatus] = useUpdateCaseStatusMutation();
  
  const [selectedAttachment, setSelectedAttachment] = useState<Evidence | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleViewAttachment = (attachment: Evidence) => {
    setSelectedAttachment(attachment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedAttachment(null), 300);
  };

  const handleCloseCase = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to close this case? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, close it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setIsClosing(true);
      
      try {
        await updateCaseStatus({
          caseId,
          status: 'Closed'
        }).unwrap();
        
        // Refetch case data to get updated status
        await refetch();
        
        await Swal.fire({
          title: 'Case Closed!',
          text: 'The case has been successfully closed.',
          icon: 'success',
          confirmButtonColor: '#507493',
          confirmButtonText: 'OK',
          timer: 2000,
          timerProgressBar: true,
        });
      } catch (error: any) {
        Swal.fire({
          title: 'Error!',
          text: error?.data?.detail || 'Failed to close case. Please try again.',
          icon: 'error',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'OK',
        });
      } finally {
        setIsClosing(false);
      }
    }
  };

  // Check if file is an image
  const isImageFile = (fileType: string) => {
    return fileType.includes('image') || 
           fileType.includes('jpg') || 
           fileType.includes('jpeg') || 
           fileType.includes('png') || 
           fileType.includes('gif') ||
           fileType.includes('webp');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#507493]" />
          <p className="text-gray-600">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Case Not Found</h1>
          <p className="text-gray-600 mb-6">The requested case could not be found.</p>
          <Link
            href="/dashboard/case-list"
            className="inline-flex items-center gap-2 text-[#507493]  font-medium"
          >
            <ChevronLeft className="w-5 h-5 text-[#507493]" />
            Back to Case List
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'dispatched':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isCaseClosed = caseData.status?.toLowerCase() === 'closed';

  return (
    <>
      <div className="min-h-screen ">
        <div className="px-6 pt-6">
          <Link
            href="/dashboard/case-list"
            className="inline-flex items-center gap-2 text-[#507493] hover:text-[#507493] font-medium mb-6 transition"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Case List
          </Link>
        </div>

        <div className="px-6 pb-12 max-w-9xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-8 border-b">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-6">{caseData.case_number}</h1>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-[#507493]" />
                      <div>
                        <p className="text-sm text-gray-600">Date Reported</p>
                        <p className="font-semibold">{caseData.date_reported}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-[#507493]" />
                      <div>
                        <p className="text-sm text-gray-600">Approved By</p>
                        <p className="font-semibold">{caseData.approved_by}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#507493]" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-semibold">{caseData.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <span className={`px-6 py-3 text-lg font-bold rounded-full ${getStatusColor(caseData.status)}`}>
                    {caseData.status}
                  </span>
                  {!isCaseClosed && (
                    <button 
                      onClick={handleCloseCase}
                      disabled={isClosing}
                      className={`flex items-center gap-3 px-6 py-3 rounded-lg transition ${
                        isClosing 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {isClosing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Closing...
                        </>
                      ) : (
                        <>
                          <X className="w-5 h-5" />
                          Close Case
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left - Description & Attachments */}
              <div className="lg:col-span-2 space-y-10">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Case Description</h2>
                  <p className="text-gray-700 text-lg leading-relaxed">{caseData.description}</p>
                </div>

                {caseData.evidence && caseData.evidence.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <FileText className="w-6 h-6 text-[#507493]" />
                      Evidence & Attachments
                    </h2>
                    <div className="space-y-4">
                      {caseData.evidence.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                          <div className="flex items-center gap-5">
                            {isImageFile(file.file_type) ? (
                              <div className="relative">
                                <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-300">
                                  <img
                                    src={`https://clubby-andy-irksomely.ngrok-free.dev${file.file_url}`}
                                    alt={file.filename}   
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                    }}
                                  />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-[#507493] text-white text-xs px-2 py-1 rounded">
                                  <ImageIcon className="w-3 h-3" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-20 h-20 bg-gray-200 border-2 border-dashed rounded-lg flex items-center justify-center">
                                <FileText className="w-10 h-10 text-gray-500" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-lg">{file.filename}</p>
                              <p className="text-sm text-gray-600">
                                Uploaded by {caseData.reporter.name} at {file.uploaded_at}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 capitalize">
                                {file.file_type} • {isImageFile(file.file_type) ? 'Image' : 'Document'}
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleViewAttachment(file)}
                            className="text-[#507493] hover:text-[#507493] font-semibold text-lg flex items-center gap-2 transition"
                          >
                            <Eye className="w-5 h-5" />
                            View →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right - Reporter Info */}
              <div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8">
                  <h2 className="text-2xl font-bold mb-6">Reporter Information</h2>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="text-xl font-bold">{caseData.reporter.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Contact Number
                      </p>
                      <p className="text-xl font-bold">{caseData.reporter.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Email
                      </p>
                      <p className="text-xl font-bold break-all">{caseData.reporter.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attachment Modal */}
      <AttachmentModal
        attachment={selectedAttachment}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        caseId={caseData.case_number}
      />
    </>
  );
}