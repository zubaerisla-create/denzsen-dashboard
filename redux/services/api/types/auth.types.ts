export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success?: boolean;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  success?: boolean;
  reset_token?: string;
}

export interface ResetPasswordRequest {
  email: string;
  new_password: string;
  confirm_password: string;
  reset_token: string;
}

export interface ResetPasswordResponse {
  message: string;
  success?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  access_token?: string;
  refresh_token?: string;
  user?: any;
  success?: boolean;
}