export type UserRole = 'admin' | 'writer' | 'user';
export type UserStatus = 'active' | 'banned';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
}