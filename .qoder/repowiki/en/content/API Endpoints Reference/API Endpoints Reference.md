# API Endpoints Reference

<cite>
**Referenced Files in This Document**   
- [src/worker/index.ts](file://src/worker/index.ts) - *Updated in recent commit*
- [src/shared/types.ts](file://src/shared/types.ts) - *Updated in recent commit*
- [src/shared/cms-service.ts](file://src/shared/cms-service.ts) - *Added in recent commit*
- [src/shared/cms-permissions-service.ts](file://src/shared/cms-permissions-service.ts) - *Added in recent commit*
- [src/shared/ai-content-service.ts](file://src/shared/ai-content-service.ts) - *Added in recent commit*
</cite>

## Update Summary
**Changes Made**   
- Added new CMS section with endpoints for pages, templates, components, media, and AI providers
- Added AI content generation endpoints for AI models, jobs, and history
- Added CMS permissions management endpoints
- Added content versioning endpoints
- Updated data validation schemas to include CMS types
- Added new sections for CMS, AI Content, and Permissions
- Updated document sources to include new CMS-related files

## Table of Contents
1. [Properties](#properties)
2. [Bookings](#bookings)
3. [Payments](#payments)
4. [Chat](#chat)
5. [Wishlist](#wishlist)
6. [Users](#users)
7. [Admin](#admin)
8. [Reviews](#reviews)
9. [Notifications](#notifications)
10. [Authentication](#authentication)
11. [CMS](#cms)
12. [AI Content](#ai-content)
13. [Permissions](#permissions)
14. [Data Validation Schemas](#data-validation-schemas)

## Properties

### GET /api/properties
Retrieve a paginated list of properties with advanced search capabilities.

**HTTP Method**: GET  
**Authentication**: None required for search  
**Required Headers**: None  
**Access Permissions**: Public

**Query Parameters**:
- `location` (string, optional): Filter by property location
- `guests` (number, optional): Minimum number of guests the property can accommodate
- `min_price` (number, optional): Minimum price per night
- `max_price` (number, optional): Maximum price per night
- `amenities` (array of strings, optional): List of amenities to filter by
- `bedrooms` (number, optional): Minimum number of bedrooms
- `bathrooms` (number, optional): Minimum number of bathrooms
- `rating` (number, optional): Minimum average rating (1-5)
- `sort_by` (string, optional): Sort order. Options: price_asc, price_desc, rating, newest, featured
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Number of results per page (default: 20)

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": "user_123",
      "title": "Luxury Apartment in Riyadh",
      "description": "Beautiful modern apartment with city views",
      "location": "Riyadh, Saudi Arabia",
      "price_per_night": 350,
      "max_guests": 4,
      "bedrooms": 2,
      "bathrooms": 2,
      "amenities": ["wifi", "pool", "parking"],
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
    "total": 45,
    "totalPages": 3
  }
}
```

**Status Codes**:
- 200: Successful response with property list
- 500: Internal server error

**Sample curl command**:
```bash
curl -X GET "http://localhost:8787/api/properties?location=Riyadh&guests=2&min_price=200&max_price=500&sort_by=price_asc&page=1&limit=10"
```

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L164-L278)

### GET /api/properties/featured
Retrieve featured properties.

**HTTP Method**: GET  
**Authentication**: None required  
**Required Headers**: None  
**Access Permissions**: Public

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": "user_123",
      "title": "Luxury Apartment in Riyadh",
      "description": "Beautiful modern apartment with city views",
      "location": "Riyadh, Saudi Arabia",
      "price_per_night": 350,
      "max_guests": 4,
      "bedrooms": 2,
      "bathrooms": 2,
      "amenities": ["wifi", "pool", "parking"],
      "images": ["https://example.com/image1.jpg"],
      "is_featured": true,
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with featured properties
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L280-L290)

### GET /api/properties/:id
Retrieve a specific property by ID with reviews.

**HTTP Method**: GET  
**Authentication**: None required  
**Required Headers**: None  
**Access Permissions**: Public

**Path Parameters**:
- `id` (number): Property ID

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": "user_123",
    "title": "Luxury Apartment in Riyadh",
    "description": "Beautiful modern apartment with city views",
    "location": "Riyadh, Saudi Arabia",
    "price_per_night": 350,
    "max_guests": 4,
    "bedrooms": 2,
    "bathrooms": 2,
    "amenities": ["wifi", "pool", "parking"],
    "images": ["https://example.com/image1.jpg"],
    "is_featured": true,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "avg_rating": 4.8,
    "review_count": 24,
    "reviews": [
      {
        "id": 1,
        "property_id": 1,
        "user_id": "user_456",
        "rating": 5,
        "comment": "Excellent stay!",
        "created_at": "2024-01-20T14:30:00Z",
        "reviewer_name": "Ahmed Ali"
      }
    ]
  }
}
```

**Status Codes**:
- 200: Successful response with property details
- 404: Property not found
- 500: Internal server error

**Sample curl command**:
```bash
curl -X GET "http://localhost:8787/api/properties/1"
```

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L292-L337)

### POST /api/properties
Create a new property listing.

**HTTP Method**: POST  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Authenticated users only

**Request Body**:
```json
{
  "title": "Luxury Apartment in Riyadh",
  "description": "Beautiful modern apartment with city views",
  "location": "Riyadh, Saudi Arabia",
  "price_per_night": 350,
  "max_guests": 4,
  "bedrooms": 2,
  "bathrooms": 2,
  "amenities": ["wifi", "pool", "parking"],
  "images": ["https://example.com/image1.jpg"]
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Property created successfully"
}
```

**Status Codes**:
- 200: Property created successfully
- 401: User not authenticated
- 400: Validation error
- 500: Failed to create property

**Sample curl command**:
```bash
curl -X POST "http://localhost:8787/api/properties" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Luxury Apartment in Riyadh",
    "description": "Beautiful modern apartment with city views",
    "location": "Riyadh, Saudi Arabia",
    "price_per_night": 350,
    "max_guests": 4,
    "bedrooms": 2,
    "bathrooms": 2,
    "amenities": ["wifi", "pool", "parking"],
    "images": ["https://example.com/image1.jpg"]
  }'
```

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L339-L379)

### GET /api/properties/my-properties
Retrieve properties owned by the authenticated user.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Authenticated users only

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": "user_123",
      "title": "Luxury Apartment in Riyadh",
      "description": "Beautiful modern apartment with city views",
      "location": "Riyadh, Saudi Arabia",
      "price_per_night": 350,
      "max_guests": 4,
      "bedrooms": 2,
      "bathrooms": 2,
      "amenities": ["wifi", "pool", "parking"],
      "images": ["https://example.com/image1.jpg"],
      "is_featured": true,
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with user's properties
- 401: User not authenticated
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L638-L655)

### GET /api/properties/:id/availability
Check property availability for specific dates.

**HTTP Method**: GET  
**Authentication**: None required  
**Required Headers**: None  
**Access Permissions**: Public

**Path Parameters**:
- `id` (number): Property ID

**Query Parameters**:
- `check_in` (string): Check-in date in YYYY-MM-DD format
- `check_out` (string): Check-out date in YYYY-MM-DD format

**Response Schema**:
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
- 400: Missing required parameters
- 500: Internal server error

**Sample curl command**:
```bash
curl -X GET "http://localhost:8787/api/properties/1/availability?check_in=2024-03-15&check_out=2024-03-18"
```

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L2450-L2480)

### GET /api/properties/:id/analytics
Retrieve analytics data for a property.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Property owners and admins only

**Path Parameters**:
- `id` (number): Property ID

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "daily_analytics": [
      {
        "property_id": 1,
        "date": "2024-02-15",
        "views": 25,
        "inquiries": 3,
        "bookings": 1,
        "revenue": 350,
        "avg_rating": 4.8,
        "review_count": 1
      }
    ],
    "summary": {
      "total_views": 750,
      "total_inquiries": 90,
      "total_bookings": 30,
      "total_revenue": 10500,
      "avg_rating": 4.7,
      "total_reviews": 24
    },
    "period": "30_days"
  }
}
```

**Status Codes**:
- 200: Successful response with analytics data
- 401: User not authenticated
- 403: Unauthorized access
- 404: Property not found
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L2150-L2210)

## Bookings

### POST /api/bookings
Create a new booking for a property.

**HTTP Method**: POST  
**Authentication**: Not required (guest bookings allowed)  
**Required Headers**: 
- `Content-Type: application/json`

**Access Permissions**: Public

**Request Body**:
```json
{
  "property_id": 1,
  "check_in_date": "2024-03-15",
  "check_out_date": "2024-03-18",
  "guests": 2,
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "guest_phone": "+966501234567",
  "special_requests": "High floor room please",
  "promo_code": "WELCOME10"
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking_id": "BOOK_123",
    "total_amount": 1925,
    "base_amount": 1750,
    "service_fee": 88,
    "taxes": 263,
    "next_step": {
      "action": "payment_required",
      "payment_url": "https://payment.habibistay.com/BOOK_123"
    }
  }
}
```

**Status Codes**:
- 200: Booking created successfully
- 400: Invalid date range, property not available, or validation error
- 404: Property not found
- 409: Date conflict with existing booking
- 500: Failed to create booking

**Validation Rules**:
- Check-in date must be before check-out date
- Property must be available for the selected dates
- Total guests must not exceed property's maximum capacity
- Guest email must be valid
- Guest phone must be at least 10 characters

**Sample curl command**:
```bash
curl -X POST "http://localhost:8787/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 1,
    "check_in_date": "2024-03-15",
    "check_out_date": "2024-03-18",
    "guests": 2,
    "guest_name": "John Doe",
    "guest_email": "john@example.com",
    "guest_phone": "+966501234567",
    "special_requests": "High floor room please"
  }'
```

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L381-L472)
- [src/shared/types.ts](file://src/shared/types.ts#L44-L54)

### GET /api/bookings/my-bookings
Retrieve bookings made by the authenticated user.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Authenticated users only

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "id": "BOOK_123",
      "user_id": "user_123",
      "property_id": 1,
      "property_title": "Luxury Apartment in Riyadh",
      "check_in_date": "2024-03-15",
      "check_out_date": "2024-03-18",
      "guests": 2,
      "guest_name": "John Doe",
      "guest_email": "john@example.com",
      "guest_phone": "+966501234567",
      "special_requests": "High floor room please",
      "total_amount": 1925,
      "status": "pending",
      "payment_status": "pending",
      "created_at": "2024-02-10T15:30:00Z",
      "updated_at": "2024-02-10T15:30:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with user's bookings
- 401: User not authenticated
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L657-L674)

### PUT /api/bookings/:id/cancel
Cancel a booking.

**HTTP Method**: PUT  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Booking owners and admins only

**Path Parameters**:
- `id` (string): Booking ID

**Request Body**:
```json
{
  "reason": "Change of plans"
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

**Status Codes**:
- 200: Booking cancelled successfully
- 400: Cannot cancel past bookings
- 401: User not authenticated
- 403: Access denied (not booking owner)
- 404: Booking not found
- 500: Failed to cancel booking

**Validation Rules**:
- Bookings can only be cancelled if check-in date is in the future
- Only booking owners or admins can cancel bookings

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L2000-L2050)

## Payments

### GET /api/payments/providers
Retrieve available payment providers.

**HTTP Method**: GET  
**Authentication**: None required  
**Required Headers**: None  
**Access Permissions**: Public

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "provider": "myfatoorah",
      "name": "MyFatoorah",
      "logo_url": "https://example.com/myfatoorah-logo.png",
      "supported_currencies": ["SAR", "USD", "EUR"],
      "is_active": true
    },
    {
      "provider": "paypal",
      "name": "PayPal",
      "logo_url": "https://example.com/paypal-logo.png",
      "supported_currencies": ["USD", "EUR"],
      "is_active": true
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with payment providers
- 500: Failed to fetch payment providers

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1600-L1620)

### GET /api/payments/methods/:provider
Retrieve available payment methods for a provider.

**HTTP Method**: GET  
**Authentication**: None required  
**Required Headers**: None  
**Access Permissions**: Public

**Path Parameters**:
- `provider` (string): Payment provider (e.g., myfatoorah, paypal)

**Query Parameters**:
- `currency` (string, optional): Currency code (default: SAR)

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "method": "credit_card",
      "name": "Credit Card",
      "icon": "credit_card",
      "supported_currencies": ["SAR", "USD", "EUR"],
      "fees": 0.025,
      "is_active": true
    },
    {
      "method": "apple_pay",
      "name": "Apple Pay",
      "icon": "apple",
      "supported_currencies": ["SAR", "USD"],
      "fees": 0.015,
      "is_active": true
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with payment methods
- 500: Failed to fetch payment methods

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1622-L1640)

### POST /api/payments/create
Create a payment for a booking.

**HTTP Method**: POST  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Authenticated users only

**Request Body**:
```json
{
  "booking_id": "BOOK_123",
  "amount": 1925,
  "currency": "SAR",
  "provider": "myfatoorah",
  "description": "Payment for booking BOOK_123"
}
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "payment_id": "PAY_456",
    "payment_url": "https://payment.habibistay.com/BOOK_123",
    "transaction_id": "TRX_789",
    "status": "pending",
    "provider": "myfatoorah"
  }
}
```

**Status Codes**:
- 200: Payment created successfully
- 400: Missing required payment information
- 401: User not authenticated
- 404: Booking not found
- 500: Failed to create payment

**Validation Rules**:
- Booking ID, amount, and description are required
- Amount must be positive
- Supported providers: myfatoorah, paypal

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1642-L1720)
- [src/shared/payment.ts](file://src/shared/payment.ts#L29-L35)

### GET /api/payments/:paymentId/status
Retrieve payment status.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Payment owners and admins only

**Path Parameters**:
- `paymentId` (string): Payment ID

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "payment_id": "PAY_456",
    "status": "completed",
    "amount": 1925,
    "currency": "SAR",
    "transaction_id": "TRX_789"
  }
}
```

**Status Codes**:
- 200: Successful response with payment status
- 403: Access denied
- 404: Payment not found
- 500: Failed to get payment status

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1722-L1760)

### POST /api/payments/:paymentId/refund
Process a refund for a payment.

**HTTP Method**: POST  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins only

**Path Parameters**:
- `paymentId` (string): Payment ID

**Request Body**:
```json
{
  "amount": 1925,
  "reason": "Booking cancelled by guest"
}
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "refund_id": "REF_123",
    "amount": 1925,
    "status": "completed"
  }
}
```

**Status Codes**:
- 200: Refund processed successfully
- 400: Valid refund amount required
- 401: User not authenticated
- 403: Access denied (not admin)
- 500: Failed to process refund

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1762-L1800)

### POST /api/payments/webhook/myfatoorah
Handle MyFatoorah webhook notifications.

**HTTP Method**: POST  
**Authentication**: None required (signature verification)  
**Required Headers**: 
- `Content-Type: application/json`
- `X-MyFatoorah-Signature`: Webhook signature
- `X-Timestamp`: Request timestamp

**Access Permissions**: MyFatoorah only

**Request Body**:
```json
{
  "EventType": "Payment.StatusChanged",
  "Data": {
    "InvoiceId": 12345,
    "InvoiceStatus": "Paid",
    "InvoiceValue": 1925,
    "CustomerName": "John Doe",
    "CustomerEmail": "john@example.com"
  }
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

**Status Codes**:
- 200: Webhook processed successfully
- 400: Webhook processing failed

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1802-L1840)

### POST /api/payments/webhook/paypal
Handle PayPal webhook notifications.

**HTTP Method**: POST  
**Authentication**: None required (signature verification)  
**Required Headers**: 
- `Content-Type: application/json`
- `PAYPAL-AUTH-ALGO`: PayPal auth algorithm
- `PAYPAL-CERT-URL`: PayPal certificate URL
- `PAYPAL-TRANSMISSION-ID`: Transmission ID
- `PAYPAL-TRANSMISSION-SIG`: Transmission signature
- `PAYPAL-TRANSMISSION-TIME`: Transmission time
- `PAYPAL-WEBHOOK-ID`: Webhook ID

**Access Permissions**: PayPal only

**Request Body**:
```json
{
  "event_type": "PAYMENT.SALE.COMPLETED",
  "resource": {
    "id": "PAY-12345",
    "state": "completed",
    "amount": {
      "total": "1925.00",
      "currency": "SAR"
    }
  }
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

**Status Codes**:
- 200: Webhook processed successfully
- 400: Webhook processing failed

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1842-L1880)

### GET /api/payments/callback/myfatoorah
Handle MyFatoorah payment callback.

**HTTP Method**: GET  
**Authentication**: None required  
**Required Query Parameters**:
- `paymentId` or `Id`: Payment identifier

**Access Permissions**: Public

**Response**: Redirect to appropriate page based on payment status

**Status Codes**:
- 302: Redirect to success or error page
- 404: Payment not found

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1882-L1940)

### GET /api/payments/callback/paypal
Handle PayPal payment callback.

**HTTP Method**: GET  
**Authentication**: None required  
**Required Query Parameters**:
- `token` or `paymentId`: Payment token

**Access Permissions**: Public

**Response**: Redirect to appropriate page based on payment status

**Status Codes**:
- 302: Redirect to success or error page
- 404: Payment not found

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1942-L2000)

## Chat

### POST /api/chat/enhanced
Send a message to the enhanced AI chatbot for property recommendations and assistance.

**HTTP Method**: POST  
**Authentication**: None required  
**Required Headers**: 
- `Content-Type: application/json`

**Access Permissions**: Public

**Request Body**:
```json
{
  "message": "I'm looking for a luxury apartment in Riyadh for 4 guests with a pool",
  "context": {
    "property_id": 1,
    "conversation_id": "conv_123"
  },
  "model_preferences": {
    "temperature": 0.7,
    "max_tokens": 500
  }
}
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "message": "I'd be happy to help you find a luxury apartment in Riyadh for 4 guests with a pool. We have several excellent options available. One highly recommended property is the Luxury Apartment in Riyadh, which features a private pool, 2 bedrooms, and stunning city views. It's priced at 350 SAR per night and has received a 4.8 rating from previous guests. Would you like more details about this property or would you prefer to see other options?",
    "conversation_id": "conv_123",
    "tokens_used": 156,
    "confidence": 0.95
  }
}
```

**Status Codes**:
- 200: Successful response from chatbot
- 400: Validation error
- 500: Failed to process message

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L800-L880)

### POST /api/chat
Send a message to the legacy AI chatbot for property recommendations and assistance.

**HTTP Method**: POST  
**Authentication**: None required  
**Required Headers**: 
- `Content-Type: application/json`

**Access Permissions**: Public

**Request Body**:
```json
{
  "message": "I need a family-friendly property in Riyadh for 6 guests"
}
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "message": "I'd be happy to help you find a family-friendly property in Riyadh for 6 guests. We have several excellent options available that can accommodate larger groups. Would you like me to show you some properties with multiple bedrooms and family amenities?"
  }
}
```

**Status Codes**:
- 200: Successful response from chatbot
- 500: OpenAI API key not configured or API error

**Sample curl command**:
```bash
curl -X POST "http://localhost:8787/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need a family-friendly property in Riyadh for 6 guests"
  }'
