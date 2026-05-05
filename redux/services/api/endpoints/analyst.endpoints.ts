import { EndpointBuilder } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import {
  AnalystsResponse,
  UpdateAnalystStatusResponse
} from '../types/analyst.types';

type ApiEndpointBuilder = EndpointBuilder<
  ReturnType<typeof fetchBaseQuery>,
  'Content' | 'Cases' | 'Users' | 'Analysts' | 'SupportTickets',
  'api'
>;

export const analystEndpoints = (builder: ApiEndpointBuilder) => ({
  getAnalysts: builder.query<AnalystsResponse, void>({
    query: () => ({
      url: '/api/v1/admin/analysts',
      method: 'GET'
    }),
    providesTags: ['Analysts'],
  }),

  updateAnalystStatus: builder.mutation<
    UpdateAnalystStatusResponse,
    { analystId: number; status: 'Active' | 'Inactive' }
  >({
    query: ({ analystId, status }: { analystId: number; status: 'Active' | 'Inactive' }) => ({
      url: `/api/v1/admin/users/${analystId}/status`,
      method: 'PATCH',
      body: { status },
    }),
    invalidatesTags: ['Analysts'],
  }),
});