import apiClient from '../axios';
import { User } from '@/models';

type PinType = 'po' | 'po_to_review' | 'mrp_exception';

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

  getPinnedRows: async (
    userId: string,
    pinType: PinType = 'po'
  ): Promise<string[]> => {
    const response = await apiClient.get<{ pinned_rows: string[] }>(
      `/user-pref/pinned-rows?user_id=${userId}&pin_type=${pinType}`
    );

    return response.data.pinned_rows;
  },

  updatePinnedRows: async (
    userId: string,
    pinnedRows: string[],
    pinType: PinType = 'po'
  ): Promise<{ pinned_rows: string[] }> => {
    const response = await apiClient.put<{ pinned_rows: string[] }>('/user-pref/pinned-rows', {
      user_id: userId,
      pin_type: pinType,
      pinned_rows: pinnedRows,
    });

    console.log(`Updated pinned rows for user ${JSON.stringify(response.data)}`);
    return response.data;
  },
};