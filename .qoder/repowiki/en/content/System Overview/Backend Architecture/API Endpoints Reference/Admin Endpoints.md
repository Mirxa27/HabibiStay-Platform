# Admin Endpoints

<cite>
**Referenced Files in This Document**   
- [index.ts](file://src/worker/index.ts#L878-L1077)
- [types.ts](file://src/shared/types.ts#L400-L599)
- [AdminDashboard.tsx](file://src/react-app/pages/AdminDashboard.tsx#L0-L578)
- [security-middleware.ts](file://src/shared/security-middleware.ts#L66-L114)
- [auth.ts](file://src/server/utils/auth.ts#L0-L395)
- [1.sql](file://migrations/1.sql)
- [2.sql](file://migrations/2.sql)
- [3.sql](file://migrations/3.sql)
- [4.sql](file://migrations/4.sql)
- [5.sql](file://migrations/5.sql)
- [6.sql](file://migrations/6.sql)
- [7.sql](file://migrations/7.sql)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Authentication and Security](#authentication-and-security)
3. [API Endpoints](#api-endpoints)
   - [GET /api/admin/stats](#get-apimadminstats)
   - [GET /api/admin/settings](#get-apimadminsettings)
   - [PUT /api/admin/settings](#put-apimadminsettings)
   - [GET /api/admin/properties](#get-apimadminproperties)
   - [GET /api/admin/bookings](#get-apimadminbookings)
   - [PUT /api/admin/bookings/:id/status](#put-apimadminbookingsidstatus)
4. [Data Structures](#data-structures)
5. [Rate Limiting and Audit Logging](#rate-limiting-and-audit-logging)
6. [Frontend Integration](#frontend-integration)
7. [Database Schema](#database-schema)
8. [Error Handling](#error-handling)
9. [Example Usage](#example-usage)

## Introduction
This document provides comprehensive documentation for the administrative API endpoints in HabibiStay, a platform for property management and bookings. The admin endpoints enable platform administrators to retrieve analytics, manage settings, view properties and bookings, and update booking statuses. All endpoints require authentication via JWT with admin role verification and include rate limiting and audit logging for security.

**Section sources**
- [index.ts](file://src/worker/index.ts#L878-L1077)
- [AdminDashboard.tsx](file://src/react-app/pages/AdminDashboard.tsx#L0-L578)

## Authentication and Security
All admin endpoints are protected by JWT-based authentication and role verification. The `authMiddleware` function validates the Authorization header, verifies the JWT token, and stores user information in the request context.

```mermaid
sequenceDiagram
participant Client
participant authMiddleware
participant verifyJWT
participant auditLogger
Client->>authMiddleware : Request with Bearer token
authMiddleware->>authMiddleware : Extract token from Authorization header
alt No token or invalid format
authMiddleware->>auditLogger : Log MISSING_AUTH_TOKEN
auditLogger-->>authMiddleware : Log entry
authMiddleware-->>Client : 401 Unauthorized
else Valid token format
authMiddleware->>verifyJWT : Verify token signature and claims
verifyJWT-->>authMiddleware : Return payload or null
alt Invalid token
authMiddleware->>auditLogger : Log INVALID_AUTH_TOKEN
auditLogger-->>authMiddleware : Log entry
authMiddleware-->>Client : 401 Unauthorized
else Valid token
authMiddleware->>authMiddleware : Set user context (user, userId, userRole)
authMiddleware->>auditLogger : Log AUTHENTICATED_ACCESS
auditLogger-->>authMiddleware : Log entry
authMiddleware->>Client : Proceed to route handler
end
end
```

**Diagram sources**
- [security-middleware.ts](file://src/shared/security-middleware.ts#L66-L114)
- [auth.ts](file://src/server/utils/auth.ts#L0-L395)

**Section sources**
- [security-middleware.ts](file://src/shared/security-middleware.ts#L66-L114)
- [auth.ts](file://src/server/utils/auth.ts#L0-L395)

## API Endpoints

### GET /api/admin/stats
Retrieves platform analytics including total properties, bookings, revenue, and other key metrics.

**:HTTP Method**
- GET

**:URL Pattern**
- /api/admin/stats

**:Authentication**
- Required: JWT with admin privileges
- Role verification: User email must contain 'admin' or 'owner'

**:Request Parameters**
- None

**:Response Schema**
```json
{
  "success": true,
  "data": {
    "total_users": 1500,
    "total_properties": 250,
    "total_bookings": 850,
    "total_revenue": 1250000,
    "pending_bookings": 45,
    "active_properties": 220,
    "monthly_growth": 12.5,
    "occupancy_rate": 78.3
  }
}
```

**:Status Codes**
- 200: Successful retrieval of statistics
- 401: Missing or invalid authentication token
- 403: User not authorized (not admin or owner)
- 500: Internal server error

**:Example Response**
```json
{
  "success": true,
  "data": {
    "total_users": 1500,
    "total_properties": 250,
    "total_bookings": 850,
    "total_revenue": 1250000,
    "pending_bookings": 45,
    "active_properties": 220,
    "monthly_growth": 12.5,
    "occupancy_rate": 78.3
  }
}
```

**Section sources**
- [index.ts](file://src/worker/index.ts#L878-L885)
- [AdminDashboard.tsx](file://src/react-app/pages/AdminDashboard.tsx#L0-L578)

### GET /api/admin/settings
Retrieves all platform configuration settings.

**:HTTP Method**
- GET

**:URL Pattern**
- /api/admin/settings

**:Authentication**
- Required: JWT with admin privileges
- Role verification: User email must contain 'admin' or 'owner'

**:Rate Limiting**
- 50 requests per 10 minutes

**:Request Parameters**
- None

**:Response Schema**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "key": "booking_commission",
      "value": "10",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "key": "featured_property_fee",
      "value": "500",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**:Status Codes**
- 200: Successful retrieval of settings
- 401: Missing or invalid authentication token
- 403: User not authorized (not admin or owner)
- 500: Internal server error

**Section sources**
- [index.ts](file://src/worker/index.ts#L915-L932)

### PUT /api/admin/settings
Updates a specific platform setting.

**:HTTP Method**
- POST

**:URL Pattern**
- /api/admin/settings

**:Authentication**
- Required: JWT with admin privileges
- Role verification: User email must contain 'admin' or 'owner'

**:Request Parameters**
- Body (JSON):
  - **key**: string - The setting key to update
  - **value**: string - The new value for the setting

**:Request Example**
```json
{
  "key": "booking_commission",
  "value": "12"
}
```

**:Response Schema**
```json
{
  "success": true,
  "message": "Setting updated"
}
```

**:Status Codes**
- 200: Setting successfully updated
- 400: Invalid request body
- 401: Missing or invalid authentication token
- 403: User not authorized (not admin or owner)
- 500: Internal server error

**Section sources**
- [index.ts](file://src/worker/index.ts#L977-L997)

### GET /api/admin/properties
Retrieves a list of all properties with filtering capabilities.

**:HTTP Method**
- GET

**:URL Pattern**
- /api/admin/properties

**:Authentication**
- Required: JWT with admin privileges
- Role verification: User email must contain 'admin' or 'owner'

**:Rate Limiting**
- 100 requests per 10 minutes

**:Request Parameters**
- None

**:Response Schema**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": "user_123",
      "title": "Luxury Villa in Riyadh",
      "description": "Spacious villa with pool and garden",
      "location": "Riyadh, Saudi Arabia",
      "price_per_night": 1500,
      "max_guests": 8,
      "bedrooms": 4,
      "bathrooms": 3,
      "amenities": "[\"wifi\",\"kitchen\",\"pool\",\"gym\"]",
      "images": "[\"https://example.com/image1.jpg\",\"https://example.com/image2.jpg\"]",
      "is_featured": true,
      "is_active": true,
      "created_at": "2024-01-10T08:30:00Z",
      "updated_at": "2024-01-10T08:30:00Z"
    }
  ]
}
```

**:Status Codes**
- 200: Successful retrieval of properties
- 401: Missing or invalid authentication token
- 403: User not authorized (not admin or owner)
- 500: Internal server error

**Section sources**
- [index.ts](file://src/worker/index.ts#L887-L900)
- [types.ts](file://src/shared/types.ts#L0-L199)

### GET /api/admin/bookings
Retrieves a list of all bookings with search capabilities.

**:HTTP Method**
- GET

**:URL Pattern**
- /api/admin/bookings

**:Authentication**
- Required: JWT with admin privileges
- Role verification: User email must contain 'admin' or 'owner'

**:Rate Limiting**
- 100 requests per 10 minutes

**:Request Parameters**
- None

**:Response Schema**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": "user_123",
      "property_id": 1,
      "guest_name": "Ahmed Al-Saud",
      "guest_email": "ahmed@example.com",
      "guest_phone": "+966501234567",
      "check_in_date": "2024-02-15",
      "check_out_date": "2024-02-20",
      "total_guests": 2,
      "total_amount": 7500,
      "status": "confirmed",
      "payment_status": "completed",
      "payment_id": "pay_789",
      "special_requests": "Late check-in after 8 PM",
      "created_at": "2024-01-05T14:20:00Z",
      "updated_at": "2024-01-05T14:20:00Z"
    }
  ]
}
```

**:Status Codes**
- 200: Successful retrieval of bookings
- 401: Missing or invalid authentication token
- 403: User not authorized (not admin or owner)
- 500: Internal server error

**Section sources**
- [index.ts](file://src/worker/index.ts#L902-L913)
- [types.ts](file://src/shared/types.ts#L0-L199)

### PUT /api/admin/bookings/:bookingId/status
Updates the status of a booking across all users.

**:HTTP Method**
- PUT

**:URL Pattern**
- /api/admin/bookings/:bookingId/status

**:Path Parameters**
- **bookingId**: number - The ID of the booking to update

**:Authentication**
- Required: JWT with admin privileges
- Role verification: User email must contain 'admin' or 'owner'

**:Request Parameters**
- Body (JSON):
  - **status**: string - The new status for the booking (e.g., "pending", "confirmed", "cancelled", "completed")

**:Request Example**
```json
{
  "status": "confirmed"
}
```

**:Response Schema**
```json
{
  "success": true,
  "message": "Booking status updated"
}
```

**:Status Codes**
- 200: Booking status successfully updated
- 400: Invalid request body
- 401: Missing or invalid authentication token
- 403: User not authorized (not admin or owner)
- 404: Booking not found
- 500: Internal server error

**Section sources**
- [index.ts](file://src/worker/index.ts#L955-L975)
- [AdminDashboard.tsx](file://src/react-app/pages/AdminDashboard.tsx#L0-L578)

## Data Structures
The admin endpoints use several key data structures defined in the shared types file.

**:AdminStats Interface**
```typescript
interface AdminStats {
  total_users: number;
  total_properties: number;
  total_bookings: number;
  total_revenue: number;
  pending_bookings: number;
  active_properties: number;
  monthly_growth: number;
  occupancy_rate: number;
}
```

**:AdminSetting Interface**
```typescript
interface AdminSetting {
  id: number;
  key: string;
  value: string | null;
  created_at: string;
  updated_at: string;
}
```

**:ApiResponse Interface**
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

**:Property Interface**
```typescript
interface Property {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  location: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: string | null;
  images: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

**:Booking Interface**
```typescript
interface Booking {
  id: number;
  user_id: string;
  property_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  check_in_date: string;
  check_out_date: string;
  total_guests: number;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_id: string | null;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
}
```

**Section sources**
- [types.ts](file://src/shared/types.ts#L0-L599)
- [AdminDashboard.tsx](file://src/react-app/pages/AdminDashboard.tsx#L0-L578)

## Rate Limiting and Audit Logging
All admin endpoints implement rate limiting and audit logging for security and abuse prevention.

**:Rate Limiting**
- GET /api/admin/properties and GET /api/admin/bookings: 100 requests per 10 minutes
- GET /api/admin/settings: 50 requests per 10 minutes
- Other admin endpoints: Default rate limiting applies

**:Audit Logging**
The system logs all authentication attempts and admin actions for security monitoring:

- **MISSING_AUTH_TOKEN**: When no Authorization header is present
- **INVALID_AUTH_TOKEN**: When the token is malformed or expired
- **AUTHENTICATED_ACCESS**: When a user successfully authenticates
- All admin actions are logged with user ID, IP address, action type, resource, and success status

```mermaid
flowchart TD
A[Incoming Request] --> B{Has Authorization Header?}
B --> |No| C[Log MISSING_AUTH_TOKEN]
C --> D[Return 401]
B --> |Yes| E{Valid Bearer Token?}
E --> |No| F[Log INVALID_AUTH_TOKEN]
F --> G[Return 401]
E --> |Yes| H[Verify JWT Signature]
H --> I{Valid Token?}
I --> |No| J[Log INVALID_AUTH_TOKEN]
J --> K[Return 401]
I --> |Yes| L[Extract User Payload]
L --> M[Set User Context]
M --> N[Log AUTHENTICATED_ACCESS]
N --> O[Proceed to Route Handler]
```

**Diagram sources**
- [security-middleware.ts](file://src/shared/security-middleware.ts#L66-L114)
- [auth.ts](file://src/server/utils/auth.ts#L0-L395)

**Section sources**
- [security-middleware.ts](file://src/shared/security-middleware.ts#L66-L114)
- [index.ts](file://src/worker/index.ts#L878-L1077)

## Frontend Integration
The AdminDashboard component consumes the admin endpoints to display platform analytics and management interfaces.

**:Data Flow**
1. On component mount, check user authentication and admin privileges
2. Fetch admin data from multiple endpoints in parallel:
   - GET /api/admin/stats
   - GET /api/admin/properties
   - GET /api/admin/bookings
3. Display data in tabbed interface with overview, properties, bookings, users, AI configuration, and settings tabs
4. Enable property status updates via PUT /api/admin/properties/:id/status
5. Enable booking status updates via PUT /api/admin/bookings/:id/status

**:Admin Check**
The frontend implements a simple admin check by verifying that the user's email contains 'admin' or 'owner'. In production, this would be replaced with proper role-based access control.

```mermaid
sequenceDiagram
participant Dashboard
participant API
participant User
Dashboard->>Dashboard : Component Mount
Dashboard->>Dashboard : Check user authentication
alt User not authenticated
Dashboard->>User : Redirect to login
else User authenticated
Dashboard->>Dashboard : Check admin privileges (email contains 'admin' or 'owner')
alt Not admin
Dashboard->>User : Redirect to dashboard
else Is admin
Dashboard->>API : GET /api/admin/stats
Dashboard->>API : GET /api/admin/properties
Dashboard->>API : GET /api/admin/bookings
API-->>Dashboard : Return stats data
API-->>Dashboard : Return properties data
API-->>Dashboard : Return bookings data
Dashboard->>Dashboard : Update state with received data
Dashboard->>User : Display admin dashboard
end
end
```

**Diagram sources**
- [AdminDashboard.tsx](file://src/react-app/pages/AdminDashboard.tsx#L0-L578)

**Section sources**
- [AdminDashboard.tsx](file://src/react-app/pages/AdminDashboard.tsx#L0-L578)

## Database Schema
The admin functionality relies on several database tables created in the migration files.

**:admin_settings Table**
Stores platform configuration settings with key-value pairs.

```sql
CREATE TABLE admin_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**:properties Table**
Stores property listings with details about location, pricing, and availability.

```sql
CREATE TABLE properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  price_per_night REAL NOT NULL,
  max_guests INTEGER NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  amenities TEXT,
  images TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**:bookings Table**
Stores booking information including guest details, dates, and status.

```sql
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  property_id INTEGER NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  total_guests INTEGER NOT NULL,
  total_amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_id TEXT,
  special_requests TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);
```

**:analytics Table**
Stores platform analytics data for reporting and dashboard displays.

```sql
CREATE TABLE analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name TEXT NOT NULL,
  metric_value REAL NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Section sources**
- [1.sql](file://migrations/1.sql)
- [2.sql](file://migrations/2.sql)
- [3.sql](file://migrations/3.sql)
- [4.sql](file://migrations/4.sql)
- [5.sql](file://migrations/5.sql)
- [6.sql](file://migrations/6.sql)
- [7.sql](file://migrations/7.sql)

## Error Handling
The admin endpoints implement consistent error handling with standardized response formats.

**:Error Response Schema**
```json
{
  "success": false,
  "error": "Error description",
  "message": "Human-readable message"
}
```

**:Common Error Types**
- **Authentication Errors**: 401 Unauthorized for missing or invalid tokens
- **Authorization Errors**: 403 Forbidden for users without admin privileges
- **Validation Errors**: 400 Bad Request for invalid request parameters
- **Not Found Errors**: 404 Not Found for non-existent resources
- **Server Errors**: 500 Internal Server Error for unexpected server issues

**:Error Handling Flow**
```mermaid
flowchart TD
A[Incoming Request] --> B[Authentication Check]
B --> |Failed| C[Return 401 with error]
B --> |Success| D[Authorization Check]
D --> |Failed| E[Return 403 with error]
D --> |Success| F[Business Logic Execution]
F --> |Success| G[Return 200 with data]
F --> |Validation Error| H[Return 400 with error]
F --> |Resource Not Found| I[Return 404 with error]
F --> |Server Error| J[Return 500 with error]
```

**Diagram sources**
- [index.ts](file://src/worker/index.ts#L878-L1077)
- [security-middleware.ts](file://src/shared/security-middleware.ts#L66-L114)

**Section sources**
- [index.ts](file://src/worker/index.ts#L878-L1077)
- [security-middleware.ts](file://src/shared/security-middleware.ts#L66-L114)

## Example Usage

**:Retrieve Platform Statistics**
```bash
curl -X GET "https://habibistay.com/api/admin/stats" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**:Update Booking Status**
```bash
curl -X PUT "https://habibistay.com/api/admin/bookings/123/status" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

**:Update Platform Setting**
```bash
curl -X POST "https://habibistay.com/api/admin/settings" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"key": "booking_commission", "value": "12"}'
```

**:Retrieve All Properties**
```bash
curl -X GET "https://habibistay.com/api/admin/properties" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**:Retrieve All Bookings**
```bash
curl -X GET "https://habibistay.com/api/admin/bookings" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Section sources**
- [index.ts](file://src/worker/index.ts#L878-L1077)
- [AdminDashboard.tsx](file://src/react-app/pages/AdminDashboard.tsx#L0-L578)