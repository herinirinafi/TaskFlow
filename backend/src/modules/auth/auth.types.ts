export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshDto {
  refreshToken: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}