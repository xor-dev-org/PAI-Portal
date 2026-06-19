# SCM Procurement Mock Server — Detailed API Specification

## Base URL

```text
http://localhost:8000
```

---

# Authentication APIs

---

# 1. MSAL Login (Procurement Specialist + Admin)

This endpoint mimics Microsoft Entra ID / MSAL authentication.

Frontend will:
- Use returned role for RBAC
- Store JWT token
- Route users accordingly

---

## Endpoint

```http
POST /auth/msal/login
```

---

## Request Body

```json
{
  "email": "ps1@mockscm.com"
}
```

OR

```json
{
  "email": "admin@mockscm.com"
}
```

---

## Validation Rules

| Field | Type | Required | Notes |
|---|---|---|---|
| email | string | Yes | Must exist in mock users |

---

## Success Response

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "role": "PROCUREMENT_SPECIALIST",
  "user": {
    "id": "PS-001",
    "name": "Procurement Specialist 1",
    "email": "ps1@mockscm.com",
    "role": "PROCUREMENT_SPECIALIST"
  }
}
```

---

## Roles Returned

| Role |
|---|
| ADMIN |
| PROCUREMENT_SPECIALIST |

---

## Frontend Usage

Frontend should:
- Decode token
- Read role
- Enable RBAC routes

Example:
- ADMIN → supplier management
- PS → PO management pages

---

## Error Response

### Invalid User

```json
{
  "detail": "Invalid user"
}
```

---

# 2. Supplier Signup

Creates supplier user.

---

## Endpoint

```http
POST /auth/supplier/signup
```

---

## Request Body

```json
{
  "supplier_number": "SUPNUM-010",
  "name": "ABC Supplier",
  "email": "abc@mock.com",
  "password": "Password123",
  "address": "Mumbai, India",
  "site": "Mumbai Plant"
}
```

---

## Fields

| Field | Type | Required |
|---|---|---|
| supplier_number | string | Yes |
| name | string | Yes |
| email | string | Yes |
| password | string | Yes |
| address | string | Yes |
| site | string | Yes |

---

## Success Response

```json
{
  "id": "uuid",
  "supplier_number": "SUPNUM-010",
  "name": "ABC Supplier",
  "email": "abc@mock.com",
  "password": "Password123",
  "address": "Mumbai, India",
  "site": "Mumbai Plant",
  "role": "SUPPLIER"
}
```

---

## Error Response

```json
{
  "detail": "Supplier already exists"
}
```

---

# 3. Supplier Login

---

## Endpoint

```http
POST /auth/supplier/login
```

---

## Request Body

```json
{
  "email": "supplier1@mockscm.com",
  "password": "Password123"
}
```

---

## Success Response

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "role": "SUPPLIER",
  "user": {
    "id": "SUP-001",
    "supplier_number": "SUPNUM-001",
    "name": "Supplier 1",
    "email": "supplier1@mockscm.com",
    "address": "Nashik Industrial Area 1",
    "site": "Site-1",
    "role": "SUPPLIER"
  }
}
```

---

# Purchase Order APIs

---

# PO Canonical Model

Unified format for:
- SAP
- Oracle

---

## Canonical PO Structure

```json
{
  "id": "uuid",
  "po_number": "PO-10001",
  "source_system": "SAP",
  "status": "APPROVED",
  "supplier_id": "SUP-001",
  "supplier_name": "Supplier 1",
  "procurement_specialist_id": "PS-001",
  "delegated_user_id": "",
  "currency": "INR",
  "total_value": 120000,
  "delivery_date": "2026-06-10",
  "payment_terms": "Net 30",
  "mrp_exceptions": "DELAY_RISK",
  "created_date": "2026-05-28",
  "line_items": [
    {
      "line_number": 1,
      "material_code": "MAT-001",
      "description": "Industrial Component",
      "quantity": 10,
      "unit_price": 5000
    }
  ]
}
```

---

# 4. Get PO List

Supports:
- Pagination
- Filtering

---

## Endpoint

```http
GET /po
```

---

## Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| page | int | No | Default = 1 |
| page_size | int | No | Default = 10 |
| status | string | No | Filter by PO status |
| supplier_id | string | No | Filter by supplier |
| procurement_specialist_id | string | No | Filter by PS |

---

## Example Requests

### Pagination

```http
GET /po?page=1&page_size=20
```

---

### Filter by Status

```http
GET /po?status=APPROVED
```

---

### Filter by Supplier

```http
GET /po?supplier_id=SUP-001
```

---

### Combined Filters

```http
GET /po?status=APPROVED&supplier_id=SUP-001&page=1&page_size=10
```

---

## Success Response

```json
{
  "page": 1,
  "page_size": 10,
  "total": 150,
  "data": []
}
```

---

