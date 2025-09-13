# API Endpoints Reference

<cite>
**Referenced Files in This Document**   
- [worker/index.ts](file://src/worker/index.ts#L43-L2443)
- [shared/types.ts](file://src/shared/types.ts#L1-L100)
- [shared/payment.ts](file://src/shared/payment.ts#L1-L50)
- [shared/security-middleware.ts](file://src/shared/security-middleware.ts#L1-L30)
</cite>

## Table of Contents
1. [Property Endpoints](#property-endpoints)
2. [Booking Endpoints](#booking-endpoints)
3. [Payment Endpoints](#payment-endpoints)
4. [Chat Endpoints](#chat-endpoints)
5. [Admin Endpoints](#admin-endpoints)
6. [Authentication Endpoints](#authentication-endpoints)
7. [User Profile Endpoints](#user-profile-endpoints)
8. [Wishlist Endpoints](#wishlist-endpoints)
9. [Review Endpoints](#review-endpoints)
10. [Notification Endpoints](#notification-endpoints)
11. [Email Management Endpoints](#email-management-endpoints)
12. [AI Configuration Endpoints](#ai-configuration-endpoints)
13. [Security and Audit Endpoints](#security-and-audit-endpoints)
14. [Utility Endpoints](#utility-endpoints)

## Property Endpoints

### GET /api/properties
Retrieve a list of properties with search and filtering capabilities.

**HTTP Method**: GET  
**URL Pattern**: `/api/properties`  
**Authentication**: Optional  
**Rate Limiting**: 200 requests per minute

**Query Parameters**:
- `location` (string): Filter by property location
- `guests` (number): Minimum number of guests the property can accommodate
- `min_price` (number): Minimum price per night
- `max_price` (number): Maximum price per night
- `amenities` (array): List of amenities to filter by
- `bedrooms` (number): Minimum number of bedrooms
- `bathrooms` (number): Minimum number of bathrooms
- `rating` (number): Minimum average rating
- `sort_by` (string): Sort order (price_asc, price_desc, rating, newest, featured)
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of results per page (default: 20)

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/properties?location=Riyadh&guests=2&min_price=200&max_price=500&sort_by=price_asc&page=1&limit=10"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Luxury Apartment",
      "location": "Riyadh",
      "price_per_night": 250,
      "max_guests": 4,
      "bedrooms": 2,
      "bathrooms": 2,
      "amenities": ["wifi", "pool", "parking"],
      "images": ["https://example.com/image1.jpg"],
      "is_featured": true,
      "avg_rating": 4.8,
      "review_count": 24
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

**Status Codes**:
- 200: Successful response with property data
- 400: Invalid query parameters
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L200-L300)

### GET /api/properties/:id
Retrieve detailed information about a specific property.

**HTTP Method**: GET  
**URL Pattern**: `/api/properties/:id`  
**Authentication**: Optional  
**Rate Limiting**: Standard API limits apply

**Path Parameters**:
- `id` (number): The ID of the property to retrieve

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/properties/1"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Luxury Apartment",
    "description": "Spacious luxury apartment in downtown Riyadh",
    "location": "Riyadh",
    "price_per_night": 250,
    "max_guests": 4,
    "bedrooms": 2,
    "bathrooms": 2,
    "amenities": ["wifi", "pool", "parking", "gym"],
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
      "https://example.com/image3.jpg"
    ],
    "is_featured": true,
    "avg_rating": 4.8,
    "review_count": 24,
    "reviews": [
      {
        "id": 1,
        "user_id": "user123",
        "rating": 5,
        "comment": "Excellent stay!",
        "created_at": "2024-01-15T10:30:00Z",
        "reviewer_name": "Ahmed Ali"
      }
    ]
  }
}
```

**Status Codes**:
- 200: Property found and returned successfully
- 404: Property not found
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L300-L350)

### POST /api/properties
Create a new property listing.

**HTTP Method**: POST  
**URL Pattern**: `/api/properties`  
**Authentication**: Required (host or admin role)  
**Rate Limiting**: 10 requests per minute

**Request Body (JSON)**:
```json
{
  "title": "string",
  "description": "string",
  "location": "string",
  "price_per_night": "number",
  "max_guests": "number",
  "bedrooms": "number",
  "bathrooms": "number",
  "amenities": ["string"],
  "images": ["string"]
}
```

**Example Request**:
```bash
curl -X POST "https://habibistay.com/api/properties" \
  -H "Authorization: Bearer jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Modern Villa",
    "description": "Beautiful modern villa with private pool",
    "location": "Jeddah",
    "price_per_night": 400,
    "max_guests": 8,
    "bedrooms": 4,
    "bathrooms": 4,
    "amenities": ["wifi", "pool", "parking", "gym", "kitchen"],
    "images": ["https://example.com/villa1.jpg", "https://example.com/villa2.jpg"]
  }'
```

**Example Response (201 Created)**:
```json
{
  "success": true,
  "message": "Property created successfully"
}
```

**Status Codes**:
- 201: Property created successfully
- 400: Invalid request body or validation error
- 401: User not authenticated
- 403: Insufficient permissions (not host or admin)
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L350-L400)

### GET /api/properties/featured
Retrieve featured properties.

**HTTP Method**: GET  
**URL Pattern**: `/api/properties/featured`  
**Authentication**: Optional  
**Rate Limiting**: Standard API limits apply

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/properties/featured"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Luxury Apartment",
      "location": "Riyadh",
      "price_per_night": 250,
      "max_guests": 4,
      "bedrooms": 2,
      "bathrooms": 2,
      "amenities": ["wifi", "pool", "parking"],
      "images": ["https://example.com/image1.jpg"],
      "is_featured": true
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with featured properties
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L300-L310)

### GET /api/properties/:id/analytics
Retrieve analytics data for a property (owner or admin only).

**HTTP Method**: GET  
**URL Pattern**: `/api/properties/:id/analytics`  
**Authentication**: Required (property owner or admin)  
**Rate Limiting**: Standard API limits apply

**Path Parameters**:
- `id` (number): The ID of the property to retrieve analytics for

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/properties/1/analytics" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "daily_analytics": [
      {
        "property_id": 1,
        "views": 25,
        "inquiries": 3,
        "bookings": 1,
        "revenue": 250,
        "avg_rating": 4.8,
        "review_count": 1,
        "date": "2024-01-15"
      }
    ],
    "summary": {
      "total_views": 350,
      "total_inquiries": 42,
      "total_bookings": 15,
      "total_revenue": 3750,
      "avg_rating": 4.8,
      "total_reviews": 24
    },
    "period": "30_days"
  }
}
```

**Status Codes**:
- 200: Analytics data returned successfully
- 401: User not authenticated
- 403: Unauthorized (not property owner or admin)
- 404: Property not found
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1200-L1250)

### GET /api/properties/:id/availability
Check availability for a property for specific dates.

**HTTP Method**: GET  
**URL Pattern**: `/api/properties/:id/availability`  
**Authentication**: Optional  
**Rate Limiting**: Standard API limits apply

**Path Parameters**:
- `id` (number): The ID of the property to check

**Query Parameters**:
- `check_in` (string): Check-in date in YYYY-MM-DD format
- `check_out` (string): Check-out date in YYYY-MM-DD format

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/properties/1/availability?check_in=2024-02-01&check_out=2024-02-05"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "available": true,
    "conflicting_booking": null
  }
}
```

**Status Codes**:
- 200: Availability check completed successfully
- 400: Missing required query parameters
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1400-L1450)

## Booking Endpoints

### POST /api/bookings
Create a new booking.

**HTTP Method**: POST  
**URL Pattern**: `/api/bookings`  
**Authentication**: Optional (guest bookings allowed)  
**Rate Limiting**: 20 requests per minute

**Request Body (JSON)**:
```json
{
  "property_id": "number",
  "guest_name": "string",
  "guest_email": "string",
  "guest_phone": "string",
  "check_in_date": "string",
  "check_out_date": "string",
  "total_guests": "number",
  "special_requests": "string"
}
```

**Example Request**:
```bash
curl -X POST "https://habibistay.com/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 1,
    "guest_name": "Ahmed Ali",
    "guest_email": "ahmed@example.com",
    "guest_phone": "+966501234567",
    "check_in_date": "2024-02-01",
    "check_out_date": "2024-02-05",
    "total_guests": 2,
    "special_requests": "High floor if possible"
  }'
```

**Example Response (201 Created)**:
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking_id": 123,
    "total_amount": 1150,
    "base_amount": 1000,
    "service_fee": 50,
    "taxes": 150
  }
}
```

**Status Codes**:
- 201: Booking created successfully
- 400: Invalid request data or dates not available
- 404: Property not found
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L400-L450)

### GET /api/bookings/my-bookings
Retrieve bookings for the authenticated user.

**HTTP Method**: GET  
**URL Pattern**: `/api/bookings/my-bookings`  
**Authentication**: Required  
**Rate Limiting**: Standard API limits apply

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/bookings/my-bookings" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "user_id": "user123",
      "property_id": 1,
      "property_title": "Luxury Apartment",
      "guest_name": "Ahmed Ali",
      "guest_email": "ahmed@example.com",
      "check_in_date": "2024-02-01",
      "check_out_date": "2024-02-05",
      "total_guests": 2,
      "total_amount": 1150,
      "status": "pending",
      "payment_status": "pending",
      "special_requests": "High floor if possible",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Bookings retrieved successfully
- 401: User not authenticated
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L800-L820)

### PUT /api/admin/bookings/:bookingId/status
Update the status of a booking (admin only).

**HTTP Method**: PUT  
**URL Pattern**: `/api/admin/bookings/:bookingId/status`  
**Authentication**: Required (admin role)  
**Rate Limiting**: Standard API limits apply

**Path Parameters**:
- `bookingId` (number): The ID of the booking to update

**Request Body (JSON)**:
```json
{
  "status": "string"
}
```

**Example Request**:
```bash
curl -X PUT "https://habibistay.com/api/admin/bookings/123/status" \
  -H "Authorization: Bearer jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "message": "Booking status updated"
}
```

**Status Codes**:
- 200: Booking status updated successfully
- 400: Invalid status value
- 401: User not authenticated
- 403: Insufficient permissions (not admin)
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L850-L870)

## Payment Endpoints

### POST /api/payments/create
Create a payment for a booking.

**HTTP Method**: POST  
**URL Pattern**: `/api/payments/create`  
**Authentication**: Optional  
**Rate Limiting**: Standard API limits apply

**Request Body (JSON)**:
```json
{
  "booking_id": "number",
  "amount": "number",
  "currency": "string",
  "return_url": "string",
  "cancel_url": "string"
}
```

**Example Request**:
```bash
curl -X POST "https://habibistay.com/api/payments/create" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": 123,
    "amount": 1150,
    "currency": "SAR",
    "return_url": "https://habibistay.com/payment/success",
    "cancel_url": "https://habibistay.com/payment/cancel"
  }'
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "payment_url": "https://myfatoorah.com/invoice/abc123",
    "invoice_id": 456
  }
}
```

**Status Codes**:
- 200: Payment created successfully
- 400: Invalid request data
- 404: Booking not found
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1000-L1050)

### POST /api/payments/callback
Handle payment callback from payment provider.

**HTTP Method**: POST  
**URL Pattern**: `/api/payments/callback`  
**Authentication**: Not required (called by payment provider)  
**Rate Limiting**: Standard API limits apply

**Request Body (JSON)**:
```json
{
  "paymentId": "string",
  "Id": "string",
  "InvoiceId": "string"
}
```

**Example Request**:
```bash
curl -X POST "https://habibistay.com/api/payments/callback" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "pay_123",
    "Id": "inv_456",
    "InvoiceId": 789
  }'
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "status": "success",
    "transaction_id": "txn_123"
  }
}
```

**Status Codes**:
- 200: Callback processed successfully
- 400: Missing payment identifier
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1050-L1100)

## Chat Endpoints

### POST /api/chat
Send a message to the AI chatbot.

**HTTP Method**: POST  
**URL Pattern**: `/api/chat`  
**Authentication**: Optional  
**Rate Limiting**: Standard API limits apply

**Request Body (JSON)**:
```json
{
  "message": "string"
}
```

**Example Request**:
```bash
curl -X POST "https://habibistay.com/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the best properties in Riyadh?"
  }'
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "I'd be happy to help you find the best properties in Riyadh! We have several excellent options including a luxury apartment and a modern villa. Would you like more details about either of these?"
  }
}
```

**Status Codes**:
- 200: Message processed successfully
- 500: Internal server error (including OpenAI API issues)

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L450-L500)

### POST /api/chat/enhanced
Send a message to the AI chatbot with enhanced features.

**HTTP Method**: POST  
**URL Pattern**: `/api/chat/enhanced`  
**Authentication**: Optional  
**Rate Limiting**: Standard API limits apply

**Request Body (JSON)**:
```json
{
  "message": "string",
  "conversation_id": "string"
}
```

**Example Request**:
```bash
curl -X POST "https://habibistay.com/api/chat/enhanced" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me properties with pools",
    "conversation_id": "session_123"
  }'
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Here are some properties with pools that might interest you:",
    "conversation_id": "session_123",
    "buttons": [
      {
        "id": "search_properties",
        "text": "🏠 Browse Properties",
        "action": "search",
        "style": "primary"
      }
    ],
    "featured_properties": [
      {
        "id": 1,
        "title": "Luxury Apartment",
        "location": "Riyadh",
        "price_per_night": 250,
        "max_guests": 4,
        "amenities": ["wifi", "pool", "parking"]
      }
    ]
  }
}
```

**Status Codes**:
- 200: Message processed successfully
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1600-L1800)

### POST /api/chat/test
Test AI configuration (admin only).

**HTTP Method**: POST  
**URL Pattern**: `/api/chat/test`  
**Authentication**: Required (admin role)  
**Rate Limiting**: Standard API limits apply

**Request Body (JSON)**:
```json
{
  "message": "string",
  "test_config": "object"
}
```

**Example Request**:
```bash
curl -X POST "https://habibistay.com/api/chat/test" \
  -H "Authorization: Bearer jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, are you working?",
    "test_config": {
      "model_name": "gpt-4o-mini",
      "temperature": 0.7,
      "max_tokens": 100
    }
  }'
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Yes, I'm working correctly!",
    "latency": 450,
    "tokens_used": 28,
    "model_used": "gpt-4o-mini",
    "temperature": 0.7
  }
}
```

**Status Codes**:
- 200: Test completed successfully
- 401: User not authenticated
- 403: Insufficient permissions (not admin)
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1800-L1850)

## Admin Endpoints

### GET /api/admin/stats
Retrieve platform statistics (admin only).

**HTTP Method**: GET  
**URL Pattern**: `/api/admin/stats`  
**Authentication**: Required (admin role)  
**Rate Limiting**: 100 requests per minute

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/admin/stats" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "total_users": 150,
    "total_properties": 300,
    "active_properties": 250,
    "total_bookings": 750,
    "pending_bookings": 25,
    "total_revenue": 187500,
    "monthly_growth": 12,
    "occupancy_rate": 85
  }
}
```

**Status Codes**:
- 200: Statistics retrieved successfully
- 401: User not authenticated
- 403: Insufficient permissions (not admin)
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L820-L850)

### GET /api/admin/properties
Retrieve all properties (admin only).

**HTTP Method**: GET  
**URL Pattern**: `/api/admin/properties`  
**Authentication**: Required (admin role)  
**Rate Limiting**: 100 requests per minute

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/admin/properties" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": "host123",
      "title": "Luxury Apartment",
      "location": "Riyadh",
      "price_per_night": 250,
      "max_guests": 4,
      "is_active": true,
      "created_at": "2024-01-01T08:00:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Properties retrieved successfully
- 401: User not authenticated
- 403: Insufficient permissions (not admin)
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L850-L870)

### GET /api/admin/bookings
Retrieve all bookings (admin only).

**HTTP Method**: GET  
**URL Pattern**: `/api/admin/bookings`  
**Authentication**: Required (admin role)  
**Rate Limiting**: 100 requests per minute

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/admin/bookings" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "user_id": "user123",
      "property_id": 1,
      "guest_name": "Ahmed Ali",
      "check_in_date": "2024-02-01",
      "check_out_date": "2024-02-05",
      "total_guests": 2,
      "total_amount": 1150,
      "status": "pending",
      "payment_status": "pending",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Bookings retrieved successfully
- 401: User not authenticated
- 403: Insufficient permissions (not admin)
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L870-L890)

### PUT /api/admin/properties/:propertyId/status
Update property status (admin only).

**HTTP Method**: PUT  
**URL Pattern**: `/api/admin/properties/:propertyId/status`  
**Authentication**: Required (admin role)  
**Rate Limiting**: Standard API limits apply

**Path Parameters**:
- `propertyId` (number): The ID of the property to update

**Request Body (JSON)**:
```json
{
  "is_active": "boolean"
}
```

**Example Request**:
```bash
curl -X PUT "https://habibistay.com/api/admin/properties/1/status" \
  -H "Authorization: Bearer jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "is_active": false
  }'
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "message": "Property status updated"
}
```

**Status Codes**:
- 200: Property status updated successfully
- 400: Invalid request data
- 401: User not authenticated
- 403: Insufficient permissions (not admin)
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L890-L910)

### PUT /api/admin/settings
Update admin settings.

**HTTP Method**: PUT  
**URL Pattern**: `/api/admin/settings`  
**Authentication**: Required (admin role)  
**Rate Limiting**: 50 requests per minute

**Request Body (JSON)**:
```json
{
  "key": "string",
  "value": "string"
}
```

**Example Request**:
```bash
curl -X PUT "https://habibistay.com/api/admin/settings" \
  -H "Authorization: Bearer jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "site_maintenance",
    "value": "true"
  }'
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "message": "Setting updated"
}
```

**Status Codes**:
- 200: Setting updated successfully
- 400: Invalid request data
- 401: User not authenticated
- 403: Insufficient permissions (not admin)
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L910-L940)

### GET /api/admin/settings/:key
Retrieve a specific admin setting.

**HTTP Method**: GET  
**URL Pattern**: `/api/admin/settings/:key`  
**Authentication**: Optional  
**Rate Limiting**: Standard API limits apply

**Path Parameters**:
- `key` (string): The key of the setting to retrieve

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/admin/settings/site_maintenance" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "key": "site_maintenance",
    "value": "true",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Status Codes**:
- 200: Setting retrieved successfully
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L940-L960)

## Authentication Endpoints

### GET /api/oauth/google/redirect_url
Get Google OAuth redirect URL.

**HTTP Method**: GET  
**URL Pattern**: `/api/oauth/google/redirect_url`  
**Authentication**: Not required  
**Rate Limiting**: Standard API limits apply

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/oauth/google/redirect_url"
```

