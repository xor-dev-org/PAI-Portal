// User and Auth types
export enum UserRole {
  ADMIN = 'ADMIN',
  PROCUREMENT_SPECIALIST = 'PROCUREMENT_SPECIALIST',
  SUPPLIER = 'SUPPLIER',
}

export interface User {
  id: string;
  name: string;
  phone?: string;
  email: string;
  role: UserRole;
  supplier_number?: string;
  address?: string;
  site?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  user: User;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface SignupRequest {
  supplier_number: string;
  name: string;
  email: string;
  password: string;
  address: string;
  site: string;
}

// Purchase Order types
export enum PurchaseOrderStatus {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  SENT_TO_SUPPLIER = 'SENT_TO_SUPPLIER',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface LineItem {
  id?: string;
  line_number: number;
  material_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  unit?: string;
  per?: number;
  supplier_mat_code?: string;
  transportation?: string;
  shipment_date?: string;
  required_in_house_date?: string;
  net_value?: number;
  updated_quantity?: number;
  updated_unit_price?: number;
  updated_delivery_date?: string;
  updated_material_no?: string;
  updated_description?: string;
  updated_net_value?: number;
  supplier_confirmation_date?: string;
  recommendation?: string;
  exception_type?: string;
  mrp_action_required?: boolean;
  concession?: string;
  documents?: string[];
  line_status?: string;
  default_expanded?: boolean;
  history?: POStatusHistory[];
}

export interface POPartyDetails {
  supplier_no?: string;
  email?: string;
  address?: string;
}

export interface POBuyerDetails {
  buyer?: string;
  telephone?: string;
  email?: string;
}

export interface POShipmentDetails {
  incoterms?: string;
  address?: string;
}

export interface POBillingDetails {
  terms_of_payment?: string;
  currency?: string;
  send_invoice_to?: string;
  bill_to_address?: string;
}

export interface PODetailsPanel {
  supplier_details?: POPartyDetails;
  buyer_details?: POBuyerDetails;
  shipment_details?: POShipmentDetails;
  billing_details?: POBillingDetails;
}

export interface POStatusHistory {
  action: string;
  actor_id: string;
  actor_role: UserRole | string;
  line_item_id: string;
  previous_status: PurchaseOrderStatus | string;
  new_status: PurchaseOrderStatus | string;
  notes?: string;
  timestamp: string;
}

export interface POLayoutConfig {
  show_mrp_tab: boolean;
  show_supplier_total_row: boolean;
  show_bottom_page_action_bar: boolean;
  show_ps_bottom_summary: boolean;
}

export interface POUIConfig {
  main_tabs: string[];
  header_actions: string[];
  line_status_tabs: string[];
  line_actions: string[];
  layout: POLayoutConfig;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  source_system: string;
  status: PurchaseOrderStatus;
  supplier_id: string;
  supplier_name: string;
  supplier_email?: string;
  site?: string;
  procurement_specialist_id: string;
  delegated_user_id: string;
  currency: string;
  total_value: number;
  delivery_date: string;
  payment_terms: string;
  mrp_exceptions: string;
  created_date: string;
  revision_changes: number;
  line_items: LineItem[];
  po_details?: PODetailsPanel;
  status_history?: POStatusHistory[];
  workflow_stage?: string;
  last_modified_by?: string;
  last_modified_date?: string;
  ui_config?: POUIConfig;
  available_actions?: string[];
}

export interface POActionRequest {
  action: string;
  line_item_id: string;
  notes?: string;
  move_in_date?: string;
  move_out_date?: string;
}

export interface PODropdownConfig {
  role: UserRole | string;
  ui_config: POUIConfig;
  actions: string[];
  status_transitions: Record<string, string>;
}

export interface POListResponse {
  page: number;
  page_size: number;
  total: number;
  data: PurchaseOrder[];
}
export interface POFilters {
  page?: number;
  page_size?: number;
  status?: PurchaseOrderStatus | string;
  supplier_id?: string;
  procurement_specialist_id?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';

  po_number?: string;
  supplier_name?: string;

  supplier_email?: string;
  site?: string;

  total_value_from?: number;
  total_value_to?: number;

  delivery_date_from?: string;
  delivery_date_to?: string;

  source_system?: string;
  revision_changes?: number;

  items_from?: number;
  items_to?: number;

  mrp_exceptions?: string;
  pinned_po_list?: string[];
}

export interface AdvanceFilters {
  po_number?: string;
  supplier_name?: string;

  total_value_from?: number;
  total_value_to?: number;

  delivery_date_from?: string;
  delivery_date_to?: string;

  source_system?: string;

  items_from?: number;
  items_to?: number;

  mrp_exceptions?: string;
}
export interface Supplier {
  id: string;
  supplier_number: string;
  name: string;
  email: string;
  address: string;
  site: string;
  role: UserRole;
}

// Delegation types
export enum DelegationStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Delegation {
  id: string;
  po_id: string;
  po_number: string;
  supplier_name: string;
  delegated_from_id: string;
  delegated_from_name: string;
  delegated_to_id: string;
  delegated_to_name: string;
  role: string;
  start_date: string;
  end_date: string;
  status: DelegationStatus;
  created_date: string;
  total_value?: number;
}

export interface DelegationFilters {
  page?: number;
  page_size?: number;
  status?: DelegationStatus | string;
  search?: string;
  sort_by?: 'date_asc' | 'date_desc';
}

export interface DelegationListResponse {
  page: number;
  page_size: number;
  total: number;
  data: Delegation[];
}