```

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L882-L940)

### GET /api/chat/conversations
Retrieve chat conversation history for the authenticated user.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Authenticated users only

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "id": "conv_123",
      "first_message": "Looking for a luxury apartment in Riyadh...",
      "message_count": 5,
      "updated_at": "2024-02-15T10:30:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with conversation list
- 401: User not authenticated
- 500: Failed to fetch conversations

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L942-L970)

### GET /api/chat/conversations/:conversationId
Retrieve a specific chat conversation.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Conversation owners only

**Path Parameters**:
- `conversationId` (string): Conversation ID

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": "conv_123",
    "messages": [
      {
        "role": "user",
        "content": "Looking for a luxury apartment in Riyadh for 4 guests with a pool",
        "timestamp": "2024-02-15T10:30:00Z"
      },
      {
        "role": "assistant",
        "content": "I'd be happy to help you find a luxury apartment in Riyadh for 4 guests with a pool...",
        "timestamp": "2024-02-15T10:31:00Z"
      }
    ],
    "context": {
      "property_id": 1
    },
    "updated_at": "2024-02-15T10:31:00Z"
  }
}
```

**Status Codes**:
- 200: Successful response with conversation details
- 401: User not authenticated
- 404: Conversation not found
- 500: Failed to fetch conversation

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L972-L1010)

