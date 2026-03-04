import { EndpointBuilder } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import {
  ContentItem,
  CreateVideoRequest,
  CreateGuideRequest,
  UpdateContentRequest
} from '../types/content.types';

type ApiEndpointBuilder = EndpointBuilder<
  ReturnType<typeof fetchBaseQuery>,
  'Content' | 'Cases' | 'Users' | 'Analysts' | 'SupportTickets',
  'api'
>;

export const contentEndpoints = (builder: ApiEndpointBuilder) => ({
  getContent: builder.query<ContentItem[], { type?: 'Video' | 'Guide' }>({
    query: (params: { type?: 'Video' | 'Guide' }) => ({
      url: '/api/v1/admin/content',
      method: 'GET',
      params,
    }),
    providesTags: ['Content'],
  }),

  createVideoContent: builder.mutation<ContentItem, CreateVideoRequest>({
    query: (body: CreateVideoRequest) => ({
      url: '/api/v1/admin/content/video',
      method: 'POST',
      body,
    }),
    invalidatesTags: ['Content'],
  }),

  createGuideContent: builder.mutation<ContentItem, CreateGuideRequest>({
    query: (body: CreateGuideRequest) => ({
      url: '/api/v1/admin/content/guide',
      method: 'POST',
      body,
    }),
    invalidatesTags: ['Content'],
  }),

  updateContent: builder.mutation<ContentItem, { id: number; data: UpdateContentRequest }>({
    query: ({ id, data }: { id: number; data: UpdateContentRequest }) => ({
      url: `/api/v1/admin/content/${id}`,
      method: 'PATCH',
      body: data,
    }),
    invalidatesTags: ['Content'],
  }),

  deleteContent: builder.mutation<{ message: string }, number>({
    query: (id: number) => ({
      url: `/api/v1/admin/content/${id}`,
      method: 'DELETE',
    }),
    invalidatesTags: ['Content'],
  }),

  getContentById: builder.query<ContentItem, number>({
    query: (id: number) => ({
      url: `/api/v1/admin/content/${id}`,
      method: 'GET',
    }),
    providesTags: (result, error, id) => [{ type: 'Content', id }],
  }),
});