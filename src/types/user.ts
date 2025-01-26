export type UserRole = 'admin' | 'writer' | 'user';
export type UserStatus = 'active' | 'banned';
export type PostStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  photoURL?: string;
  createdAt: Date;
}