### DELETE /api/chat/conversations/:conversationId
Delete a chat conversation.

**HTTP Method**: DELETE  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Conversation owners only

**Path Parameters**:
- `conversationId` (string): Conversation ID

**Response Schema**:
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

**Status Codes**:
- 200: Conversation deleted successfully
- 401: User not authenticated
- 500: Failed to delete conversation

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1012-L1040)

## Wishlist

### GET /api/wishlist
Retrieve the authenticated user's wishlist of properties.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Authenticated users only

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "property_id": 1,
      "created_at": "2024-01-12T09:15:00Z",
      "property": {
        "id": 1,
        "user_id": "user_123",
        "title": "Luxury Apartment in Riyadh",
        "description": "Beautiful modern apartment with city views",
        "location": "Riyadh, Saudi Arabia",
        "price_per_night": 350,
        "max_guests": 4,
        "bedrooms": 2,
        "bathrooms": 2,
        "amenities": ["wifi", "pool", "parking"],
        "images": ["https://example.com/image1.jpg"],
        "is_featured": true,
        "is_active": true,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with wishlist items
- 401: User not authenticated
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1042-L1070)

### POST /api/wishlist/:propertyId
Add a property to the authenticated user's wishlist.

**HTTP Method**: POST  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Authenticated users only

**Path Parameters**:
- `propertyId` (number): ID of the property to add to wishlist

**Response Schema**:
```json
{
  "success": true,
  "message": "Added to wishlist"
}
```

**Status Codes**:
- 200: Property added to wishlist
- 400: Property already in wishlist
- 401: User not authenticated
- 500: Failed to add to wishlist

**Sample curl command**:
```bash
curl -X POST "http://localhost:8787/api/wishlist/1" \
  -H "Authorization: Bearer your-jwt-token"
```

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1072-L1090)

### DELETE /api/wishlist/:propertyId
Remove a property from the authenticated user's wishlist.

**HTTP Method**: DELETE  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Authenticated users only

**Path Parameters**:
- `propertyId` (number): ID of the property to remove from wishlist

**Response Schema**:
```json
{
  "success": true,
  "message": "Removed from wishlist"
}
```

**Status Codes**:
- 200: Property removed from wishlist
- 401: User not authenticated
- 500: Failed to remove from wishlist

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1092-L1110)

## Users

### GET /api/users/profile
Retrieve the authenticated user's profile information.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Authenticated users only

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "profile": {
      "user_id": "user_123",
      "full_name": "John Doe",
      "phone": "+966501234567",
      "address": "123 Main St",
      "city": "Riyadh",
      "country": "Saudi Arabia",
      "date_of_birth": "1990-01-01",
      "preferred_language": "en",
      "currency": "SAR",
      "bio": "Travel enthusiast",
      "avatar_url": "https://example.com/avatar.jpg",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-10T14:30:00Z"
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
- 200: Successful response with user profile
- 401: User not authenticated
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1112-L1140)

### PUT /api/users/profile
Update the authenticated user's profile information.

**HTTP Method**: PUT  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Authenticated users only

**Request Body**:
```json
{
  "full_name": "John Doe",
  "phone": "+966501234567",
  "address": "123 Main St",
  "city": "Riyadh",
  "country": "Saudi Arabia",
  "date_of_birth": "1990-01-01",
  "preferred_language": "en",
  "currency": "SAR",
  "bio": "Travel enthusiast",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

**Status Codes**:
- 200: Profile updated successfully
- 401: User not authenticated
- 400: Validation error
- 500: Failed to update profile

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1142-L1170)

### GET /api/users/notifications
Retrieve the authenticated user's notification settings.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Authenticated users only

**Response Schema**:
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
- 200: Successful response with notification settings
- 401: User not authenticated
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L2400-L2420)

### PUT /api/users/notifications
Update the authenticated user's notification settings.

**HTTP Method**: PUT  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Authenticated users only

**Request Body**:
```json
{
  "email_booking_updates": true,
  "email_marketing": false,
  "sms_booking_updates": true,
  "push_notifications": true
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Notification settings updated"
}
```

**Status Codes**:
- 200: Notification settings updated successfully
- 401: User not authenticated
- 500: Failed to update settings

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L2422-L2450)

## Admin

### GET /api/admin/stats
Retrieve platform statistics.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins and owners only

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "total_users": 150,
    "total_properties": 85,
    "active_properties": 78,
    "total_bookings": 320,
    "pending_bookings": 15,
    "total_revenue": 125000,
    "monthly_growth": 12,
    "occupancy_rate": 85
  }
}
```

**Status Codes**:
- 200: Successful response with platform stats
- 401: User not authenticated
- 403: Unauthorized access
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1172-L1210)

### GET /api/admin/properties
Retrieve all properties.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins and owners only

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": "user_123",
      "title": "Luxury Apartment in Riyadh",
      "description": "Beautiful modern apartment with city views",
      "location": "Riyadh, Saudi Arabia",
      "price_per_night": 350,
      "max_guests": 4,
      "bedrooms": 2,
      "bathrooms": 2,
      "amenities": ["wifi", "pool", "parking"],
      "images": ["https://example.com/image1.jpg"],
      "is_featured": true,
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with properties
- 401: User not authenticated
- 403: Unauthorized access
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1212-L1230)

### GET /api/admin/bookings
Retrieve all bookings.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins and owners only

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "id": "BOOK_123",
      "user_id": "user_123",
      "property_id": 1,
      "check_in_date": "2024-03-15",
      "check_out_date": "2024-03-18",
      "guests": 2,
      "guest_name": "John Doe",
      "guest_email": "john@example.com",
      "guest_phone": "+966501234567",
      "special_requests": "High floor room please",
      "total_amount": 1925,
      "status": "confirmed",
      "payment_status": "completed",
      "created_at": "2024-02-10T15:30:00Z",
      "updated_at": "2024-02-10T15:30:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with bookings
- 401: User not authenticated
- 403: Unauthorized access
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1232-L1250)

### PUT /api/admin/properties/:propertyId/status
Update property status.

**HTTP Method**: PUT  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins and owners only

**Path Parameters**:
- `propertyId` (number): Property ID

**Request Body**:
```json
{
  "is_active": false
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Property status updated"
}
```

**Status Codes**:
- 200: Property status updated successfully
- 401: User not authenticated
- 403: Unauthorized access
- 500: Failed to update property status

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1252-L1270)

### PUT /api/admin/bookings/:bookingId/status
Update booking status.

**HTTP Method**: PUT  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins and owners only

**Path Parameters**:
- `bookingId` (string): Booking ID

**Request Body**:
```json
{
  "status": "confirmed"
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Booking status updated"
}
```

**Status Codes**:
- 200: Booking status updated successfully
- 401: User not authenticated
- 403: Unauthorized access
- 500: Failed to update booking status

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1272-L1290)

### GET /api/admin/settings
Retrieve admin settings.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins and owners only

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "key": "site_title",
      "value": "HabibiStay",
      "updated_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with admin settings
- 401: User not authenticated
- 403: Unauthorized access
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1292-L1310)

