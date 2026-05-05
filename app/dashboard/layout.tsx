'use client';

import { useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import Slidebar from '@/components/Slidebar/Slidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const sidebarItems = [
  { name: 'Dashboard Overview', href: '/dashboard' },
  { name: 'Cases', href: '/dashboard/case-list' },
  { name: 'User Management', href: '/dashboard/users' },
  { name: 'Analyst Management', href: '/dashboard/analyst' },
  { name: 'Contact Us', href: '/dashboard/contact' },
  { name: 'CPIN Portal', href: '/dashboard/cop-portal' },
  { name: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Find active sidebar item
  const activeItem = sidebarItems.find(item => pathname === item.href);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu size={28} />
          </button>

          {/* Dynamic Header Title */}
       <div className='pl-2'>
           <h1 className="text-2xl font-bold text-gray-800">
            {activeItem ? activeItem.name : ''}
          </h1>
          <p className='text-[#707070] text-[12px]' >
            Welcome back, Admin
          </p>
       </div>


<div className='flex gap-4'>
  


          {/* <Link href="/dashboard/settings">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold">
            U
          </div>
          </Link> */}
</div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
