export interface PurchaseOrderDTO {
  id: string;
  order_number: string;
  supplier_id: string;
  supplier_name: string;
  status: string;
  order_date: string;
  delivery_date: string;
  total_amount: number;
  currency: string;
  line_items: LineItemDTO[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface LineItemDTO {
  id: string;
  product_id: string;
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit: string;
}

export interface SupplierDTO {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address: AddressDTO;
  contact_person: string;
  rating: number;
  status: string;
  category: string;
  payment_terms: string;
  created_at: string;
  updated_at: string;
}

export interface AddressDTO {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface UserDTO {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
  permissions: string[];
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PurchaseOrderFilters extends PaginationParams {
  status?: string;
  supplierId?: string;
  fromDate?: string;
  toDate?: string;
  searchTerm?: string;
}

export interface SupplierFilters extends PaginationParams {
  status?: string;
  category?: string;
  searchTerm?: string;
}


export interface ACSMessage {
  id: string;
  content: string;
  senderId: string;
  createdOn: Date;
}