### POST /api/admin/settings
Update admin settings.

**HTTP Method**: POST  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins and owners only

**Request Body**:
```json
{
  "key": "site_title",
  "value": "HabibiStay - Premium Stays"
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Setting updated"
}
```

**Status Codes**:
- 200: Setting updated successfully
- 401: User not authenticated
- 403: Unauthorized access
- 500: Failed to update setting

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1312-L1340)

### GET /api/admin/settings/:key
Retrieve a specific admin setting.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins and owners only

**Path Parameters**:
- `key` (string): Setting key

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "key": "site_title",
    "value": "HabibiStay",
    "updated_at": "2024-01-01T10:00:00Z"
  }
}
```

**Status Codes**:
- 200: Successful response with setting
- 401: User not authenticated
- 403: Unauthorized access
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1342-L1360)

### GET /api/admin/email-templates
Retrieve email templates.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins and owners only

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "template_key": "payment_success",
      "subject": "Your payment has been confirmed",
      "html_content": "<p>Dear {{name}}, your payment has been confirmed...</p>",
      "variables": ["name", "amount", "transaction_id"],
      "is_active": true,
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with email templates
- 401: User not authenticated
- 403: Unauthorized access
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L2300-L2320)

### GET /api/admin/email-logs
Retrieve email logs.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins and owners only

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "to_email": "john@example.com",
      "template_key": "payment_success",
      "status": "sent",
      "error_message": null,
      "created_at": "2024-02-10T15:30:00Z",
      "updated_at": "2024-02-10T15:30:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with email logs
- 401: User not authenticated
- 403: Unauthorized access
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L2322-L2340)

### GET /api/admin/init-email-templates
Initialize email templates.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins and owners only

**Response Schema**:
```json
{
  "success": true,
  "message": "Email templates initialized successfully"
}
```

**Status Codes**:
- 200: Email templates initialized successfully
- 401: User not authenticated
- 403: Unauthorized access
- 500: Failed to initialize email templates

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L2342-L2380)

### GET /api/admin/ai-config
Retrieve AI configuration.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "model_provider": "openai",
    "model_name": "gpt-4o-mini",
    "temperature": 0.7,
    "max_tokens": 500,
    "personality": "friendly",
    "language": "en",
    "is_active": true,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
}
```

**Status Codes**:
- 200: Successful response with AI configuration
- 401: User not authenticated
- 403: Unauthorized access
- 500: Failed to fetch AI configuration

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L882-L900)

### POST /api/admin/ai-config
Update AI configuration.

**HTTP Method**: POST  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins only

**Request Body**:
```json
{
  "model_provider": "openai",
  "model_name": "gpt-4o-mini",
  "temperature": 0.7,
  "max_tokens": 500,
  "personality": "friendly",
  "language": "en"
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "AI configuration updated successfully"
}
```

**Status Codes**:
- 200: AI configuration updated successfully
- 400: Invalid model provider or personality setting
- 401: User not authenticated
- 403: Unauthorized access
- 500: Failed to update AI configuration

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L902-L940)

### POST /api/admin/ai-config/test
Test AI configuration.

**HTTP Method**: POST  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins only

**Request Body**:
```json
{
  "message": "Hello, this is a test message"
}
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "response": "Hello! I'm Sara, your AI assistant. How can I help you today?",
    "latency": 850,
    "tokens_used": 45,
    "confidence": 0.98
  }
}
```

**Status Codes**:
- 200: AI service test successful
- 400: AI service test failed
- 401: User not authenticated
- 403: Unauthorized access
- 500: AI service test failed

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L942-L980)

## Reviews

### GET /api/reviews/:propertyId
Retrieve reviews for a property.

**HTTP Method**: GET  
**Authentication**: None required  
**Required Headers**: None  
**Access Permissions**: Public

**Path Parameters**:
- `propertyId` (number): Property ID

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "property_id": 1,
      "user_id": "user_456",
      "rating": 5,
      "comment": "Excellent stay!",
      "created_at": "2024-01-20T14:30:00Z",
      "reviewer_name": "Ahmed Ali",
      "reviewer_avatar": "https://example.com/avatar.jpg"
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with reviews
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L2382-L2400)

### POST /api/reviews
Submit a review for a property.

**HTTP Method**: POST  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Authenticated users only

**Request Body**:
```json
{
  "property_id": 1,
  "booking_id": "BOOK_123",
  "rating": 5,
  "comment": "Excellent stay!"
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Review submitted successfully"
}
```

**Status Codes**:
- 200: Review submitted successfully
- 400: Invalid review data or already reviewed
- 401: User not authenticated
- 500: Failed to submit review

**Validation Rules**:
- Rating must be between 1 and 5
- User can only submit one review per property
- Booking ID is optional but recommended

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L2402-L2450)

## CMS

### GET /api/cms/pages
Retrieve all CMS pages.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Home",
      "slug": "home",
      "template_id": 1,
      "content": "{\"sections\":[{\"type\":\"hero\",\"title\":\"Welcome to HabibiStay\"}]}",
      "metadata": "{\"seo_title\":\"HabibiStay - Premium Stays\",\"seo_description\":\"Luxury accommodations in Riyadh\"}",
      "status": "published",
      "created_by": "user_123",
      "updated_by": "user_123",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z",
      "published_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with pages
- 401: User not authenticated
- 403: Unauthorized access
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1042-L1060)

### GET /api/cms/pages/:id
Retrieve a specific CMS page by ID.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Path Parameters**:
- `id` (number): Page ID

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Home",
    "slug": "home",
    "template_id": 1,
    "content": "{\"sections\":[{\"type\":\"hero\",\"title\":\"Welcome to HabibiStay\"}]}",
    "metadata": "{\"seo_title\":\"HabibiStay - Premium Stays\",\"seo_description\":\"Luxury accommodations in Riyadh\"}",
    "status": "published",
    "created_by": "user_123",
    "updated_by": "user_123",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z",
    "published_at": "2024-01-01T10:00:00Z"
  }
}
```

**Status Codes**:
- 200: Successful response with page
- 401: User not authenticated
- 403: Unauthorized access
- 404: Page not found
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1062-L1080)

### POST /api/cms/pages
Create a new CMS page.

**HTTP Method**: POST  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins only

**Request Body**:
```json
{
  "title": "About Us",
  "slug": "about",
  "template_id": 2,
  "content": "{\"sections\":[{\"type\":\"text\",\"content\":\"Learn about our story\"}]}",
  "metadata": "{\"seo_title\":\"About HabibiStay\",\"seo_description\":\"Our company story\"}",
  "status": "draft"
}
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "About Us",
    "slug": "about",
    "template_id": 2,
    "content": "{\"sections\":[{\"type\":\"text\",\"content\":\"Learn about our story\"}]}",
    "metadata": "{\"seo_title\":\"About HabibiStay\",\"seo_description\":\"Our company story\"}",
    "status": "draft",
    "created_by": "user_123",
    "updated_by": "user_123",
    "created_at": "2024-01-02T10:00:00Z",
    "updated_at": "2024-01-02T10:00:00Z"
  },
  "message": "Page created successfully"
}
```

**Status Codes**:
- 200: Page created successfully
- 400: Validation error
- 401: User not authenticated
- 403: Unauthorized access
- 500: Failed to create page

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1082-L1100)

### PUT /api/cms/pages/:id
Update a CMS page.

**HTTP Method**: PUT  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins only

**Path Parameters**:
- `id` (number): Page ID

**Request Body**:
```json
{
  "title": "About Us",
  "slug": "about",
  "template_id": 2,
  "content": "{\"sections\":[{\"type\":\"text\",\"content\":\"Learn about our updated story\"}]}",
  "metadata": "{\"seo_title\":\"About HabibiStay\",\"seo_description\":\"Our updated company story\"}",
  "status": "published"
}
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "About Us",
    "slug": "about",
    "template_id": 2,
    "content": "{\"sections\":[{\"type\":\"text\",\"content\":\"Learn about our updated story\"}]}",
    "metadata": "{\"seo_title\":\"About HabibiStay\",\"seo_description\":\"Our updated company story\"}",
    "status": "published",
    "created_by": "user_123",
    "updated_by": "user_123",
    "created_at": "2024-01-02T10:00:00Z",
    "updated_at": "2024-01-02T11:00:00Z",
    "published_at": "2024-01-02T11:00:00Z"
  },
  "message": "Page updated successfully"
}
```

**Status Codes**:
- 200: Page updated successfully
- 400: Validation error
- 401: User not authenticated
- 403: Unauthorized access
- 404: Page not found
- 500: Failed to update page

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1102-L1120)

### DELETE /api/cms/pages/:id
Delete a CMS page.

**HTTP Method**: DELETE  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Path Parameters**:
- `id` (number): Page ID

**Response Schema**:
```json
{
  "success": true,
  "message": "Page deleted successfully"
}
```

**Status Codes**:
- 200: Page deleted successfully
- 401: User not authenticated
- 403: Unauthorized access
- 404: Page not found
- 500: Failed to delete page

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1122-L1140)

### GET /api/cms/templates
Retrieve all CMS templates.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Default Layout",
      "description": "Default page layout with header, content, and footer",
      "content_structure": "{\"sections\":[{\"type\":\"header\"},{\"type\":\"content\"},{\"type\":\"footer\"}]}",
      "preview_image": "https://example.com/templates/default-preview.jpg",
      "is_default": true,
      "parent_template_id": null,
      "design_settings": "{\"color_scheme\":\"blue\",\"font_family\":\"Arial\"}",
      "created_by": "user_123",
      "updated_by": "user_123",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with templates
- 401: User not authenticated
- 403: Unauthorized access
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1142-L1160)

### GET /api/cms/templates/:id
Retrieve a specific CMS template by ID.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Path Parameters**:
- `id` (number): Template ID

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Default Layout",
    "description": "Default page layout with header, content, and footer",
    "content_structure": "{\"sections\":[{\"type\":\"header\"},{\"type\":\"content\"},{\"type\":\"footer\"}]}",
    "preview_image": "https://example.com/templates/default-preview.jpg",
    "is_default": true,
    "parent_template_id": null,
    "design_settings": "{\"color_scheme\":\"blue\",\"font_family\":\"Arial\"}",
    "created_by": "user_123",
    "updated_by": "user_123",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
}
```

