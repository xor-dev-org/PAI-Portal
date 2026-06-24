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

  getPinnedRows: async (userId: string): Promise<string[]> => {
    const response = await apiClient.get<{ pinned_rows: string[] }>(`/user-pref/pinned-rows?user_id=${userId}`);
    return response.data.pinned_rows;
  },

  updatePinnedRows: async (userId: string, pinnedRows: string[]): Promise<{ pinned_rows: string[] }> => {
    const response = await apiClient.put<{ pinned_rows: string[] }>('/user-pref/pinned-rows', {
      user_id: userId,
      pinned_rows: pinnedRows,
    });
    console.log(`Updated pinned rows for user ${JSON.stringify(response.data)}`);
    return response.data;
  },

  getLinePinnedRows: async (userId: string): Promise<string[]> => {
    const response = await apiClient.get<{ line_pinned_rows: string[] }>(
      `/user-pref/line-pinned-rows?user_id=${userId}`
    );
    return response.data.line_pinned_rows;
  },

  updateLinePinnedRows: async (userId: string, linePinnedRows: string[]): Promise<{ line_pinned_rows: string[] }> => {
    const response = await apiClient.put<{ line_pinned_rows: string[] }>('/user-pref/line-pinned-rows', {
      user_id: userId,
      line_pinned_rows: linePinnedRows,
    });
    return response.data;
  },
};
