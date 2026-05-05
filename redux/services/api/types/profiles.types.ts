// profile.types.ts
export interface UserProfile {
  full_name: string;
  email: string;
  cop_id: string;
  avatar_url: string;
  current_lat: number;
  current_long: number;
  dispatch_radius: number;
  id: number;
  is_verified: boolean;
  role: string;
  phone: string;
  created_at: string;
  location: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface UpdateProfileResponse extends UserProfile {}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

export interface ChangePasswordResponse {
  message: string;
  success?: boolean;
}