**Example Response (200 OK)**:
```json
{
  "redirectUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
}
```

**Status Codes**:
- 200: Redirect URL returned successfully
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L150-L170)

### POST /api/sessions
Create a new session (handle OAuth callback).

**HTTP Method**: POST  
**URL Pattern**: `/api/sessions`  
**Authentication**: Not required  
**Rate Limiting**: Standard API limits apply

**Request Body (JSON)**:
```json
{
  "code": "string"
}
```

**Example Request**:
```bash
curl -X POST "https://habibistay.com/api/sessions" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "oauth_code_from_google"
  }'
```

**Example Response (200 OK)**:
```json
{
  "success": true
}
```

**Status Codes**:
- 200: Session created successfully
- 400: No authorization code provided
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L170-L190)

### GET /api/users/me
Get current user information.

**HTTP Method**: GET  
**URL Pattern**: `/api/users/me`  
**Authentication**: Required  
**Rate Limiting**: Standard API limits apply

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/users/me" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "id": "user123",
  "email": "user@example.com",
  "role": "user",
  "google_user_data": {
    "name": "Ahmed Ali",
    "picture": "https://example.com/avatar.jpg"
  }
}
```

**Status Codes**:
- 200: User information returned successfully
- 401: User not authenticated
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L190-L200)

### GET /api/logout
Logout the current user.

**HTTP Method**: GET  
**URL Pattern**: `/api/logout`  
**Authentication**: Not required (uses session cookie)  
**Rate Limiting**: Standard API limits apply

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/logout"
```

