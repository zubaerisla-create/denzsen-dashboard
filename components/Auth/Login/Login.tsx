'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useAdminLoginMutation } from '@/redux/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import img from '../../../public/image.png';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');

  const [adminLogin, { isLoading }] = useAdminLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await adminLogin({ email, password }).unwrap();

      // Validate response
      if (!res.access_token || !res.refresh_token || !res.user) {
        throw new Error('Invalid response from server');
      }

      // Store tokens and user data
      localStorage.setItem('access_token', res.access_token);
      localStorage.setItem('refresh_token', res.refresh_token);
      localStorage.setItem('admin_user', JSON.stringify(res.user));

      // Role check
      if (res.user.role !== 'admin' && res.user.role !== 'analyst') {
        throw new Error('Unauthorized role');
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Admin login failed', err);
      setError(err?.data?.message || err?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 gap-10">
      
      {/* Image Section */}
      <div className="hidden md:block">
        <Image src={img} className='rounded-lg' alt="Login Image" width={400} height={400} />
      </div>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-[#507493] rounded-2xl p-5 mb-3">
            <Shield className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-gray-600">Sign in to access the dashboard</p>
        </div>

        <div className="bg-white shadow-xl rounded-3xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin email"
                required
                className="w-full pl-12 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="h-4 w-4" />
                <span>Remember me</span>
              </label>

              <Link href="/verify-email" className="text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
                {error}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#507493] text-white rounded-xl hover:bg-[#3a5a78] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Admin Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}