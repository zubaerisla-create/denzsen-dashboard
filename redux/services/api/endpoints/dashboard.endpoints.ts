import { EndpointBuilder } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import {
  DashboardStatsResponse,
  ChartsResponse,
  RecentCase
} from '../types/dashboard.types';

type ApiEndpointBuilder = EndpointBuilder<
  ReturnType<typeof fetchBaseQuery>,
  'Content' | 'Cases' | 'Users' | 'Analysts' | 'SupportTickets',
  'api'
>;

export const dashboardEndpoints = (builder: ApiEndpointBuilder) => ({
  getDashboardStats: builder.query<DashboardStatsResponse, void>({
    query: () => ({
      url: '/api/v1/admin/dashboard/stats',
      method: 'GET',
    }),
  }),

  getDashboardCharts: builder.query<ChartsResponse, void>({
    query: () => ({
      url: '/api/v1/admin/dashboard/charts',
      method: 'GET',
    }),
  }),

  getRecentCases: builder.query<RecentCase[], void>({
    query: () => ({
      url: '/api/v1/admin/dashboard/recent-cases',
      method: 'GET',
    }),
  }),
});