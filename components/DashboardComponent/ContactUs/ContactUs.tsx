'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Mail, Send, MessageSquare, Calendar, Clock, X } from 'lucide-react';
import { useGetSupportTicketsQuery } from '@/redux/services/api';
import { formatDate } from '@/utils/formatDate';

interface SupportTicket {
  id: number;
  subject: string;
  message_preview: string;
  created_at: string;
  status: string;
  user: {
    full_name: string;
    email: string;
    avatar_url: string | null;
    cop_id: string;
  };
}

interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export default function ContactUs() {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState<EmailData>({
    to: '',
    subject: '',
    body: ''
  });
  
  // Fetch tickets from API
  const { data, isLoading } = useGetSupportTicketsQuery({ page: 1, page_size: 10 });
  
  const tickets = data?.tickets ?? [];
  
  // Calculate total and today's messages
  const totalMessages = tickets.length;
  
  const todayMessages = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return tickets.filter(ticket => ticket.created_at.startsWith(today)).length;
  }, [tickets]);
  
  // Set default selected ticket when data loads
  useEffect(() => {
    if (tickets.length > 0 && !selectedTicket) {
      setSelectedTicket(tickets[0]);
    }
  }, [tickets, selectedTicket]);
  
  // Helper function to get avatar letters from name
  const getAvatarLetters = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Helper function to format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = formatDate(dateString);
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return { date: formattedDate, time: formattedTime };
  };
  
  // Open email modal with pre-filled data
  const handleSendEmail = (ticket: SupportTicket) => {
    setEmailData({
      to: ticket.user.email,
      subject: `Re: ${ticket.subject}`,
      body: `Dear ${ticket.user.full_name},\n\nThank you for contacting us regarding "${ticket.subject}".\n\n`
    });
    setShowEmailModal(true);
  };
  
  // Send email function
  const sendEmail = () => {
    // Here you can integrate with your email service or API
    const mailtoLink = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    window.location.href = mailtoLink;
    
    // Alternatively, you can send via an API endpoint:
    // fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(emailData)
    // })
    
    setShowEmailModal(false);
  };
  
  if (isLoading) {
    return <div className="p-10 text-center">Loading messages... ⏳</div>;
  }
  
  return (
    <div className="min-h-screen p-2">
      <div className="max-w-9xl mx-auto space-y-6">
        {/* Stats Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="w-8 h-8 cursor-pointer text-[#507493]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-3xl font-bold text-gray-900">{totalMessages}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-8 cursor-pointer h-8 text-[#507493]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-3xl font-bold text-gray-900">{todayMessages}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Messages List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Contact Messages
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {tickets.length} messages received
                </span>
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {tickets.map((ticket) => {
                const { date, time } = formatDateTime(ticket.created_at);
                const avatarLetters = getAvatarLetters(ticket.user.full_name);
                
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-6 cursor-pointer transition ${
                      selectedTicket?.id === ticket.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-medium text-gray-700">
                          {avatarLetters}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {ticket.user.full_name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{date}</span>
                            <span>{time}</span>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900">{ticket.subject}</p>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {ticket.message_preview}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Message Details Panel */}
          <div className="bg-white rounded-lg shadow-sm flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Message Details</h2>
            </div>

            {selectedTicket ? (
              <div className="flex-1 flex flex-col">
                <div className="p-6 flex-1">
                  {/* User Information */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-medium text-gray-700">
                          {getAvatarLetters(selectedTicket.user.full_name)}
                        </span>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedTicket.user.full_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          CPIN ID: {selectedTicket.user.cop_id}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail className="w-5 h-5" />
                      <span>{selectedTicket.user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Calendar className="w-5 h-5" />
                      <span>Received</span>
                      <span className="text-gray-900">
                        {formatDateTime(selectedTicket.created_at).date} at{' '}
                        {formatDateTime(selectedTicket.created_at).time}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {selectedTicket.subject}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedTicket.message_preview}
                    </p>
                  </div>
                </div>

                {/* Reply Section */}
                <div className="border-t p-6 mt-auto">
                  <button
                    onClick={() => handleSendEmail(selectedTicket)}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#507493] text-white rounded-lg hover:bg-[#507493]/80 transition"
                  >
                    <Send className="w-5 h-5" />
                    Send Email
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Send Email</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <input
                  type="email"
                  value={emailData.to}
                  onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#507493] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#507493] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={emailData.body}
                  onChange={(e) => setEmailData({...emailData, body: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#507493] focus:border-transparent resize-none"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition"
              >
                Cancel
              </button>
              <button
                onClick={sendEmail}
                className="flex items-center gap-2 px-6 py-2 bg-[#507493] text-white rounded-lg hover:bg-[#507493]/80 transition"
              >
                <Send className="w-4 h-4" />
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}