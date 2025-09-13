# Bookings API

<cite>
**Referenced Files in This Document**   
- [index.ts](file://src/worker/index.ts#L406-L599)
- [index.ts](file://src/worker/index.ts#L768-L814)
- [index.ts](file://src/worker/index.ts#L890-L947)
- [index.ts](file://src/worker/index.ts#L1456-L1505)
- [types.ts](file://src/shared/types.ts#L34-L62)
- [types.ts](file://src/shared/types.ts#L584-L589)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document provides comprehensive documentation for the Bookings API in the HabibiStay platform. The API enables users to manage bookings throughout their lifecycle, including creation, retrieval, status updates, and cancellation. It integrates with property availability checks, payment processing, and email notifications to provide a complete booking management solution. The system uses JWT-based authentication through an external users service and implements robust validation using Zod schemas to ensure data integrity.

## Project Structure
The project follows a layered architecture with distinct separation between frontend, shared utilities, and backend worker logic. The booking functionality is implemented in the Cloudflare Worker at `src/worker/index.ts`, which serves as the backend API. Shared types and validation schemas are defined in `src/shared/types.ts` and reused across the application. The frontend React application in `src/react-app` consumes these APIs through various components like BookingModal and PropertyDetail.

```mermaid
graph TB
subgraph "Frontend"
A[React App]
B[Components]
C[Hooks]
end
subgraph "Shared"
D[Types]
E[Payment]
F[Email]
end
subgraph "Backend"
G[Worker]
H[API Routes]
I[Database]
end
A --> H
D --> A
D --> G
G --> I
H --> D
```

**Diagram sources**
- [index.ts](file://src/worker/index.ts#L0-L199)
- [types.ts](file://src/shared/types.ts#L50-L62)

**Section sources**
- [index.ts](file://src/worker/index.ts#L0-L199)
- [types.ts](file://src/shared/types.ts#L50-L62)

## Core Components
The core booking components include the booking creation endpoint, user bookings retrieval, booking status updates, and availability checking. These components work together to provide a complete booking management system with proper validation, authentication, and business logic enforcement. The implementation uses Hono as the web framework, Zod for request validation, and interacts with a database to persist booking information and check availability constraints.

**Section sources**
- [index.ts](file://src/worker/index.ts#L406-L599)
- [index.ts](file://src/worker/index.ts#L768-L814)
- [types.ts](file://src/shared/types.ts#L34-L62)

## Architecture Overview
The Bookings API follows a RESTful architecture implemented on Cloudflare Workers. The system receives HTTP requests that are processed through middleware for CORS and error handling. Authentication is handled by an external users service using JWT tokens. Validated requests are processed by route handlers that interact with the database to perform CRUD operations on bookings. The architecture includes integration with external services for payments and email notifications, and uses a shared types module to maintain consistency across the codebase.

```mermaid
graph TD
Client[Client Application] --> API[API Gateway]
API --> Auth[Authentication Middleware]
Auth --> Validation[Request Validation]
Validation --> Controller[Booking Controller]
Controller --> DB[(Database)]
Controller --> Email[Email Service]
Controller --> Payment[Payment Service]
DB --> Controller
Email --> User[Guest/Host]
Payment --> External[Payment Provider]
style Client fill:#4CAF50,stroke:#388E3C
style API fill:#2196F3,stroke:#1976D2
style Auth fill:#FF9800,stroke:#F57C00
style Validation fill:#9C27B0,stroke:#7B1FA2
style Controller fill:#00BCD4,stroke:#0097A7
style DB fill:#E91E63,stroke:#C2185B
style Email fill:#8BC34A,stroke:#689F38
style Payment fill:#607D8B,stroke:#455A64
```

**Diagram sources**
- [index.ts](file://src/worker/index.ts#L406-L599)
- [index.ts](file://src/worker/index.ts#L768-L814)

## Detailed Component Analysis

### Booking Creation Endpoint
The booking creation endpoint handles the creation of new bookings with comprehensive validation and availability checking. It calculates pricing including service fees and taxes, checks for conflicting bookings, and creates the booking record if available. The endpoint also triggers email notifications and updates analytics data upon successful booking creation.

```mermaid
sequenceDiagram
participant Client as "Client App"
participant API as "POST /api/bookings"
participant Validator as "Zod Validator"
participant DB as "Database"
participant Email as "Email Service"
participant Analytics as "Analytics"
Client->>API : POST /api/bookings with data
API->>Validator : Validate request body
Validator-->>API : Validated data
API->>DB : Check property existence
DB-->>API : Property details
API->>API : Calculate total amount
API->>DB : Check availability
DB-->>API : No conflicts
API->>DB : Insert booking record
DB-->>API : Success with booking ID
API->>Email : Send confirmation email
Email-->>API : Email sent
API->>Analytics : Update property analytics
Analytics-->>API : Updated
API-->>Client : 200 OK with booking details
```

**Diagram sources**
- [index.ts](file://src/worker/index.ts#L406-L599)
- [types.ts](file://src/shared/types.ts#L53-L62)

**Section sources**
- [index.ts](file://src/worker/index.ts#L406-L599)
- [types.ts](file://src/shared/types.ts#L53-L62)

### User Bookings Retrieval
The user bookings endpoint retrieves all bookings associated with the authenticated user, including both bookings they've made and properties they own. This provides a unified view of all booking activity for the user, whether as a guest or host. The endpoint joins booking data with property information to provide enriched results.

```mermaid
sequenceDiagram
participant Client as "Client App"
participant API as "GET /api/bookings/my-bookings"
participant Auth as "authMiddleware"
participant DB as "Database"
Client->>API : GET /api/bookings/my-bookings
API->>Auth : Verify JWT token
Auth-->>API : User authenticated
API->>DB : Query bookings with user ID
DB-->>API : Booking records with property titles
API-->>Client : 200 OK with bookings array
```

**Diagram sources**
- [index.ts](file://src/worker/index.ts#L768-L814)
- [types.ts](file://src/shared/types.ts#L34-L51)

**Section sources**
- [index.ts](file://src/worker/index.ts#L768-L814)
- [types.ts](file://src/shared/types.ts#L34-L51)

### Booking Status Updates
The booking status update endpoint allows authorized users (admins or property owners) to modify the status of existing bookings. This is used to confirm, reject, or otherwise manage bookings in the system. The endpoint enforces role-based access control to prevent unauthorized status changes.

```mermaid
sequenceDiagram
participant Client as "Admin/Owner App"
participant API as "PUT /api/admin/bookings/ : id/status"
participant Auth as "authMiddleware"
participant DB as "Database"
Client->>API : PUT /api/admin/bookings/123/status
API->>Auth : Verify JWT token
Auth-->>API : User authenticated
API->>API : Check admin/owner role
API->>DB : Update booking status
DB-->>API : Update successful
API-->>Client : 200 OK with success message
```

**Diagram sources**
- [index.ts](file://src/worker/index.ts#L890-L947)
- [types.ts](file://src/shared/types.ts#L34-L51)

**Section sources**
- [index.ts](file://src/worker/index.ts#L890-L947)
- [types.ts](file://src/shared/types.ts#L34-L51)

### Property Availability Checking
The property availability endpoint checks whether a property is available for a given date range by querying for conflicting bookings. This endpoint is used both by the booking creation process and by the frontend to provide real-time availability information to users before they submit a booking request.

```mermaid
flowchart TD
Start([Check Availability]) --> ValidateInput["Validate check_in and check_out dates"]
ValidateInput --> InputValid{"Dates Provided?"}
InputValid --> |No| ReturnError["Return 400 Bad Request"]
InputValid --> |Yes| CheckConflicts["Query for conflicting bookings"]
CheckConflicts --> ConflictsFound{"Conflicting Booking Exists?"}
ConflictsFound --> |Yes| ReturnUnavailable["Return available: false"]
ConflictsFound --> |No| ReturnAvailable["Return available: true"]
ReturnError --> End([Response Sent])
ReturnUnavailable --> End
ReturnAvailable --> End
```

**Diagram sources**
- [index.ts](file://src/worker/index.ts#L1456-L1505)
- [types.ts](file://src/shared/types.ts#L53-L62)

**Section sources**
- [index.ts](file://src/worker/index.ts#L1456-L1505)
- [types.ts](file://src/shared/types.ts#L53-L62)

## Dependency Analysis
The booking system has several key dependencies that enable its functionality. The primary dependency is the database, which stores all booking records and is queried for availability checks and booking retrieval. The system also depends on the shared types module for validation schemas, the external users service for authentication, and email services for sending confirmation messages. These dependencies are managed through explicit imports and interface contracts.

```mermaid
graph TD
BookingAPI[Booking API] --> Zod[zValidator]
BookingAPI --> SharedTypes[src/shared/types]
BookingAPI --> Database[DB Binding]
BookingAPI --> EmailService[src/shared/email]
BookingAPI --> AuthService[authMiddleware]
BookingAPI --> ApiResponse[ApiResponse Interface]
SharedTypes --> Zod
EmailService --> Database
AuthService --> External[External Users Service]
style BookingAPI fill:#00BCD4,stroke:#0097A7
style Zod fill:#9C27B0,stroke:#7B1FA2
style SharedTypes fill:#FF9800,stroke:#F57C00
style Database fill:#E91E63,stroke:#C2185B
style EmailService fill:#8BC34A,stroke:#689F38
style AuthService fill:#673AB7,stroke:#5E35B1
style ApiResponse fill:#4CAF50,stroke:#388E3C
```

**Diagram sources**
- [index.ts](file://src/worker/index.ts#L406-L599)
- [types.ts](file://src/shared/types.ts#L584-L589)

**Section sources**
- [index.ts](file://src/worker/index.ts#L406-L599)
- [types.ts](file://src/shared/types.ts#L584-L589)

## Performance Considerations
The booking API is designed for performance with several optimizations in place. Database queries use parameterized statements to prevent SQL injection and enable query plan caching. The availability check uses a single query with proper indexing on date ranges to quickly identify conflicts. The system also implements analytics updates using SQLite's INSERT OR REPLACE pattern to minimize database round trips. For high-traffic scenarios, additional caching of availability information could further improve performance.

## Troubleshooting Guide
Common issues with the booking API include availability conflicts, validation errors, and authentication problems. When a booking fails with "Property is not available for selected dates", check the database for existing bookings that overlap with the requested dates. For validation errors, verify that the request body matches the CreateBookingSchema structure exactly. Authentication issues typically stem from missing or invalid JWT tokens - ensure the client is properly handling the OAuth flow and including the Authorization header. Database connection issues may require checking the Cloudflare Worker bindings configuration.

**Section sources**
- [index.ts](file://src/worker/index.ts#L406-L599)
- [index.ts](file://src/worker/index.ts#L1456-L1505)
- [types.ts](file://src/shared/types.ts#L53-L62)

## Conclusion
The Bookings API provides a robust and secure system for managing property reservations in the HabibiStay platform. With comprehensive validation, availability checking, and integration with external services, it delivers a reliable booking experience for both guests and hosts. The use of standardized response formats, proper authentication, and clear error handling makes the API easy to consume and maintain. Future enhancements could include idempotency keys for safe retries, webhook notifications for status changes, and more sophisticated pricing rules.