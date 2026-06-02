import apiClient from '../axios';
import { Delegation, DelegationListResponse, DelegationFilters } from '@/models';

export const delegationService = {
  // Get delegation list with filters and pagination
  getDelegationList: async (filters: DelegationFilters = {}): Promise<DelegationListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);

    const response = await apiClient.get<DelegationListResponse>(`/delegation?${params.toString()}`);
    return response.data;
  },

  // Get delegation by ID
  getDelegationById: async (delegationId: string): Promise<Delegation> => {
    const response = await apiClient.get<Delegation>(`/delegation/${delegationId}`);
    return response.data;
  },

  // Create delegation
  createDelegation: async (delegationData: Partial<Delegation>): Promise<Delegation> => {
    const response = await apiClient.post<Delegation>('/delegation', delegationData);
    return response.data;
  },

  // Delete delegation
  deleteDelegation: async (delegationId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/delegation/${delegationId}`);
    return response.data;
  },

  // Update delegation
  updateDelegation: async (delegationId: string, delegationData: Partial<Delegation>): Promise<Delegation> => {
    const response = await apiClient.put<Delegation>(`/delegation/${delegationId}`, delegationData);
    return response.data;
  },
};
