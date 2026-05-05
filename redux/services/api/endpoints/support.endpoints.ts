import { EndpointBuilder } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import {
  SupportTicketsResponse
} from '../types/support.types';

type ApiEndpointBuilder = EndpointBuilder<
  ReturnType<typeof fetchBaseQuery>,
  'Content' | 'Cases' | 'Users' | 'Analysts' | 'SupportTickets',
  'api'
>;

export const supportEndpoints = (builder: ApiEndpointBuilder) => ({
  getSupportTickets: builder.query<
    SupportTicketsResponse,
    { page?: number; page_size?: number }
  >({
    query: ({ page = 1, page_size = 10 }: { page?: number; page_size?: number }) => ({
      url: '/api/v1/admin/support/tickets',
      method: 'GET',
      params: { page, page_size },
    }),
    providesTags: ['SupportTickets'],
  }),
});