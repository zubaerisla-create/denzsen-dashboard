'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { useForgotPasswordMutation } from '@/redux/services/api';
import { useRouter } from 'next/navigation';

export default function VerifyEmail() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    try {
      await forgotPassword({ email }).unwrap();
      localStorage.setItem('reset_email', email);
      router.push('/verify-otp');
    } catch (error: any) {
      console.error('Failed to send OTP', error);
      setError(error?.data?.message || 'Failed to send OTP. Please try again.');
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        <div
          className="rounded-3xl shadow-2xl p-8"
          style={{
            background: 'linear-gradient(to bottom, #507493, #FFFFFF)',
          }}
        >
          <h1 className="text-3xl font-bold text-center text-white mb-3">
            Verify Your Email
          </h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-full text-center">
              {error}
            </div>
          )}

          <div className="bg-white rounded-full shadow-inner flex items-center px-5 py-4 mb-6">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 outline-none text-gray-700"
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSendOtp}
              disabled={isLoading}
              className="bg-[#507493] text-white font-semibold py-3 px-12 rounded-full shadow-lg hover:bg-[#406080] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Remember your password?{' '}
            <Link href="/login" className="text-[#507493] font-medium hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}