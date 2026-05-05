'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, User, MapPin, Phone, Mail, FileText, Image as ImageIcon, X, Eye, Loader2, Search } from 'lucide-react';
import Swal from 'sweetalert2';

import AttachmentModal from './AttachmentModal';
import { useGetCaseByIdQuery, useUpdateCaseStatusMutation, useUpdateCaseDetailsMutation, useGetProfileQuery, useGetUsersQuery, useAssignMemberMutation } from '@/redux/services/api';

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
  event_details?: string;
  actions_taken?: string;
  evidence: Evidence[];
  reporter: Reporter;
  members?: any[];
}

export default function CaseDetails() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;
  
  const { data: caseData, isLoading, error, refetch } = useGetCaseByIdQuery(caseId);  
  const [updateCaseDetails] = useUpdateCaseDetailsMutation();
  const [updateCaseStatus] = useUpdateCaseStatusMutation();
  const { data: profileData } = useGetProfileQuery();
  const { data: usersData } = useGetUsersQuery({ page: 1, page_size: 100 });
  const [assignMember] = useAssignMemberMutation();
  
  const [eventDetails, setEventDetails] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [caseDescription, setCaseDescription] = useState('');
  const [caseLocation, setCaseLocation] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchUser, setSearchUser] = useState('');

  useEffect(() => {
    if (caseData) {
      setEventDetails((caseData as any).event_details || '');
      setActionsTaken((caseData as any).actions_taken || '');
      setCaseDescription(caseData.description || '');
      setCaseLocation(caseData.location || '');
    }
  }, [caseData]);

  const userRole = profileData?.role?.toLowerCase() || '';
  const canAddMember = ['admin', 'director', 'analyst'].includes(userRole);
  const canCloseCase = ['admin', 'director', 'analyst'].includes(userRole);
  
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

  const handleUpdateDetails = async () => {
    setIsUpdating(true);
    try {
      await updateCaseDetails({
        caseId,
        event_details: eventDetails,
        actions_taken: actionsTaken,
        description: caseDescription,
        address: caseLocation,
      }).unwrap();
      Swal.fire({
        title: 'Updated!',
        text: 'Case details have been updated.',
        icon: 'success',
        confirmButtonColor: '#507493',
        timer: 1500,
      });
      setIsEditing(false);
      refetch();
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to update details.',
        icon: 'error',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangeStatus = async (newStatus: string) => {
    const result = await Swal.fire({
      title: `Change status to ${newStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#507493',
    });

    if (result.isConfirmed) {
      setIsUpdating(true);
      try {
        const updateData: any = { caseId, status: newStatus };
        if (['active', 'dispatched'].includes(newStatus.toLowerCase()) && profileData) {
          updateData.approved_by = profileData.full_name;
        }
        
        await updateCaseDetails(updateData).unwrap();
        Swal.fire('Success', `Status changed to ${newStatus}`, 'success');
        refetch();
      } catch (err) {
        Swal.fire('Error', 'Failed to change status', 'error');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleAssignMember = async (userId: number) => {
    try {
      await assignMember({ caseId, userId }).unwrap();
      Swal.fire('Success', 'Member assigned successfully', 'success');
      refetch();
      setIsAssigning(false);
      setSearchUser('');
    } catch (err) {
      Swal.fire('Error', 'Failed to assign member', 'error');
    }
  };

  const filteredUsers = usersData?.users.filter(user => 
    (user.name.toLowerCase().includes(searchUser.toLowerCase()) || 
     user.email.toLowerCase().includes(searchUser.toLowerCase())) &&
    !caseData?.members?.some((m: any) => m.user_id === user.id)
  ) || [];

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
                        <p className="font-semibold">{caseData.approved_by || 'Pending Approval'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#507493]" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        {isEditing ? (
                          <input 
                            type="text"
                            value={caseLocation}
                            onChange={(e) => setCaseLocation(e.target.value)}
                            className="font-semibold bg-white border-b border-blue-300 focus:outline-none focus:border-blue-600 w-full"
                          />
                        ) : (
                          <p className="font-semibold">{caseData.location}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4">
                  {/* Current Status Badge */}
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">Current Case Status</p>
                    <span className={`px-8 py-3 text-xl font-black rounded-2xl shadow-sm border ${getStatusColor(caseData.status)}`}>
                      {caseData.status}
                    </span>
                  </div>
                  
                  {/* Action Buttons Section */}
                  {!isCaseClosed && (
                    <div className="bg-white/50 backdrop-blur-sm p-3 rounded-2xl border border-gray-100 flex flex-wrap items-center justify-end gap-2 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">Protocol Actions:</p>
                      <button
                        onClick={() => handleChangeStatus('Dispatched')}
                        disabled={isUpdating}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 text-sm font-bold rounded-xl transition shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50"
                      >
                        DISPATCH
                      </button>
                      <button
                        onClick={() => handleChangeStatus('Active')}
                        disabled={isUpdating}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-bold rounded-xl transition shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50"
                      >
                        ACTIVATE
                      </button>
                      <button
                        onClick={() => handleChangeStatus('Resolved')}
                        disabled={isUpdating}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-bold rounded-xl transition shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50"
                      >
                        RESOLVE
                      </button>
                      {canCloseCase && (
                        <button 
                          onClick={handleCloseCase}
                          disabled={isClosing || isUpdating}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-sm font-bold rounded-xl transition shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                          CLOSE
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left - Description & Attachments */}
              <div className="lg:col-span-2 space-y-10">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Intelligence Briefing</h2>
                    {!isEditing && !isCaseClosed && (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="text-sm font-bold text-[#507493] hover:text-[#406383] flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg transition"
                      >
                        <FileText className="w-4 h-4" />
                        EDIT BRIEFING
                      </button>
                    )}
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Initial Case Description</h3>
                      {isEditing ? (
                        <textarea
                          value={caseDescription}
                          onChange={(e) => setCaseDescription(e.target.value)}
                          rows={3}
                          className="w-full p-4 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none transition-all shadow-inner text-gray-700 italic"
                        />
                      ) : (
                        <div className="text-gray-700 text-lg leading-relaxed bg-gray-50/50 p-6 rounded-xl border border-dashed border-gray-200 italic">
                          "{caseData.description}"
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Detailed Event Intelligence</h3>
                        {isEditing ? (
                          <textarea
                            value={eventDetails}
                            onChange={(e) => setEventDetails(e.target.value)}
                            placeholder="Enter detailed intelligence gathered..."
                            rows={6}
                            className="w-full p-4 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none transition-all shadow-inner"
                          />
                        ) : (
                          <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-xl min-h-[120px] text-gray-700">
                            {caseData.event_details || <span className="text-gray-400 italic">No intelligence reported yet.</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Actions Taken & Protocols</h3>
                        {isEditing ? (
                          <textarea
                            value={actionsTaken}
                            onChange={(e) => setActionsTaken(e.target.value)}
                            placeholder="Document all actions and applied protocols..."
                            rows={6}
                            className="w-full p-4 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none transition-all shadow-inner"
                          />
                        ) : (
                          <div className="p-4 bg-green-50/30 border border-green-100 rounded-xl min-h-[120px] text-gray-700">
                            {caseData.actions_taken || <span className="text-gray-400 italic">No actions documented yet.</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEventDetails((caseData as any).event_details || '');
                            setActionsTaken((caseData as any).actions_taken || '');
                            setCaseDescription(caseData.description || '');
                            setCaseLocation(caseData.location || '');
                          }}
                          className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                          CANCEL
                        </button>
                        <button
                          onClick={handleUpdateDetails}
                          disabled={isUpdating}
                          className="bg-[#507493] text-white px-8 py-2.5 rounded-lg hover:bg-[#406383] transition flex items-center gap-2 font-bold text-sm shadow-md"
                        >
                          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                          COMMIT UPDATES
                        </button>
                      </div>
                    )}
                  </div>
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
                                    src={file.file_url.startsWith('http') ? file.file_url : `https://clubby-andy-irksomely.ngrok-free.dev${file.file_url}`}
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

                {/* Assigned Members Section */}
                <div className="bg-white border rounded-xl p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Assigned Members</h2>
                    {canAddMember && (
                      <button
                        onClick={() => setIsAssigning(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Assign Member
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {caseData.members && caseData.members.length > 0 ? (
                      caseData.members.map((member: any) => (
                        <div key={member.user_id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 bg-[#507493] text-white rounded-full flex items-center justify-center font-bold text-lg">
                            {member.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{member.full_name}</p>
                            <p className="text-sm text-gray-600">{member.email}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic col-span-2">No members assigned to this case yet.</p>
                    )}
                  </div>
                </div>
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

      {/* Assign Member Modal */}
      {isAssigning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Assign Member</h2>
              <button
                onClick={() => setIsAssigning(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search members by name or email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user: any) => (
                    <button
                      key={user.id}
                      onClick={() => handleAssignMember(user.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition text-left"
                    >
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No members found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}