**Example Response (200 OK)**:
```json
{
  "success": true
}
```

**Status Codes**:
- 200: Logout successful
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L200-L220)

## User Profile Endpoints

### GET /api/users/profile
Get user profile information.

**HTTP Method**: GET  
**URL Pattern**: `/api/users/profile`  
**Authentication**: Required  
**Rate Limiting**: Standard API limits apply

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/users/profile" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "profile": {
      "full_name": "Ahmed Ali",
      "phone": "+966501234567",
      "address": "123 Main St",
      "city": "Riyadh",
      "country": "Saudi Arabia",
      "date_of_birth": "1990-01-01",
      "preferred_language": "en",
      "currency": "SAR",
      "bio": "Travel enthusiast",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "notifications": {
      "email_booking_updates": true,
      "email_marketing": false,
      "sms_booking_updates": true,
      "push_notifications": true
    }
  }
}
```

**Status Codes**:
- 200: Profile retrieved successfully
- 401: User not authenticated
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L600-L650)

### PUT /api/users/profile
Update user profile information.

**HTTP Method**: PUT  
**URL Pattern**: `/api/users/profile`  
**Authentication**: Required  
**Rate Limiting**: Standard API limits apply

**Request Body (JSON)**:
```json
{
  "full_name": "string",
  "phone": "string",
  "address": "string",
  "city": "string",
  "country": "string",
  "date_of_birth": "string",
  "preferred_language": "string",
  "currency": "string",
  "bio": "string",
  "avatar_url": "string"
}
```

**Example Request**:
```bash
curl -X PUT "https://habibistay.com/api/users/profile" \
  -H "Authorization: Bearer jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Ahmed Ali",
    "phone": "+966501234567",
    "city": "Riyadh",
    "country": "Saudi Arabia",
    "preferred_language": "en",
    "currency": "SAR"
  }'
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

