// api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { authEndpoints } from './api/endpoints/auth.endpoints';
import { userEndpoints } from './api/endpoints/user.endpoints';
import { caseEndpoints } from './api/endpoints/case.endpoints';
import { dashboardEndpoints } from './api/endpoints/dashboard.endpoints';
import { analystEndpoints } from './api/endpoints/analyst.endpoints';
import { supportEndpoints } from './api/endpoints/support.endpoints';
import { contentEndpoints } from './api/endpoints/content.endpoints';
import { profileEndpoints } from './api/endpoints/profile.endpoints';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://coppnet.org',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ['Content', 'Cases', 'Users', 'Analysts', 'SupportTickets'],
  endpoints: (builder) => ({
    ...authEndpoints(builder),
    ...userEndpoints(builder),
    ...caseEndpoints(builder),
    ...dashboardEndpoints(builder),
    ...analystEndpoints(builder),
    ...supportEndpoints(builder),
    ...contentEndpoints(builder),
    ...profileEndpoints(builder),
  }),
});
// api.ts - Update the export section
export const {
  useAdminLoginMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  // User management hooks
  useGetUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
  // Dashboard hooks
  useGetDashboardStatsQuery,
  useGetDashboardChartsQuery,
  useUpdateCaseStatusMutation,
  useGetRecentCasesQuery,
  // Cases hooks
  useGetCasesQuery,
  useGetCaseByIdQuery,
  // Analysts hooks
  useGetAnalystsQuery,
  useUpdateAnalystStatusMutation,
  // Support tickets hooks
  useGetSupportTicketsQuery,
  // Content management hooks
  useGetContentQuery,
  useCreateVideoContentMutation,
  useCreateGuideContentMutation,
  useUpdateContentMutation,
  useDeleteContentMutation,
  useGetContentByIdQuery,
  // Profile hooks
  useGetProfileQuery, // Add this
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = api;