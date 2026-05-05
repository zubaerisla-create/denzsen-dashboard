export interface User {
  id: number;
  cop_id: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
  role: string;
  cases_reported: number;
  phone: string;
  avatar_url: string | null;
  is_verified: boolean;
  organization?: string | null;
  created_at: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  page_size: number;
}

export interface AddUserRequest {
  full_name: string;
  email: string;
  phone: string;
  role: string;
  status: 'Active' | 'Inactive';
  organization?: string | null;
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: 'Active' | 'Inactive';
  organization?: string | null;
}

export interface UpdateUserStatusRequest {
  action: 'suspend' | 'activate';
}