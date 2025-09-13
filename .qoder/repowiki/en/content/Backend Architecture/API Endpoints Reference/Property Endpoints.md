# Property Endpoints

<cite>
**Referenced Files in This Document**   
- [worker/index.ts](file://src/worker/index.ts)
- [server/services/PropertyService.ts](file://src/server/services/PropertyService.ts)
- [shared/types.ts](file://src/shared/types.ts)
- [react-app/pages/PropertyDetail.tsx](file://src/react-app/pages/PropertyDetail.tsx)
- [react-app/components/PropertyCard.tsx](file://src/react-app/components/PropertyCard.tsx)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Property Endpoints Overview](#property-endpoints-overview)
3. [GET /api/properties - List Properties](#get-apiproperties---list-properties)
4. [GET /api/properties/:id - Retrieve Single Property](#get-apipropertiesid---retrieve-single-property)
5. [POST /api/properties - Create Property](#post-apiproperties---create-property)
6. [PUT /api/properties/:id - Update Property](#put-apipropertiesid---update-property)
7. [DELETE /api/properties/:id - Delete Property](#delete-apipropertiesid---delete-property)
8. [Property Availability Check](#property-availability-check)
9. [Property Analytics](#property-analytics)
10. [Response Schema](#response-schema)
11. [Authentication and Authorization](#authentication-and-authorization)
12. [Error Handling](#error-handling)
13. [Frontend Integration](#frontend-integration)
14. [Example Usage](#example-usage)

## Introduction
This document provides comprehensive documentation for all property-related endpoints in the HabibiStay backend. The API enables users to list, retrieve, create, update, and delete property listings with robust filtering, authentication, and validation mechanisms. The endpoints support real-time availability checks, analytics tracking, and role-based access control to ensure secure and efficient property management.

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1-L50)
- [server/services/PropertyService.ts](file://src/server/services/PropertyService.ts#L1-L50)

## Property Endpoints Overview
The HabibiStay backend exposes a comprehensive set of RESTful API endpoints for property management. These endpoints support CRUD operations with advanced filtering, authentication, and authorization. The API is built using Hono framework with Cloudflare Workers and follows REST conventions with JSON responses.

The property system includes features such as:
- Property listing with filtering by location, price, dates, and amenities
- Real-time availability checking
- Role-based access control (owner/admin for create/edit/delete)
- JWT authentication via Google OAuth
- Zod validation for input data
- Analytics tracking for views and bookings
- Soft deletion to preserve booking history

```mermaid
graph TB
A[Client] --> B[API Gateway]
B --> C[Authentication]
C --> D[Property Endpoints]
D --> E[Property Service]
E --> F[Database]
D --> G[Analytics Service]
D --> H[Validation]
C --> I[Google OAuth]
G --> J[Analytics Database]
```

**Diagram sources**
- [worker/index.ts](file://src/worker/index.ts#L1-L2444)
- [server/services/PropertyService.ts](file://src/server/services/PropertyService.ts#L1-L605)

## GET /api/properties - List Properties
Retrieves a paginated list of properties with optional filtering by location, price range, guest count, and other criteria.

### Endpoint
```
GET /api/properties
```

### Query Parameters
| Parameter | Type | Required | Description |
|---------|------|--------|------------|
| `location` | string | No | Filter properties by location (city, neighborhood, or region) |
| `guests` | number | No | Minimum number of guests the property can accommodate |
| `min_price` | number | No | Minimum price per night (SAR) |
| `max_price` | number | No | Maximum price per night (SAR) |
| `amenities` | string[] | No | Filter by amenities (comma-separated values: wifi, parking, pool, etc.) |
| `bedrooms` | number | No | Minimum number of bedrooms |
| `bathrooms` | number | No | Minimum number of bathrooms |
| `rating` | number | No | Minimum average rating (1-5) |
| `sort_by` | string | No | Sort order: price_asc, price_desc, rating, newest, featured |
| `page` | number | No | Page number for pagination (default: 1) |
| `limit` | number | No | Number of results per page (default: 20, max: 100) |

### Response
Returns a JSON object with success status, property data, and pagination information.

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L200-L349)
- [server/services/PropertyService.ts](file://src/server/services/PropertyService.ts#L150-L350)

## GET /api/properties/:id - Retrieve Single Property
Retrieves detailed information about a specific property including availability, reviews, and analytics.

### Endpoint
```
GET /api/properties/:id
```

### Path Parameters
| Parameter | Type | Description |
|---------|------|------------|
| `id` | number | Unique identifier of the property |

### Response
Returns a JSON object with property details, reviews, and increments the view count for analytics.

### Implementation Details
The endpoint performs the following operations:
1. Fetches property details with average rating and review count
2. Retrieves recent reviews with reviewer information
3. Tracks property view for analytics
4. Returns combined property data

```mermaid
sequenceDiagram
participant Client
participant API
participant Database
participant Analytics
Client->>API : GET /api/properties/123
API->>Database : SELECT property with rating
Database-->>API : Property data
API->>Database : SELECT recent reviews
Database-->>API : Review data
API->>Analytics : Track property view
Analytics-->>API : Success
API-->>Client : Property with reviews
```

**Diagram sources**
- [worker/index.ts](file://src/worker/index.ts#L350-L400)
- [server/services/PropertyService.ts](file://src/server/services/PropertyService.ts#L50-L150)

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L350-L400)
- [server/services/PropertyService.ts](file://src/server/services/PropertyService.ts#L50-L150)

## POST /api/properties - Create Property
Creates a new property listing. Requires authentication and owner/admin role.

### Endpoint
```
POST /api/properties
```

### Request Headers
| Header | Value | Required |
|-------|-------|--------|
| `Authorization` | Bearer {token} | Yes |
| `Content-Type` | application/json | Yes |

### Request Body
JSON object containing property details:

| Field | Type | Required | Validation |
|------|------|--------|-----------|
| `title` | string | Yes | Minimum 5 characters |
| `description` | string | Yes | Minimum 20 characters |
| `location` | string | Yes | Minimum 3 characters |
| `property_type` | string | Yes | Not empty |
| `max_guests` | number | Yes | 1-20 guests |
| `price_per_night` | number | Yes | 10-10000 SAR |
| `bedrooms` | number | No | Positive integer |
| `bathrooms` | number | No | Positive integer |
| `amenities` | string[] | No | Array of amenity strings |
| `images` | string[] | No | Array of image URLs |
| `check_in_time` | string | No | HH:MM format |
| `check_out_time` | string | No | HH:MM format |
| `minimum_stay` | number | No | Minimum nights |
| `maximum_stay` | number | No | Maximum nights |
| `house_rules` | string | No | Text description |
| `cancellation_policy` | string | No | flexible, moderate, strict |

### Response
Returns success status and confirmation message.

### Implementation Details
The endpoint validates user authentication and role, sanitizes input data, and inserts the property into the database.

```mermaid
sequenceDiagram
participant Client
participant API
participant Auth
participant Database
participant Service
Client->>API : POST /api/properties
API->>Auth : Verify JWT token
Auth-->>API : User data
API->>Service : Validate property data
Service-->>API : Validation result
API->>Database : INSERT property
Database-->>API : Success
API-->>Client : Success response
```

**Diagram sources**
- [worker/index.ts](file://src/worker/index.ts#L400-L450)
- [server/services/PropertyService.ts](file://src/server/services/PropertyService.ts#L34-L100)

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L400-L450)
- [server/services/PropertyService.ts](file://src/server/services/PropertyService.ts#L34-L100)

## PUT /api/properties/:id - Update Property
Updates an existing property listing. Requires authentication and ownership/admin role.

### Endpoint
```
PUT /api/properties/:id
```

### Path Parameters
| Parameter | Type | Description |
|---------|------|------------|
| `id` | number | Unique identifier of the property |

### Request Headers
| Header | Value | Required |
|-------|-------|--------|
| `Authorization` | Bearer {token} | Yes |
| `Content-Type` | application/json | Yes |

### Request Body
JSON object with properties to update (any combination of the fields listed in POST endpoint).

### Response
Returns the updated property object with success status.

### Implementation Details
The endpoint verifies property ownership, sanitizes input data, builds a dynamic update query, and returns the updated property.

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L450-L500)
- [server/services/PropertyService.ts](file://src/server/services/PropertyService.ts#L100-L200)

## DELETE /api/properties/:id - Delete Property
Deletes a property listing. Requires authentication and ownership/admin role.

### Endpoint
```
DELETE /api/properties/:id
```

### Path Parameters
| Parameter | Type | Description |
|---------|------|------------|
| `id` | number | Unique identifier of the property |

### Request Headers
| Header | Value | Required |
|-------|-------|--------|
| `Authorization` | Bearer {token} | Yes |

### Response
Returns success status and confirmation message.

### Implementation Details
The endpoint performs soft deletion by setting `is_active = false` rather than removing the record, preserving booking history.

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L500-L550)
- [server/services/PropertyService.ts](file://src/server/services/PropertyService.ts#L200-L250)

## Property Availability Check
Checks real-time availability for a property during specified dates.

### Endpoint
```
GET /api/properties/:id/availability
```

### Path Parameters
| Parameter | Type | Description |
|---------|------|------------|
| `id` | number | Unique identifier of the property |

### Query Parameters
| Parameter | Type | Required | Description |
|---------|------|--------|------------|
| `check_in` | string | Yes | Check-in date (YYYY-MM-DD) |
| `check_out` | string | Yes | Check-out date (YYYY-MM-DD) |

### Response
Returns availability status and any conflicting booking ID.

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1400-L1450)

## Property Analytics
Retrieves analytics data for a property. Accessible only to property owners and admins.

### Endpoint
```
GET /api/properties/:id/analytics
```

### Path Parameters
| Parameter | Type | Description |
|---------|------|------------|
| `id` | number | Unique identifier of the property |

### Response
Returns daily analytics for the last 30 days and summary statistics.

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1180-L1250)

## Response Schema
All API responses follow a consistent schema:

```json
{
  "success": boolean,
  "data": object | array | null,
  "error": string | null,
  "message": string | null
}
```

### Property Object Schema
```json
{
  "id": 123,
  "title": "Luxury Apartment in Riyadh",
  "description": "Beautiful 2-bedroom apartment with city views",
  "location": "Riyadh, Saudi Arabia",
  "property_type": "apartment",
  "max_guests": 4,
  "bedrooms": 2,
  "bathrooms": 2,
  "price_per_night": 350,
  "amenities": ["wifi", "parking", "pool", "gym"],
  "images": [
    "https://storage.habibistay.com/properties/123/interior.jpg",
    "https://storage.habibistay.com/properties/123/exterior.jpg"
  ],
  "owner_id": "user_123",
  "owner_name": "Ahmed Al-Saud",
  "is_featured": true,
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:45:00Z",
  "avg_rating": 4.8,
  "review_count": 24,
  "view_count": 156,
  "check_in_time": "15:00",
  "check_out_time": "11:00",
  "minimum_stay": 1,
  "maximum_stay": 30,
  "house_rules": "No smoking, no pets",
  "cancellation_policy": "flexible",
  "latitude": 24.7136,
  "longitude": 46.6753,
  "address": "King Fahd Road",
  "city": "Riyadh",
  "country": "Saudi Arabia",
  "postal_code": "12345",
  "reviews": [
    {
      "id": 456,
      "user_id": "user_789",
      "rating": 5,
      "comment": "Excellent stay!",
      "reviewer_name": "Sarah Johnson",
      "created_at": "2024-01-18T09:20:00Z"
    }
  ]
}
```

**Section sources**
- [shared/types.ts](file://src/shared/types.ts#L1-L100)
- [worker/index.ts](file://src/worker/index.ts#L350-L400)

## Authentication and Authorization
The property endpoints implement robust authentication and authorization mechanisms.

### Authentication
- JWT tokens obtained through Google OAuth
- Tokens included in Authorization header: `Bearer {token}`
- Token validation via `authMiddleware`

### Authorization
- **GET endpoints**: Public access
- **POST/PUT/DELETE endpoints**: Require authentication and specific roles
- Role-based access control using `requireRole(['host', 'admin'])`
- Property ownership verification for edit/delete operations

### Security Features
- Rate limiting (1000 requests per 15 minutes)
- Input validation and sanitization
- SQL injection protection
- CORS policy configuration
- Request logging and monitoring

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L118-L172)
- [server/utils/auth.ts](file://src/server/utils/auth.ts#L1-L100)

## Error Handling
The API implements comprehensive error handling with appropriate HTTP status codes.

### Common Error Responses
| Status Code | Error | Description |
|-----------|-------|------------|
| 400 | Validation error | Invalid or missing request data |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions for operation |
| 404 | Not Found | Property with specified ID not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

### Error Response Schema
```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message (development only)"
}
```

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L118-L172)
- [src/test/api-endpoints.test.ts](file://src/test/api-endpoints.test.ts#L514-L559)

## Frontend Integration
The property endpoints are integrated with frontend components for seamless user experience.

### PropertyCard Component
- Displays property thumbnail, title, location, price, and rating
- Links to PropertyDetail page
- Shows featured property badge
- Handles click events for property selection

### PropertyDetail Component
- Displays comprehensive property information
- Shows image gallery
- Renders amenities list
- Displays reviews and ratings
- Integrates booking modal
- Shows availability calendar

```mermaid
graph TB
A[PropertyCard] --> B[API /api/properties]
C[PropertyDetail] --> D[API /api/properties/:id]
C --> E[API /api/properties/:id/availability]
C --> F[API /api/reviews/:propertyId]
G[BookingModal] --> H[API /api/bookings]
```

**Diagram sources**
- [react-app/components/PropertyCard.tsx](file://src/react-app/components/PropertyCard.tsx#L1-L100)
- [react-app/pages/PropertyDetail.tsx](file://src/react-app/pages/PropertyDetail.tsx#L1-L100)

**Section sources**
- [react-app/components/PropertyCard.tsx](file://src/react-app/components/PropertyCard.tsx#L1-L100)
- [react-app/pages/PropertyDetail.tsx](file://src/react-app/pages/PropertyDetail.tsx#L1-L100)

## Example Usage
### Fetch Available Properties in Riyadh
```bash
curl -X GET "https://api.habibistay.com/api/properties?location=Riyadh&guests=2&min_price=200&max_price=500&amenities=wifi,parking&sort_by=price_asc&page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Create a New Property
```bash
curl -X POST "https://api.habibistay.com/api/properties" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Modern Apartment in Downtown Riyadh",
    "description": "Spacious 2-bedroom apartment with stunning city views",
    "location": "Riyadh, Saudi Arabia",
    "property_type": "apartment",
    "max_guests": 4,
    "bedrooms": 2,
    "bathrooms": 2,
    "price_per_night": 300,
    "amenities": ["wifi", "parking", "pool", "gym"],
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "check_in_time": "15:00",
    "check_out_time": "11:00"
  }'
```

### Check Property Availability
```bash
curl -X GET "https://api.habibistay.com/api/properties/123/availability?check_in=2024-02-01&check_out=2024-02-05" \
  -H "Content-Type: application/json"
```

### Sample Response
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": 123,
        "title": "Luxury Apartment in Riyadh",
        "location": "Riyadh, Saudi Arabia",
        "price_per_night": 350,
        "max_guests": 4,
        "bedrooms": 2,
        "bathrooms": 2,
        "amenities": ["wifi", "parking", "pool"],
        "images": ["https://storage.habibistay.com/properties/123/interior.jpg"],
        "avg_rating": 4.8,
        "review_count": 24,
        "is_featured": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  },
  "error": null
}
```

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L200-L400)
- [src/test/api-endpoints.test.ts](file://src/test/api-endpoints.test.ts#L62-L101)