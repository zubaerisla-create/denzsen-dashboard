// AnalystManagement.tsx - Fixed component
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Ban, X, Loader2, User as UserIcon, Lock, Unlock, UserCheck, UserX, Users } from 'lucide-react';
import Swal from 'sweetalert2';
import { useGetAnalystsQuery } from '@/redux/services/api';
import Image from 'next/image';

interface Analyst {
  id: number;
  cop_id: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
  cases_reported: number;
  role: string;

}

interface User {
  id: number;
  name: string;
  status: 'Active' | 'Inactive';
}

export default function AnalystManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Fetch analysts data
  const { 
    data: analystsData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useGetAnalystsQuery();

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    organization: string;
    role: string;
    status: 'Active' | 'Inactive';
  }>({
    name: '',
    email: '',
    phone: '',
    organization: '',
    role: 'analyst',
    status: 'Active',
  });

  // Update local state when API data changes
  useEffect(() => {
    if (analystsData?.users) {
      setAnalysts(analystsData.users);
    }
  }, [analystsData]);

  // Calculate stats
  const totalAnalysts = analysts.length;
  const activeAnalysts = analysts.filter(a => a.status === 'Active').length;
  const inactiveAnalysts = totalAnalysts - activeAnalysts;

  const filteredAnalysts = analysts.filter(analyst =>
    analyst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analyst.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analyst.cop_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAnalysts = [...filteredAnalysts].sort((a: any, b: any) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual API call when endpoint is available
      // await createAnalyst(formData).unwrap();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo - create new analyst locally
      const newAnalyst: Analyst = {
        id: Math.max(...analysts.map(a => a.id)) + 1,
        cop_id: `CPIN${String(analysts.length + 1).padStart(4, '0')}`,
        name: formData.name,
        email: formData.email,
        status: formData.status,
        cases_reported: 0,
        role: 'Analyst',

      };

      setAnalysts(prev => [...prev, newAnalyst]);
      setIsModalOpen(false);
      
      Swal.fire({
        title: 'Success!',
        text: 'User has been added successfully.',
        icon: 'success',
        confirmButtonColor: '#507493',
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        organization: '',
        role: 'analyst',
        status: 'Active',
      });

      // Refetch data
      refetch();
      
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add analyst. Please try again.',
        icon: 'error',
        confirmButtonColor: '#507493',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuspendToggle = async (analyst: Analyst) => {
    const action = analyst.status === 'Active' ? 'suspend' : 'activate';
  
    Swal.fire({
      title: `${action === 'suspend' ? 'Suspend' : 'Activate'} Analyst`,
      text: `Are you sure you want to ${action} ${analyst.name || 'this analyst'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#507493',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('access_token');

          const response = await fetch(
            `https://clubby-andy-irksomely.ngrok-free.dev/admin/users/${analyst.id}/status`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: action,
              }),
            }
          );

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to update status');
          }

          // Update UI status based on action
          setAnalysts((prev) =>
            prev.map((a) =>
              a.id === analyst.id
                ? { ...a, status: action === 'suspend' ? 'Inactive' : 'Active' }
                : a
            )
          );

          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text:
              action === 'suspend'
                ? `${analyst.name} has been suspended`
                : `${analyst.name} has been activated`,
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (error: any) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Something went wrong',
          });
        }
      }
    });
  };

  const handleDeleteAnalyst = async (analystId: number, analystName: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${analystName}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        // TODO: Call API to delete analyst when endpoint is available
        // await deleteAnalyst(analystId).unwrap();
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update local state
        setAnalysts(prev => prev.filter(analyst => analyst.id !== analystId));
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Analyst has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#507493',
        });
        
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete analyst. Please try again.',
          icon: 'error',
          confirmButtonColor: '#507493',
        });
      }
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading analysts...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-md">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Failed to load analysts</h3>
          <p className="text-gray-600 mb-4">
            {error ? 'Network error occurred' : 'Please check your connection and try again.'}
          </p>
          <button 
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen p-2">
        <div className="max-w-9xl mx-auto">
          {/* Summary Cards */}
        {/* Analyst Metrics Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
  {/* Total Analyst Card */}
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-100 to-white shadow-lg p-4 md:p-6 border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-600 text-sm md:text-base flex items-center gap-2">
          <Users className="w-4 h-4 md:w-5 md:h-5" />
          Total Analyst
        </p>
        <p className="text-2xl md:text-3xl font-bold mt-2">{totalAnalysts.toLocaleString()}</p>
        <div className="flex items-center mt-1">
          <span className="text-blue-600 text-xs md:text-sm">
            All registered analysts
          </span>
        </div>
      </div>
      <div className="p-3 bg-blue-50 rounded-full">
        <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
      </div>
    </div>
  </div>

  {/* Active Analyst Card */}
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-100 to-white shadow-lg p-4 md:p-6 border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-600 text-sm md:text-base flex items-center gap-2">
          <UserCheck className="w-4 h-4 md:w-5 md:h-5" />
          Active Analyst
        </p>
        <p className="text-2xl md:text-3xl font-bold mt-2">{activeAnalysts.toLocaleString()}</p>
        <div className="flex items-center mt-1">
          <span className="text-green-600 text-xs md:text-sm">
            Currently available
          </span>
        </div>
      </div>
      <div className="p-3 bg-green-50 rounded-full">
        <UserCheck className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
      </div>
    </div>
  </div>

  {/* Inactive Analyst Card */}
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-100 to-white shadow-lg p-4 md:p-6 border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-600 text-sm md:text-base flex items-center gap-2">
          <UserX className="w-4 h-4 md:w-5 md:h-5" />
          Inactive Analyst
        </p>
        <p className="text-2xl md:text-3xl font-bold mt-2">{inactiveAnalysts.toLocaleString()}</p>
        <div className="flex items-center mt-1">
          <span className="text-gray-600 text-xs md:text-sm">
            Not currently working
          </span>
        </div>
      </div>
      <div className="p-3 bg-gray-50 rounded-full">
        <UserX className="w-6 h-6 md:w-8 md:h-8 text-gray-500" />
      </div>
    </div>
  </div>
