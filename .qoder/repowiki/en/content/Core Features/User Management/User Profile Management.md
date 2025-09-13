# User Profile Management

<cite>
**Referenced Files in This Document**   
- [Profile.tsx](file://src/react-app/pages/Profile.tsx)
- [index.ts](file://src/worker/index.ts)
- [types.ts](file://src/shared/types.ts)
- [4.sql](file://migrations/4.sql)
- [security-middleware.ts](file://src/shared/security-middleware.ts)
</cite>

## Table of Contents
1. [User Profile Management](#user-profile-management)
2. [Profile Creation and Update Workflow](#profile-creation-and-update-workflow)
3. [Data Stored in User Profiles](#data-stored-in-user-profiles)
4. [Frontend Implementation in Profile.tsx](#frontend-implementation-in-profiletsx)
5. [Backend API Endpoints](#backend-api-endpoints)
6. [API Request Examples](#api-request-examples)
7. [Common Issues and Solutions](#common-issues-and-solutions)
8. [Extending Profile Fields](#extending-profile-fields)
9. [Profile Synchronization Across Devices](#profile-synchronization-across-devices)

## Profile Creation and Update Workflow

User profile management begins at first login through Google OAuth authentication. When a user logs in for the first time, the system automatically creates a profile using available Google profile data such as name and email. The profile is initialized with default values for language (English), currency (SAR), and country (Saudi Arabia). On subsequent visits, the user's profile data is retrieved from the database and loaded into the frontend state.

The profile update process is handled through a PUT request to `/api/users/profile`. The system uses an upsert pattern (INSERT with ON CONFLICT) to either create a new profile or update an existing one. This ensures that users always have a profile record regardless of whether they are logging in for the first time or updating their information.

```mermaid
sequenceDiagram
participant Frontend as Profile.tsx
participant API as Worker API
participant DB as Database
Frontend->>API : GET /api/users/profile
API->>DB : SELECT user_profiles, notification_settings
DB-->>API : Profile data
API-->>Frontend : Return profile and notifications
Frontend->>API : PUT /api/users/profile
API->>API : Validate input (zod)
API->>DB : UPSERT INTO user_profiles
DB-->>API : Success status
API-->>Frontend : Success response
```

**Diagram sources**
- [Profile.tsx](file://src/react-app/pages/Profile.tsx#L56-L101)
- [index.ts](file://src/worker/index.ts#L650-L750)

**Section sources**
- [Profile.tsx](file://src/react-app/pages/Profile.tsx#L56-L101)
- [index.ts](file://src/worker/index.ts#L650-L849)

## Data Stored in User Profiles

The user profile system stores three main categories of data: Google profile data, user preferences, and notification settings.

### Google Profile Data
- **Full Name**: Retrieved from Google OAuth response
- **Email**: Primary identifier from Google authentication
- **Profile Picture**: Avatar URL from Google account
- **Account Creation Date**: Timestamp when user first authenticated

### User Preferences
The following preferences are stored in the `user_profiles` table:

:full_name: - User's full name  
:phone: - Contact phone number  
:address: - Street address  
:city: - City of residence  
:country: - Country (defaults to Saudi Arabia)  
:date_of_birth: - Date of birth in ISO format  
:preferred_language: - Interface language (en/ar)  
:currency: - Preferred currency (defaults to SAR)  
:bio: - Personal biography or description  
:avatar_url: - Profile picture URL  

### Notification Settings
Stored in the `notification_settings` table:

:email_booking_updates: - Receive booking confirmation emails  
:email_marketing: - Opt-in for marketing emails  
:sms_booking_updates: - Receive SMS notifications for bookings  
:push_notifications: - Enable browser/device push notifications  

```mermaid
erDiagram
USER_PROFILES {
integer id PK
string user_id FK
string full_name
string phone
string address
string city
string country
date date_of_birth
string preferred_language
string currency
text bio
string avatar_url
datetime created_at
datetime updated_at
}
NOTIFICATION_SETTINGS {
integer id PK
string user_id FK
boolean email_booking_updates
boolean email_marketing
boolean sms_booking_updates
boolean push_notifications
datetime created_at
datetime updated_at
}
USER_PROFILES ||--|| NOTIFICATION_SETTINGS : "1:1"
```

**Diagram sources**
- [4.sql](file://migrations/4.sql#L1-L45)
- [types.ts](file://src/shared/types.ts#L137-L166)

**Section sources**
- [4.sql](file://migrations/4.sql#L1-L45)
- [types.ts](file://src/shared/types.ts#L137-L166)

## Frontend Implementation in Profile.tsx

The Profile.tsx component implements a tabbed interface for managing different aspects of the user profile. It uses React hooks for state management and side effects.

### Component Structure
The component maintains several state variables:
- :profile: - Stores personal information fields
- :notifications: - Manages notification preferences
- :activeTab: - Controls which section is displayed
- :loading: - Indicates data retrieval status
- :saving: - Shows save operation progress

### Form Validation and Submission
The form implements client-side validation through controlled components. Each input field updates the state immediately upon change:

```typescript
<input
  type="text"
  id="full_name"
  value={profile.full_name}
  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
/>
```

The submission logic is centralized in the `saveProfile` function, which sends a PUT request with both profile and notification data:

```mermaid
flowchart TD
A[Form Change] --> B[Update State]
B --> C{User Action}
C --> |Save Changes| D[Call saveProfile]
D --> E[Set saving=true]
E --> F[Fetch /api/users/profile PUT]
F --> G{Success?}
G --> |Yes| H[Show Success]
G --> |No| I[Log Error]
H --> J[Set saving=false]
I --> J
```

**Diagram sources**
- [Profile.tsx](file://src/react-app/pages/Profile.tsx#L0-L57)
- [Profile.tsx](file://src/react-app/pages/Profile.tsx#L103-L150)

**Section sources**
- [Profile.tsx](file://src/react-app/pages/Profile.tsx#L0-L551)

## Backend API Endpoints

The user profile functionality is supported by two primary API endpoints implemented in the worker/index.ts file.

### GET /api/users/profile
Retrieves the user's profile and notification settings. The endpoint:
- Requires authentication via authMiddleware
- Fetches data from both user_profiles and notification_settings tables
- Returns default values if no profile exists
- Combines Google OAuth data with stored preferences

### PUT /api/users/profile
Updates the user's profile information. The endpoint:
- Uses zValidator with CreateUserProfileSchema for input validation
- Implements upsert logic using INSERT ... ON CONFLICT
- Uses COALESCE to preserve existing values when fields are not provided
- Updates the updated_at timestamp on modification

The authentication is enforced by the authMiddleware, which verifies the JWT token and attaches user information to the request context.

```mermaid
sequenceDiagram
participant Client as Frontend
participant Auth as authMiddleware
participant API as Profile Endpoint
participant DB as Database
Client->>Auth : GET /api/users/profile
Auth->>Auth : Verify JWT Token
Auth-->>API : Attach user context
API->>DB : SELECT profile and notifications
DB-->>API : Return data
API-->>Client : JSON response
Client->>Auth : PUT /api/users/profile
Auth->>Auth : Verify JWT Token
Auth-->>API : Attach user context
API->>API : Validate input schema
API->>DB : UPSERT profile data
DB-->>API : Success status
API-->>Client : Success message
```

**Diagram sources**
- [index.ts](file://src/worker/index.ts#L650-L849)
- [security-middleware.ts](file://src/shared/security-middleware.ts#L65-L114)

**Section sources**
- [index.ts](file://src/worker/index.ts#L650-L849)
- [security-middleware.ts](file://src/shared/security-middleware.ts#L65-L264)

## API Request Examples

### Profile Retrieval (GET)
```http
GET /api/users/profile HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

Response:
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "profile": {
      "full_name": "John Doe",
      "phone": "+966 555 555 555",
      "address": "King Fahd Road",
      "city": "Riyadh",
      "country": "Saudi Arabia",
      "date_of_birth": "1990-01-01",
      "preferred_language": "en",
      "currency": "SAR",
      "bio": "Travel enthusiast",
      "avatar_url": "https://lh3.googleusercontent.com/a/..."
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

### Profile Update (PUT)
```http
PUT /api/users/profile HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "profile": {
    "full_name": "John Smith",
    "phone": "+966 500 123 456",
    "city": "Jeddah",
    "preferred_language": "ar"
  },
  "notifications": {
    "email_marketing": true,
    "push_notifications": false
  }
}

Response:
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Profile updated successfully"
}
```

**Section sources**
- [index.ts](file://src/worker/index.ts#L650-L849)
- [Profile.tsx](file://src/react-app/pages/Profile.tsx#L56-L101)

## Common Issues and Solutions

### Partial Profile Updates
The system handles partial updates gracefully using the COALESCE function in SQL. When a field is not provided in the update request, the existing value is preserved:

```sql
full_name = COALESCE(excluded.full_name, full_name)
```

This ensures that updating one field (e.g., phone number) doesn't overwrite other fields with null values.

### Data Consistency Between Frontend and Backend
The frontend initializes its state with default values that match the backend defaults:
- Country defaults to "Saudi Arabia" in both frontend and database
- Language defaults to "en" in both systems
- Currency defaults to "SAR"

The fetchProfile function ensures the frontend state is synchronized with the backend on component mount.

### Profile Image Handling
Profile images are managed through a priority system:
1. Google OAuth profile picture (highest priority)
2. Custom avatar_url from user_profiles table
3. Default icon if neither is available

The component conditionally renders the Google profile image when available, falling back to a default icon otherwise.

**Section sources**
- [index.ts](file://src/worker/index.ts#L769-L807)
- [Profile.tsx](file://src/react-app/pages/Profile.tsx#L160-L180)

## Extending Profile Fields

To extend profile fields, modifications are required in three locations:

### 1. Database Schema
Add columns to the user_profiles table in a new migration file:
```sql
ALTER TABLE user_profiles ADD COLUMN occupation TEXT;
ALTER TABLE user_profiles ADD COLUMN interests TEXT;
```

### 2. Type Definitions
Update the UserProfileSchema in types.ts:
```typescript
export const UserProfileSchema = z.object({
  // existing fields...
  occupation: z.string().nullable(),
  interests: z.string().nullable(),
});
```

### 3. Frontend Component
Add new fields to the Profile.tsx interface and form:
```typescript
interface UserProfile {
  // existing fields...
  occupation?: string;
  interests?: string;
}
```

Then add the corresponding form elements in the JSX.

**Section sources**
- [4.sql](file://migrations/4.sql#L1-L45)
- [types.ts](file://src/shared/types.ts#L137-L166)
- [Profile.tsx](file://src/react-app/pages/Profile.tsx#L0-L57)

## Profile Synchronization Across Devices

The system achieves profile synchronization through centralized data storage:
- All profile data is stored in the database, not locally
- No local storage is used for profile information
- Each device fetches the latest data from the server on load

The synchronization workflow:
1. User updates profile on Device A
2. Changes are saved to the database
3. When User accesses the profile on Device B, fresh data is retrieved from the server
4. Device B displays the updated information

This approach ensures consistency across devices without requiring complex synchronization logic. The trade-off is that an internet connection is required to access or modify profile information.

**Section sources**
- [index.ts](file://src/worker/index.ts#L650-L849)
- [Profile.tsx](file://src/react-app/pages/Profile.tsx#L56-L101)