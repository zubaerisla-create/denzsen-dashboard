import { EndpointBuilder } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { Dispatch, CreateDispatchRequest } from '../types/dispatch.types';

type ApiEndpointBuilder = EndpointBuilder<
  ReturnType<typeof fetchBaseQuery>,
  'Content' | 'Cases' | 'Users' | 'Analysts' | 'SupportTickets',
  'api'
>;

export const dispatchEndpoints = (builder: ApiEndpointBuilder) => ({
  createDispatch: builder.mutation<Dispatch, CreateDispatchRequest>({
    query: (body) => ({
      url: '/api/v1/admin/dispatches',
      method: 'POST',
      body,
    }),
    invalidatesTags: ['Cases'], // Dispatch creation might affect case list
  }),
});