**Status Codes**:
- 200: Successful response with template
- 401: User not authenticated
- 403: Unauthorized access
- 404: Template not found
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1162-L1180)

### POST /api/cms/templates
Create a new CMS template.

**HTTP Method**: POST  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins only

**Request Body**:
```json
{
  "name": "Blog Layout",
  "description": "Layout for blog posts with sidebar",
  "content_structure": "{\"sections\":[{\"type\":\"header\"},{\"type\":\"blog-content\"},{\"type\":\"sidebar\"},{\"type\":\"footer\"}]}",
  "preview_image": "https://example.com/templates/blog-preview.jpg",
  "is_default": false,
  "parent_template_id": 1,
  "design_settings": "{\"color_scheme\":\"green\",\"font_family\":\"Georgia\"}"
}
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Blog Layout",
    "description": "Layout for blog posts with sidebar",
    "content_structure": "{\"sections\":[{\"type\":\"header\"},{\"type\":\"blog-content\"},{\"type\":\"sidebar\"},{\"type\":\"footer\"}]}",
    "preview_image": "https://example.com/templates/blog-preview.jpg",
    "is_default": false,
    "parent_template_id": 1,
    "design_settings": "{\"color_scheme\":\"green\",\"font_family\":\"Georgia\"}",
    "created_by": "user_123",
    "updated_by": "user_123",
    "created_at": "2024-01-02T10:00:00Z",
    "updated_at": "2024-01-02T10:00:00Z"
  },
  "message": "Template created successfully"
}
```

**Status Codes**:
- 200: Template created successfully
- 400: Validation error
- 401: User not authenticated
- 403: Unauthorized access
- 500: Failed to create template

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1182-L1200)

### PUT /api/cms/templates/:id
Update a CMS template.

**HTTP Method**: PUT  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins only

**Path Parameters**:
- `id` (number): Template ID

**Request Body**:
```json
{
  "name": "Blog Layout",
  "description": "Updated layout for blog posts with enhanced sidebar",
  "content_structure": "{\"sections\":[{\"type\":\"header\"},{\"type\":\"blog-content\"},{\"type\":\"enhanced-sidebar\"},{\"type\":\"footer\"}]}",
  "preview_image": "https://example.com/templates/blog-preview-v2.jpg",
  "is_default": false,
  "parent_template_id": 1,
  "design_settings": "{\"color_scheme\":\"green\",\"font_family\":\"Georgia\",\"sidebar_width\":\"300px\"}"
}
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Blog Layout",
    "description": "Updated layout for blog posts with enhanced sidebar",
    "content_structure": "{\"sections\":[{\"type\":\"header\"},{\"type\":\"blog-content\"},{\"type\":\"enhanced-sidebar\"},{\"type\":\"footer\"}]}",
    "preview_image": "https://example.com/templates/blog-preview-v2.jpg",
    "is_default": false,
    "parent_template_id": 1,
    "design_settings": "{\"color_scheme\":\"green\",\"font_family\":\"Georgia\",\"sidebar_width\":\"300px\"}",
    "created_by": "user_123",
    "updated_by": "user_123",
    "created_at": "2024-01-02T10:00:00Z",
    "updated_at": "2024-01-02T11:00:00Z"
  },
  "message": "Template updated successfully"
}
```

**Status Codes**:
- 200: Template updated successfully
- 400: Validation error
- 401: User not authenticated
- 403: Unauthorized access
- 404: Template not found
- 500: Failed to update template

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1202-L1220)

### DELETE /api/cms/templates/:id
Delete a CMS template.

**HTTP Method**: DELETE  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Path Parameters**:
- `id` (number): Template ID

**Response Schema**:
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

**Status Codes**:
- 200: Template deleted successfully
- 401: User not authenticated
- 403: Unauthorized access
- 404: Template not found
- 500: Failed to delete template

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1222-L1240)

### GET /api/cms/components
Retrieve all CMS components.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "hero",
      "name": "Hero Banner",
      "properties": "{\"title\":\"Welcome\",\"subtitle\":\"Luxury Stays in Riyadh\"}",
      "styles": "{\"background_color\":\"#2957c3\",\"text_color\":\"white\"}",
      "created_by": "user_123",
      "updated_by": "user_123",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with components
- 401: User not authenticated
- 403: Unauthorized access
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1242-L1260)

### GET /api/cms/components/:id
Retrieve a specific CMS component by ID.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Path Parameters**:
- `id` (number): Component ID

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "hero",
    "name": "Hero Banner",
    "properties": "{\"title\":\"Welcome\",\"subtitle\":\"Luxury Stays in Riyadh\"}",
    "styles": "{\"background_color\":\"#2957c3\",\"text_color\":\"white\"}",
    "created_by": "user_123",
    "updated_by": "user_123",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
}
```

**Status Codes**:
- 200: Successful response with component
- 401: User not authenticated
- 403: Unauthorized access
- 404: Component not found
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1262-L1280)

### POST /api/cms/components
Create a new CMS component.

**HTTP Method**: POST  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins only

**Request Body**:
```json
{
  "type": "testimonial",
  "name": "Customer Testimonial",
  "properties": "{\"quote\":\"Excellent service!\",\"author\":\"John Doe\",\"rating\":5}",
  "styles": "{\"background_color\":\"#f8f9fa\",\"border_radius\":\"8px\"}"
}
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "type": "testimonial",
    "name": "Customer Testimonial",
    "properties": "{\"quote\":\"Excellent service!\",\"author\":\"John Doe\",\"rating\":5}",
    "styles": "{\"background_color\":\"#f8f9fa\",\"border_radius\":\"8px\"}",
    "created_by": "user_123",
    "updated_by": "user_123",
    "created_at": "2024-01-02T10:00:00Z",
    "updated_at": "2024-01-02T10:00:00Z"
  },
  "message": "Component created successfully"
}
```

**Status Codes**:
- 200: Component created successfully
- 400: Validation error
- 401: User not authenticated
- 403: Unauthorized access
- 500: Failed to create component

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1282-L1300)

### PUT /api/cms/components/:id
Update a CMS component.

**HTTP Method**: PUT  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins only

**Path Parameters**:
- `id` (number): Component ID

**Request Body**:
```json
{
  "type": "testimonial",
  "name": "Customer Testimonial",
  "properties": "{\"quote\":\"Outstanding experience!\",\"author\":\"John Doe\",\"rating\":5,\"location\":\"Riyadh\"}",
  "styles": "{\"background_color\":\"#f8f9fa\",\"border_radius\":\"8px\",\"padding\":\"20px\"}"
}
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "type": "testimonial",
    "name": "Customer Testimonial",
    "properties": "{\"quote\":\"Outstanding experience!\",\"author\":\"John Doe\",\"rating\":5,\"location\":\"Riyadh\"}",
    "styles": "{\"background_color\":\"#f8f9fa\",\"border_radius\":\"8px\",\"padding\":\"20px\"}",
    "created_by": "user_123",
    "updated_by": "user_123",
    "created_at": "2024-01-02T10:00:00Z",
    "updated_at": "2024-01-02T11:00:00Z"
  },
  "message": "Component updated successfully"
}
```

**Status Codes**:
- 200: Component updated successfully
- 400: Validation error
- 401: User not authenticated
- 403: Unauthorized access
- 404: Component not found
- 500: Failed to update component

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1302-L1320)

### DELETE /api/cms/components/:id
Delete a CMS component.

**HTTP Method**: DELETE  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Path Parameters**:
- `id` (number): Component ID

**Response Schema**:
```json
{
  "success": true,
  "message": "Component deleted successfully"
}
```

**Status Codes**:
- 200: Component deleted successfully
- 401: User not authenticated
- 403: Unauthorized access
- 404: Component not found
- 500: Failed to delete component

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1322-L1340)

### GET /api/cms/media
Retrieve all CMS media files.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "filename": "luxury-apartment.jpg",
      "original_name": "luxury-apartment.jpg",
      "mime_type": "image/jpeg",
      "size": 154230,
      "url": "https://example.com/media/luxury-apartment.jpg",
      "alt_text": "Luxury apartment in Riyadh",
      "caption": "Modern luxury apartment with city views",
      "created_by": "user_123",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with media files
- 401: User not authenticated
- 403: Unauthorized access
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1342-L1360)

### GET /api/cms/media/:id
Retrieve a specific CMS media file by ID.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Path Parameters**:
- `id` (number): Media ID

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "filename": "luxury-apartment.jpg",
    "original_name": "luxury-apartment.jpg",
    "mime_type": "image/jpeg",
    "size": 154230,
    "url": "https://example.com/media/luxury-apartment.jpg",
    "alt_text": "Luxury apartment in Riyadh",
    "caption": "Modern luxury apartment with city views",
    "created_by": "user_123",
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

**Status Codes**:
- 200: Successful response with media file
- 401: User not authenticated
- 403: Unauthorized access
- 404: Media not found
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1362-L1380)

### POST /api/cms/media
Upload a new CMS media file.

**HTTP Method**: POST  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins only

**Request Body**:
```json
{
  "filename": "new-property.jpg",
  "original_name": "new-property.jpg",
  "mime_type": "image/jpeg",
  "size": 204850,
  "url": "https://example.com/media/new-property.jpg",
  "alt_text": "New property listing",
  "caption": "Beautiful new property available for booking"
}
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "filename": "new-property.jpg",
    "original_name": "new-property.jpg",
    "mime_type": "image/jpeg",
    "size": 204850,
    "url": "https://example.com/media/new-property.jpg",
    "alt_text": "New property listing",
    "caption": "Beautiful new property available for booking",
    "created_by": "user_123",
    "created_at": "2024-01-02T10:00:00Z"
  },
  "message": "Media created successfully"
}
```

**Status Codes**:
- 200: Media created successfully
- 400: Validation error
- 401: User not authenticated
- 403: Unauthorized access
- 500: Failed to create media

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1382-L1400)

### DELETE /api/cms/media/:id
Delete a CMS media file.

**HTTP Method**: DELETE  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Path Parameters**:
- `id` (number): Media ID

**Response Schema**:
```json
{
  "success": true,
  "message": "Media deleted successfully"
}
```

**Status Codes**:
- 200: Media deleted successfully
- 401: User not authenticated
- 403: Unauthorized access
- 404: Media not found
- 500: Failed to delete media

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1402-L1420)

## AI Content

### GET /api/cms/ai/providers
Retrieve all AI providers.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "OpenAI",
      "api_key": "sk-...",
      "api_url": "https://api.openai.com/v1",
      "enabled": true,
      "default_model": "gpt-4",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with AI providers
- 401: User not authenticated
- 403: Unauthorized access
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1422-L1440)

### GET /api/cms/ai/providers/:id
Retrieve a specific AI provider by ID.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Path Parameters**:
- `id` (number): Provider ID

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "OpenAI",
    "api_key": "sk-...",
    "api_url": "https://api.openai.com/v1",
    "enabled": true,
    "default_model": "gpt-4",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
}
```