# 5. Get PO By ID

---

## Endpoint

```http
GET /po/{po_id}
```

---

## Example

```http
GET /po/1234-abcd
```

---

## Success Response

Returns full canonical PO object.

---

## Error Response

```json
{
  "detail": "PO not found"
}
```

---

# 6. Create PO

---

## Endpoint

```http
POST /po
```

---

## Request Body

Canonical PO JSON.

---

## Example

```json
{
  "id": "uuid",
  "po_number": "PO-20001",
  "source_system": "ORACLE",
  "status": "CREATED",
  "supplier_id": "SUP-001",
  "supplier_name": "Supplier 1",
  "procurement_specialist_id": "PS-002",
  "delegated_user_id": "",
  "currency": "INR",
  "total_value": 55000,
  "delivery_date": "2026-07-01",
  "payment_terms": "Net 45",
  "mrp_exceptions": "NONE",
  "created_date": "2026-05-28",
  "line_items": []
}
```

---

## Success Response

Returns created PO.

---

# 7. Update PO

---

## Endpoint

```http
PUT /po/{po_id}
```

---

## Request Body

Full PO object.

---

## Example

```json
{
  "status": "DELIVERED"
}
```

---

## Success Response

Returns updated PO.

---

# Supplier APIs

---

# 8. Get Suppliers

---

## Endpoint

```http
GET /suppliers
```

---

## Success Response

```json
[
  {
    "id": "SUP-001",
    "supplier_number": "SUPNUM-001",
    "name": "Supplier 1",
    "email": "supplier1@mockscm.com",
    "address": "Nashik Industrial Area 1",
    "site": "Site-1",
    "role": "SUPPLIER"
  }
]
```

---

# Admin APIs

---

# 9. Update Supplier Details

Admin-only operation.

---

## Endpoint

```http
PUT /admin/supplier/{supplier_id}
```

---

## Example Request

```json
{
  "address": "Updated Address",
  "site": "Updated Site"
}
```

---

## Success Response

Returns updated supplier.

---

# 10. Update PO Assignment

Allows admin to:
- Change PS owner
- Change supplier owner

---

## Endpoint

```http
PUT /admin/po-assignment/{po_id}
```

---

## Request Body

```json
{
  "procurement_specialist_id": "PS-003",
  "supplier_id": "SUP-004"
}
```

---

## Success Response

Returns updated PO.

---

# RBAC Design

Frontend should use:
- `role`
- JWT payload

for:
- Page access
- Menu visibility
- API routing

---

## Role Permissions Matrix

| Feature | Admin | PS | Supplier |
|---|---|---|---|
| Login | Yes | Yes | Yes |
| Create Supplier | Yes | No | Self Signup |
| View POs | Yes | Assigned Only | Assigned Only |
| Update POs | Yes | Yes | No |
| Reassign POs | Yes | No | No |
| Supplier Management | Yes | No | No |

---

# Mock Data

---

## Procurement Specialists

| ID | Email |
|---|---|
| PS-001 | ps1@mockscm.com |
| PS-002 | ps2@mockscm.com |
| PS-003 | ps3@mockscm.com |
| PS-004 | ps4@mockscm.com |
| PS-005 | ps5@mockscm.com |

---

## Admin

| ID | Email |
|---|---|
| ADMIN-001 | admin@mockscm.com |

---

## Suppliers

| ID | Email |
|---|---|
| SUP-001 | supplier1@mockscm.com |
| SUP-002 | supplier2@mockscm.com |
| SUP-003 | supplier3@mockscm.com |
| SUP-004 | supplier4@mockscm.com |
| SUP-005 | supplier5@mockscm.com |

Password for all suppliers:

```text
Password123
```

---

# Suggested Future Enhancements

---

## Authentication
- Real MSAL integration
- Refresh tokens
- Access token expiry
- OAuth2 scopes

---

## Purchase Orders
- Partial updates (PATCH)
- Sorting
- Search APIs
- Bulk upload
- Attachment support

---

## Database
- MongoDB
- PostgreSQL

---

## Integrations
- SAP S4HANA
- Oracle Fusion
- Event Hub
- Kafka
- Azure Data Factory

---

# Recommended Frontend Flow

---

## Procurement Specialist

```text
MSAL Login
→ Decode Role
→ Fetch Assigned POs
→ Manage POs
```

---

## Supplier

```text
Signup/Login
→ Fetch Supplier POs
→ View Delivery Status
```

---

## Admin

```text
MSAL Login
→ Supplier Management
→ PO Reassignment
→ Audit Views
```

---

# Chat API Reference

Detailed chat service API reference is available at:

- `../bebackup/docs/chat-api-reference.md`

Frontend implementation guide for chat is available at:

- `../bebackup/docs/frontend-chat-changes.md`