**Status Codes**:
- 200: Profile updated successfully
- 400: Invalid request data
- 401: User not authenticated
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L650-L700)

### GET /api/users/notifications
Get user notification settings.

**HTTP Method**: GET  
**URL Pattern**: `/api/users/notifications`  
**Authentication**: Required  
**Rate Limiting**: Standard API limits apply

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/users/notifications" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "email_booking_updates": true,
    "email_marketing": false,
    "sms_booking_updates": true,
    "push_notifications": true
  }
}
```

**Status Codes**:
- 200: Notification settings retrieved successfully
- 401: User not authenticated
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1400-L1420)

### PUT /api/users/notifications
Update user notification settings.

**HTTP Method**: PUT  
**URL Pattern**: `/api/users/notifications`  
**Authentication**: Required  
**Rate Limiting**: Standard API limits apply

**Request Body (JSON)**:
```json
{
  "email_booking_updates": "boolean",
  "email_marketing": "boolean",
  "sms_booking_updates": "boolean",
  "push_notifications": "boolean"
}
```

**Example Request**:
```bash
curl -X PUT "https://habibistay.com/api/users/notifications" \
  -H "Authorization: Bearer jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "email_booking_updates": true,
    "email_marketing": false,
    "sms_booking_updates": true,
    "push_notifications": true
  }'
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "message": "Notification settings updated"
}
```

**Status Codes**:
- 200: Notification settings updated successfully
- 400: Invalid request data
- 401: User not authenticated
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1420-L1450)

## Wishlist Endpoints

### GET /api/wishlist
Get user's wishlist.

**HTTP Method**: GET  
**URL Pattern**: `/api/wishlist`  
**Authentication**: Required  
**Rate Limiting**: Standard API limits apply

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/wishlist" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "property_id": 1,
      "created_at": "2024-01-15T10:30:00Z",
      "property": {
        "id": 1,
        "title": "Luxury Apartment",
        "location": "Riyadh",
        "price_per_night": 250,
        "max_guests": 4,
        "amenities": ["wifi", "pool", "parking"]
      }
    }
  ]
}
```

