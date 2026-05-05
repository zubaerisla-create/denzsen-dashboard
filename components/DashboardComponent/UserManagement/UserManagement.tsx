'use client';

import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Lock, Trash2, User as UserIcon, CheckCircle, X, Unlock, Edit2, Users, UserX } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAddUserMutation, useDeleteUserMutation, useGetUsersQuery, useUpdateUserMutation, useUpdateUserStatusMutation } from '@/redux/services/api';


interface User {
  id: number;
  cop_id: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
  cases_reported: number;
  phone: string;
  avatar_url: string | null;
  role: string;
  is_verified: boolean;
  created_at: string;
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // RTK Query hooks
  const { data: usersData, isLoading, refetch } = useGetUsersQuery({ 
    page: 1, 
    page_size: 100 
  });
  const [addUser] = useAddUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();

  // Form state for the add modal
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    status: 'Active' as 'Active' | 'Inactive',
    role: 'member',
    organization: '',
  });

  // Form state for the edit modal
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'admin',
    status: 'Active' as 'Active' | 'Inactive',
  });

  // Process users from API
  const users = usersData?.users || [];
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.trim().toLowerCase();
    const userName = (user.name || '').toLowerCase();
    const userEmail = (user.email || '').toLowerCase();
    const userCopId = (user.cop_id || '').toLowerCase();
    
    return (
      userName.includes(term) ||
      userEmail.includes(term) ||
      userCopId.includes(term)
    );
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...filteredUsers].sort((a: any, b: any) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Stats calculations
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const inactiveUsers = users.filter(u => u.status === 'Inactive').length;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addUser({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        role: formData.role,
        organization: formData.organization,
      }).unwrap();

      // Refresh users list
      await refetch();
      setIsAddModalOpen(false);

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'User Added!',
        text: `${formData.full_name} has been added successfully.`,
        timer: 2000,
        showConfirmButton: false
      });

      // Reset form
        setFormData({
        full_name: '',
        email: '',
        phone: '',
        status: 'Active',
        role: 'member',
        organization: '',
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.data?.message || error.message || 'Failed to add user',
      });
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      full_name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'admin',
      status: user.status || 'Active',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      await updateUser({
        userId: selectedUser.id,
        data: {
          full_name: editFormData.full_name,
          email: editFormData.email,
          phone: editFormData.phone,
          role: editFormData.role,
          status: editFormData.status,
        }
      }).unwrap();

      // Refresh users list
      await refetch();
      setIsEditModalOpen(false);
      setSelectedUser(null);

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'User information has been updated.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.data?.message || error.message || 'Failed to update user',
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setEditFormData({
      full_name: '',
      email: '',
      phone: '',
      role: 'admin',
      status: 'Active',
    });
  };

  const handleSuspendToggle = async (user: User) => {
    const action = user.status === 'Active' ? 'suspend' : 'activate';

    Swal.fire({
      title: `${action === 'suspend' ? 'Suspend' : 'Activate'} User`,
      text: `Are you sure you want to ${action} ${user.name || 'this user'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#507493',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await updateUserStatus({
            userId: user.id,
            action: { action }
          }).unwrap();

          // Refresh users list
          await refetch();

          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: action === 'suspend' 
              ? `${user.name} has been suspended`
              : `${user.name} has been activated`,
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (error: any) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.data?.message || error.message || 'Failed to update status',
          });
        }
      }
    });
  };

  const handleDelete = async (user: User) => {
    Swal.fire({
      title: 'Delete User',
      text: `Are you sure you want to delete ${user.name || 'this user'}? This action cannot be undone.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#507493',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteUser(user.id).unwrap();
          
          // Refresh users list
          await refetch();
          
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: `${user.name || 'User'} has been deleted.`,
            timer: 1500,
            showConfirmButton: false
          });
        } catch (error: any) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.data?.message || error.message || 'Failed to delete user',
          });
        }
      }
    });
  };

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-9xl mx-auto shadow-sm overflow-hidden">
        
        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4">
          {/* Total Users Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-100 to-white shadow-lg p-4 md:p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm md:text-base flex items-center gap-2">
                  <Users className="w-4 h-4 md:w-5 md:h-5" />
                  Total Users
                </p>
                <p className="text-2xl md:text-3xl font-bold mt-2">{totalUsers.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Active Users Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-100 to-white shadow-lg p-4 md:p-6 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm md:text-base flex items-center gap-2">
                  <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
                  Active Users
                </p>
                <p className="text-2xl md:text-3xl font-bold mt-2">{activeUsers.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <UserIcon className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Inactive Users Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-100 to-white shadow-lg p-4 md:p-6 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm md:text-base flex items-center gap-2">
                  <UserX className="w-4 h-4 md:w-5 md:h-5" />
                  Inactive Users
                </p>
                <p className="text-2xl md:text-3xl font-bold mt-2">{inactiveUsers.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-full">
                <UserX className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Add User */}
        <div className="pb-4 pl-4 pt-6 border-b flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input  
              type="text"
              placeholder="Search by name, email or ID..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 cursor-pointer px-5 py-2.5 bg-[#507493] text-white rounded-lg hover:bg-[#507493]/80 transition"
          >
            <UserPlus className="w-5 h-5" />
            Add User
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('cop_id')}>CPIN ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('email')}>Email</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('cases_reported')}>Cases Reported</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('phone')}>Phone Number</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('role')}>Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">{user.cop_id || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-dashed border-gray-400 flex items-center justify-center">
                          {user.avatar_url ? (
                            <img 
                              src={user.avatar_url} 
                              alt={user.name || 'User'}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <UserIcon className="w-6 h-6 text-gray-500" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{user.name || 'Unknown User'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{user.email || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          user.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {user.status || 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.cases_reported || 0}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{user.phone || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'analyst' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'moderator' ? 'bg-indigo-100 text-indigo-800' :
                        user.role === 'director' ? 'bg-orange-100 text-orange-800' :
                        user.role === 'leo' ? 'bg-teal-100 text-teal-800' :
                        user.role === 'pi' ? 'bg-pink-100 text-pink-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-6">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="flex gap-1 items-center text-blue-600 hover:text-blue-700 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 mt-1 h-4" />
                          <span className="text-xs">Edit</span>
                        </button>
                        <button 
                          onClick={() => handleSuspendToggle(user)}
                          className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
                          title={user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                        >
                          {user.status === 'Active' ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
                          <span className="text-xs">
                            {user.status === 'Active' ? 'Suspend' : 'Activate'}
                          </span>
                        </button>
                        <button 
                          onClick={() => handleDelete(user)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-xs">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Add User</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jane Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jane.smith@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="hidden">
                <input type="hidden" name="role" value="member" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization (Optional)</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Organization"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#507493] text-white rounded-lg cursor-pointer hover:bg-[#507493]/80 transition"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Edit User</h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={editFormData.full_name}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jane Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jane.smith@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={editFormData.role}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#507493] text-white rounded-lg cursor-pointer hover:bg-[#507493]/80 transition"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}