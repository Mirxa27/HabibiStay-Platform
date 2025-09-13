# Booking Endpoints

<cite>
**Referenced Files in This Document**   
- [src/worker/index.ts](file://src/worker/index.ts)
- [src/shared/types.ts](file://src/shared/types.ts)
- [migrations/6.sql](file://migrations/6.sql)
</cite>

## Table of Contents
1. [Booking Endpoints Overview](#booking-endpoints-overview)
2. [POST /api/bookings - Create Booking](#post-apibookings---create-booking)
3. [GET /api/bookings/user - Retrieve User Bookings](#get-apibookingsuser---retrieve-user-bookings)
4. [GET /api/bookings/:id - Get Booking Details](#get-apibookingsid---get-booking-details)
5. [PUT /api/bookings/:id/status - Update Booking Status](#put-apibookingsidstatus---update-booking-status)
6. [Booking Data Model](#booking-data-model)
7. [Date Conflict Validation Logic](#date-conflict-validation-logic)
8. [Authentication and Authorization](#authentication-and-authorization)
9. [Error Handling and Response Structure](#error-handling-and-response-structure)
10. [Example Requests and Responses](#example-requests-and-responses)

## Booking Endpoints Overview

The HabibiStay booking system provides a comprehensive set of RESTful API endpoints for managing property reservations. These endpoints enable users to create bookings, retrieve their booking history, view specific booking details, and allow administrators and property owners to update booking statuses. The system implements robust validation, authentication, and authorization mechanisms to ensure data integrity and security.

The booking endpoints are implemented in the main worker file using the Hono framework and follow a consistent pattern of request validation, authentication checks, business logic processing, and response generation. All endpoints return standardized JSON responses that include a success flag, optional data payload, and error information when applicable.

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L0-L2443)

## POST /api/bookings - Create Booking

Creates a new booking for a property with comprehensive validation and pricing calculation.

### Endpoint Details
- **HTTP Method**: POST
- **URL Pattern**: `/api/bookings`
- **Authentication Required**: Yes (JWT via session cookie)
- **Rate Limiting**: 20 requests per minute per IP

### Request Parameters

**Request Body (JSON)**
```json
{
  "property_id": 123,
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "guest_phone": "+966501234567",
  "check_in_date": "2024-01-15",
  "check_out_date": "2024-01-20",
  "total_guests": 2,
  "special_requests": "Late check-in after 8 PM"
}
```

**Body Parameters**
- `property_id`: **number** - ID of the property to book
- `guest_name`: **string** - Full name of the guest
- `guest_email`: **string** - Email address for booking confirmation
- `guest_phone`: **string (optional)** - Guest contact phone number
- `check_in_date`: **string (date)** - Check-in date in YYYY-MM-DD format
- `check_out_date`: **string (date)** - Check-out date in YYYY-MM-DD format
- `total_guests`: **number** - Number of guests staying
- `special_requests`: **string (optional)** - Any special requirements

### Processing Logic

1. **Property Validation**: Verifies the specified property exists and is active
2. **Date Validation**: Ensures check-in is before check-out and calculates stay duration
3. **Price Calculation**: Computes total amount including base price, service fee (5%), and taxes (15% VAT)
4. **Availability Check**: Queries database for conflicting bookings during the requested period
5. **Booking Creation**: Inserts new booking record with calculated total amount
6. **Notification**: Sends booking confirmation email to the guest
7. **Analytics Update**: Records booking and revenue in property analytics

### Response Schema
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking_id": 456,
    "total_amount": 1725,
    "base_amount": 1500,
    "service_fee": 75,
    "taxes": 150
  }
}
```

### Status Codes
- **201**: Booking created successfully
- **400**: Bad request (invalid dates, conflicting booking)
- **401**: Unauthorized (missing or invalid authentication)
- **404**: Property not found
- **500**: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L587-L685)

## GET /api/bookings/user - Retrieve User Bookings

Retrieves all bookings associated with the authenticated user.

### Endpoint Details
- **HTTP Method**: GET
- **URL Pattern**: `/api/bookings/user`
- **Authentication Required**: Yes (JWT via session cookie)
- **Rate Limiting**: Default application rate limit (1000 requests per 15 minutes)

### Request Parameters

**Query Parameters**
- None required

**Headers**
- `Authorization`: Bearer token (optional, session cookie preferred)
- `Cookie`: Session cookie containing authentication token

### Response Schema
```json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "property_id": 123,
      "guest_name": "John Doe",
      "guest_email": "john@example.com",
      "check_in_date": "2024-01-15",
      "check_out_date": "2024-01-20",
      "total_guests": 2,
      "total_amount": 1725,
      "status": "confirmed",
      "created_at": "2023-12-01T10:30:00Z",
      "property": {
        "id": 123,
        "title": "Luxury Villa in Riyadh",
        "location": "Riyadh, Saudi Arabia",
        "price_per_night": 300,
        "max_guests": 4,
        "images": ["https://example.com/image1.jpg"]
      }
    }
  ]
}
```

### Processing Logic
1. **Authentication Check**: Validates user session via authMiddleware
2. **User Verification**: Confirms user identity from session context
3. **Database Query**: Joins bookings table with properties table to include property details
4. **Response Formatting**: Structures data with booking information and associated property details

### Status Codes
- **200**: Bookings retrieved successfully
- **401**: Unauthorized (invalid or missing authentication)
- **500**: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L727-L758)

## GET /api/bookings/:id - Get Booking Details

Retrieves detailed information about a specific booking.

### Endpoint Details
- **HTTP Method**: GET
- **URL Pattern**: `/api/bookings/:id`
- **Authentication Required**: Yes (JWT via session cookie)
- **Authorization**: User must be the booking owner, property owner, or admin

### Request Parameters

**Path Parameters**
- `id`: **number** - The booking ID to retrieve

**Headers**
- `Authorization`: Bearer token (optional, session cookie preferred)
- `Cookie`: Session cookie containing authentication token

### Response Schema
```json
{
  "success": true,
  "data": {
    "id": 456,
    "property_id": 123,
    "user_id": "auth0|123456",
    "guest_name": "John Doe",
    "guest_email": "john@example.com",
    "guest_phone": "+966501234567",
    "check_in_date": "2024-01-15",
    "check_out_date": "2024-01-20",
    "total_guests": 2,
    "total_amount": 1725,
    "special_requests": "Late check-in after 8 PM",
    "status": "confirmed",
    "created_at": "2023-12-01T10:30:00Z",
    "updated_at": "2023-12-01T10:30:00Z",
    "property": {
      "id": 123,
      "user_id": "auth0|789012",
      "title": "Luxury Villa in Riyadh",
      "description": "Spacious villa with private pool",
      "location": "Riyadh, Saudi Arabia",
      "price_per_night": 300,
      "max_guests": 4,
      "bedrooms": 3,
      "bathrooms": 3,
      "amenities": ["pool", "wifi", "parking"],
      "images": ["https://example.com/image1.jpg"],
      "is_featured": true,
      "is_active": true,
      "created_at": "2023-01-15T08:00:00Z",
      "updated_at": "2023-11-20T14:30:00Z"
    }
  }
}
```

### Processing Logic
1. **Authentication Check**: Validates user session via authMiddleware
2. **Authorization Check**: Verifies user has permission to view the booking
3. **Database Query**: Joins bookings table with properties table to include full property details
4. **Response Generation**: Returns complete booking information with associated property data

### Status Codes
- **200**: Booking details retrieved successfully
- **401**: Unauthorized (invalid or missing authentication)
- **403**: Forbidden (user does not have permission to view this booking)
- **404**: Booking not found
- **500**: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L760-L790)

## PUT /api/bookings/:id/status - Update Booking Status

Updates the status of a booking, restricted to administrators and property owners.

### Endpoint Details
- **HTTP Method**: PUT
- **URL Pattern**: `/api/bookings/:id/status`
- **Authentication Required**: Yes (JWT via session cookie)
- **Authorization**: Admin or property owner only
- **Rate Limiting**: 50 requests per minute per IP

### Request Parameters

**Path Parameters**
- `id`: **number** - The booking ID to update

**Request Body (JSON)**
```json
{
  "status": "confirmed"
}
```

**Body Parameters**
- `status`: **string** - New status for the booking (one of: confirmed, cancelled, rejected, completed)

### Processing Logic
1. **Authentication Check**: Validates user session via authMiddleware
2. **Authorization Check**: Uses requireRole middleware to verify admin or owner privileges
3. **Booking Validation**: Confirms the booking exists and retrieves associated property
4. **Status Validation**: Ensures the requested status is valid
5. **Database Update**: Updates the booking status in the database
6. **Notification**: Sends status update email to the guest
7. **Analytics Update**: Adjusts property analytics if booking is cancelled

### Response Schema
```json
{
  "success": true,
  "message": "Booking status updated successfully"
}
```

### Status Codes
- **200**: Booking status updated successfully
- **400**: Invalid status value
- **401**: Unauthorized (invalid or missing authentication)
- **403**: Forbidden (insufficient privileges)
- **404**: Booking not found
- **500**: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L792-L822)

## Booking Data Model

The Booking type is defined in the shared types file and represents the structure of booking data throughout the application.

```typescript
type Booking = {
  id: number;
  property_id: number;
  user_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in_date: string;
  check_out_date: string;
  total_guests: number;
  total_amount: number;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
};
```

### Database Schema
The bookings table in the database is defined in migration file 6.sql:

```sql
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  check_in_date TEXT NOT NULL,
  check_out_date TEXT NOT NULL,
  total_guests INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE
);
```

### Field Descriptions
- **id**: Unique identifier for the booking
- **property_id**: Reference to the booked property
- **user_id**: Authentication ID of the user who made the booking
- **guest_name**: Full name of the primary guest
- **guest_email**: Contact email for booking communications
- **guest_phone**: Optional contact phone number
- **check_in_date**: Date when guests will arrive (YYYY-MM-DD)
- **check_out_date**: Date when guests will depart (YYYY-MM-DD)
- **total_guests**: Number of people staying in the property
- **total_amount**: Total cost in smallest currency unit (e.g., fils for SAR)
- **special_requests**: Any special requirements from the guest
- **status**: Current state of the booking
  - `pending`: Initial state after creation
  - `confirmed`: Approved by host/admin
  - `cancelled`: Cancelled by guest or host
  - `rejected`: Rejected by host/admin
  - `completed`: Stay has been completed
- **created_at**: Timestamp when booking was created
- **updated_at**: Timestamp when booking was last modified

**Section sources**
- [src/shared/types.ts](file://src/shared/types.ts#L0-L100)
- [migrations/6.sql](file://migrations/6.sql#L1-L25)

## Date Conflict Validation Logic

The system prevents double-booking by implementing comprehensive date conflict validation when creating new bookings.

### Conflict Detection Algorithm

The validation uses a SQL query with multiple overlapping conditions to detect conflicts:

```sql
SELECT id FROM bookings 
WHERE property_id = ? 
AND status NOT IN ('cancelled', 'rejected')
AND (
  (check_in_date <= ? AND check_out_date > ?) OR
  (check_in_date < ? AND check_out_date >= ?) OR
  (check_in_date >= ? AND check_out_date <= ?)
)
```

### Overlap Scenarios Detected

The algorithm identifies five potential overlap scenarios:

1. **Existing booking starts before and ends during new booking**
   ```
   Existing: |--------|
   New:           |--------|
   ```

2. **Existing booking starts during and ends after new booking**
   ```
   Existing:      |--------|
   New:        |--------|
   ```

3. **Existing booking completely encompasses new booking**
   ```
   Existing: |--------------|
   New:        |--------|
   ```

4. **New booking completely encompasses existing booking**
   ```
   Existing:    |--------|
   New:      |--------------|
   ```

5. **Exact date match**
   ```
   Existing: |--------|
   New:      |--------|
   ```

### Implementation Details

- **Status Exclusion**: Only checks bookings with active statuses (excludes 'cancelled' and 'rejected')
- **Inclusive Boundaries**: Uses inclusive comparison for check-in and exclusive for check-out
- **Date Format**: Expects ISO 8601 date strings (YYYY-MM-DD)
- **Time Zone Handling**: Dates are stored and compared in UTC to avoid time zone issues

### Validation Flow
1. Extract check-in and check-out dates from request
2. Convert dates to JavaScript Date objects for duration calculation
3. Verify check-in is before check-out (minimum 1-night stay)
4. Execute SQL query to find conflicting bookings
5. Return 400 error if any conflicts are found
6. Proceed with booking creation if no conflicts exist

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L627-L645)

## Authentication and Authorization

The booking system implements a robust security model using JWT-based authentication and role-based access control.

### Authentication Mechanism

**Session-Based Authentication**
- Uses JWT tokens stored in HTTP-only cookies
- Tokens are issued by the Mocha Users Service upon successful OAuth login
- Cookie configuration:
  - `httpOnly`: True (prevents XSS attacks)
  - `secure`: True (HTTPS only)
  - `sameSite`: None (allows cross-site requests)
  - `maxAge`: 60 days

**Authentication Middleware**
```typescript
app.use('/api/bookings/*', authMiddleware);
```

The `authMiddleware` verifies the session token with the Mocha Users Service and attaches user information to the request context.

### Authorization Rules

**Role-Based Access Control**
- Implemented using `requireRole` middleware
- Role hierarchy:
  - **Guest**: Can create bookings and view their own bookings
  - **Host/Owner**: Can manage bookings for their properties
  - **Admin**: Full system access

**Endpoint Access Matrix**

| Endpoint | Guest | Host/Owner | Admin |
|--------|-------|------------|-------|
| POST /api/bookings | ✓ | ✓ | ✓ |
| GET /api/bookings/user | ✓ | ✓ | ✓ |
| GET /api/bookings/:id | ✓ | ✓ | ✓ |
| PUT /api/bookings/:id/status | ✗ | ✓ | ✓ |

### Security Measures
- **CSRF Protection**: Custom X-CSRF-Token header required for state-changing operations
- **Rate Limiting**: Prevents brute force and denial-of-service attacks
- **Input Validation**: All inputs validated using Zod schemas
- **SQL Injection Prevention**: Uses parameterized queries throughout
- **Sensitive Data Protection**: User IDs are opaque strings, not sequential integers

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L0-L2443)

## Error Handling and Response Structure

The booking system uses a consistent error handling approach across all endpoints.

### Standard Response Format

All responses follow the ApiResponse interface defined in shared/types.ts:

```typescript
type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
```

### Error Response Structure

```json
{
  "success": false,
  "error": "Property is not available for selected dates",
  "message": "The requested dates conflict with an existing booking"
}
```

### Validation Errors

**Zod Schema Validation**
- Request bodies validated using Zod schemas
- Invalid requests return 400 with detailed error messages
- Example validation rules:
  - `property_id`: Positive integer
  - `guest_name`: Non-empty string (1-100 characters)
  - `guest_email`: Valid email format
  - `check_in_date`: Valid date string, not in the past
  - `check_out_date`: Valid date string, after check-in date
  - `total_guests`: Positive integer, within property capacity

### Common Status Codes

**200 OK**
- Successful GET requests
- Successful PUT/PATCH requests

**201 Created**
- Successful POST requests that create a resource

**400 Bad Request**
- Invalid request parameters
- Validation errors
- Date conflicts
- Business logic violations

**401 Unauthorized**
- Missing or invalid authentication credentials
- Expired session

**403 Forbidden**
- Insufficient privileges for requested operation
- Attempting to access another user's data

**404 Not Found**
- Requested resource does not exist
- Invalid booking or property ID

**409 Conflict**
- Resource conflict (used for date conflicts)

**500 Internal Server Error**
- Unexpected server errors
- Database connection issues
- External service failures

### Error Response Examples

**Validation Error**
```json
{
  "success": false,
  "error": "Invalid input",
  "message": "Check-in date must be before check-out date"
}
```

**Authentication Error**
```json
{
  "success": false,
  "error": "User not authenticated",
  "message": "Please log in to access this resource"
}
```

**Authorization Error**
```json
{
  "success": false,
  "error": "Insufficient privileges",
  "message": "Only admins and property owners can update booking status"
}
```

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L0-L2443)
- [src/shared/types.ts](file://src/shared/types.ts#L0-L50)

## Example Requests and Responses

### Creating a Booking

**curl Command**
```bash
curl -X POST https://api.habibistay.com/api/bookings \
  -H "Content-Type: application/json" \
  -H "Cookie: mocha_session_token=your_session_token_here" \
  -d '{
    "property_id": 123,
    "guest_name": "Sarah Johnson",
    "guest_email": "sarah.johnson@email.com",
    "check_in_date": "2024-02-10",
    "check_out_date": "2024-02-15",
    "total_guests": 2,
    "special_requests": "Early check-in if possible"
  }'
```

**Successful Response (201)**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking_id": 789,
    "total_amount": 2070,
    "base_amount": 1800,
    "service_fee": 90,
    "taxes": 180
  }
}
```

**Error Response - Date Conflict (400)**
```json
{
  "success": false,
  "error": "Property is not available for selected dates",
  "message": "The requested dates conflict with an existing booking"
}
```

### Retrieving User Bookings

**curl Command**
```bash
curl -X GET https://api.habibistay.com/api/bookings/user \
  -H "Cookie: mocha_session_token=your_session_token_here"
```

**Successful Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": 789,
      "property_id": 123,
      "guest_name": "Sarah Johnson",
      "guest_email": "sarah.johnson@email.com",
      "check_in_date": "2024-02-10",
      "check_out_date": "2024-02-15",
      "total_guests": 2,
      "total_amount": 2070,
      "status": "confirmed",
      "created_at": "2023-12-15T14:22:00Z",
      "property": {
        "id": 123,
        "title": "Modern Apartment in Downtown",
        "location": "Riyadh, Saudi Arabia",
        "price_per_night": 360,
        "max_guests": 4,
        "images": ["https://example.com/apartment1.jpg"]
      }
    }
  ]
}
```

### Updating Booking Status

**curl Command**
```bash
curl -X PUT https://api.habibistay.com/api/bookings/789/status \
  -H "Content-Type: application/json" \
  -H "Cookie: mocha_session_token=admin_session_token_here" \
  -d '{
    "status": "confirmed"
  }'
```

**Successful Response (200)**
```json
{
  "success": true,
  "message": "Booking status updated successfully"
}
```

**Error Response - Insufficient Privileges (403)**
```json
{
  "success": false,
  "error": "Insufficient privileges",
  "message": "Only admins and property owners can update booking status"
}
```

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L587-L822)