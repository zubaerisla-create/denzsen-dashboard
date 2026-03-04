"use client"

// app/notifications/page.tsx

import { Bell, ShieldAlert, UserPlus, MessageSquare, FileText, AlertCircle, Users, Briefcase  } from 'lucide-react';
import { useState } from 'react';

type NotificationType = 'contact' | 'dispatch' | 'security' | 'registration' | 'content' | 'case' | 'message';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  isUnread?: boolean;
  tab: 'all' | 'cases' | 'security' | 'message';
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'contact',
    title: 'Contact Message',
    description: 'New Inquiry: You have received 8 new messages in the "Contact Us" section today. Last message received from John Doe.',
    time: '2 mins ago',
    isUnread: true,
    tab: 'message',
  },
  {
    id: '2',
    type: 'dispatch',
    title: 'Active Dispatch Update',
    description: 'Dispatch Update: Unit 12 (Jane Smith) is now active at Downtown Plaza for surveillance.',
    time: '2 mins ago',
    tab: 'cases',
  },
  {
    id: '3',
    type: 'security',
    title: 'Security Alert',
    description: 'Warning: A new login was detected from an unrecognized IP address. Review your Email notification settings.',
    time: '23 mins ago',
    isUnread: true,
    tab: 'security',
  },
  {
    id: '4',
    type: 'registration',
    title: 'User Registration',
    description: 'New user Emily Davis has registered and is pending approval.',
    time: '2 mins ago',
    tab: 'message',
  },
  {
    id: '5',
    type: 'content',
    title: 'Content Management',
    description: 'Portal Update: A new guide "How to Write a Comprehensive Case Report" has been published successfully.',
    time: 'Yesterday',
    tab: 'all',
  },
  // New Cases Data
  {
    id: '6',
    type: 'case',
    title: 'New Case Assigned',
    description: 'Case #C-2023-0456 has been assigned to you. Client: ABC Corporation. Priority: High.',
    time: '1 hour ago',
    isUnread: true,
    tab: 'cases',
  },
  {
    id: '7',
    type: 'case',
    title: 'Case Status Update',
    description: 'Case #C-2023-0321 status changed from "Investigation" to "Resolved".',
    time: '3 hours ago',
    tab: 'cases',
  },
  {
    id: '8',
    type: 'case',
    title: 'Case Evidence Uploaded',
    description: 'New evidence files (5 documents) have been uploaded to Case #C-2023-0289.',
    time: 'Yesterday',
    tab: 'cases',
  },
  // New Security Data
  {
    id: '9',
    type: 'security',
    title: 'System Audit Complete',
    description: 'Monthly security audit completed. All systems are secure. No vulnerabilities found.',
    time: '5 hours ago',
    tab: 'security',
  },
  {
    id: '10',
    type: 'security',
    title: 'Access Permission Changed',
    description: 'User permissions for Sarah Johnson have been updated. Now has admin access.',
    time: '1 day ago',
    tab: 'security',
  },
  {
    id: '11',
    type: 'security',
    title: 'Failed Login Attempts',
    description: 'Multiple failed login attempts detected from IP: 192.168.1.100. Account locked for 30 minutes.',
    time: '2 days ago',
    isUnread: true,
    tab: 'security',
  },
  // New Message Data
  {
    id: '12',
    type: 'message',
    title: 'New Direct Message',
    description: 'You have received a new direct message from Robert Chen regarding case collaboration.',
    time: '30 mins ago',
    isUnread: true,
    tab: 'message',
  },
  {
    id: '13',
    type: 'message',
    title: 'Team Group Message',
    description: 'New message in "Investigation Team Alpha" group: Meeting scheduled for tomorrow at 2 PM.',
    time: '4 hours ago',
    tab: 'message',
  },
  {
    id: '14',
    type: 'message',
    title: 'System Broadcast',
    description: 'System maintenance scheduled for this Saturday from 2 AM to 4 AM. Service may be interrupted.',
    time: '1 day ago',
    tab: 'message',
  },
];

type TabType = 'all' | 'cases' | 'security' | 'message';

export default function Notification() {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const filteredNotifications = notifications.filter(notification => 
    activeTab === 'all' ? true : notification.tab === activeTab
  );

  const unreadCount = {
    all: notifications.filter(n => n.isUnread).length,
    cases: notifications.filter(n => n.tab === 'cases' && n.isUnread).length,
    security: notifications.filter(n => n.tab === 'security' && n.isUnread).length,
    message: notifications.filter(n => n.tab === 'message' && n.isUnread).length,
  };

  const tabs = [
    { id: 'all', label: 'All', unread: unreadCount.all },
    { id: 'cases', label: 'Cases', unread: unreadCount.cases },
    { id: 'security', label: 'Security', unread: unreadCount.security },
    { id: 'message', label: 'Message', unread: unreadCount.message },
  ] as const;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'contact':
        return <MessageSquare className="h-6 w-6 text-blue-600" />;
      case 'dispatch':
        return <AlertCircle className="h-6 w-6 text-amber-600" />;
      case 'security':
        return <ShieldAlert className="h-6 w-6 text-red-600" />;
      case 'registration':
        return <UserPlus className="h-6 w-6 text-green-600" />;
      case 'content':
        return <FileText className="h-6 w-6 text-purple-600" />;
      case 'case':
        return <Briefcase className="h-6 w-6 text-indigo-600" />;
      case 'message':
        return <MessageSquare className="h-6 w-6 text-cyan-600" />;
      default:
        return <AlertCircle className="h-6 w-6 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-9xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <span className="text-sm text-gray-500">Admin</span>
          </div>

          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="bg-[#507493] text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {unreadCount.all} unread
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-[#507493] text-[#507493]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
                {tab.unread > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id 
                      ? 'bg-[#507493] text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.unread} unread
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Notification List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`
                  bg-white rounded-lg border shadow-sm p-5 hover:shadow-md transition-shadow
                  ${notification.isUnread ? 'bg-red-50/40' : ''}
                `}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-base font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-500 whitespace-nowrap">
                        {notification.time}
                      </p>
                    </div>

                    <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
                      {notification.description}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg border shadow-sm p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <Bell className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-500">
                  There are no notifications in the "{tabs.find(t => t.id === activeTab)?.label}" category.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}