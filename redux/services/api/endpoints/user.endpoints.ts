import { EndpointBuilder } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import {
  User,
  UsersResponse,
  AddUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest
} from '../types/user.types';

type ApiEndpointBuilder = EndpointBuilder<
  ReturnType<typeof fetchBaseQuery>,
  'Content' | 'Cases' | 'Users' | 'Analysts' | 'SupportTickets',
  'api'
>;

export const userEndpoints = (builder: ApiEndpointBuilder) => ({
  getUsers: builder.query<UsersResponse, { page?: number; page_size?: number; search?: string }>({
    query: (params: { page?: number; page_size?: number; search?: string }) => ({
      url: '/api/v1/admin/users',
      method: 'GET',
      params,
    }),
    providesTags: ['Users'],
  }),

  addUser: builder.mutation<User, AddUserRequest>({
    query: (body: AddUserRequest) => ({
      url: '/api/v1/admin/users',
      method: 'POST',
      body,
    }),
    invalidatesTags: ['Users'],
  }),

  updateUser: builder.mutation<User, { userId: number; data: UpdateUserRequest }>({
    query: ({ userId, data }: { userId: number; data: UpdateUserRequest }) => ({
      url: `/api/v1/admin/users/${userId}`,
      method: 'PATCH',
      body: data,
    }),
    invalidatesTags: ['Users'],
  }),

  deleteUser: builder.mutation<{ message: string }, number>({
    query: (userId: number) => ({
      url: `/api/v1/admin/users/${userId}`,
      method: 'DELETE',
    }),
    invalidatesTags: ['Users'],
  }),

  updateUserStatus: builder.mutation<
    { message: string; success?: boolean },
    { userId: number; action: UpdateUserStatusRequest }
  >({
    query: ({ userId, action }: { userId: number; action: UpdateUserStatusRequest }) => ({
      url: `/api/v1/admin/users/${userId}/status`,
      method: 'PATCH',
      body: action,
    }),
    invalidatesTags: ['Users'],
  }),
});