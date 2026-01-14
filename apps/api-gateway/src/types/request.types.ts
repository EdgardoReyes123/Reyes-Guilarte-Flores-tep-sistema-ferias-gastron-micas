export interface AuthenticatedUser {
  id: string;
  role: 'customer' | 'seller' | 'admin'; // 'cliente' | 'emprendedor' | 'organizador'
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
