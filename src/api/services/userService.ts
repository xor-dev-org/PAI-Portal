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

  // getPinnedColumns: async (userId: string): Promise<string[]> => {
  //   const response = await apiClient.get<{ pinned_columns: string[] }>(`/user-pref/pinned-columns?user_id=${userId}`);
  //   return response.data.pinned_columns;
  // },

  // updatePinnedColumns: async (userId: string, pinnedColumns: string[]): Promise<void> => {
  //   await apiClient.put('/user-pref/pinned-columns', {
  //     user_id: userId,
  //     pinned_columns: pinnedColumns,
  //   });
  // },
};