**Status Codes**:
- 200: Successful response with AI provider
- 401: User not authenticated
- 403: Unauthorized access
- 404: Provider not found
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1442-L1460)

### POST /api/cms/ai/providers
Create a new AI provider.

**HTTP Method**: POST  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins only

**Request Body**:
```json
{
  "name": "Anthropic",
  "api_key": "sk-...",
  "api_url": "https://api.anthropic.com/v1",
  "enabled": true,
  "default_model": "claude-2"
}
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Anthropic",
    "api_key": "sk-...",
    "api_url": "https://api.anthropic.com/v1",
    "enabled": true,
    "default_model": "claude-2",
    "created_at": "2024-01-02T10:00:00Z",
    "updated_at": "2024-01-02T10:00:00Z"
  },
  "message": "AI provider created successfully"
}
```

**Status Codes**:
- 200: AI provider created successfully
- 400: Validation error
- 401: User not authenticated
- 403: Unauthorized access
- 500: Failed to create AI provider

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1462-L1480)

### PUT /api/cms/ai/providers/:id
Update an AI provider.

**HTTP Method**: PUT  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins only

**Path Parameters**:
- `id` (number): Provider ID

**Request Body**:
```json
{
  "name": "Anthropic",
  "api_key": "sk-...",
  "api_url": "https://api.anthropic.com/v1",
  "enabled": true,
  "default_model": "claude-3"
}
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Anthropic",
    "api_key": "sk-...",
    "api_url": "https://api.anthropic.com/v1",
    "enabled": true,
    "default_model": "claude-3",
    "created_at": "2024-01-02T10:00:00Z",
    "updated_at": "2024-01-02T11:00:00Z"
  },
  "message": "AI provider updated successfully"
}
```

**Status Codes**:
- 200: AI provider updated successfully
- 400: Validation error
- 401: User not authenticated
- 403: Unauthorized access
- 404: Provider not found
- 500: Failed to update AI provider

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1482-L1500)

### DELETE /api/cms/ai/providers/:id
Delete an AI provider.

**HTTP Method**: DELETE  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Path Parameters**:
- `id` (number): Provider ID

**Response Schema**:
```json
{
  "success": true,
  "message": "AI provider deleted successfully"
}
```

**Status Codes**:
- 200: AI provider deleted successfully
- 401: User not authenticated
- 403: Unauthorized access
- 404: Provider not found
- 500: Failed to delete AI provider

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1502-L1520)

### GET /api/cms/ai/providers/:providerId/models
Retrieve all AI models for a specific provider.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Path Parameters**:
- `providerId` (number): Provider ID

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "provider_id": 1,
      "name": "gpt-4",
      "capabilities": "[\"text-generation\",\"code-generation\"]",
      "max_tokens": 8192,
      "pricing": 0.06,
      "performance": 0.95,
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with AI models
- 401: User not authenticated
- 403: Unauthorized access
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1522-L1540)

### POST /api/cms/ai/providers/:providerId/models/refresh
Refresh AI models from a specific provider.

