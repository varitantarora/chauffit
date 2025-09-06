export type UserRole = 'customer' | 'driver' | 'biker';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
}