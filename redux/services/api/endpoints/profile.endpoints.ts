// profile.endpoints.ts
import { EndpointBuilder } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { ChangePasswordRequest, ChangePasswordResponse, UpdateProfileRequest, UpdateProfileResponse, UserProfile } from '../types/profiles.types';
import { api } from '../../api';


type ApiEndpointBuilder = EndpointBuilder<
  ReturnType<typeof fetchBaseQuery>,
  'Content' | 'Cases' | 'Users' | 'Analysts' | 'SupportTickets',
  'api'
>;

export const profileEndpoints = (builder: ApiEndpointBuilder) => ({
  getProfile: builder.query<UserProfile, void>({
    query: () => ({
      url: '/api/v1/users/me',
      method: 'GET',
    }),
    providesTags: ['Users'],
  }),

  updateProfile: builder.mutation<UpdateProfileResponse, UpdateProfileRequest>({
    query: (body: UpdateProfileRequest) => ({
      url: '/api/v1/users/me',
      method: 'PATCH',
      body,
    }),
    invalidatesTags: ['Users'],
    // Refetch profile after update
    async onQueryStarted(_, { dispatch, queryFulfilled }) {
      try {
        await queryFulfilled;
        dispatch(api.util.invalidateTags(['Users']));
      } catch (error) {
        console.error('Failed to invalidate tags:', error);
      }
    },
  }),

  changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordRequest>({
    query: (body: ChangePasswordRequest) => ({
      url: '/api/v1/users/me/change-password',
      method: 'POST',
      body,
    }),
  }),
});