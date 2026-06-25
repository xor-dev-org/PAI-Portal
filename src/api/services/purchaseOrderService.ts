import apiClient from '../axios';
import { logger } from '@/services/logger';
import {
  POActionRequest,
  PODropdownConfig,
  POFilters,
  POListResponse,
  PurchaseOrder,
} from '@/models';

interface POHistoryResponse {
  po_id: string;
  history: Array<Record<string, unknown>>;
}

interface PODocumentsResponse {
  po_id: string;
  documents: Array<Record<string, unknown>>;
}

export const purchaseOrderService = {
  // Get PO list with filters and pagination
  getPOList: async (filters: POFilters = {}): Promise<POListResponse> => {
    const params = new URLSearchParams();

    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.page_size !== undefined) params.append('page_size', filters.page_size.toString());
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
    if (filters.sites) {
      params.append('site',filters.sites.length > 0 ? filters.sites.join(',') : '__NO_SITE_SELECTED__');} else if (filters.site) {params.append('site', filters.site);}
    if (filters.total_value_from)
      params.append('total_value_from', filters.total_value_from.toString());
    if (filters.total_value_to) params.append('total_value_to', filters.total_value_to.toString());
    if (filters.source_system) params.append('source_system', filters.source_system);
    if (filters.revision_changes)
      params.append('revision_changes', filters.revision_changes.toString());
    if (filters.items_from) params.append('items_from', filters.items_from.toString());
    if (filters.items_to) params.append('items_to', filters.items_to.toString());
    if (filters.mrp_exceptions) params.append('mrp_exceptions', filters.mrp_exceptions);
    if (filters.delivery_date_from) params.append('delivery_date_from', filters.delivery_date_from);
    if (filters.delivery_date_to) params.append('delivery_date_to', filters.delivery_date_to);
    if (filters.pinned_po_list?.length) {
      filters.pinned_po_list.forEach((poId) => params.append('pinned_po_list', poId));
    }

    const url = `/po?${params.toString()}`;
    const startTime = performance.now();
    console.log('API Params:', params.toString());
    const response = await apiClient.get<POListResponse>(url);
    logger.info('Purchase order API call completed', {
      url,
      durationMs: Math.round(performance.now() - startTime),
    });
    return response.data;
  },

  getAvailableSites: async (): Promise<string[]> => {
    const response = await apiClient.get<{ sites: string[] }>('/po/config/sites');
    return response.data.sites;
  },

  // Get Pinned PO List for a user
  getPinnedPOList: async (userId: string, filters: POFilters = {}): Promise<POListResponse> => {
    const params = new URLSearchParams();

    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.page_size !== undefined) params.append('page_size', filters.page_size.toString());

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

  getPOHistory: async (poId: string): Promise<Array<Record<string, unknown>>> => {
    const response = await apiClient.get<POHistoryResponse>(`/po/${poId}/history`);
    return response.data.history || [];
  },

  getPODocuments: async (poId: string): Promise<Array<Record<string, unknown>>> => {
    const response = await apiClient.get<PODocumentsResponse>(`/po/${poId}/documents`);
    return response.data.documents || [];
  },

  downloadPODocument: async (
    poId: string,
    documentId: string
  ): Promise<{ blob: Blob; fileName: string | null }> => {
    const response = await apiClient.get<Blob>(`/po/${poId}/documents/${documentId}/download`, {
      responseType: 'blob',
    });

    const disposition = response.headers['content-disposition'] as string | undefined;
    const fileNameMatch = disposition?.match(/filename\*?=(?:UTF-8''|\")?([^\";]+)/i);
    const extractedFileName = fileNameMatch?.[1];
    const fileName = extractedFileName
      ? decodeURIComponent(extractedFileName.replace(/\"/g, '').trim())
      : null;

    return { blob: response.data, fileName };
  },

  performPODocumentAction: async (
    poId: string,
    documentId: string,
    payload: { action: string; notes?: string }
  ): Promise<Record<string, unknown>> => {
    const response = await apiClient.post<{ document: Record<string, unknown> }>(
      `/po/${poId}/documents/${documentId}/actions`,
      payload
    );
    return response.data.document;
  },

  replacePODocument: async (
    poId: string,
    documentId: string,
    payload: { file: File; comments?: string }
  ): Promise<Record<string, unknown>> => {
    const form = new FormData();
    form.append('file', payload.file);
    form.append('comments', payload.comments || '');

    const response = await apiClient.post<{ document: Record<string, unknown> }>(
      `/po/${poId}/documents/${documentId}/replace`,
      form,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.document;
  },

  uploadPODocument: async (
    poId: string,
    payload: {
      line_item_id: string;
      file: File;
      document_tag_to?: string;
      comments?: string;
    }
  ): Promise<Record<string, unknown>> => {
    const form = new FormData();
    form.append('line_item_id', payload.line_item_id);
    form.append('file', payload.file);
    form.append('document_tag_to', payload.document_tag_to || 'LINE_ITEM');
    form.append('comments', payload.comments || '');

    const response = await apiClient.post<{ document: Record<string, unknown> }>(
      `/po/${poId}/documents/upload`,
      form,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.document;
  },

  getPODropdownConfig: async (): Promise<PODropdownConfig> => {
    const response = await apiClient.get<PODropdownConfig>('/po/config/dropdowns');
    return response.data;
  },
};
