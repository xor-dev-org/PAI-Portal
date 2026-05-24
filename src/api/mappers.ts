import {
  PurchaseOrder,
  Supplier,
  LineItem,
  Address,
  User,
  PurchaseOrderStatus,
  SupplierStatus,
  UserRole,
} from '@/models';
import {
  PurchaseOrderDTO,
  SupplierDTO,
  LineItemDTO,
  AddressDTO,
  UserDTO,
} from '@/api/types';

export const mapLineItemFromDTO = (dto: LineItemDTO): LineItem => ({
  id: dto.id,
  productId: dto.product_id,
  productName: dto.product_name,
  description: dto.description,
  quantity: dto.quantity,
  unitPrice: dto.unit_price,
  totalPrice: dto.total_price,
  unit: dto.unit,
});

export const mapLineItemToDTO = (item: LineItem): LineItemDTO => ({
  id: item.id,
  product_id: item.productId,
  product_name: item.productName,
  description: item.description,
  quantity: item.quantity,
  unit_price: item.unitPrice,
  total_price: item.totalPrice,
  unit: item.unit,
});

export const mapPurchaseOrderFromDTO = (dto: PurchaseOrderDTO): PurchaseOrder => ({
  id: dto.id,
  orderNumber: dto.order_number,
  supplierId: dto.supplier_id,
  supplierName: dto.supplier_name,
  status: dto.status as PurchaseOrderStatus,
  orderDate: dto.order_date,
  deliveryDate: dto.delivery_date,
  totalAmount: dto.total_amount,
  currency: dto.currency,
  lineItems: dto.line_items.map(mapLineItemFromDTO),
  createdBy: dto.created_by,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
});

export const mapPurchaseOrderToDTO = (po: PurchaseOrder): PurchaseOrderDTO => ({
  id: po.id,
  order_number: po.orderNumber,
  supplier_id: po.supplierId,
  supplier_name: po.supplierName,
  status: po.status,
  order_date: po.orderDate,
  delivery_date: po.deliveryDate,
  total_amount: po.totalAmount,
  currency: po.currency,
  line_items: po.lineItems.map(mapLineItemToDTO),
  created_by: po.createdBy,
  created_at: po.createdAt,
  updated_at: po.updatedAt,
});

export const mapAddressFromDTO = (dto: AddressDTO): Address => ({
  street: dto.street,
  city: dto.city,
  state: dto.state,
  postalCode: dto.postal_code,
  country: dto.country,
});

export const mapAddressToDTO = (address: Address): AddressDTO => ({
  street: address.street,
  city: address.city,
  state: address.state,
  postal_code: address.postalCode,
  country: address.country,
});

export const mapSupplierFromDTO = (dto: SupplierDTO): Supplier => ({
  id: dto.id,
  name: dto.name,
  code: dto.code,
  email: dto.email,
  phone: dto.phone,
  address: mapAddressFromDTO(dto.address),
  contactPerson: dto.contact_person,
  rating: dto.rating,
  status: dto.status as SupplierStatus,
  category: dto.category,
  paymentTerms: dto.payment_terms,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
});

export const mapSupplierToDTO = (supplier: Supplier): SupplierDTO => ({
  id: supplier.id,
  name: supplier.name,
  code: supplier.code,
  email: supplier.email,
  phone: supplier.phone,
  address: mapAddressToDTO(supplier.address),
  contact_person: supplier.contactPerson,
  rating: supplier.rating,
  status: supplier.status,
  category: supplier.category,
  payment_terms: supplier.paymentTerms,
  created_at: supplier.createdAt,
  updated_at: supplier.updatedAt,
});

export const mapUserFromDTO = (dto: UserDTO): User => ({
  id: dto.id,
  email: dto.email,
  firstName: dto.first_name,
  lastName: dto.last_name,
  role: dto.role as UserRole,
  department: dto.department,
  permissions: dto.permissions,
  avatarUrl: dto.avatar_url,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
});

export const mapUserToDTO = (user: User): UserDTO => ({
  id: user.id,
  email: user.email,
  first_name: user.firstName,
  last_name: user.lastName,
  role: user.role,
  department: user.department,
  permissions: user.permissions,
  avatar_url: user.avatarUrl,
  created_at: user.createdAt,
  updated_at: user.updatedAt,
});
