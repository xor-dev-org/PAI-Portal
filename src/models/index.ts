// User and Auth types
export enum UserRole {
  ADMIN = 'ADMIN',
  PROCUREMENT_SPECIALIST = 'PROCUREMENT_SPECIALIST',
  SUPPLIER = 'SUPPLIER',
}

export interface User {
  id: string;
  name: string;
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
  line_number: number;
  material_code: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  source_system: string;
  status: PurchaseOrderStatus;
  supplier_id: string;
  supplier_name: string;
  procurement_specialist_id: string;
  delegated_user_id: string;
  currency: string;
  total_value: number;
  delivery_date: string;
  payment_terms: string;
  mrp_exceptions: string;
  created_date: string;
  line_items: LineItem[];
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
  sort_by?: 'delivery_date_asc' | 'delivery_date_desc';
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
