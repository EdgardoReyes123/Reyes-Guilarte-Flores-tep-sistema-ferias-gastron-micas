export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  name?: string;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  access_token: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  error?: string;
}
