import apiClient from '../axios';
import { PurchaseOrder, POListResponse, POFilters } from '@/models';

export const purchaseOrderService = {
  // Get PO list with filters and pagination
  getPOList: async (filters: POFilters = {}): Promise<POListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.supplier_id) params.append('supplier_id', filters.supplier_id);
    if (filters.procurement_specialist_id) params.append('procurement_specialist_id', filters.procurement_specialist_id);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);

    const response = await apiClient.get<POListResponse>(`/po?${params.toString()}`);
    return response.data;
  },

  // Get PO by ID
  getPOById: async (poId: string): Promise<PurchaseOrder> => {
    const response = await apiClient.get<PurchaseOrder>(`/po/${poId}`);
    return response.data;
  },

  // Create PO
  createPO: async (poData: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    const response = await apiClient.post<PurchaseOrder>('/po', poData);
    return response.data;
  },

  // Update PO
  updatePO: async (poId: string, poData: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    const response = await apiClient.put<PurchaseOrder>(`/po/${poId}`, poData);
    return response.data;
  },
};
