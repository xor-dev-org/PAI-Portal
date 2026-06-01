import apiClient from '../axios';
import { User } from '@/models';

export const userService = {
  // Get users by role
  getUsersByRole: async (role: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>(`/admin/users?role=${role}`);
    return response.data;
  },

  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/admin/users');
    return response.data;
  },
};
