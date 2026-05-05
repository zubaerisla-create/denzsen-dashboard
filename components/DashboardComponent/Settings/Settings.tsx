'use client';

import { useChangePasswordMutation, useUpdateProfileMutation, useGetProfileQuery } from '@/redux/services/api';
import { Camera, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';

interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

interface ProfileFormData {
  full_name: string;
  email: string;
  phone: string;
  role: string;
  avatar_url: string;
}

export default function EditProfile() {
  // Fetch profile data
  const { data: profileData, isLoading: isProfileLoading, error: profileError, refetch } = useGetProfileQuery();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    email: '',
    phone: '',
    role: '',
    avatar_url: ''
  });

  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileImage, setProfileImage] = useState<string>('https://cuq.in/w4Ic');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState<ProfileFormData | null>(null);
  
  // Initialize the mutations
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword, isSuccess: passwordSuccess }] = useChangePasswordMutation();

  // Initialize form data when profile is loaded
  useEffect(() => {
    if (profileData && !isProfileLoading) {
      const newFormData = {
        full_name: profileData.full_name || 'Admin User',
        email: profileData.email || 'admin@safety.com',
        phone: profileData.phone || '+1 (555) 123-4567',
        role: profileData.role || 'System Administrator',
        avatar_url: profileData.avatar_url || 'https://cuq.in/w4Ic'
      };
      
      setFormData(newFormData);
      setProfileImage(profileData.avatar_url || 'https://cuq.in/w4Ic');
      
      // Set initial data for comparison
      if (!initialFormData) {
        setInitialFormData(newFormData);
      }
    }
  }, [profileData, isProfileLoading, initialFormData]);

  // Check for changes
  useEffect(() => {
    if (initialFormData) {
      const hasFormChanges = 
        formData.full_name !== initialFormData.full_name ||
        formData.phone !== initialFormData.phone ||
        formData.avatar_url !== initialFormData.avatar_url;
      
      const hasPasswordChanges = 
        passwordFormData.current_password !== '' ||
        passwordFormData.new_password !== '' ||
        passwordFormData.confirm_new_password !== '';
      
      setHasChanges(hasFormChanges || hasPasswordChanges);
    }
  }, [formData, passwordFormData, initialFormData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, create a local URL for preview
      const localUrl = URL.createObjectURL(file);
      setProfileImage(localUrl);
      
      // Update the form data with the local URL
      setFormData(prev => ({
        ...prev,
        avatar_url: localUrl
      }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const showSuccessAlert = (title: string, message: string) => {
    Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      confirmButtonColor: '#507493',
      confirmButtonText: 'OK'
    });
  };

  const showErrorAlert = (title: string, message: string) => {
    Swal.fire({
      title: title,
      text: message,
      icon: 'error',
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'OK'
    });
  };

  const handleSave = async () => {
    try {
      // Prepare the data for the API
      const updateData: any = {};
      
      if (formData.full_name !== initialFormData?.full_name) {
        updateData.full_name = formData.full_name;
      }
      
      if (formData.phone !== initialFormData?.phone) {
        updateData.phone = formData.phone;
      }
      
      if (formData.avatar_url !== initialFormData?.avatar_url && formData.avatar_url.startsWith('blob:')) {
        // Note: In production, you need to upload the image to a server first
        // For now, we'll use the local URL but you should implement proper image upload
        updateData.avatar_url = formData.avatar_url;
      }

      // Only call API if there are changes
      if (Object.keys(updateData).length > 0) {
        const result = await updateProfile(updateData).unwrap();
        
        // Show success alert
        showSuccessAlert('Success!', 'Profile updated successfully!');
        
        // Refetch profile data
        refetch();
        
        // Update initial form data to current state
        setInitialFormData({
          full_name: result.full_name,
          email: result.email,
          phone: result.phone,
          role: result.role,
          avatar_url: result.avatar_url
        });
      } else {
        showSuccessAlert('No Changes', 'No changes were made to your profile.');
      }
      
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error?.data?.detail?.[0]?.msg || error?.data?.message || 'Failed to update profile';
      showErrorAlert('Error!', errorMessage);
    }
  };

  const handleCancel = () => {
    // Reset to initial values
    if (initialFormData) {
      setFormData(initialFormData);
      setProfileImage(initialFormData.avatar_url);
    }
    
    // Clear password fields
    setPasswordFormData({
      current_password: '',
      new_password: '',
      confirm_new_password: ''
    });
    
    // Reset password visibility
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePasswordSave = async () => {
    try {
      // Validate passwords match
      if (passwordFormData.new_password !== passwordFormData.confirm_new_password) {
        showErrorAlert('Error!', 'New password and confirmation do not match');
        return;
      }

      // Validate password strength (optional)
      if (passwordFormData.new_password.length < 8) {
        showErrorAlert('Error!', 'Password must be at least 8 characters long');
        return;
      }

      // Call the password change API
      const result = await changePassword(passwordFormData).unwrap();
      
      // Show success alert
      showSuccessAlert('Success!', 'Password changed successfully!');
      
      // Clear password fields
      setPasswordFormData({
        current_password: '',
        new_password: '',
        confirm_new_password: ''
      });
      
      // Reset password visibility
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      
    } catch (error: any) {
      console.error('Failed to change password:', error);
      const errorMessage = error?.data?.detail?.[0]?.msg || error?.data?.message || 'Failed to change password';
      showErrorAlert('Error!', errorMessage);
    }
  };

  // Show password success alert when mu  action to tation succeeds
  useEffect(() => {
    if (passwordSuccess) {
      showSuccessAlert('Success!', 'Password changed successfully!');
    }
  }, [passwordSuccess]);

  const isLoading = isProfileLoading || isUpdatingProfile || isChangingPassword;

  if (isProfileLoading && !profileData) {
    return (
      <div className="max-w-9xl mx-auto bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#507493] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="max-w-9xl mx-auto bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load profile. Please try again.</p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 px-4 py-2 bg-[#507493] text-white rounded-md hover:bg-[#3b5f73]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-9xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center">
        <Link href="/dashboard/settings">
          <button className="mr-6 text-gray-700 cursor-pointer hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </Link>
        <h1 className="text-xl font-semibold text-gray-800">Edit Profile</h1>
        <div className="flex-1" />
        <div className="relative group cursor-pointer" onClick={triggerFileInput}>
          <img
            src={profileImage}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 group-hover:opacity-80 transition-opacity"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image';
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white w-6 h-6" />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Settings */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Full Name Field - Directly Editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors cursor-text disabled:bg-gray-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              />
            </div>

            {/* Email Address Field (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                <p className="text-gray-700">{formData.email}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone Number Field - Directly Editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors cursor-text disabled:bg-gray-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              />
            </div>

            {/* Role Field (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <div className="w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                <p className="text-gray-700 capitalize">{formData.role}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Settings - Password Change */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Security Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Current Password with Eye Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <input 
                  type={showCurrentPassword ? "text" : "password"} 
                  name="current_password"
                  value={passwordFormData.current_password}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors cursor-text disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter current password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                  disabled={isLoading}
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            {/* New Password with Eye Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  name="new_password"
                  value={passwordFormData.new_password}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors cursor-text disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                  disabled={isLoading}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>
            
            {/* Confirm New Password with Eye Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirm_new_password"
                  value={passwordFormData.confirm_new_password}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors cursor-text disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Re-enter new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Change Button */}
          <div className="flex justify-end">
            <button
              onClick={handlePasswordSave}
              disabled={isLoading || (!passwordFormData.current_password && !passwordFormData.new_password)}
              className={`px-6 py-3 text-white rounded-md cursor-pointer ${
                isLoading || (!passwordFormData.current_password && !passwordFormData.new_password)
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#507493] hover:bg-[#3b5f73] transition-colors'
              }`}
            >
              {isChangingPassword ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            onClick={handleCancel}
            className={`px-6 py-3 text-gray-700 border border-gray-300 rounded-md transition-colors ${
              !hasChanges || isLoading
                ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                : 'hover:bg-gray-100 cursor-pointer'
            }`}
            disabled={!hasChanges || isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            className={`px-6 py-3 text-white rounded-md cursor-pointer transition-colors ${
              !hasChanges || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#507493] hover:bg-[#3b5f73]'
            }`}
          >
            {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}