**Status Codes**:
- 200: Wishlist retrieved successfully
- 401: User not authenticated
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L500-L550)

### POST /api/wishlist/:propertyId
Add a property to wishlist.

**HTTP Method**: POST  
**URL Pattern**: `/api/wishlist/:propertyId`  
**Authentication**: Required  
**Rate Limiting**: Standard API limits apply

**Path Parameters**:
- `propertyId` (number): The ID of the property to add to wishlist

**Example Request**:
```bash
curl -X POST "https://habibistay.com/api/wishlist/1" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "message": "Added to wishlist"
}
```

**Status Codes**:
- 200: Property added to wishlist successfully
- 400: Property already in wishlist
- 401: User not authenticated
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L550-L580)

### DELETE /api/wishlist/:propertyId
Remove a property from wishlist.

**HTTP Method**: DELETE  
**URL Pattern**: `/api/wishlist/:propertyId`  
**Authentication**: Required  
**Rate Limiting**: Standard API limits apply

**Path Parameters**:
- `propertyId` (number): The ID of the property to remove from wishlist

**Example Request**:
```bash
curl -X DELETE "https://habibistay.com/api/wishlist/1" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "message": "Removed from wishlist"
}
```

**Status Codes**:
- 200: Property removed from wishlist successfully
- 401: User not authenticated
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L580-L600)

## Review Endpoints

### GET /api/reviews/:propertyId
Get reviews for a property.

**HTTP Method**: GET  
**URL Pattern**: `/api/reviews/:propertyId`  
**Authentication**: Optional  
**Rate Limiting**: Standard API limits apply

**Path Parameters**:
- `propertyId` (number): The ID of the property to get reviews for

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/reviews/1"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": "user123",
      "property_id": 1,
      "rating": 5,
      "comment": "Excellent stay!",
      "reviewer_name": "Ahmed Ali",
      "reviewer_avatar": "https://example.com/avatar.jpg",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Reviews retrieved successfully
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1250-L1280)