</div>

          {/* Search and Add Button */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#507493] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#507493]/80 transition-colors whitespace-nowrap"
            >
              <span className="text-xl">+</span>
              Add User
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('cop_id')}>CPIN ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('email')}>Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('cases_reported')}>Cases</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('role')}>Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedAnalysts.map((analyst) => (
                    <tr key={analyst.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {analyst.cop_id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                      
                          <span className="text-sm font-medium text-gray-900">{analyst.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {analyst.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          analyst.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {analyst.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {analyst.cases_reported}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          analyst.role.toLowerCase() === 'admin' ? 'bg-purple-100 text-purple-800' :
                          analyst.role.toLowerCase() === 'analyst' ? 'bg-blue-100 text-blue-800' :
                          analyst.role.toLowerCase() === 'moderator' ? 'bg-indigo-100 text-indigo-800' :
                          analyst.role.toLowerCase() === 'director' ? 'bg-orange-100 text-orange-800' :
                          analyst.role.toLowerCase() === 'leo' ? 'bg-teal-100 text-teal-800' :
                          analyst.role.toLowerCase() === 'pi' ? 'bg-pink-100 text-pink-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {analyst.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleSuspendToggle(analyst)}
                            className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
                            title={analyst.status === 'Active' ? 'Suspend Analyst' : 'Activate Analyst'}
                          >
                            {analyst.status === 'Active' ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Unlock className="w-4 h-4" />
                            )}
                            <span className="text-xs">
                              {analyst.status === 'Active' ? 'Suspend' : 'Activate'}
                            </span>
                          </button>
                          <button 
                            onClick={() => handleDeleteAnalyst(analyst.id, analyst.name)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete Analyst"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAnalysts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        {searchTerm ? 'No analysts found matching your search' : 'No analysts available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Analyst Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
              <button
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jane Smith"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jane.smith@email.com"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization (Optional)</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Organization"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="analyst">Analyst</option>
                  <option value="director">Director</option>
                  <option value="leo">LEO</option>
                  <option value="pi">PI</option>
                  <option value="member">Member</option>
                </select>
              </div>

         

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}