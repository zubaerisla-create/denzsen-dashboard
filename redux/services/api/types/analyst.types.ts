export interface AnalystApiItem {
  id: number;
  cop_id: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
  role: string;
  cases_reported: number;
  avatar_url: string | null;
}

export interface AnalystsResponse {
  users: AnalystApiItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface UpdateAnalystStatusResponse {
  message: string;
  success?: boolean;
}