**HTTP Method**: POST  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Path Parameters**:
- `providerId` (number): Provider ID

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "provider_id": 1,
      "name": "gpt-4",
      "capabilities": "[\"text-generation\",\"code-generation\"]",
      "max_tokens": 8192,
      "pricing": 0.06,
      "performance": 0.95,
      "created_at": "2024-01-01T10:00:00Z"
    }
  ],
  "message": "Models refreshed successfully"
}
```

**Status Codes**:
- 200: Models refreshed successfully
- 401: User not authenticated
- 403: Unauthorized access
- 500: Failed to refresh models

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1542-L1560)

### POST /api/cms/ai/models
Create a new AI model.

**HTTP Method**: POST  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins only

**Request Body**:
```json
{
  "provider_id": 1,
  "name": "gpt-4-turbo",
  "capabilities": "[\"text-generation\",\"code-generation\",\"vision\"]",
  "max_tokens": 128000,
  "pricing": 0.01,
  "performance": 0.98
}
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "provider_id": 1,
    "name": "gpt-4-turbo",
    "capabilities": "[\"text-generation\",\"code-generation\",\"vision\"]",
    "max_tokens": 128000,
    "pricing": 0.01,
    "performance": 0.98,
    "created_at": "2024-01-02T10:00:00Z"
  },
  "message": "AI model created successfully"
}
```

**Status Codes**:
- 200: AI model created successfully
- 400: Validation error
- 401: User not authenticated
- 403: Unauthorized access
- 500: Failed to create AI model

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1562-L1580)

### PUT /api/cms/ai/models/:id
Update an AI model.

**HTTP Method**: PUT  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins only

**Path Parameters**:
- `id` (number): Model ID

**Request Body**:
```json
{
  "name": "gpt-4-turbo",
  "capabilities": "[\"text-generation\",\"code-generation\",\"vision\",\"audio\"]",
  "max_tokens": 128000,
  "pricing": 0.008,
  "performance": 0.99
}
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "provider_id": 1,
    "name": "gpt-4-turbo",
    "capabilities": "[\"text-generation\",\"code-generation\",\"vision\",\"audio\"]",
    "max_tokens": 128000,
    "pricing": 0.008,
    "performance": 0.99,
    "created_at": "2024-01-02T10:00:00Z",
    "updated_at": "2024-01-02T11:00:00Z"
  },
  "message": "AI model updated successfully"
}
```

**Status Codes**:
- 200: AI model updated successfully
- 400: Validation error
- 401: User not authenticated
- 403: Unauthorized access
- 404: Model not found
- 500: Failed to update AI model

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1582-L1600)

### DELETE /api/cms/ai/models/:id
Delete an AI model.

**HTTP Method**: DELETE  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Path Parameters**:
- `id` (number): Model ID

**Response Schema**:
```json
{
  "success": true,
  "message": "AI model deleted successfully"
}
```

**Status Codes**:
- 200: AI model deleted successfully
- 401: User not authenticated
- 403: Unauthorized access
- 404: Model not found
- 500: Failed to delete AI model

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1602-L1620)

### GET /api/cms/ai/jobs
Retrieve all pending AI content jobs.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "provider_id": 1,
      "model_id": 1,
      "prompt": "Generate a description for a luxury apartment in Riyadh",
      "content": null,
      "status": "pending",
      "created_by": "user_123",
      "created_at": "2024-01-01T10:00:00Z",
      "completed_at": null,
      "metadata": "{\"temperature\":0.7,\"max_tokens\":500}"
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with AI jobs
- 401: User not authenticated
- 403: Unauthorized access
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1622-L1640)

### POST /api/cms/ai/generate
Create a new AI content generation job.

**HTTP Method**: POST  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins only

**Request Body**:
```json
{
  "provider_id": 1,
  "model_id": 1,
  "prompt": "Generate a description for a luxury apartment in Riyadh",
  "metadata": "{\"temperature\":0.7,\"max_tokens\":500}"
}
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "provider_id": 1,
    "model_id": 1,
    "prompt": "Generate a description for a luxury apartment in Riyadh",
    "content": null,
    "status": "pending",
    "created_by": "user_123",
    "created_at": "2024-01-02T10:00:00Z",
    "completed_at": null,
    "metadata": "{\"temperature\":0.7,\"max_tokens\":500}"
  },
  "message": "AI content job created successfully"
}
```

**Status Codes**:
- 200: AI content job created successfully
- 400: Validation error
- 401: User not authenticated
- 403: Unauthorized access
- 500: Failed to create AI content job

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1642-L1660)

### PUT /api/cms/ai/jobs/:id
Update an AI content job.

**HTTP Method**: PUT  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins only

**Path Parameters**:
- `id` (number): Job ID

**Request Body**:
```json
{
  "status": "processing",
  "content": "A luxurious apartment located in the heart of Riyadh, offering stunning city views and premium amenities..."
}
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "provider_id": 1,
    "model_id": 1,
    "prompt": "Generate a description for a luxury apartment in Riyadh",
    "content": "A luxurious apartment located in the heart of Riyadh, offering stunning city views and premium amenities...",
    "status": "processing",
    "created_by": "user_123",
    "created_at": "2024-01-02T10:00:00Z",
    "completed_at": null,
    "metadata": "{\"temperature\":0.7,\"max_tokens\":500}"
  },
  "message": "AI content job updated successfully"
}
```

**Status Codes**:
- 200: AI content job updated successfully
- 400: Validation error
- 401: User not authenticated
- 403: Unauthorized access
- 404: Job not found
- 500: Failed to update AI content job

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1662-L1680)

### POST /api/cms/ai/process-jobs
Process all pending AI content jobs.

**HTTP Method**: POST  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Response Schema**:
```json
{
  "success": true,
  "message": "AI content jobs processed successfully"
}
```

**Status Codes**:
- 200: AI content jobs processed successfully
- 401: User not authenticated
- 403: Unauthorized access
- 500: Failed to process AI content jobs

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1682-L1700)

## Permissions

### GET /api/cms/permissions
Retrieve all CMS permissions for the current user.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Response Schema**:
```json
{
  "success": true,
  "data": [
    "cms.pages.view",
    "cms.pages.create",
    "cms.pages.edit",
    "cms.templates.view",
    "cms.components.manage"
  ]
}
```

**Status Codes**:
- 200: Successful response with user permissions
- 401: User not authenticated
- 403: Unauthorized access
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1702-L1720)

### GET /api/cms/permissions/all
Retrieve all available CMS permissions.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Response Schema**:
```json
{
  "success": true,
  "data": [
    {
      "name": "cms.pages.view",
      "description": "View CMS pages"
    },
    {
      "name": "cms.pages.create",
      "description": "Create CMS pages"
    },
    {
      "name": "cms.pages.edit",
      "description": "Edit CMS pages"
    },
    {
      "name": "cms.pages.delete",
      "description": "Delete CMS pages"
    },
    {
      "name": "cms.templates.view",
      "description": "View CMS templates"
    },
    {
      "name": "cms.templates.create",
      "description": "Create CMS templates"
    },
    {
      "name": "cms.templates.edit",
      "description": "Edit CMS templates"
    },
    {
      "name": "cms.templates.delete",
      "description": "Delete CMS templates"
    },
    {
      "name": "cms.components.view",
      "description": "View CMS components"
    },
    {
      "name": "cms.components.create",
      "description": "Create CMS components"
    },
    {
      "name": "cms.components.edit",
      "description": "Edit CMS components"
    },
    {
      "name": "cms.components.delete",
      "description": "Delete CMS components"
    },
    {
      "name": "cms.media.view",
      "description": "View CMS media"
    },
    {
      "name": "cms.media.upload",
      "description": "Upload CMS media"
    },
    {
      "name": "cms.media.delete",
      "description": "Delete CMS media"
    },
    {
      "name": "cms.ai.providers.manage",
      "description": "Manage AI providers"
    },
    {
      "name": "cms.ai.models.manage",
      "description": "Manage AI models"
    },
    {
      "name": "cms.ai.jobs.manage",
      "description": "Manage AI content jobs"
    },
    {
      "name": "cms.permissions.manage",
      "description": "Manage CMS permissions"
    }
  ]
}
```

**Status Codes**:
- 200: Successful response with all permissions
- 401: User not authenticated
- 403: Unauthorized access
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1722-L1740)

### GET /api/cms/permissions/check/:permission
Check if the current user has a specific CMS permission.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Admins only

**Path Parameters**:
- `permission` (string): Permission name to check

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "hasPermission": true
  }
}
```

**Status Codes**:
- 200: Successful response with permission check result
- 401: User not authenticated
- 403: Unauthorized access
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1742-L1760)

### POST /api/cms/permissions/grant
Grant a CMS permission to a user.

**HTTP Method**: POST  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins only

**Request Body**:
```json
{
  "userId": "user_123",
  "permission": "cms.pages.create"
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Permission granted successfully"
}
```

**Status Codes**:
- 200: Permission granted successfully
- 400: Validation error
- 401: User not authenticated
- 403: Unauthorized access
- 500: Failed to grant permission

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1762-L1780)

### POST /api/cms/permissions/revoke
Revoke a CMS permission from a user.

**HTTP Method**: POST  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Access Permissions**: Admins only

**Request Body**:
```json
{
  "userId": "user_123",
  "permission": "cms.pages.create"
}
```

**Response Schema**:
```json
{
  "success": true,
  "message": "Permission revoked successfully"
}
```

**Status Codes**:
- 200: Permission revoked successfully
- 400: Validation error
- 401: User not authenticated
- 403: Unauthorized access
- 500: Failed to revoke permission

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L1782-L1800)

## Authentication

### GET /api/oauth/google/redirect_url
Get the Google OAuth redirect URL for authentication.

**HTTP Method**: GET  
**Authentication**: None required  
**Required Headers**: None  
**Access Permissions**: Public

**Response Schema**:
```json
{
  "redirectUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=your_client_id&redirect_uri=your_redirect_uri&response_type=code&scope=profile+email&access_type=offline"
}
```

**Status Codes**:
- 200: Successful response with redirect URL

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L114-L124)

### POST /api/sessions
Create a new session using an OAuth authorization code.

**HTTP Method**: POST  
**Authentication**: OAuth authorization code  
**Required Headers**: 
- `Content-Type: application/json`

**Access Permissions**: Public

**Request Body**:
```json
{
  "code": "oauth-authorization-code"
}
```

**Response Schema**:
```json
{
  "success": true
}
```

**Status Codes**:
- 200: Session created successfully
- 400: No authorization code provided
- 500: Failed to create session

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L126-L147)

### GET /api/users/me
Retrieve the authenticated user's information.

**HTTP Method**: GET  
**Authentication**: JWT required  
**Required Headers**: 
- `Authorization: Bearer <token>`

**Access Permissions**: Authenticated users only

**Response Schema**:
```json
{
  "id": "user_123",
  "email": "john@example.com",
  "google_user_data": {
    "sub": "1234567890",
    "name": "John Doe",
    "picture": "https://example.com/avatar.jpg",
    "email": "john@example.com"
  },
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-10T14:30:00Z"
}
```

**Status Codes**:
- 200: Successful response with user information
- 401: User not authenticated
- 500: Internal server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L149-L154)

### GET /api/logout
Log out the current user by invalidating their session.

**HTTP Method**: GET  
**Authentication**: Session cookie  
**Required Headers**: None  
**Access Permissions**: Authenticated users only

**Response Schema**:
```json
{
  "success": true
}
```

**Status Codes**:
- 200: Successfully logged out

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L156-L172)

## Data Validation Schemas

The API uses Zod schemas for request validation. These schemas define the structure and constraints for request data.

### CreatePropertySchema
Validates property creation requests.

```typescript
const CreatePropertySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  location: z.string().min(3).max(200),
  price_per_night: z.number().positive(),
  max_guests: z.number().int().positive(),
  bedrooms: z.number().int().positive().optional(),
  bathrooms: z.number().int().positive().optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
});
```

**Validation Rules**:
- Title: 3-100 characters
- Description: Up to 1000 characters (optional)
- Location: 3-200 characters
- Price per night: Positive number
- Max guests: Positive integer
- Bedrooms: Positive integer (optional)
- Bathrooms: Positive integer (optional)
- Amenities: Array of strings (optional)
- Images: Array of valid URLs (optional)

