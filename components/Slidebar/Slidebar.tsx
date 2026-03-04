'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Home, Users, Settings, FileText, BarChart3, LogOut, Mail } from 'lucide-react';
import Image from 'next/image';

const sidebarItems = [
  { name: 'Dashboard Overview', href: '/dashboard', icon: Home },
  { name: 'Case List', href: '/dashboard/case-list', icon: FileText },
  { name: 'User Management', href: '/dashboard/users', icon: Users },
  { name: 'Analytics Management', href: '/dashboard/analyst', icon: BarChart3 },
  { name: 'Contact Us', href: '/dashboard/contact', icon: Mail },
  { name: 'COP Portal', href: '/dashboard/cop-portal', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const Slidebar = ({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
}) => {
  const pathname = usePathname();

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300
      lg:translate-x-0 lg:static lg:inset-0
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="relative h-12 w-12">
            {/* Use absolute path or public folder */}
            <div className='bg-[#507493] h-12 rounded-[10px] ' > 
              <Image 
              src="/logo.png" 
              alt="logo" 
              fill
              className="object-contain"
              priority
              
            />
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-lg">COP</h2>
            <div className="text-sm text-gray-600">Admin Portal</div>
          </div>
        </div>
        
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-700 hover:text-black"
          aria-label="Close sidebar"
        >
          <X size={24} />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="mt-4 flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-6 py-3 text-black transition-colors
                  ${isActive 
                    ? 'bg-[#507493] text-white border-l-4 border-[#405c75]' 
                    : 'hover:bg-gray-100 hover:text-[#507493]'
                  }`}
              >
                <Icon size={20} className="mr-4" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}

          
        </div>

        {/* Logout Button */}
        <div className="border-t border-gray-200">
          <Link
            href="/login"
            className="flex items-center px-6 py-3 text-black hover:bg-gray-100 hover:text-[#507493] transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <LogOut size={20} className="mr-4" />
            <span className="text-sm font-medium">Logout</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Slidebar;