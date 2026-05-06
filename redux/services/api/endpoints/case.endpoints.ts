import { EndpointBuilder } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import {
  CasesResponse,
  CaseDetails,
  UpdateCaseStatusResponse
} from '../types/case.types';

type ApiEndpointBuilder = EndpointBuilder<
  ReturnType<typeof fetchBaseQuery>,
  'Content' | 'Cases' | 'Users' | 'Analysts' | 'SupportTickets',
  'api'
>;

export const caseEndpoints = (builder: ApiEndpointBuilder) => ({
  getCases: builder.query<CasesResponse, { page?: number; page_size?: number; search?: string; status?: string }>({
    query: (params: { page?: number; page_size?: number; search?: string; status?: string }) => ({
      url: '/api/v1/admin/cases',
      method: 'GET',
      params,
    }),
    providesTags: ['Cases'],
  }),

  getCaseById: builder.query<CaseDetails, string>({
    query: (caseId: string) => ({
      url: `/api/v1/admin/cases/${caseId}`,
      method: 'GET',
    }),
  }),

  updateCaseStatus: builder.mutation<UpdateCaseStatusResponse, { caseId: string; status: string }>({
    query: ({ caseId, status }: { caseId: string; status: string }) => ({
      url: `/api/v1/admin/cases/${caseId}/status`,
      method: 'PATCH',
      body: { status },
    }),
    invalidatesTags: ['Cases'],
  }),

  updateCaseDetails: builder.mutation<UpdateCaseStatusResponse, { 
    caseId: string; 
    event_details?: string; 
    actions_taken?: string;
    approved_by?: string;
    status?: string;
      description?: string;
      address?: string;
  }>({
    query: ({ caseId, ...data }) => ({
      url: `/api/v1/admin/cases/${caseId}/details`,
      method: 'PATCH',
      body: data,
    }),
    invalidatesTags: ['Cases'],
  }),

  assignMember: builder.mutation<{ message: string }, { caseId: string; userId: number }>({
    query: ({ caseId, userId }) => ({
      url: `/api/v1/admin/cases/${caseId}/members`,
      method: 'POST',
      params: { user_id: userId },
    }),
    invalidatesTags: ['Cases'],
  }),
});