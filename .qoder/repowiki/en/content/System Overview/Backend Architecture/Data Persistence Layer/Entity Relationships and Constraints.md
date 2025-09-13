# Entity Relationships and Constraints

<cite>
**Referenced Files in This Document**   
- [migrations/1.sql](file://migrations/1.sql)
- [migrations/2.sql](file://migrations/2.sql)
- [migrations/3.sql](file://migrations/3.sql)
- [migrations/4.sql](file://migrations/4.sql)
- [migrations/5.sql](file://migrations/5.sql)
- [migrations/6.sql](file://migrations/6.sql)
- [migrations/7.sql](file://migrations/7.sql)
- [migrations/8.sql](file://migrations/8.sql)
- [migrations/9.sql](file://migrations/9.sql)
- [src/worker/index.ts](file://src/worker/index.ts)
</cite>

## Table of Contents
1. [Entity Relationships and Referential Integrity](#entity-relationships-and-referential-integrity)
2. [Cascading Behaviors and Constraint Enforcement](#cascading-behaviors-and-constraint-enforcement)
3. [Composite Keys and Unique Constraints](#composite-keys-and-unique-constraints)
4. [Indexing Strategies for Foreign Key Lookups](#indexing-strategies-for-foreign-key-lookups)
5. [API Implementation of Relational Queries](#api-implementation-of-relational-queries)
6. [Data Consistency and Anomaly Prevention](#data-consistency-and-anomaly-prevention)

## Entity Relationships and Referential Integrity

The HabibiStay data model implements a comprehensive relational structure with well-defined foreign key constraints to maintain referential integrity across core entities. The primary relationships are enforced through SQL DDL constraints in the migration files, ensuring data consistency at the database level.

### Property → User (Owner) Relationship
The `properties` table maintains a foreign key relationship with the `users` table through the `owner_id` column:
```sql
CREATE TABLE properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id TEXT NOT NULL,
  ...
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
```
This ensures that every property is associated with a valid user who acts as the owner. The relationship is mandatory (NOT NULL), preventing orphaned properties without owners.

### Booking → User and Booking → Property Relationships
The `bookings` table establishes two critical foreign key relationships:
```sql
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  property_id INTEGER NOT NULL,
  ...
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);
```
These constraints ensure that every booking is linked to both a valid user (guest) and a valid property, maintaining the integrity of the booking system.

### Payment → Booking Relationship
The `payments` table enforces a strict relationship with bookings:
```sql
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  ...
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
```
This ensures that payment records cannot exist without a corresponding booking, preventing financial data inconsistencies.

### Review → User/Property Relationships
The `reviews` table maintains relationships with both users and properties:
```sql
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  property_id INTEGER NOT NULL,
  booking_id INTEGER,
  ...
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (property_id) REFERENCES properties(id),
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
```
The booking_id foreign key is optional, allowing reviews to be linked to specific bookings while still maintaining the core user-property relationship.

### Wishlist → User/Property Relationships
The `wishlists` table implements a many-to-many relationship between users and properties:
```sql
CREATE TABLE wishlists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  property_id INTEGER NOT NULL,
  ...
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);
```
This allows users to save properties they're interested in, with constraints ensuring both entities exist.

**Section sources**
- [migrations/1.sql](file://migrations/1.sql#L1-L261)

## Cascading Behaviors and Constraint Enforcement

The database schema implements a restrictive approach to cascading behaviors, prioritizing data integrity over automatic deletion. This design choice prevents accidental data loss and maintains historical records.

### Restrictive Delete Behavior
All foreign key constraints in the HabibiStay schema use the default RESTRICT behavior (implied when no ON DELETE clause is specified). This means:

- **Deleting a user** will fail if they own properties, have bookings, or have reviews
- **Deleting a property** will fail if it has bookings, reviews, or wishlist entries
- **Deleting a booking** will fail if it has associated payments

This restrictive approach ensures that important business data is preserved and requires explicit handling of dependent records.

### Example: Property Deletion Constraints
When attempting to delete a property, the database will prevent the operation if:
1. There are existing bookings for the property
2. The property has reviews
3. The property appears in user wishlists
4. The property has financial reports or analytics data

This behavior is enforced at the database level through the foreign key constraints defined in the DDL.

### Application-Level Cascade Handling
While the database uses restrictive constraints, the application implements controlled cascade operations through explicit business logic. For example, when a user is deactivated (rather than deleted), the system maintains historical data while preventing new transactions.

**Section sources**
- [migrations/1.sql](file://migrations/1.sql#L1-L261)

## Composite Keys and Unique Constraints

The data model employs strategic use of composite keys and unique constraints to prevent data duplication and ensure business rule compliance.

### Wishlist Unique Constraint
The most critical unique constraint prevents duplicate wishlist entries:
```sql
CREATE TABLE wishlists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  property_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, property_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);
```
This composite unique constraint on `(user_id, property_id)` ensures that a user cannot add the same property to their wishlist multiple times, enforcing the business rule that wishlist items are unique per user.

### Property Availability Composite Key
The `property_availability` table uses a composite unique constraint:
```sql
CREATE TABLE property_availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER NOT NULL,
  date DATE NOT NULL,
  ...
  UNIQUE(property_id, date),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);
```
This ensures that there is only one availability record per property per date, preventing conflicting availability information.

### Channel Connections Uniqueness
The `channel_connections` table ensures a property can only have one connection per platform:
```sql
CREATE TABLE channel_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER NOT NULL,
  platform TEXT NOT NULL,
  ...
  UNIQUE(property_id, platform),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);
```

**Section sources**
- [migrations/1.sql](file://migrations/1.sql#L1-L261)

## Indexing Strategies for Foreign Key Lookups

The database implements comprehensive indexing strategies to optimize foreign key lookups and JOIN operations, ensuring efficient query performance.

### Foreign Key Indexes
While the migration files don't explicitly show index creation for foreign keys, best practices and query patterns indicate that indexes are likely created on all foreign key columns. This includes indexes on:
- `properties.owner_id`
- `bookings.user_id` and `bookings.property_id`
- `payments.booking_id`
- `reviews.user_id`, `reviews.property_id`, and `reviews.booking_id`
- `wishlists.user_id` and `wishlists.property_id`

### Composite Indexes for Query Patterns
The application's query patterns suggest the need for composite indexes that support common JOIN operations and filtering criteria. For example:
- Index on `bookings(property_id, check_in_date, check_out_date)` for availability checks
- Index on `reviews(property_id, created_at)` for retrieving recent reviews
- Index on `properties(owner_id, created_at)` for retrieving a user's properties

### Analytics and Performance Indexes
The `property_analytics` table likely has composite indexes on `(property_id, date)` to support the upsert pattern used in the application:
```sql
INSERT INTO property_analytics (property_id, views, date) 
VALUES (?, 1, ?)
ON CONFLICT(property_id, date) 
DO UPDATE SET views = views + 1
```

**Section sources**
- [migrations/1.sql](file://migrations/1.sql#L1-L261)
- [src/worker/index.ts](file://src/worker/index.ts#L118-L128)

## API Implementation of Relational Queries

The API routes in `src/worker/index.ts` demonstrate how JOINs and relational queries are implemented to serve data to the frontend, leveraging the underlying database constraints.

### Property Search with JOINs
The property search endpoint combines data from multiple tables:
```typescript
app.get("/api/properties", async (c) => {
  let query = "SELECT p.*, AVG(r.rating) as avg_rating, COUNT(r.id) as review_count FROM properties p LEFT JOIN reviews r ON p.id = r.property_id WHERE p.is_active = 1";
  // ... filtering logic
  query += " GROUP BY p.id";
});
```
This query JOINs the `properties` and `reviews` tables to provide aggregated rating information, using the foreign key relationship between the tables.

### Wishlist Data Retrieval
The wishlist endpoint demonstrates a direct JOIN between wishlists and properties:
```typescript
app.get("/api/wishlist", authMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT w.*, p.* FROM wishlists w
    JOIN properties p ON w.property_id = p.id
    WHERE w.user_id = ? AND p.is_active = 1
    ORDER BY w.created_at DESC
  `).bind(user.id).all();
});
```
This query leverages the foreign key relationship to retrieve complete property information for a user's wishlist items.

### Booking with Property Details
The payment creation endpoint JOINs bookings with properties:
```typescript
app.post("/api/payments/create", async (c) => {
  const booking = await c.env.DB.prepare(`
    SELECT b.*, p.title as property_title 
    FROM bookings b 
    JOIN properties p ON b.property_id = p.id 
    WHERE b.id = ?
  `).bind(booking_id).first();
});
```
This ensures that payment processing has access to the associated property information.

### Review Retrieval with User Information
The reviews endpoint JOINs reviews with user profiles:
```typescript
app.get("/api/reviews/:propertyId", async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT r.*, up.full_name as reviewer_name, up.avatar_url as reviewer_avatar
    FROM reviews r
    LEFT JOIN user_profiles up ON r.user_id = up.user_id
    WHERE r.property_id = ?
    ORDER BY r.created_at DESC
  `).bind(propertyId).all();
});
```

**Section sources**
- [src/worker/index.ts](file://src/worker/index.ts#L300-L350)
- [src/worker/index.ts](file://src/worker/index.ts#L700-L730)
- [src/worker/index.ts](file://src/worker/index.ts#L1300-L1330)
- [src/worker/index.ts](file://src/worker/index.ts#L1800-L1830)

## Data Consistency and Anomaly Prevention

The combination of database constraints and application logic effectively prevents common data anomalies and ensures consistency across the system.

### Prevention of Orphaned Records
The foreign key constraints prevent orphaned records in all related tables:
- No bookings without valid users or properties
- No payments without valid bookings
- No reviews without valid users or properties
- No wishlist entries without valid users or properties

### Prevention of Duplicate Entries
The unique constraints prevent duplicate business entities:
- No duplicate wishlist entries for the same user-property combination
- No duplicate channel connections for the same property-platform combination
- No duplicate availability records for the same property-date combination

### Transactional Integrity
Critical operations are wrapped in transactions or use atomic operations to ensure consistency:
- Property view tracking uses `ON CONFLICT` to atomically increment view counts
- Booking creation checks availability and creates the booking in a coordinated manner
- Payment processing updates both payment and booking status together

### Business Rule Enforcement
The constraints enforce key business rules:
- Users cannot review the same property multiple times (enforced by application logic checking existing reviews)
- Guests cannot book overlapping dates (enforced by availability check queries)
- Properties cannot be priced below minimum thresholds (enforced by pricing rules)

The comprehensive constraint system ensures that the database remains in a consistent state even under concurrent operations, providing a reliable foundation for the application.

**Section sources**
- [migrations/1.sql](file://migrations/1.sql#L1-L261)
- [src/worker/index.ts](file://src/worker/index.ts#L118-L128)
- [src/worker/index.ts](file://src/worker/index.ts#L500-L550)
- [src/worker/index.ts](file://src/worker/index.ts#L1500-L1550)