### POST /api/reviews
Submit a review for a property.

**HTTP Method**: POST  
**URL Pattern**: `/api/reviews`  
**Authentication**: Required  
**Rate Limiting**: Standard API limits apply

**Request Body (JSON)**:
```json
{
  "property_id": "number",
  "booking_id": "number",
  "rating": "number",
  "comment": "string"
}
```

**Example Request**:
```bash
curl -X POST "https://habibistay.com/api/reviews" \
  -H "Authorization: Bearer jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 1,
    "booking_id": 123,
    "rating": 5,
    "comment": "Excellent stay!"
  }'
```

**Example Response (201 Created)**:
```json
{
  "success": true,
  "message": "Review submitted successfully"
}
```

**Status Codes**:
- 201: Review submitted successfully
- 400: Invalid review data
- 401: User not authenticated
- 403: User has already reviewed this property
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1280-L1350)

### GET /api/reviews/summary/:propertyId
Get review summary for a property.

**HTTP Method**: GET  
**URL Pattern**: `/api/reviews/summary/:propertyId`  
**Authentication**: Optional  
**Rate Limiting**: Standard API limits apply

**Path Parameters**:
- `propertyId` (number): The ID of the property to get review summary for

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/reviews/summary/1"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "averageRating": 4.8,
    "totalReviews": 24,
    "ratingDistribution": {
      "1": 0,
      "2": 1,
      "3": 2,
      "4": 5,
      "5": 16
    },
    "categoryRatings": {
      "cleanliness": 4.9,
      "communication": 4.7,
      "location": 4.8,
      "value": 4.6
    }
  }
}
```

**Status Codes**:
- 200: Review summary retrieved successfully
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L2000-L2050)

### POST /api/reviews/:id/helpful
Mark a review as helpful.

**HTTP Method**: POST  
**URL Pattern**: `/api/reviews/:id/helpful`  
**Authentication**: Optional  
**Rate Limiting**: Standard API limits apply

**Path Parameters**:
- `id` (number): The ID of the review to mark as helpful

**Example Request**:
```bash
curl -X POST "https://habibistay.com/api/reviews/1/helpful"
```

**Example Response (200 OK)**:
```json
{
  "success": true
}
```

**Status Codes**:
- 200: Review marked as helpful successfully
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L2050-L2070)

## Email Management Endpoints

### GET /api/admin/email-templates
Get all email templates (admin only).

**HTTP Method**: GET  
**URL Pattern**: `/api/admin/email-templates`  
**Authentication**: Required (admin role)  
**Rate Limiting**: Standard API limits apply

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/admin/email-templates" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "template_key": "booking_confirmation",
      "subject": "Your booking is confirmed!",
      "html_content": "<p>Dear {{guest_name}}, your booking is confirmed...</p>",
      "variables": ["guest_name", "property_title", "check_in_date"],
      "is_active": true
    }
  ]
}
```

**Status Codes**:
- 200: Email templates retrieved successfully
- 401: User not authenticated
- 403: Insufficient permissions (not admin)
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1250-L1270)

### GET /api/admin/email-logs
Get email logs (admin only).

**HTTP Method**: GET  
**URL Pattern**: `/api/admin/email-logs`  
**Authentication**: Required (admin role)  
**Rate Limiting**: Standard API limits apply

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/admin/email-logs" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "recipient_email": "ahmed@example.com",
      "template_key": "booking_confirmation",
      "subject": "Your booking is confirmed!",
      "status": "sent",
      "sent_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Email logs retrieved successfully
- 401: User not authenticated
- 403: Insufficient permissions (not admin)
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1270-L1290)

### GET /api/admin/init-email-templates
Initialize email templates (admin only).

**HTTP Method**: GET  
**URL Pattern**: `/api/admin/init-email-templates`  
**Authentication**: Required (admin role)  
**Rate Limiting**: Standard API limits apply

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/admin/init-email-templates" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "message": "Email templates initialized successfully"
}
```

**Status Codes**:
- 200: Email templates initialized successfully
- 401: User not authenticated
- 403: Insufficient permissions (not admin)
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1290-L1320)

## AI Configuration Endpoints

### GET /api/admin/ai-config
Get current AI configuration (admin only).

**HTTP Method**: GET  
**URL Pattern**: `/api/admin/ai-config`  
**Authentication**: Required (admin role)  
**Rate Limiting**: Standard API limits apply

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/admin/ai-config" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "model_provider": "openai",
    "model_name": "gpt-4o-mini",
    "temperature": 0.7,
    "max_tokens": 1000,
    "personality": "friendly",
    "language": "en",
    "is_active": true
  }
}
```

**Status Codes**:
- 200: AI configuration retrieved successfully
- 401: User not authenticated
- 403: Insufficient permissions (not admin)
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1600-L1630)

### PUT /api/admin/ai-config
Update AI configuration (admin only).

**HTTP Method**: PUT  
**URL Pattern**: `/api/admin/ai-config`  
**Authentication**: Required (admin role)  
**Rate Limiting**: Standard API limits apply

**Request Body (JSON)**:
```json
{
  "model_provider": "string",
  "model_name": "string",
  "api_key": "string",
  "temperature": "number",
  "max_tokens": "number",
  "system_prompt": "string",
  "personality": "string",
  "language": "string"
}
```

