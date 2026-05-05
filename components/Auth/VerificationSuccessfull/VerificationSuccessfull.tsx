// app/verify-success/page.tsx (or components/VerificationSuccess.tsx)
'use client';

import Link from 'next/link';

export default function VerificationSuccessfull() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Checkmark Icon */}
        <div className="flex justify-center mb-8">
          <svg
            width="120"
            height="120"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
          >
            <circle cx="50" cy="50" r="50" fill="#507493" />
            <path
              d="M30 50L43 63L70 37"
              stroke="white"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="50" r="48" stroke="#507493" strokeWidth="4" fill="none" />
          </svg>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Verification Successful!
          </h1>
          <p className="text-gray-600 leading-relaxed mb-8">
            Congratulations! Your email has been successfully verified. Your
            account is now active and ready to use.
          </p>

          {/* Button */}
          <Link
            href="/login"
            className="inline-block bg-[#507493] hover:bg-[#406080] text-white font-medium py-3 px-8 rounded-full transition duration-200 shadow-md hover:shadow-lg"
          >
            Continue to Login
          </Link>
        </div>
      </div>
    </div>
  );
}