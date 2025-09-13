# Property Endpoints

<cite>
**Referenced Files in This Document**   
- [worker/index.ts](file://src/worker/index.ts)
- [server/services/PropertyService.ts](file://src/server/services/PropertyService.ts)
- [shared/types.ts](file://src/shared/types.ts)
- [migrations/1.sql](file://migrations/1.sql)
- [migrations/2.sql](file://migrations/2.sql)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Property Endpoints Overview](#property-endpoints-overview)
3. [GET /properties - Retrieve All Properties](#get-properties---retrieve-all-properties)
4. [POST /properties - Create New Property](#post-properties---create-new-property)
5. [GET /properties/:id - Fetch Property by ID](#get-propertiesid---fetch-property-by-id)
6. [PUT /properties/:id - Update Property](#put-propertiesid---update-property)
7. [DELETE /properties/:id - Remove Property](#delete-propertiesid---remove-property)
8. [Authentication and Authorization](#authentication-and-authorization)
9. [Data Validation with Zod](#data-validation-with-zod)
10. [Error Handling](#error-handling)
11. [Example Requests and Responses](#example-requests-and-responses)
12. [Property Type Definition](#property-type-definition)
13. [Database Schema](#database-schema)
14. [Sequence Diagrams](#sequence-diagrams)

## Introduction
This document provides comprehensive RESTful API documentation for all property-related endpoints in HabibiStay, a premium short-term rental platform. The API enables users to manage property listings, including creating, retrieving, updating, and deleting properties. The documentation covers all endpoints with detailed information about request parameters, response schemas, authentication requirements, and error handling. The system uses Google OAuth for authentication and JWT validation for secure access to protected endpoints.

## Property Endpoints Overview
The HabibiStay property API provides a complete set of CRUD operations for managing property listings. The endpoints support filtering, searching, and pagination for retrieving properties, with role-based access control for creation, update, and deletion operations. The API is built using Hono framework with Cloudflare Workers and follows RESTful principles.

```mermaid
graph TD
A[Client] --> B[GET /properties]
A --> C[POST /properties]
A --> D[GET /properties/:id]
A --> E[PUT /properties/:id]
A --> F[DELETE /properties/:id]
B --> G[PropertyService.searchProperties]
C --> H[PropertyService.createProperty]
D --> I[PropertyService.getPropertyById]
E --> J[PropertyService.updateProperty]
F --> K[PropertyService.deleteProperty]
G --> L[Database Query]
H --> M[Database Insert]
I --> N[Database Query]
J --> O[Database Update]
K --> P[Database Soft Delete]
```

**Diagram sources**
- [worker/index.ts](file://src/worker/index.ts#L200-L400)
- [server/services/PropertyService.ts](file://src/server/services/PropertyService.ts#L34-L605)

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L200-L2442)
- [server/services/PropertyService.ts](file://src/server/services/PropertyService.ts#L34-L605)

## GET /properties - Retrieve All Properties
Retrieves a paginated list of properties with optional filtering and sorting capabilities.

### Endpoint Details
- **HTTP Method**: GET
- **URL Pattern**: `/api/properties`
- **Authentication Required**: No (public endpoint)
- **Rate Limiting**: 200 requests per minute

### Request Parameters
#### Query Parameters
| Parameter | Type | Required | Description |
|---------|------|----------|-------------|
| `location` | string | No | Filter properties by location (city, neighborhood, or address) |
| `guests` | number | No | Filter properties that can accommodate at least this many guests |
| `min_price` | number | No | Minimum price per night (SAR) |
| `max_price` | number | No | Maximum price per night (SAR) |
| `amenities` | string[] | No | Filter properties that have all specified amenities |
| `bedrooms` | number | No | Minimum number of bedrooms |
| `bathrooms` | number | No | Minimum number of bathrooms |
| `rating` | number | No | Minimum average rating (1-5) |
| `sort_by` | string | No | Sort order: `price_asc`, `price_desc`, `rating`, `newest`, `featured` |
| `page` | number | No | Page number for pagination (default: 1) |
| `limit` | number | No | Number of results per page (default: 20, max: 100) |

### Response Schema
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Luxury Villa in Riyadh",
      "description": "Beautiful modern villa with private pool",
      "location": "Riyadh, Saudi Arabia",
      "price_per_night": 500,
      "max_guests": 8,
      "bedrooms": 4,
      "bathrooms": 3,
      "amenities": ["wifi", "pool", "parking", "ac"],
      "images": ["https://example.com/image1.jpg"],
      "is_featured": true,
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "avg_rating": 4.8,
      "review_count": 24
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Status Codes
- **200 OK**: Successfully retrieved properties
- **400 Bad Request**: Invalid query parameters
- **500 Internal Server Error**: Server error during processing

### Example Request
```bash
curl -X GET "http://localhost/api/properties?location=Riyadh&min_price=300&max_price=800&guests=4&amenities=wifi,pool&sort_by=price_asc&page=1&limit=10"
```

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L200-L240)

## POST /properties - Create New Property
Creates a new property listing. Requires authentication and appropriate user role.

### Endpoint Details
- **HTTP Method**: POST
- **URL Pattern**: `/api/properties`
- **Authentication Required**: Yes
- **Authorization Roles**: `host` or `admin`
- **Rate Limiting**: 10 requests per minute

### Request Parameters
#### Headers
- `Authorization: Bearer <token>` - JWT token from Google OAuth
- `Content-Type: application/json`

#### Request Body
The request body must contain a Property object with the following required fields:

| Field | Type | Required | Validation |
|------|------|----------|-----------|
| `title` | string | Yes | Minimum 5 characters |
| `description` | string | Yes | Minimum 20 characters |
| `location` | string | Yes | Minimum 3 characters |
| `property_type` | string | Yes | Valid property type |
| `max_guests` | number | Yes | Between 1 and 20 |
| `price_per_night` | number | Yes | Between 10 and 10000 SAR |
| `bedrooms` | number | No | Positive integer |
| `bathrooms` | number | No | Positive integer |
| `amenities` | string[] | No | Array of valid amenities |
| `images` | string[] | No | Array of image URLs |

### Response Schema
```json
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "id": 123,
    "title": "New Property Title",
    "description": "Property description",
    "location": "Riyadh, Saudi Arabia",
    "price_per_night": 300,
    "max_guests": 4,
    "bedrooms": 2,
    "bathrooms": 2,
    "amenities": ["wifi", "parking"],
    "images": ["image1.jpg", "image2.jpg"],
    "is_featured": false,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Status Codes
- **201 Created**: Property successfully created
- **400 Bad Request**: Invalid request body or validation errors
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User lacks required role
- **500 Internal Server Error**: Server error during creation

### Example Request
```bash
curl -X POST "http://localhost/api/properties" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Modern Apartment in Downtown",
    "description": "Beautiful 2-bedroom apartment with city views",
    "location": "Downtown Riyadh",
    "property_type": "apartment",
    "max_guests": 4,
    "price_per_night": 400,
    "bedrooms": 2,
    "bathrooms": 2,
    "amenities": ["wifi", "parking", "ac", "tv"],
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
  }'
```

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L400-L430)
- [server/services/PropertyService.ts](file://src/server/services/PropertyService.ts#L34-L60)

## GET /properties/:id - Fetch Property by ID
Retrieves detailed information about a specific property by its ID.

### Endpoint Details
- **HTTP Method**: GET
- **URL Pattern**: `/api/properties/:id`
- **Authentication Required**: No (public endpoint)
- **Rate Limiting**: 200 requests per minute

### Request Parameters
#### Path Parameters
| Parameter | Type | Required | Description |
|---------|------|----------|-------------|
| `id` | number | Yes | The unique identifier of the property |

### Response Schema
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Luxury Villa in Riyadh",
    "description": "Beautiful modern villa with private pool",
    "location": "Riyadh, Saudi Arabia",
    "price_per_night": 500,
    "max_guests": 8,
    "bedrooms": 4,
    "bathrooms": 3,
    "amenities": ["wifi", "pool", "parking", "ac"],
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "is_featured": true,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "owner_name": "Ahmed Al-Saud",
    "owner_email": "ahmed@example.com",
    "rating": 4.8,
    "review_count": 24,
    "reviews": [
      {
        "id": 1,
        "user_id": 101,
        "rating": 5,
        "comment": "Amazing stay! Highly recommended.",
        "reviewer_name": "Sarah Johnson",
        "created_at": "2024-01-10T14:30:00Z"
      }
    ]
  }
}
```

### Status Codes
- **200 OK**: Successfully retrieved property
- **404 Not Found**: Property with specified ID does not exist
- **500 Internal Server Error**: Server error during retrieval

### Example Request
```bash
curl -X GET "http://localhost/api/properties/1"
```

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L349-L399)

## PUT /properties/:id - Update Property
Updates an existing property listing. Requires authentication and ownership or admin privileges.

### Endpoint Details
- **HTTP Method**: PUT
- **URL Pattern**: `/api/properties/:id`
- **Authentication Required**: Yes
- **Authorization**: Property owner or admin
- **Rate Limiting**: 10 requests per minute

### Request Parameters
#### Path Parameters
| Parameter | Type | Required | Description |
|---------|------|----------|-------------|
| `id` | number | Yes | The unique identifier of the property to update |

#### Headers
- `Authorization: Bearer <token>` - JWT token from Google OAuth
- `Content-Type: application/json`

#### Request Body
The request body can contain any subset of the following fields to update:

| Field | Type | Validation |
|------|------|-----------|
| `title` | string | Minimum 5 characters |
| `description` | string | Minimum 20 characters |
| `location` | string | Minimum 3 characters |
| `property_type` | string | Valid property type |
| `max_guests` | number | Between 1 and 20 |
| `price_per_night` | number | Between 10 and 10000 SAR |
| `bedrooms` | number | Positive integer |
| `bathrooms` | number | Positive integer |
| `amenities` | string[] | Array of valid amenities |
| `images` | string[] | Array of image URLs |
| `is_active` | boolean | Property availability status |

### Response Schema
```json
{
  "success": true,
  "message": "Property updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Property Title",
    "description": "Updated property description",
    "location": "Riyadh, Saudi Arabia",
    "price_per_night": 450,
    "max_guests": 6,
    "bedrooms": 3,
    "bathrooms": 2,
    "amenities": ["wifi", "pool", "parking", "ac", "gym"],
    "images": ["https://example.com/image1.jpg", "https://example.com/image3.jpg"],
    "is_featured": true,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-16T15:45:00Z",
    "owner_name": "Ahmed Al-Saud",
    "owner_email": "ahmed@example.com",
    "rating": 4.8,
    "review_count": 24
  }
}
```

### Status Codes
- **200 OK**: Property successfully updated
- **400 Bad Request**: Invalid request body or validation errors
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User does not own the property and is not an admin
- **404 Not Found**: Property with specified ID does not exist
- **500 Internal Server Error**: Server error during update

### Example Request
```bash
curl -X PUT "http://localhost/api/properties/1" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Luxury Villa with Pool",
    "price_per_night": 550,
    "amenities": ["wifi", "pool", "parking", "ac", "gym", "bbq"]
  }'
```

**Section sources**
- [server/services/PropertyService.ts](file://src/server/services/PropertyService.ts#L150-L250)

## DELETE /properties/:id - Remove Property
Removes a property listing. Requires authentication and ownership or admin privileges.

### Endpoint Details
- **HTTP Method**: DELETE
- **URL Pattern**: `/api/properties/:id`
- **Authentication Required**: Yes
- **Authorization**: Property owner or admin
- **Rate Limiting**: 5 requests per minute

### Request Parameters
#### Path Parameters
| Parameter | Type | Required | Description |
|---------|------|----------|-------------|
| `id` | number | Yes | The unique identifier of the property to delete |

#### Headers
- `Authorization: Bearer <token>` - JWT token from Google OAuth

### Response Schema
```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

### Status Codes
- **200 OK**: Property successfully deleted (soft delete)
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User does not own the property and is not an admin
- **404 Not Found**: Property with specified ID does not exist
- **409 Conflict**: Cannot delete property with active bookings
- **500 Internal Server Error**: Server error during deletion

### Example Request
```bash
curl -X DELETE "http://localhost/api/properties/1" \
  -H "Authorization: Bearer your-jwt-token"
```

**Section sources**
- [server/services/PropertyService.ts](file://src/server/services/PropertyService.ts#L252-L300)

## Authentication and Authorization
The property API uses Google OAuth for authentication and JWT validation for secure access control.

### Authentication Flow
1. User authenticates with Google OAuth
2. Backend exchanges authorization code for JWT token
3. JWT token is returned to client and stored in secure cookie
4. Client includes JWT token in Authorization header for protected endpoints

### Authorization Rules
| Endpoint | Required Role | Access Control |
|---------|---------------|----------------|
| GET /properties | None | Public access |
| POST /properties | `host` or `admin` | Authenticated users with host or admin role |
| GET /properties/:id | None | Public access |
| PUT /properties/:id | Owner or `admin` | Property owner or admin users |
| DELETE /properties/:id | Owner or `admin` | Property owner or admin users |

```mermaid
sequenceDiagram
participant Client
participant API
participant AuthService
Client->>API : GET /api/properties
API-->>Client : Return public properties
Client->>AuthService : Google OAuth Login
AuthService-->>Client : Authorization Code
Client->>API : POST /api/sessions with code
API->>AuthService : Exchange code for session
AuthService-->>API : JWT Token
API-->>Client : Set cookie with JWT
Client->>API : POST /api/properties with JWT
API->>API : Validate JWT and role
API->>API : Create property
API-->>Client : Property created response
```

**Diagram sources**
- [worker/index.ts](file://src/worker/index.ts#L200-L2442)
- [server/utils/auth.ts](file://src/server/utils/auth.ts)

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L200-L2442)

## Data Validation with Zod
The API uses Zod schemas for comprehensive data validation of request bodies and parameters.

### Property Validation Schema
The `CreatePropertySchema` validates all property creation requests:

```typescript
const CreatePropertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(3, "Location is required"),
  property_type: z.string().min(1, "Property type is required"),
  max_guests: z.number().min(1).max(20),
  price_per_night: z.number().min(10).max(10000),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional(),
  minimum_stay: z.number().min(1).optional(),
  maximum_stay: z.number().min(1).optional(),
  house_rules: z.string().optional(),
  cancellation_policy: z.enum(['flexible', 'moderate', 'strict']).optional(),
});
```

### Validation Process
1. Request body is validated against the Zod schema
2. If validation fails, return 400 with error details
3. If validation passes, sanitize input data
4. Proceed with business logic

**Section sources**
- [shared/types.ts](file://src/shared/types.ts)
- [worker/index.ts](file://src/worker/index.ts#L400-L430)

## Error Handling
The API implements comprehensive error handling with standardized response formats.

### Error Response Schema
```json
{
  "success": false,
  "error": "Descriptive error message",
  "message": "Additional error details (in development mode)"
}
```

### Common Error Codes
| Status Code | Error Message | Cause |
|------------|--------------|------|
| 400 | "Invalid request parameters" | Malformed query parameters |
| 400 | "Invalid property data" | Request body validation failed |
| 401 | "User not authenticated" | Missing or invalid JWT token |
| 403 | "Access denied: You do not own this property" | User trying to modify property they don't own |
| 403 | "Insufficient permissions" | User lacks required role |
| 404 | "Property not found" | No property with specified ID |
| 409 | "Cannot delete property with active bookings" | Property has confirmed or pending bookings |
| 500 | "Internal server error" | Unexpected server error |

### Error Handling Middleware
The API uses a global error handler middleware that:
- Catches all unhandled exceptions
- Logs errors to console
- Returns consistent error responses
- Prevents sensitive information leakage in production

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L180-L200)

## Example Requests and Responses
This section provides complete examples of API requests and responses.

### Retrieve All Properties with Filtering
**Request**
```bash
curl -X GET "http://localhost/api/properties?location=Riyadh&min_price=300&max_price=800&guests=4&amenities=wifi,pool&sort_by=price_asc&page=1&limit=5"
```

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "title": "Modern Apartment with Pool",
      "description": "Beautiful 2-bedroom apartment with access to shared pool",
      "location": "Riyadh, Saudi Arabia",
      "price_per_night": 350,
      "max_guests": 4,
      "bedrooms": 2,
      "bathrooms": 2,
      "amenities": ["wifi", "pool", "parking", "ac"],
      "images": ["https://example.com/apartment1.jpg"],
      "is_featured": false,
      "is_active": true,
      "created_at": "2024-01-14T09:15:00Z",
      "updated_at": "2024-01-14T09:15:00Z",
      "avg_rating": 4.6,
      "review_count": 18
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 12,
    "totalPages": 3
  }
}
```

### Create a New Property
**Request**
```bash
curl -X POST "http://localhost/api/properties" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Luxury Villa in Al Olaya",
    "description": "Spacious 5-bedroom villa with private garden and pool",
    "location": "Al Olaya, Riyadh",
    "property_type": "villa",
    "max_guests": 10,
    "price_per_night": 800,
    "bedrooms": 5,
    "bathrooms": 4,
    "amenities": ["wifi", "pool", "parking", "ac", "gym", "bbq", "smart_home"],
    "images": [
      "https://example.com/villa1.jpg",
      "https://example.com/villa2.jpg",
      "https://example.com/villa3.jpg"
    ],
    "cancellation_policy": "moderate"
  }'
```

**Response**
```json
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "id": 124,
    "title": "Luxury Villa in Al Olaya",
    "description": "Spacious 5-bedroom villa with private garden and pool",
    "location": "Al Olaya, Riyadh",
    "property_type": "villa",
    "max_guests": 10,
    "price_per_night": 800,
    "bedrooms": 5,
    "bathrooms": 4,
    "amenities": ["wifi", "pool", "parking", "ac", "gym", "bbq", "smart_home"],
    "images": [
      "https://example.com/villa1.jpg",
      "https://example.com/villa2.jpg",
      "https://example.com/villa3.jpg"
    ],
    "is_featured": false,
    "is_active": true,
    "created_at": "2024-01-16T11:20:00Z",
    "updated_at": "2024-01-16T11:20:00Z"
  }
}
```

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L200-L430)

## Property Type Definition
The Property type is defined in the shared types file and used across the application.

### TypeScript Interface
```typescript
interface Property {
  id: number;
  title: string;
  description: string;
  location: string;
  property_type: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  price_per_night: number;
  amenities: string[];
  images: string[];
  is_featured: boolean;
  is_active: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
  view_count?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  check_in_time?: string;
  check_out_time?: string;
  minimum_stay?: number;
  maximum_stay?: number;
  house_rules?: string;
  cancellation_policy?: string;
  owner_name?: string;
  owner_email?: string;
  rating?: number;
  review_count?: number;
}
```

### Property Search Result
```typescript
interface PropertySearchResult {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

**Section sources**
- [shared/types.ts](file://src/shared/types.ts)

## Database Schema
The property data is stored in a SQLite database with the following schema.

### Properties Table
```sql
CREATE TABLE properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  property_type TEXT NOT NULL,
  max_guests INTEGER NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  price_per_night REAL NOT NULL,
  amenities TEXT, -- JSON array
  images TEXT, -- JSON array
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  latitude REAL,
  longitude REAL,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  check_in_time TEXT DEFAULT '15:00',
  check_out_time TEXT DEFAULT '11:00',
  minimum_stay INTEGER DEFAULT 1,
  maximum_stay INTEGER DEFAULT 30,
  house_rules TEXT,
  cancellation_policy TEXT DEFAULT 'flexible'
);
```

### Indexes
```sql
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_price ON properties(price_per_night);
CREATE INDEX idx_properties_active ON properties(is_active);
CREATE INDEX idx_properties_featured ON properties(is_featured);
CREATE INDEX idx_properties_owner ON properties(owner_id);
```

**Section sources**
- [migrations/1.sql](file://migrations/1.sql)
- [migrations/2.sql](file://migrations/2.sql)

## Sequence Diagrams
This section shows the sequence of operations for key property management workflows.

### Property Creation Sequence
```mermaid
sequenceDiagram
participant Client
participant API
participant PropertyService
participant Database
Client->>API : POST /api/properties with data
API->>API : Validate JWT and role
API->>API : Validate request with Zod
API->>PropertyService : createProperty(data, ownerId)
PropertyService->>PropertyService : Sanitize input data
PropertyService->>PropertyService : Validate property data
PropertyService->>Database : INSERT INTO properties
Database-->>PropertyService : Success
PropertyService->>PropertyService : Log property action
PropertyService->>PropertyService : Get created property
PropertyService-->>API : Return property
API-->>Client : 201 Created with property data
```

**Diagram sources**
- [worker/index.ts](file://src/worker/index.ts#L400-L430)
- [server/services/PropertyService.ts](file://src/server/services/PropertyService.ts#L34-L60)

### Property Update Sequence
```mermaid
sequenceDiagram
participant Client
participant API
participant PropertyService
participant Database
Client->>API : PUT /api/properties/123 with data
API->>API : Validate JWT
API->>PropertyService : updateProperty(123, data, userId)
PropertyService->>PropertyService : Validate ownership
PropertyService->>PropertyService : Sanitize input data
PropertyService->>Database : UPDATE properties SET ...
Database-->>PropertyService : Success
PropertyService->>PropertyService : Log property action
PropertyService->>PropertyService : Get updated property
PropertyService-->>API : Return updated property
API-->>Client : 200 OK with updated property
```

**Diagram sources**
- [worker/index.ts](file://src/worker/index.ts#L400-L600)
- [server/services/PropertyService.ts](file://src/server/services/PropertyService.ts#L150-L250)

### Property Deletion Sequence
```mermaid
sequenceDiagram
participant Client
participant API
participant PropertyService
participant Database
Client->>API : DELETE /api/properties/123
API->>API : Validate JWT
API->>PropertyService : deleteProperty(123, userId)
PropertyService->>PropertyService : Validate ownership
PropertyService->>Database : SELECT COUNT(*) FROM bookings WHERE property_id = 123 AND status IN ('confirmed', 'pending')
Database-->>PropertyService : Return booking count
alt Has active bookings
PropertyService-->>API : Throw error "Cannot delete property with active bookings"
API-->>Client : 409 Conflict
else No active bookings
PropertyService->>Database : UPDATE properties SET is_active = false WHERE id = 123
Database-->>PropertyService : Success
PropertyService->>PropertyService : Log property action
PropertyService-->>API : Success
API-->>Client : 200 OK
end
```

**Diagram sources**
- [worker/index.ts](file://src/worker/index.ts#L1000-L1200)
- [server/services/PropertyService.ts](file://src/server/services/PropertyService.ts#L252-L300)