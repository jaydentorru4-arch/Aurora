export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: number;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}
