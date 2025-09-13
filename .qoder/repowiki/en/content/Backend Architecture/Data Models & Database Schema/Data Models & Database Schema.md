# Data Models & Database Schema

<cite>
**Referenced Files in This Document**   
- [types.ts](file://src/shared/types.ts)
- [1.sql](file://migrations/1.sql)
- [4.sql](file://migrations/4.sql)
- [5.sql](file://migrations/5.sql)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Core Data Models](#core-data-models)
   - [User](#user)
   - [Property](#property)
   - [Booking](#booking)
   - [Payment](#payment)
   - [Review](#review)
   - [Wishlist](#wishlist)
   - [PropertyAnalytics](#propertyanalytics)
3. [Entity Relationships](#entity-relationships)
4. [Data Validation and Business Logic](#data-validation-and-business-logic)
5. [Sample Data Records](#sample-data-records)
6. [Database Indexing and Performance](#database-indexing-and-performance)
7. [Data Lifecycle and Security](#data-lifecycle-and-security)

## Introduction
This document provides comprehensive documentation for the core data models in the HabibiStay backend system. The data architecture is designed to support a full-featured property booking platform with AI-powered features, analytics, and multi-channel integration. The schema is implemented using SQLite with D1 database on Cloudflare Workers, and TypeScript interfaces are used throughout the application to ensure type safety. This documentation covers all core entities including Property, Booking, Payment, User, Review, Wishlist, and PropertyAnalytics, detailing their structure, relationships, constraints, and usage patterns.

## Core Data Models

### User
The User model represents platform users with three distinct roles: guest, host, and admin. It serves as the foundation for authentication, authorization, and personalization across the system.

**Field Definitions:**
- `id`: TEXT PRIMARY KEY - Unique user identifier (UUID)
- `email`: TEXT UNIQUE NOT NULL - User's email address
- `name`: TEXT NOT NULL - Full name of the user
- `avatar`: TEXT - URL to profile picture
- `phone`: TEXT - Phone number
- `role`: TEXT DEFAULT 'guest' - User role with CHECK constraint (guest, host, admin)
- `is_verified`: BOOLEAN DEFAULT 0 - Email verification status
- `is_active`: BOOLEAN DEFAULT 1 - Account status
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP - Creation timestamp
- `updated_at`: DATETIME DEFAULT CURRENT_TIMESTAMP - Last update timestamp

**Constraints:**
- Primary Key: `id`
- Unique Constraint: `email`
- Check Constraint: `role` must be one of 'guest', 'host', 'admin'

**Section sources**
- [1.sql](file://migrations/1.sql#L1-L13)
- [types.ts](file://src/shared/types.ts#L299-L307)

### Property
The Property model represents accommodations listed on the platform, ranging from apartments to villas. It contains comprehensive details about the property's features, pricing, and availability rules.

**Field Definitions:**
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT - Unique property identifier
- `owner_id`: TEXT NOT NULL - Foreign key to users table
- `title`: TEXT NOT NULL - Property title
- `description`: TEXT - Detailed description
- `location`: TEXT NOT NULL - Geographic location
- `address`: TEXT - Full address
- `latitude`: REAL - Geographic coordinate
- `longitude`: REAL - Geographic coordinate
- `price_per_night`: REAL NOT NULL - Base price per night
- `currency`: TEXT DEFAULT 'SAR' - Currency code
- `max_guests`: INTEGER NOT NULL - Maximum occupancy
- `bedrooms`: INTEGER DEFAULT 1 - Number of bedrooms
- `bathrooms`: INTEGER DEFAULT 1 - Number of bathrooms
- `property_type`: TEXT - Type of property
- `amenities`: TEXT - JSON array of amenities
- `images`: TEXT - JSON array of image URLs
- `house_rules`: TEXT - Property-specific rules
- `check_in_time`: TEXT DEFAULT '15:00' - Standard check-in time
- `check_out_time`: TEXT DEFAULT '11:00' - Standard check-out time
- `cancellation_policy`: TEXT DEFAULT 'moderate' - Cancellation terms
- `instant_book`: BOOLEAN DEFAULT 0 - Instant booking availability
- `is_featured`: BOOLEAN DEFAULT 0 - Featured status
- `is_active`: BOOLEAN DEFAULT 1 - Listing status
- `view_count`: INTEGER DEFAULT 0 - Number of views
- `booking_count`: INTEGER DEFAULT 0 - Number of bookings
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP - Creation timestamp
- `updated_at`: DATETIME DEFAULT CURRENT_TIMESTAMP - Last update timestamp

**Constraints:**
- Primary Key: `id`
- Foreign Key: `owner_id` references users(id)
- Check Constraint: `instant_book`, `is_featured`, and `is_active` are boolean values

**Section sources**
- [1.sql](file://migrations/1.sql#L15-L47)
- [types.ts](file://src/shared/types.ts#L125-L126)

### Booking
The Booking model represents reservations made by users for properties. It captures all details related to a stay including dates, guests, pricing breakdown, and status.

**Field Definitions:**
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT - Unique booking identifier
- `user_id`: TEXT NOT NULL - Foreign key to users table
- `property_id`: INTEGER NOT NULL - Foreign key to properties table
- `guest_name`: TEXT NOT NULL - Name of primary guest
- `guest_email`: TEXT NOT NULL - Email of primary guest
- `guest_phone`: TEXT - Phone number of primary guest
- `guest_count`: INTEGER NOT NULL - Number of guests
- `check_in_date`: DATE NOT NULL - Check-in date
- `check_out_date`: DATE NOT NULL - Check-out date
- `nights_count`: INTEGER NOT NULL - Number of nights
- `base_amount`: REAL NOT NULL - Base accommodation cost
- `service_fee`: REAL DEFAULT 0 - Service fee
- `taxes`: REAL DEFAULT 0 - Applicable taxes
- `total_amount`: REAL NOT NULL - Total booking cost
- `status`: TEXT DEFAULT 'pending' - Booking status with CHECK constraint
- `payment_status`: TEXT DEFAULT 'pending' - Payment status with CHECK constraint
- `payment_id`: TEXT - Reference to payment record
- `payment_method`: TEXT - Payment method used
- `special_requests`: TEXT - Guest requests
- `cancellation_reason`: TEXT - Reason for cancellation
- `cancelled_at`: DATETIME - Timestamp of cancellation
- `confirmed_at`: DATETIME - Timestamp of confirmation
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP - Creation timestamp
- `updated_at`: DATETIME DEFAULT CURRENT_TIMESTAMP - Last update timestamp

**Constraints:**
- Primary Key: `id`
- Foreign Keys: `user_id` references users(id), `property_id` references properties(id)
- Check Constraints: `status` in ('pending', 'confirmed', 'cancelled', 'completed'), `payment_status` in ('pending', 'processing', 'completed', 'failed', 'refunded')

**Section sources**
- [1.sql](file://migrations/1.sql#L49-L81)
- [types.ts](file://src/shared/types.ts#L127-L128)

### Payment
The Payment model represents financial transactions associated with bookings. It stores payment gateway details, status, and transaction metadata.

**Field Definitions:**
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT - Unique payment identifier
- `booking_id`: INTEGER NOT NULL - Foreign key to bookings table
- `payment_id`: TEXT UNIQUE NOT NULL - Gateway-specific payment ID
- `gateway`: TEXT NOT NULL - Payment gateway used
- `amount`: REAL NOT NULL - Transaction amount
- `currency`: TEXT DEFAULT 'SAR' - Currency code
- `status`: TEXT DEFAULT 'pending' - Payment status with CHECK constraint
- `gateway_response`: TEXT - JSON response from payment gateway
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP - Creation timestamp
- `updated_at`: DATETIME DEFAULT CURRENT_TIMESTAMP - Last update timestamp

**Constraints:**
- Primary Key: `id`
- Foreign Key: `booking_id` references bookings(id)
- Unique Constraint: `payment_id`
- Check Constraint: `gateway` in ('myfatoorah', 'paypal', 'stripe'), `status` in ('pending', 'processing', 'completed', 'failed', 'refunded')

**Section sources**
- [1.sql](file://migrations/1.sql#L83-L95)
- [types.ts](file://src/shared/types.ts#L225-L226)

### Review
The Review model captures guest feedback and ratings for properties. It supports detailed rating dimensions and moderation.

**Field Definitions:**
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT - Unique review identifier
- `user_id`: TEXT NOT NULL - Foreign key to users table
- `property_id`: INTEGER NOT NULL - Foreign key to properties table
- `booking_id`: INTEGER - Foreign key to bookings table (nullable)
- `rating`: INTEGER NOT NULL - Overall rating (1-5)
- `cleanliness_rating`: INTEGER - Cleanliness rating (1-5)
- `communication_rating`: INTEGER - Communication rating (1-5)
- `location_rating`: INTEGER - Location rating (1-5)
- `value_rating`: INTEGER - Value rating (1-5)
- `comment`: TEXT - Written feedback
- `is_approved`: BOOLEAN DEFAULT 1 - Moderation status
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP - Creation timestamp
- `updated_at`: DATETIME DEFAULT CURRENT_TIMESTAMP - Last update timestamp

**Constraints:**
- Primary Key: `id`
- Foreign Keys: `user_id` references users(id), `property_id` references properties(id), `booking_id` references bookings(id)
- Check Constraints: All rating fields between 1 and 5

**Section sources**
- [1.sql](file://migrations/1.sql#L97-L117)
- [types.ts](file://src/shared/types.ts#L130-L131)

### Wishlist
The Wishlist model allows users to save properties for future consideration. It implements a simple many-to-many relationship between users and properties.

**Field Definitions:**
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT - Unique wishlist identifier
- `user_id`: TEXT NOT NULL - Foreign key to users table
- `property_id`: INTEGER NOT NULL - Foreign key to properties table
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP - Creation timestamp

**Constraints:**
- Primary Key: `id`
- Foreign Keys: `user_id` references users(id), `property_id` references properties(id)
- Unique Constraint: Combination of `user_id` and `property_id`

**Section sources**
- [1.sql](file://migrations/1.sql#L119-L125)
- [types.ts](file://src/shared/types.ts#L129-L130)

### PropertyAnalytics
The PropertyAnalytics model tracks performance metrics for properties on a daily basis. It enables data-driven decision making for property owners.

**Field Definitions:**
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT - Unique analytics record identifier
- `property_id`: INTEGER NOT NULL - Foreign key to properties table
- `views`: INTEGER DEFAULT 0 - Number of property views
- `inquiries`: INTEGER DEFAULT 0 - Number of inquiries
- `bookings`: INTEGER DEFAULT 0 - Number of bookings
- `revenue`: REAL DEFAULT 0 - Total revenue generated
- `avg_rating`: REAL DEFAULT 0 - Average rating
- `review_count`: INTEGER DEFAULT 0 - Number of reviews
- `occupancy_rate`: REAL DEFAULT 0 - Occupancy rate percentage
- `date`: DATE NOT NULL - Date of analytics record
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP - Creation timestamp
- `updated_at`: DATETIME DEFAULT CURRENT_TIMESTAMP - Last update timestamp

**Constraints:**
- Primary Key: `id`
- Foreign Key: `property_id` references properties(id)
- Unique Constraint: Combination of `property_id` and `date`

**Section sources**
- [5.sql](file://migrations/5.sql#L23-L37)
- [types.ts](file://src/shared/types.ts#L224-L225)

## Entity Relationships
The data model implements a relational structure with well-defined relationships between core entities.

```mermaid
erDiagram
USER ||--o{ PROPERTY : owns
USER ||--o{ BOOKING : makes
USER ||--o{ REVIEW : writes
USER ||--o{ WISHLIST : saves
USER ||--o{ PAYMENT : pays
USER ||--o{ USER_PROFILES : has
USER ||--o{ NOTIFICATION_SETTINGS : has
PROPERTY ||--o{ BOOKING : has
PROPERTY ||--o{ REVIEW : receives
PROPERTY ||--o{ WISHLIST : appears_in
PROPERTY ||--o{ PROPERTY_ANALYTICS : generates
PROPERTY ||--o{ CHANNEL_CONNECTIONS : connects_to
PROPERTY ||--o{ PRICING_RULES : has
PROPERTY ||--o{ PROPERTY_AVAILABILITY : has
BOOKING ||--o{ PAYMENT : has
BOOKING ||--o{ REVIEW : enables
PROPERTY_ANALYTICS }|--|| PROPERTY : tracks
BOOKING }|--|| PAYMENT : uses
BOOKING }|--|| REVIEW : references
WISHLIST }|--|| USER : belongs_to
WISHLIST }|--|| PROPERTY : references
class USER {
id [PK]
email [UK]
role
is_verified
is_active
}
class PROPERTY {
id [PK]
owner_id [FK]
title
location
price_per_night
max_guests
is_featured
is_active
}
class BOOKING {
id [PK]
user_id [FK]
property_id [FK]
check_in_date
check_out_date
total_amount
status
payment_status
}
class PAYMENT {
id [PK]
booking_id [FK]
amount
status
gateway
}
class REVIEW {
id [PK]
user_id [FK]
property_id [FK]
booking_id [FK]
rating
comment
}
class WISHLIST {
id [PK]
user_id [FK]
property_id [FK]
}
class PROPERTY_ANALYTICS {
id [PK]
property_id [FK]
date [UK]
views
bookings
revenue
avg_rating
}
```

**Diagram sources**
- [1.sql](file://migrations/1.sql)
- [5.sql](file://migrations/5.sql)
- [types.ts](file://src/shared/types.ts)

## Data Validation and Business Logic
The system implements comprehensive data validation at both the database and application levels to ensure data integrity and enforce business rules.

### Database Constraints
- **Referential Integrity**: All foreign keys enforce referential integrity with CASCADE behavior implied
- **Check Constraints**: Enumerated fields (status, role, gateway) are constrained to valid values
- **Unique Constraints**: Email uniqueness for users, payment ID uniqueness, and composite uniqueness for wishlist items
- **Default Values**: Most fields have sensible defaults to ensure data completeness

### Application-Level Validation
Using Zod schemas defined in `types.ts`, the application enforces additional validation rules:

**Property Validation:**
- Title must be at least 1 character
- Location must be provided
- Price per night must be positive
- Maximum guests must be positive integer
- Bedrooms and bathrooms must be positive integers (if provided)

**Booking Validation:**
- Guest name must be provided
- Guest email must be valid email format
- Check-in and check-out dates must be provided
- Total guests must be positive integer
- Check-out date must be after check-in date (enforced in business logic)

**Review Validation:**
- Rating must be integer between 1 and 5
- Comment is optional
- Property ID must be provided
- Booking ID is optional (for guests who haven't booked)

**Business Logic Constraints:**
- **Date Availability**: Before creating a booking, the system checks the property_availability table to ensure all dates are available
- **Pricing Calculation**: Total amount is calculated based on base price, seasonal pricing rules, and service fees
- **Double Booking Prevention**: The system validates that the requested date range does not overlap with existing confirmed bookings
- **Rating Consistency**: Average rating in PropertyAnalytics is updated whenever a new review is added or an existing one is modified

**Section sources**
- [types.ts](file://src/shared/types.ts)
- [1.sql](file://migrations/1.sql)

## Sample Data Records
Sample data records demonstrate the structure and content of each core entity.

### User Sample
```json
{
  "id": "user_12345",
  "email": "ahmed.hassan@email.com",
  "name": "Ahmed Hassan",
  "avatar": "https://example.com/avatars/ahmed.jpg",
  "phone": "+966501234567",
  "role": "guest",
  "is_verified": true,
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Property Sample
```json
{
  "id": 1,
  "owner_id": "owner_123",
  "title": "Luxury Downtown Apartment",
  "description": "Experience the heart of Riyadh in this stunning modern apartment with panoramic city views.",
  "location": "King Fahd District, Riyadh",
  "address": "King Fahd Road, Building 123",
  "latitude": 24.7136,
  "longitude": 46.6753,
  "price_per_night": 850,
  "currency": "SAR",
  "max_guests": 4,
  "bedrooms": 2,
  "bathrooms": 2,
  "property_type": "apartment",
  "amenities": "[\"WiFi\", \"Air Conditioning\", \"Kitchen\", \"Parking\", \"TV\", \"Gym\"]",
  "images": "[\"https://images.example.com/photo-1.jpg\", \"https://images.example.com/photo-2.jpg\"]",
  "house_rules": "No smoking, No pets",
  "check_in_time": "15:00",
  "check_out_time": "11:00",
  "cancellation_policy": "moderate",
  "instant_book": true,
  "is_featured": true,
  "is_active": true,
  "view_count": 156,
  "booking_count": 23,
  "created_at": "2024-01-10T08:00:00Z",
  "updated_at": "2024-01-10T08:00:00Z"
}
```

### Booking Sample
```json
{
  "id": 1,
  "user_id": "guest_123",
  "property_id": 1,
  "guest_name": "Ahmed Al-Hassan",
  "guest_email": "ahmed.hassan@email.com",
  "guest_phone": "+966501234567",
  "guest_count": 2,
  "check_in_date": "2024-12-28",
  "check_out_date": "2024-12-31",
  "nights_count": 3,
  "base_amount": 2550,
  "service_fee": 255,
  "taxes": 153,
  "total_amount": 2958,
  "status": "confirmed",
  "payment_status": "completed",
  "payment_id": "pay_789",
  "payment_method": "credit_card",
  "special_requests": "High floor if possible",
  "cancellation_reason": null,
  "cancelled_at": null,
  "confirmed_at": "2024-11-15T14:30:00Z",
  "created_at": "2024-11-15T14:30:00Z",
  "updated_at": "2024-11-15T14:30:00Z"
}
```

### Payment Sample
```json
{
  "id": 1,
  "booking_id": 1,
  "payment_id": "pay_789",
  "gateway": "myfatoorah",
  "amount": 2958,
  "currency": "SAR",
  "status": "completed",
  "gateway_response": "{\"transaction_id\": \"txn_123\", \"payment_method\": \"credit_card\"}",
  "created_at": "2024-11-15T14:30:00Z",
  "updated_at": "2024-11-15T14:30:00Z"
}
```

### Review Sample
```json
{
  "id": 1,
  "user_id": "guest_123",
  "property_id": 1,
  "booking_id": 1,
  "rating": 5,
  "cleanliness_rating": 5,
  "communication_rating": 5,
  "location_rating": 5,
  "value_rating": 5,
  "comment": "Absolutely exceptional stay! The property exceeded all expectations.",
  "is_approved": true,
  "created_at": "2024-12-31T18:00:00Z",
  "updated_at": "2024-12-31T18:00:00Z"
}
```

### Wishlist Sample
```json
{
  "id": 1,
  "user_id": "guest_123",
  "property_id": 1,
  "created_at": "2024-11-20T10:00:00Z"
}
```

### PropertyAnalytics Sample
```json
{
  "id": 1,
  "property_id": 1,
  "views": 24,
  "inquiries": 3,
  "bookings": 1,
  "revenue": 2958,
  "avg_rating": 5,
  "review_count": 1,
  "occupancy_rate": 0.75,
  "date": "2024-11-20",
  "created_at": "2024-11-21T00:00:00Z",
  "updated_at": "2024-11-21T00:00:00Z"
}
```

**Section sources**
- [1.sql](file://migrations/1.sql)
- [3.sql](file://migrations/3.sql)
- [5.sql](file://migrations/5.sql)

## Database Indexing and Performance
The database schema includes several indexing strategies to optimize query performance for common access patterns.

### Primary Indexes
- All tables have primary keys with auto-incrementing integers or UUIDs
- Primary keys are automatically indexed for fast lookups

### Secondary Indexes
While explicit indexes are not defined in the migration files, the following fields would benefit from indexing based on access patterns:

**Users Table:**
- `email` (already has UNIQUE constraint, which creates an index)
- `role` (frequent filtering by user role)

**Properties Table:**
- `owner_id` (frequent queries by property owner)
- `location` (common search criterion)
- `is_featured` and `is_active` (filtering active and featured properties)
- `price_per_night` (range queries for price filtering)

**Bookings Table:**
- `user_id` (user booking history)
- `property_id` (property booking history)
- `check_in_date` and `check_out_date` (date range queries)
- `status` and `payment_status` (filtering by booking status)

**Reviews Table:**
- `property_id` (property ratings and reviews)
- `user_id` (user review history)

**Wishlist Table:**
- `user_id` (user's saved properties)
- `property_id` (popular properties)

**PropertyAnalytics Table:**
- `property_id` and `date` (composite index for time series queries)

### Query Patterns
The worker code likely uses the following common query patterns:

**Property Search:**
```sql
SELECT * FROM properties 
WHERE location LIKE ? 
AND price_per_night BETWEEN ? AND ?
AND max_guests >= ?
AND is_active = 1
ORDER BY is_featured DESC, price_per_night ASC
```

**User Bookings:**
```sql
SELECT b.*, p.title, p.location, p.images 
FROM bookings b 
JOIN properties p ON b.property_id = p.id 
WHERE b.user_id = ?
ORDER BY b.check_in_date DESC
```

**Property Availability:**
```sql
SELECT date, is_available, price_override 
FROM property_availability 
WHERE property_id = ? 
AND date BETWEEN ? AND ?
```

**Analytics Aggregation:**
```sql
SELECT 
  SUM(views) as total_views,
  SUM(bookings) as total_bookings,
  AVG(avg_rating) as average_rating,
  SUM(revenue) as total_revenue
FROM property_analytics 
WHERE property_id = ? 
AND date BETWEEN ? AND ?
```

**Section sources**
- [1.sql](file://migrations/1.sql)
- [5.sql](file://migrations/5.sql)

## Data Lifecycle and Security
The system implements comprehensive data lifecycle management and security practices to protect user information and ensure compliance.

### Data Retention Policies
- **Active Records**: All core entities (User, Property, Booking, etc.) are retained indefinitely while active
- **Inactive Accounts**: Inactive user accounts may be subject to periodic review and potential deactivation after extended periods of inactivity
- **Booking History**: Booking records are retained permanently for financial and legal compliance
- **Payment Records**: Payment transaction details are retained according to financial regulations (typically 5-7 years)
- **Analytics Data**: PropertyAnalytics records are retained for at least 2 years to enable trend analysis

### Archival Rules
- **Completed Bookings**: After 1 year, completed booking records may be moved to cold storage while maintaining referential integrity
- **Inactive Properties**: Properties that have been inactive for 12 months may be archived but not deleted
- **Historical Analytics**: Analytics data older than 2 years may be aggregated into monthly summaries and the daily records archived

### Data Security
- **Encryption**: Sensitive data such as payment information is encrypted at rest
- **PII Protection**: Personally Identifiable Information is handled according to privacy regulations
- **Access Control**: Row-level access control is implemented in API routes to ensure users can only access their own data

### Privacy Compliance
- **User Data Handling**: User data is collected and processed in compliance with applicable privacy laws
- **Consent Management**: Users can manage their communication preferences through notification_settings
- **Data Subject Rights**: The system supports data access, correction, and deletion requests
- **Third-party Integration**: External platforms (Airbnb, Booking.com) are integrated through secure APIs with limited data sharing

### Row-Level Access Control
The API routes implement the following access control patterns:
- Users can only view and modify their own profile and booking information
- Property owners can only manage their own properties
- Admin users have elevated privileges to manage all content
- Guests can only write reviews for properties they have booked
- Users can only add properties to their own wishlist

**Section sources**
- [1.sql](file://migrations/1.sql)
- [4.sql](file://migrations/4.sql)
- [types.ts](file://src/shared/types.ts)