**Section sources**
- [src/shared/types.ts](file://src/shared/types.ts)

### BookingCreateSchema
Validates booking creation requests.

```typescript
const BookingCreateSchema = z.object({
  property_id: z.number().positive(),
  check_in_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  check_out_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().min(1).max(20),
  guest_name: z.string().min(2).max(100),
  guest_email: z.string().email(),
  guest_phone: z.string().min(10),
  special_requests: z.string().optional(),
  promo_code: z.string().optional()
});
```

**Validation Rules**:
- Property ID: Positive integer
- Check-in date: Valid date string in YYYY-MM-DD format
- Check-out date: Valid date string in YYYY-MM-DD format
- Guests: 1-20
- Guest name: 2-100 characters
- Guest email: Valid email format
- Guest phone: At least 10 characters
- Special requests: Up to 500 characters (optional)
- Promo code: String (optional)

**Section sources**
- [src/shared/types.ts](file://src/shared/types.ts#L44-L54)

### CreatePaymentSchema
Validates payment creation requests.

```typescript
const CreatePaymentSchema = z.object({
  booking_id: z.number(),
  amount: z.number().positive(),
  currency: z.string().default('SAR'),
  return_url: z.string().url(),
  cancel_url: z.string().url(),
});
```

**Validation Rules**:
- Booking ID: Number
- Amount: Positive number
- Currency: String (default: SAR)
- Return URL: Valid URL
- Cancel URL: Valid URL

**Section sources**
- [src/shared/payment.ts](file://src/shared/payment.ts#L29-L35)

### PaymentCallbackSchema
Validates payment callback requests.

```typescript
const PaymentCallbackSchema = z.object({
  paymentId: z.string(),
  Id: z.string().optional(),
  InvoiceId: z.string().optional(),
});
```

**Validation Rules**:
- Payment ID: String (required)
- Id: String (optional)
- InvoiceId: String (optional)

**Section sources**
- [src/shared/payment.ts](file://src/shared/payment.ts#L37-L41)

### CreateUserProfileSchema
Validates user profile update requests.

```typescript
const CreateUserProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  date_of_birth: z.string().date().optional(),
  preferred_language: z.string().length(2).optional(),
  currency: z.string().length(3).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional(),
});
```

**Validation Rules**:
- Full name: 2-100 characters (optional)
- Phone: Up to 20 characters (optional)
- Address: Up to 200 characters (optional)
- City: Up to 100 characters (optional)
- Country: Up to 100 characters (optional)
- Date of birth: Valid date string (optional)
- Preferred language: 2-character language code (optional)
- Currency: 3-character currency code (optional)
- Bio: Up to 500 characters (optional)
- Avatar URL: Valid URL (optional)

**Section sources**
- [src/shared/types.ts](file://src/shared/types.ts)

### PageSchema
Validates CMS page creation and update requests.

```typescript
const PageSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  template_id: z.number().nullable().optional(),
  content: z.string().nullable().optional(),
  metadata: z.string().nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  created_by: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  published_at: z.string().nullable().optional(),
});
```

**Validation Rules**:
- Title: At least 1 character
- Slug: At least 1 character
- Template ID: Number or null (optional)
- Content: String or null (optional)
- Metadata: String or null (optional)
- Status: Must be one of 'draft', 'published', 'archived'
- Created by: String or null (optional)
- Updated by: String or null (optional)
- Created at: ISO date string (optional)
- Updated at: ISO date string (optional)
- Published at: ISO date string or null (optional)

**Section sources**
- [src/shared/types.ts](file://src/shared/types.ts)

### TemplateSchema
Validates CMS template creation and update requests.

```typescript
const TemplateSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  content_structure: z.string().nullable().optional(),
  preview_image: z.string().nullable().optional(),
  is_default: z.boolean().optional(),
  parent_template_id: z.number().nullable().optional(),
  design_settings: z.string().nullable().optional(),
  created_by: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
```

**Validation Rules**:
- Name: At least 1 character
- Description: String or null (optional)
- Content structure: String or null (optional)
- Preview image: String or null (optional)
- Is default: Boolean (optional)
- Parent template ID: Number or null (optional)
- Design settings: String or null (optional)
- Created by: String or null (optional)
- Updated by: String or null (optional)
- Created at: ISO date string (optional)
- Updated at: ISO date string (optional)

**Section sources**
- [src/shared/types.ts](file://src/shared/types.ts)

### ComponentSchema
Validates CMS component creation and update requests.

```typescript
const ComponentSchema = z.object({
  id: z.number().optional(),
  type: z.string().min(1),
  name: z.string().min(1),
  properties: z.string().nullable().optional(),
  styles: z.string().nullable().optional(),
  created_by: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
```

**Validation Rules**:
- Type: At least 1 character
- Name: At least 1 character
- Properties: String or null (optional)
- Styles: String or null (optional)
- Created by: String or null (optional)
- Updated by: String or null (optional)
- Created at: ISO date string (optional)
- Updated at: ISO date string (optional)

**Section sources**
- [src/shared/types.ts](file://src/shared/types.ts)

### MediaSchema
Validates CMS media creation requests.

```typescript
const MediaSchema = z.object({
  id: z.number().optional(),
  filename: z.string().min(1),
  original_name: z.string().min(1),
  mime_type: z.string().min(1),
  size: z.number().positive(),
  url: z.string().url(),
  alt_text: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  created_by: z.string().nullable().optional(),
  created_at: z.string().optional(),
});
```

**Validation Rules**:
- Filename: At least 1 character
- Original name: At least 1 character
- Mime type: At least 1 character
- Size: Positive number
- URL: Valid URL
- Alt text: String or null (optional)
- Caption: String or null (optional)
- Created by: String or null (optional)
- Created at: ISO date string (optional)

**Section sources**
- [src/shared/types.ts](file://src/shared/types.ts)

### CMSAIProviderSchema
Validates AI provider creation and update requests.

```typescript
const CMSAIProviderSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  api_key: z.string().nullable().optional(),
  api_url: z.string().nullable().optional(),
  enabled: z.boolean().optional(),
  default_model: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
```

**Validation Rules**:
- Name: At least 1 character
- API key: String or null (optional)
- API URL: String or null (optional)
- Enabled: Boolean (optional)
- Default model: String or null (optional)
- Created at: ISO date string (optional)
- Updated at: ISO date string (optional)

**Section sources**
- [src/shared/types.ts](file://src/shared/types.ts)

### AIModelSchema
Validates AI model creation and update requests.

```typescript
const AIModelSchema = z.object({
  id: z.number().optional(),
  provider_id: z.number().positive(),
  name: z.string().min(1),
  capabilities: z.string().nullable().optional(),
  max_tokens: z.number().nullable().optional(),
  pricing: z.number().nullable().optional(),
  performance: z.number().nullable().optional(),
  created_at: z.string().optional(),
});
```

**Validation Rules**:
- Provider ID: Positive integer
- Name: At least 1 character
- Capabilities: String or null (optional)
- Max tokens: Number or null (optional)
- Pricing: Number or null (optional)
- Performance: Number or null (optional)
- Created at: ISO date string (optional)

**Section sources**
- [src/shared/types.ts](file://src/shared/types.ts)

### AIContentJobSchema
Validates AI content job creation and update requests.

```typescript
const AIContentJobSchema = z.object({
  id: z.number().optional(),
  provider_id: z.number().positive(),
  model_id: z.number().positive(),
  prompt: z.string().min(1),
  content: z.string().nullable().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  created_by: z.string().nullable().optional(),
  created_at: z.string().optional(),
  completed_at: z.string().nullable().optional(),
  metadata: z.string().nullable().optional(),
});
```

**Validation Rules**:
- Provider ID: Positive integer
- Model ID: Positive integer
- Prompt: At least 1 character
- Content: String or null (optional)
- Status: Must be one of 'pending', 'processing', 'completed', 'failed'
- Created by: String or null (optional)
- Created at: ISO date string (optional)
- Completed at: ISO date string or null (optional)
- Metadata: String or null (optional)

**Section sources**
- [src/shared/types.ts](file://src/shared/types.ts)

### Pagination Strategy
The API implements cursor-based pagination for list endpoints:

- Default page size: 20 items
- Maximum page size: 100 items
- Response includes pagination metadata:
  - `page`: Current page number
  - `limit`: Number of items per page
  - `total`: Total number of items
  - `totalPages`: Total number of pages

Endpoints that support pagination:
- GET /api/properties
- GET /api/bookings/my-bookings
- GET /api/properties/my-properties

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L164-L278)

### Error Response Format
All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message (development only)"
}
```

**Status Codes**:
- 400: Bad Request - Validation error or invalid parameters
- 401: Unauthorized - Authentication required or invalid credentials
- 403: Forbidden - Access denied
- 404: Not Found - Resource not found
- 409: Conflict - Resource conflict (e.g., date conflict)
- 500: Internal Server Error - Unexpected server error

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L104-L112)

### Authentication Requirements
The API uses JWT-based authentication with Google OAuth integration:

- **JWT Authentication**: Most endpoints require a valid JWT token in the Authorization header
- **Google OAuth**: Users authenticate via Google OAuth flow
- **Session Management**: Sessions are managed via secure HTTP-only cookies
- **Public Endpoints**: Search, property details, and chat endpoints are publicly accessible

**Authentication Flow**:
1. Client requests Google OAuth redirect URL
2. User authenticates with Google
3. Google redirects back with authorization code
4. Client exchanges code for session token
5. Session token is stored in HTTP-only cookie
6. Subsequent requests include the cookie automatically

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L114-L172)