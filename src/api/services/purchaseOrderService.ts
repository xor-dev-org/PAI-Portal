import apiClient from '../axios';
import { logger } from '@/services/logger';
import {
  POActionRequest,
  PODropdownConfig,
  POFilters,
  POListResponse,
  PurchaseOrder,
} from '@/models';

export const purchaseOrderService = {
  // Get PO list with filters and pagination
  getPOList: async (filters: POFilters = {}): Promise<POListResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.supplier_id) params.append('supplier_id', filters.supplier_id);
    if (filters.procurement_specialist_id)
      params.append('procurement_specialist_id', filters.procurement_specialist_id);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);
    if (filters.po_number) params.append('po_number', filters.po_number);
    if (filters.supplier_name) params.append('supplier_name', filters.supplier_name);
    if (filters.supplier_email) params.append('supplier_email', filters.supplier_email);
    if (filters.site) params.append('site', filters.site);
    if (filters.total_value_from) params.append('total_value_from', filters.total_value_from.toString());
    if (filters.total_value_to) params.append('total_value_to', filters.total_value_to.toString());
    if (filters.source_system) params.append('source_system', filters.source_system);
    if (filters.revision_changes) params.append('revision_changes', filters.revision_changes.toString());
    if (filters.items_from) params.append('items_from', filters.items_from.toString());
    if (filters.items_to) params.append('items_to', filters.items_to.toString());
    if (filters.mrp_exceptions) params.append('mrp_exceptions', filters.mrp_exceptions);
    if (filters.delivery_date_from) params.append('delivery_date_from', filters.delivery_date_from);
    if (filters.delivery_date_to) params.append('delivery_date_to', filters.delivery_date_to);
    if (filters.pinned_po_list) params.append('pinned_po_list', filters.pinned_po_list.join(','));

    const url = `/po?${params.toString()}`;
    const startTime = performance.now();
    const response = await apiClient.get<POListResponse>(url);
    logger.info('Purchase order API call completed', {
      url,
      durationMs: Math.round(performance.now() - startTime),
    });
    return response.data;
  },

  // Get Pinned PO List for a user
  getPinnedPOList: async (userId: string, filters: POFilters = {}): Promise<POListResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());

    const url = `/po/pinned_po_list?user_id=${userId}&${params.toString()}`;
    const startTime = performance.now();
    const response = await apiClient.get<POListResponse>(url);
    logger.info('Purchase order API call completed', {
      url,
      durationMs: Math.round(performance.now() - startTime),
    });
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

  performPOAction: async (poId: string, payload: POActionRequest): Promise<PurchaseOrder> => {
    const response = await apiClient.post<PurchaseOrder>(`/po/${poId}/actions`, payload);
    return response.data;
  },

  getPODropdownConfig: async (): Promise<PODropdownConfig> => {
    const response = await apiClient.get<PODropdownConfig>('/po/config/dropdowns');
    return response.data;
  },
};
