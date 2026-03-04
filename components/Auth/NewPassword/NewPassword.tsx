'use client';

import React, { useState, useEffect } from 'react';
import { useResetPasswordMutation } from '@/redux/services/api';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

const NewPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const router = useRouter();

  // Get stored data from localStorage
  const email = typeof window !== 'undefined' ? localStorage.getItem('reset_email') : '';
  const resetToken = typeof window !== 'undefined' ? localStorage.getItem('reset_token') : '';

  // Check if user has completed OTP verification
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!email || !resetToken) {
        setError('');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    }
  }, [email, resetToken, router]);

  const validatePassword = () => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return '';
  };

  const handleResetPassword = async () => {
    if (!email || !resetToken) {
      setError('Session expired. Please restart the process.');
      return;
    }

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setSuccess('');

    try {
      await resetPassword({ 
        email, 
        new_password: password, // Changed to match API field name
        confirm_password: confirmPassword, // Changed to match API field name
        reset_token: resetToken
      }).unwrap();
      
      setSuccess('Password changed successfully! Redirecting to login...');
      
      // Clean up localStorage
      localStorage.removeItem('reset_email');
      localStorage.removeItem('reset_token');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error: any) {
      console.error('Reset Password Error:', error);
      
      // Extract error message from API response
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error?.data?.detail) {
        // Handle Pydantic validation errors
        const details = error.data.detail;
        if (Array.isArray(details)) {
          errorMessage = details.map((err: any) => err.msg).join(', ');
        } else {
          errorMessage = details;
        }
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.error) {
        errorMessage = error.error;
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-10">
          <div className="bg-[#507493] text-white rounded-2xl p-6 shadow-md">
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        <div
          className="rounded-3xl shadow-2xl p-8"
          style={{ background: 'linear-gradient(to bottom, #507493, #FFFFFF)' }}
        >
          <h1 className="text-3xl font-bold text-center text-white mb-3">
            Enter New Password
          </h1>
          
          <p className="text-center text-gray-200 text-sm mb-8">
            Create a new password for your account
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-full text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-full text-center">
              {success}
            </div>
          )}

          {/* Password Field */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 ml-4">New Password</label>
            <div className="bg-white rounded-full shadow-inner flex items-center px-5 py-4">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="flex-1 outline-none text-gray-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {password && password.length < 6 && (
              <p className="text-red-500 text-sm mt-1 ml-4">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="mb-8">
            <label className="block text-gray-700 mb-2 ml-4">Confirm Password</label>
            <div className="bg-white rounded-full shadow-inner flex items-center px-5 py-4">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                className="flex-1 outline-none text-gray-700"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="ml-2 text-gray-500 hover:text-gray-700"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-sm mt-1 ml-4">
                Passwords do not match
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleResetPassword}
              disabled={isLoading}
              className="bg-[#507493] text-white font-semibold py-3 px-12 rounded-full shadow-lg hover:bg-[#406080] transition-colors disabled:opacity-50 w-full max-w-xs"
            >
              {isLoading ? 'Updating...' : 'Confirm Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPassword;