# Properties API

<cite>
**Referenced Files in This Document**   
- [types.ts](file://src/shared/types.ts)
- [index.ts](file://src/worker/index.ts)
</cite>

## Table of Contents
1. [Properties API](#properties-api)
2. [GET /properties](#get-properties)
3. [GET /properties/:id](#get-propertiesid)
4. [POST /properties](#post-properties)
5. [PUT /properties/:id](#put-propertiesid)
6. [DELETE /properties/:id](#delete-propertiesid)
7. [Request Parameters](#request-parameters)
8. [Response Schemas](#response-schemas)
9. [Authentication and Headers](#authentication-and-headers)
10. [Error Responses](#error-responses)
11. [Examples](#examples)

## GET /properties

Retrieves a paginated list of properties with optional filtering and sorting capabilities.

**Endpoint**: `GET /api/properties`

### Query Parameters
The endpoint accepts query parameters based on the `AdvancedPropertySearchSchema` for filtering and pagination:

- **location**: Filter properties by location (partial match)
- **guests**: Minimum number of guests the property can accommodate
- **min_price**: Minimum price per night
- **max_price**: Maximum price per night
- **amenities**: Array of amenities that must be present
- **bedrooms**: Minimum number of bedrooms
- **bathrooms**: Minimum number of bathrooms
- **rating**: Minimum average rating (1-5)
- **sort_by**: Sorting criteria:
  - `price_asc`: Price ascending
  - `price_desc`: Price descending
  - `rating`: By average rating (descending)
  - `newest`: By creation date (newest first)
  - `featured`: Featured properties first
- **page**: Page number (default: 1)
- **limit**: Number of results per page (default: 20, max: 50)

### Response
Returns a paginated response with property data including average rating and review count.

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": "user-123",
      "title": "Luxury Apartment in Riyadh",
      "description": "Modern apartment with city views",
      "location": "Riyadh, Saudi Arabia",
      "price_per_night": 350,
      "max_guests": 4,
      "bedrooms": 2,
      "bathrooms": 2,
      "amenities": "[\"wifi\",\"kitchen\",\"parking\"]",
      "images": "[\"https://example.com/image1.jpg\",\"https://example.com/image2.jpg\"]",
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
    "total": 45,
    "totalPages": 3
  }
}
```

**Section sources**
- [index.ts](file://src/worker/index.ts#L181-L229)

## GET /properties/:id

Retrieves detailed information about a specific property by ID, including its reviews.

**Endpoint**: `GET /api/properties/:id`

### Path Parameters
- **id**: The unique identifier of the property (number)

### Response
Returns detailed property information with embedded reviews.

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": "user-123",
    "title": "Luxury Apartment in Riyadh",
    "description": "Modern apartment with city views",
    "location": "Riyadh, Saudi Arabia",
    "price_per_night": 350,
    "max_guests": 4,
    "bedrooms": 2,
    "bathrooms": 2,
    "amenities": "[\"wifi\",\"kitchen\",\"parking\"]",
    "images": "[\"https://example.com/image1.jpg\",\"https://example.com/image2.jpg\"]",
    "is_featured": true,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "avg_rating": 4.8,
    "review_count": 24,
    "reviews": [
      {
        "id": 1,
        "user_id": "user-456",
        "property_id": 1,
        "booking_id": 101,
        "rating": 5,
        "comment": "Excellent stay!",
        "created_at": "2024-01-20T14:30:00Z",
        "updated_at": "2024-01-20T14:30:00Z",
        "reviewer_name": "Ahmed Ali"
      }
    ]
  }
}
```

**Section sources**
- [index.ts](file://src/worker/index.ts#L315-L365)

## POST /properties

Creates a new property listing. Restricted to authenticated users with admin or owner privileges.

**Endpoint**: `POST /api/properties`

### Authentication
Requires JWT authentication with admin or owner role.

### Request Body
The request body must conform to the `CreatePropertySchema`:

```json
{
  "title": "Luxury Apartment in Riyadh",
  "description": "Modern apartment with city views",
  "location": "Riyadh, Saudi Arabia",
  "price_per_night": 350,
  "max_guests": 4,
  "bedrooms": 2,
  "bathrooms": 2,
  "amenities": ["wifi", "kitchen", "parking"],
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

### Validation Rules
- **title**: Required string (minimum length 1)
- **description**: Optional string
- **location**: Required string (minimum length 1)
- **price_per_night**: Positive number
- **max_guests**: Positive integer
- **bedrooms**: Positive integer (optional)
- **bathrooms**: Positive integer (optional)
- **amenities**: Array of strings (optional)
- **images**: Array of strings (optional)

### Response
```json
{
  "success": true,
  "message": "Property created successfully"
}
```

**Section sources**
- [index.ts](file://src/worker/index.ts#L379-L400)
- [types.ts](file://src/shared/types.ts#L5-L24)

## PUT /properties/:id

Updates an existing property listing. Restricted to property owners, admins, or owners.

**Endpoint**: `PUT /api/properties/:id`

### Path Parameters
- **id**: The unique identifier of the property to update (number)

### Authentication
Requires JWT authentication. The authenticated user must be the property owner, an admin, or have owner privileges.

### Request Body
The request body follows the same structure as POST /properties, with all fields being optional (partial updates allowed):

```json
{
  "title": "Updated Property Title",
  "price_per_night": 375,
  "amenities": ["wifi", "kitchen", "parking", "pool"]
}
```

### Response
```json
{
  "success": true,
  "message": "Property updated successfully"
}
```

**Section sources**
- [index.ts](file://src/worker/index.ts#L777-L976)

## DELETE /properties/:id

Deletes a property listing. Restricted to property owners, admins, or owners.

**Endpoint**: `DELETE /api/properties/:id`

### Path Parameters
- **id**: The unique identifier of the property to delete (number)

### Authentication
Requires JWT authentication. The authenticated user must be the property owner, an admin, or have owner privileges.

### Response
```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

**Section sources**
- [index.ts](file://src/worker/index.ts#L777-L976)

## Request Parameters

### Query Filters (GET /properties)
The GET /properties endpoint supports comprehensive filtering:

- **Location filtering**: Partial match on location field
- **Date availability**: While not directly in the main properties endpoint, availability can be checked via `/api/properties/:id/availability` with `check_in` and `check_out` parameters
- **Guest capacity**: Filter by minimum guest capacity
- **Price range**: Filter by minimum and maximum price per night
- **Amenities**: Filter by one or more required amenities
- **Bedrooms/Bathrooms**: Filter by minimum number of bedrooms and bathrooms
- **Rating**: Filter by minimum average rating

### Path Parameters
- **:id**: Used in GET, PUT, and DELETE operations to specify the target property

### Request Body Structure
Based on the `Property` type from shared types:

- **id**: number
- **user_id**: string
- **title**: string
- **description**: string | null
- **location**: string
- **price_per_night**: number
- **max_guests**: number
- **bedrooms**: number | null
- **bathrooms**: number | null
- **amenities**: string | null (stored as JSON string)
- **images**: string | null (stored as JSON string)
- **is_featured**: boolean
- **is_active**: boolean
- **created_at**: string (ISO date)
- **updated_at**: string (ISO date)

**Section sources**
- [types.ts](file://src/shared/types.ts#L5-L24)

## Response Schemas

### Single Property Response
```typescript
interface SinglePropertyResponse extends ApiResponse {
  data?: {
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
    avg_rating: number | null;
    review_count: number;
    reviews: Array<{
      id: number;
      user_id: string;
      property_id: number;
      booking_id: number | null;
      rating: number;
      comment: string | null;
      created_at: string;
      updated_at: string;
      reviewer_name: string;
    }>;
  };
}
```

### Paginated Property Response
```typescript
interface PaginatedPropertyResponse extends ApiResponse<Property[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

The paginated response includes embedded availability and review data, with average rating and review count calculated from the reviews table.

**Section sources**
- [types.ts](file://src/shared/types.ts#L590-L600)
- [index.ts](file://src/worker/index.ts#L181-L229)

## Authentication and Headers

### Authentication Requirements
All property modification endpoints (POST, PUT, DELETE) require JWT authentication with role-based access control:

- **JWT Token**: Must be included in the Authorization header
- **Role Requirements**:
  - POST /properties: Admin or owner
  - PUT /properties/:id: Property owner, admin, or owner
  - DELETE /properties/:id: Property owner, admin, or owner

The system checks user roles by examining the email domain (containing 'admin' or 'owner').

### Required Headers
- **Content-Type**: `application/json` (for POST and PUT requests)
- **Authorization**: `Bearer <JWT_TOKEN>`

### Zod Validation Rules
Input validation is performed using Zod schemas:

- **PropertySearchSchema**: Validates query parameters for GET /properties
- **CreatePropertySchema**: Validates request body for POST /properties
- **AdvancedPropertySearchSchema**: Extends basic search with additional filtering options

Validation occurs before database operations, ensuring data integrity.

**Section sources**
- [index.ts](file://src/worker/index.ts#L379-L400)
- [types.ts](file://src/shared/types.ts#L5-L24)

## Error Responses

The API returns standardized error responses following the `ApiResponse` interface:

### Invalid Query Parameters
**Status**: 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid query parameters"
}
```

### Unauthorized Access
**Status**: 403 Forbidden
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### Authentication Required
**Status**: 401 Unauthorized
```json
{
  "success": false,
  "error": "User not authenticated"
}
```

### Resource Not Found
**Status**: 404 Not Found
```json
{
  "success": false,
  "error": "Property not found"
}
```

### Validation Failures
**Status**: 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid review data"
}
```

### Server Errors
**Status**: 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to create property"
}
```

**Section sources**
- [index.ts](file://src/worker/index.ts#L315-L365)
- [types.ts](file://src/shared/types.ts#L590-L600)

## Examples

### Searching Properties in Riyadh with Date Filters
```bash
curl -X GET "http://localhost:8787/api/properties?location=Riyadh&check_in=2024-02-01&check_out=2024-02-05&guests=2&min_price=200&max_price=500&sort_by=price_asc&page=1&limit=10" \
  -H "Content-Type: application/json"
```

Note: While the example includes check_in and check_out parameters, the current implementation uses a separate endpoint `/api/properties/:id/availability` for date-based availability checking.

### Creating a New Property Listing
```bash
curl -X POST "http://localhost:8787/api/properties" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Modern Apartment in Riyadh",
    "description": "Beautiful apartment with city views and modern amenities",
    "location": "Riyadh, Saudi Arabia",
    "price_per_night": 350,
    "max_guests": 4,
    "bedrooms": 2,
    "bathrooms": 2,
    "amenities": ["wifi", "kitchen", "parking", "air_conditioning"],
    "images": [
      "https://example.com/images/apartment1.jpg",
      "https://example.com/images/apartment2.jpg",
      "https://example.com/images/apartment3.jpg"
    ]
  }'
```

The response will be:
```json
{
  "success": true,
  "message": "Property created successfully"
}
```

**Section sources**
- [index.ts](file://src/worker/index.ts#L379-L400)
- [types.ts](file://src/shared/types.ts#L5-L24)