'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useVerifyOtpMutation, useForgotPasswordMutation } from '@/redux/services/api';

export default function VerifyOtp() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();
  const email = typeof window !== 'undefined' ? localStorage.getItem('reset_email') || '' : '';

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [forgotPassword, { isLoading: isResending }] = useForgotPasswordMutation();

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, []);

  // Timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // VERIFY OTP
  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }

    if (!email) {
      setError('Email not found. Please restart the process.');
      return;
    }

    try {
      const response = await verifyOtp({ email, otp: otpCode }).unwrap();
      
      // Store the reset_token from API response
      if (response.reset_token) {
        localStorage.setItem('reset_token', response.reset_token);
      }
      
      router.push('/new-password');
    } catch (error: any) {
      console.error('OTP Verification Error:', error);
      
      // Extract error message
      let errorMessage = 'Invalid OTP. Please try again.';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (error?.status) {
        errorMessage = `Error ${error.status}: Failed to verify OTP`;
      }
      
      setError(errorMessage);
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0]?.focus();
      }
    }
  };

  // RESEND OTP
  const handleResend = async () => {
    if (!canResend) return;
    
    if (!email) {
      setError('Email not found. Please restart the process.');
      return;
    }

    try {
      await forgotPassword({ email }).unwrap();
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setError('');
      if (inputRefs.current[0]) {
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error('Resend failed', error);
      
      // Extract error message
      let errorMessage = 'Failed to resend OTP. Please try again.';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.error) {
        errorMessage = error.error;
      }
      
      setError(errorMessage);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div
          className="rounded-3xl shadow-2xl p-8"
          style={{ background: 'linear-gradient(to bottom, #507493, #FFFFFF)' }}
        >
          <h1 className="text-3xl font-bold text-center text-white mb-3">
            Check Your Email
          </h1>

          <p className="text-center font-semibold text-gray-100 mb-2">{email}</p>
          <p className="text-center text-gray-200 text-sm mb-8">
            We've sent a 6-digit verification code to your email
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-full text-center">
              {error}
            </div>
          )}

          {/* OTP boxes */}
          <div className="flex justify-center gap-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-[#507493] focus:outline-none focus:ring-2 focus:ring-[#507493]/30 transition-all"
                maxLength={1}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            ))}
          </div>

          {/* Timer/Resend */}
          <div className="text-center mb-8">
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-[#507493] font-medium hover:text-[#406080] disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend code'}
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-600">
                  Resend in <b>{formatTimer(timer)}</b>
                </p>
                <p className="text-gray-500 text-sm">
                  Didn't receive the code? Check your spam folder
                </p>
              </div>
            )}
          </div>

          {/* Verify button */}
          <div className="flex justify-center">
            <button
              onClick={handleVerifyOtp}
              disabled={isVerifying}
              className="bg-[#507493] text-white font-semibold py-3 px-12 rounded-full shadow-lg hover:bg-[#406080] transition-colors disabled:opacity-50 w-full max-w-xs"
            >
              {isVerifying ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}