**Example Request**:
```bash
curl -X PUT "https://habibistay.com/api/admin/ai-config" \
  -H "Authorization: Bearer jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "gpt-4o",
    "temperature": 0.8,
    "max_tokens": 1500,
    "personality": "professional",
    "language": "en"
  }'
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "message": "AI configuration updated successfully"
}
```

**Status Codes**:
- 200: AI configuration updated successfully
- 400: Invalid request data
- 401: User not authenticated
- 403: Insufficient permissions (not admin)
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1630-L1680)

## Security and Audit Endpoints

### GET /api/admin/security/metrics
Get security metrics (admin only).

**HTTP Method**: GET  
**URL Pattern**: `/api/admin/security/metrics`  
**Authentication**: Required (admin role)  
**Rate Limiting**: 50 requests per minute

**Query Parameters**:
- `timeRange` (string): Time range for metrics (24h, 7d, 30d)

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/admin/security/metrics?timeRange=24h" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "totalEvents": 1247,
    "criticalAlerts": 3,
    "blockedIPs": 15,
    "failedLogins": 89,
    "activeUsers": 234,
    "suspiciousActivity": 12,
    "dataBreachAttempts": 0,
    "systemUptime": 99.97
  }
}
```

**Status Codes**:
- 200: Security metrics retrieved successfully
- 401: User not authenticated
- 403: Insufficient permissions (not admin)
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L2200-L2230)

### GET /api/admin/security/events
Get security events (admin only).

**HTTP Method**: GET  
**URL Pattern**: `/api/admin/security/events`  
**Authentication**: Required (admin role)  
**Rate Limiting**: 50 requests per minute

**Query Parameters**:
- `timeRange` (string): Time range for events (24h, 7d, 30d)
- `filter` (string): Filter by event level (all, warning, error, info)
- `limit` (number): Maximum number of events to return

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/admin/security/events?timeRange=24h&filter=error&limit=10" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "2",
      "timestamp": "2024-01-15T10:15:00Z",
      "level": "error",
      "event": "SQL injection attempt detected",
      "ip": "10.0.0.5",
      "location": "Unknown",
      "details": {
        "query": "SELECT * FROM users WHERE id = 1 OR 1=1"
      },
      "resolved": true
    }
  ]
}
```

**Status Codes**:
- 200: Security events retrieved successfully
- 401: User not authenticated
- 403: Insufficient permissions (not admin)
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L2230-L2280)

### GET /api/admin/security/threats
Get security threats (admin only).

**HTTP Method**: GET  
**URL Pattern**: `/api/admin/security/threats`  
**Authentication**: Required (admin role)  
**Rate Limiting**: 50 requests per minute

**Query Parameters**:
- `limit` (number): Maximum number of threats to return

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/admin/security/threats?limit=10" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "ipAddress": "203.0.113.1",
      "threatScore": 85,
      "country": "Unknown",
      "attempts": 47,
      "lastAttempt": "2024-01-15T10:45:00Z",
      "blocked": false,
      "reason": "Multiple failed authentication attempts from unknown location"
    }
  ]
}
```

**Status Codes**:
- 200: Security threats retrieved successfully
- 401: User not authenticated
- 403: Insufficient permissions (not admin)
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L2280-L2310)

### POST /api/admin/security/block-ip
Block an IP address (admin only).

**HTTP Method**: POST  
**URL Pattern**: `/api/admin/security/block-ip`  
**Authentication**: Required (admin role)  
**Rate Limiting**: 10 requests per minute

**Request Body (JSON)**:
```json
{
  "ip": "string",
  "reason": "string"
}
```

**Example Request**:
```bash
curl -X POST "https://habibistay.com/api/admin/security/block-ip" \
  -H "Authorization: Bearer jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "203.0.113.1",
    "reason": "Multiple failed login attempts"
  }'
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "message": "IP 203.0.113.1 has been blocked successfully"
}
```

**Status Codes**:
- 200: IP address blocked successfully
- 400: IP address and reason are required
- 401: User not authenticated
- 403: Insufficient permissions (not admin)
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L2310-L2340)

## Utility Endpoints

### GET /api/properties/my-properties
Get properties owned by the authenticated user.

**HTTP Method**: GET  
**URL Pattern**: `/api/properties/my-properties`  
**Authentication**: Required  
**Rate Limiting**: Standard API limits apply

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/properties/my-properties" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Luxury Apartment",
      "location": "Riyadh",
      "price_per_night": 250,
      "max_guests": 4,
      "is_active": true,
      "created_at": "2024-01-01T08:00:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Properties retrieved successfully
- 401: User not authenticated
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L800-L820)

### POST /api/contact
Submit a contact form.

**HTTP Method**: POST  
**URL Pattern**: `/api/contact`  
**Authentication**: Not required  
**Rate Limiting**: Standard API limits apply

**Request Body (JSON)**:
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "interest": "string",
  "message": "string"
}
```

**Example Request**:
```bash
curl -X POST "https://habibistay.com/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Ali",
    "email": "ahmed@example.com",
    "phone": "+966501234567",
    "interest": "booking",
    "message": "I have a question about booking options."
  }'
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "message": "Contact form submitted successfully"
}
```

