import { EndpointBuilder } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResetPasswordRequest,
  ResetPasswordResponse
} from '../types/auth.types';

type ApiEndpointBuilder = EndpointBuilder<
  ReturnType<typeof fetchBaseQuery>,
  'Content' | 'Cases' | 'Users' | 'Analysts' | 'SupportTickets',
  'api'
>;

export const authEndpoints = (builder: ApiEndpointBuilder) => ({
  adminLogin: builder.mutation<LoginResponse, LoginRequest>({
    query: (body: LoginRequest) => ({
      url: '/api/v1/admin/auth/login',
      method: 'POST',
      body,
    }),
  }),

  forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
    query: (body: ForgotPasswordRequest) => ({
      url: '/api/v1/admin/auth/forgot-password',
      method: 'POST',
      body,
    }),
  }),

  verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
    query: (body: VerifyOtpRequest) => ({
      url: '/api/v1/admin/auth/verify-otp',
      method: 'POST',
      body,
    }),
  }),

  resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
    query: (body: ResetPasswordRequest) => ({
      url: '/api/v1/admin/auth/reset-password',
      method: 'POST',
      body,
    }),
  }),
});