**Status Codes**:
- 200: Contact form submitted successfully
- 400: Required fields missing
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1450-L1500)

### POST /api/newsletter/subscribe
Subscribe to the newsletter.

**HTTP Method**: POST  
**URL Pattern**: `/api/newsletter/subscribe`  
**Authentication**: Not required  
**Rate Limiting**: Standard API limits apply

**Request Body (JSON)**:
```json
{
  "email": "string",
  "source": "string"
}
```

**Example Request**:
```bash
curl -X POST "https://habibistay.com/api/newsletter/subscribe" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "source": "website"
  }'
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter"
}
```

**Status Codes**:
- 200: Successfully subscribed to newsletter
- 400: Valid email address required or email already subscribed
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L1800-L1850)

### GET /api/health
Health check endpoint.

**HTTP Method**: GET  
**URL Pattern**: `/api/health`  
**Authentication**: Not required  
**Rate Limiting**: Standard API limits apply

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/health"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "message": "HabibiStay API is running",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Status Codes**:
- 200: API is running normally

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L2000-L2010)

### POST /api/host/onboard
Onboard a new host.

**HTTP Method**: POST  
**URL Pattern**: `/api/host/onboard`  
**Authentication**: Not required  
**Rate Limiting**: Standard API limits apply

**Request Body (JSON)**:
```json
{
  "user_id": "string",
  "property": {
    "title": "string",
    "description": "string",
    "location": "string",
    "type": "string",
    "max_guests": "number"
  },
  "pricing": {
    "base_price": "number",
    "cleaning_fee": "number"
  }
}
```

**Example Request**:
```bash
curl -X POST "https://habibistay.com/api/host/onboard" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "host123",
    "property": {
      "title": "My Villa",
      "description": "Beautiful villa for rent",
      "location": "Riyadh",
      "type": "villa",
      "max_guests": 6
    },
    "pricing": {
      "base_price": 300,
      "cleaning_fee": 30
    }
  }'
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "property_id": 1,
    "message": "Onboarding completed successfully. Your property will be reviewed within 24 hours."
  }
}
```

**Status Codes**:
- 200: Onboarding completed successfully
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L2100-L2150)

### GET /api/admin/pricing/settings/:propertyId
Get pricing settings for a property.

**HTTP Method**: GET  
**URL Pattern**: `/api/admin/pricing/settings/:propertyId`  
**Authentication**: Required (admin role)  
**Rate Limiting**: Standard API limits apply

**Path Parameters**:
- `propertyId` (number): The ID of the property to get pricing settings for

**Example Request**:
```bash
curl -X GET "https://habibistay.com/api/admin/pricing/settings/1" \
  -H "Authorization: Bearer jwt_token"
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "property_id": 1,
    "base_price": 250,
    "currency": "SAR",
    "minimum_price": 125,
    "maximum_price": 750,
    "auto_pricing_enabled": true,
    "update_frequency": "daily",
    "aggressiveness": "moderate"
  }
}
```

**Status Codes**:
- 200: Pricing settings retrieved successfully
- 404: Pricing settings not found
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L2000-L2030)

### PUT /api/admin/pricing/settings/:propertyId
Update pricing settings for a property.

**HTTP Method**: PUT  
**URL Pattern**: `/api/admin/pricing/settings/:propertyId`  
**Authentication**: Required (admin role)  
**Rate Limiting**: Standard API limits apply

**Path Parameters**:
- `propertyId` (number): The ID of the property to update pricing settings for

**Request Body (JSON)**:
```json
{
  "base_price": "number",
  "currency": "string",
  "minimum_price": "number",
  "maximum_price": "number",
  "auto_pricing_enabled": "boolean",
  "update_frequency": "string",
  "aggressiveness": "string"
}
```

**Example Request**:
```bash
curl -X PUT "https://habibistay.com/api/admin/pricing/settings/1" \
  -H "Authorization: Bearer jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "base_price": 300,
    "currency": "SAR",
    "minimum_price": 150,
    "maximum_price": 900,
    "auto_pricing_enabled": true,
    "update_frequency": "daily",
    "aggressiveness": "aggressive"
  }'
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 1
  }
}
```

**Status Codes**:
- 200: Pricing settings updated successfully
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L2030-L2060)

### POST /api/pricing/calculate
Calculate price for a booking.

**HTTP Method**: POST  
**URL Pattern**: `/api/pricing/calculate`  
**Authentication**: Not required  
**Rate Limiting**: Standard API limits apply

**Request Body (JSON)**:
```json
{
  "property_id": "number",
  "check_in_date": "string",
  "check_out_date": "string"
}
```

**Example Request**:
```bash
curl -X POST "https://habibistay.com/api/pricing/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 1,
    "check_in_date": "2024-02-01",
    "check_out_date": "2024-02-05"
  }'
```

**Example Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "base_price": 250,
    "total_nights": 4,
    "breakdown": {
      "base_total": 1000,
      "adjustments": [],
      "taxes": 150,
      "fees": 75,
      "discounts": 0,
      "grand_total": 1225
    },
    "final_price": 1225,
    "currency": "SAR",
    "applied_rules": []
  }
}
```

**Status Codes**:
- 200: Price calculated successfully
- 404: Property pricing settings not found
- 500: Internal server error

**Section sources**
- [worker/index.ts](file://src/worker/index.ts#L2150-L2200)