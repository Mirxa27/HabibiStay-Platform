# Users API

<cite>
**Referenced Files in This Document**   
- [AuthCallback.tsx](file://src/react-app/pages/AuthCallback.tsx)
- [Profile.tsx](file://src/react-app/pages/Profile.tsx)
- [index.ts](file://src/worker/index.ts)
- [security-middleware.ts](file://src/shared/security-middleware.ts)
- [security-utils.ts](file://src/shared/security-utils.ts)
- [types.ts](file://src/shared/types.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Authentication Flow](#authentication-flow)
3. [User Profile Endpoints](#user-profile-endpoints)
4. [Response Schema](#response-schema)
5. [Error Handling](#error-handling)
6. [GDPR Compliance](#gdpr-compliance)
7. [Code Examples](#code-examples)
8. [Sequence Diagrams](#sequence-diagrams)

## Introduction
This document provides comprehensive documentation for the user management endpoints in the HabibiStay application. It covers authentication via Google OAuth, profile retrieval and updates, JWT-based security, and GDPR-compliant data handling. The API is designed to support guest, host, and admin user roles with secure session management and preference customization.

## Authentication Flow

### Google OAuth Callback Handling
The authentication flow begins with Google OAuth integration, where users are redirected to Google's authentication system. Upon successful authentication, Google redirects back to the application with an authorization code.

The `AuthCallback.tsx` component handles this callback by extracting the authorization code from the URL parameters and exchanging it for a session token via the `/api/sessions` endpoint.

```mermaid
sequenceDiagram
participant Browser as "User Browser"
participant AuthCallback as "AuthCallback.tsx"
participant API as "API Server"
participant Google as "Google OAuth"
Browser->>Google : Redirect to Google login
Google->>Browser : Authenticate user
Browser->>AuthCallback : Redirect with code
AuthCallback->>API : POST /api/sessions {code}
API->>API : exchangeCodeForSessionToken()
API->>AuthCallback : Set session cookie
AuthCallback->>Browser : Redirect to /dashboard
```

**Diagram sources**
- [AuthCallback.tsx](file://src/react-app/pages/AuthCallback.tsx#L0-L106)
- [index.ts](file://src/worker/index.ts#L174-L172)

**Section sources**
- [AuthCallback.tsx](file://src/react-app/pages/AuthCallback.tsx#L0-L106)
- [index.ts](file://src/worker/index.ts#L118-L172)

### JWT-Based Authentication
The system uses JWT tokens for stateless authentication. When a user logs in, a JWT is generated containing user identity and role information. This token is sent in the `Authorization: Bearer <token>` header for protected endpoints.

The JWT payload includes:
- `sub`: User ID
- `email`: User email
- `role`: User role (guest, host, admin)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp (24 hours from issue)

```mermaid
sequenceDiagram
participant Client as "Client App"
participant Middleware as "authMiddleware"
participant JWT as "JWT Utilities"
Client->>Middleware : Request with Bearer token
Middleware->>JWT : verifyJWT(token)
alt Token valid
JWT-->>Middleware : Return payload
Middleware->>Client : Proceed with request
else Token invalid/expired
JWT-->>Middleware : null
Middleware->>Client : 401 Unauthorized
end
```

**Diagram sources**
- [security-middleware.ts](file://src/shared/security-middleware.ts#L65-L114)
- [security-utils.ts](file://src/shared/security-utils.ts#L137-L186)

**Section sources**
- [security-middleware.ts](file://src/shared/security-middleware.ts#L65-L114)
- [security-utils.ts](file://src/shared/security-utils.ts#L137-L186)

## User Profile Endpoints

### GET /api/users/me (Profile Retrieval)
Retrieves the authenticated user's profile information including personal details and notification preferences.

**Request**
```
GET /api/users/me
Authorization: Bearer <valid_jwt_token>
```

**Response**
```json
{
  "success": true,
  "data": {
    "profile": {
      "full_name": "John Doe",
      "phone": "+966501234567",
      "address": "King Fahd Road",
      "city": "Riyadh",
      "country": "Saudi Arabia",
      "date_of_birth": "1990-01-01",
      "preferred_language": "en",
      "currency": "SAR",
      "bio": "Frequent traveler",
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

**Section sources**
- [index.ts](file://src/worker/index.ts#L729-L767)

### PUT /api/users/profile (Profile Updates)
Updates the user's profile information and notification preferences.

**Request**
```
PUT /api/users/profile
Authorization: Bearer <valid_jwt_token>
Content-Type: application/json
```

```json
{
  "full_name": "John Doe",
  "phone": "+966501234567",
  "city": "Jeddah",
  "country": "Saudi Arabia",
  "preferred_language": "ar",
  "currency": "SAR",
  "bio": "Travel enthusiast",
  "avatar_url": "https://example.com/avatar.jpg",
  "email_booking_updates": true,
  "email_marketing": false,
  "sms_booking_updates": false,
  "push_notifications": true
}
```

**Response**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

**Section sources**
- [index.ts](file://src/worker/index.ts#L767-L803)
- [Profile.tsx](file://src/react-app/pages/Profile.tsx#L402-L550)

## Response Schema

### User Roles
The system supports three user roles:
- **guest**: Regular users who book properties
- **host**: Property owners who list and manage properties
- **admin**: Administrative users with full system access

### Profile Data Structure
```typescript
interface UserProfile {
  id: number;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  date_of_birth: string | null;
  preferred_language: string;
  currency: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
```

### Notification Settings
```typescript
interface NotificationSettings {
  email_booking_updates: boolean;
  email_marketing: boolean;
  sms_booking_updates: boolean;
  push_notifications: boolean;
}
```

The default notification preferences are:
- Email booking updates: Enabled
- Email marketing: Disabled
- SMS booking updates: Enabled
- Push notifications: Enabled

**Section sources**
- [types.ts](file://src/shared/types.ts#L200-L399)
- [index.ts](file://src/worker/index.ts#L729-L767)

## Error Handling

### Common Error Responses
The API returns standardized error responses in the following format:

```json
{
  "success": false,
  "error": "Error description"
}
```

### Specific Error Cases

**Expired or Invalid Token**
```
HTTP 401 Unauthorized
```
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**Missing Authorization Header**
```
HTTP 401 Unauthorized
```
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**Invalid Google Token**
```
HTTP 400 Bad Request
```
```json
{
  "success": false,
  "error": "No authorization code provided"
}
```

**Forbidden Operations**
```
HTTP 403 Forbidden
```
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

**Internal Server Error**
```
HTTP 500 Internal Server Error
```
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

**Section sources**
- [security-middleware.ts](file://src/shared/security-middleware.ts#L65-L114)
- [index.ts](file://src/worker/index.ts#L118-L172)

## GDPR Compliance

### Data Access Requests
Users can access their personal data through the "Download Your Data" option in the privacy settings. This feature exports all user data including:
- Account information
- Booking history
- Wishlist items
- Review history
- Notification preferences
- Profile information

### Data Deletion Requests
Users can delete their account through the "Delete Account" option in the privacy settings. This triggers a GDPR-compliant deletion process that:
1. Marks the user account as inactive
2. Anonymizes personal information
3. Retains transaction records for legal compliance
4. Removes the user from marketing lists
5. Deletes authentication tokens

The system retains aggregated, anonymized data for analytics purposes in compliance with GDPR Article 5(1)(b).

**Section sources**
- [Profile.tsx](file://src/react-app/pages/Profile.tsx#L500-L550)

## Code Examples

### Retrieving User Profile with curl
```bash
curl -X GET "https://api.habibistay.com/api/users/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Updating Notification Preferences
```bash
curl -X PUT "https://api.habibistay.com/api/users/profile" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "email_booking_updates": true,
    "email_marketing": false,
    "sms_booking_updates": false,
    "push_notifications": true
  }'
```

**Section sources**
- [Profile.tsx](file://src/react-app/pages/Profile.tsx#L402-L550)
- [index.ts](file://src/worker/index.ts#L767-L803)

## Sequence Diagrams

### Complete Authentication Flow
```mermaid
sequenceDiagram
participant User as "User"
participant Frontend as "Frontend App"
participant Backend as "Backend API"
participant Google as "Google OAuth"
participant DB as "Database"
User->>Frontend : Click Login with Google
Frontend->>Google : Redirect to Google OAuth
Google->>User : Google Login Form
User->>Google : Enter credentials
Google->>Frontend : Redirect with code
Frontend->>Backend : POST /api/sessions {code}
Backend->>Backend : exchangeCodeForSessionToken()
Backend->>DB : Store session
Backend->>Frontend : Set secure cookie
Frontend->>User : Redirect to dashboard
User->>Backend : GET /api/users/me
Backend->>Backend : authMiddleware
Backend->>Backend : verifyJWT()
Backend->>DB : Get profile & notifications
Backend->>User : Return profile data
```

**Diagram sources**
- [AuthCallback.tsx](file://src/react-app/pages/AuthCallback.tsx#L0-L106)
- [index.ts](file://src/worker/index.ts#L118-L172)
- [security-middleware.ts](file://src/shared/security-middleware.ts#L65-L114)

### Profile Update Flow
```mermaid
sequenceDiagram
participant User as "User"
participant Frontend as "Frontend App"
participant Backend as "Backend API"
participant DB as "Database"
User->>Frontend : Change notification settings
Frontend->>Frontend : Update state
User->>Frontend : Click Save Preferences
Frontend->>Backend : PUT /api/users/profile
Backend->>Backend : authMiddleware
Backend->>Backend : verifyJWT()
alt Valid token
Backend->>DB : Update user_profiles
Backend->>DB : Update notification_settings
Backend->>Frontend : 200 OK
Frontend->>User : Show success message
else Invalid token
Backend->>Frontend : 401 Unauthorized
Frontend->>User : Show login prompt
end
```

**Diagram sources**
- [Profile.tsx](file://src/react-app/pages/Profile.tsx#L402-L550)
- [index.ts](file://src/worker/index.ts#L767-L803)
- [security-middleware.ts](file://src/shared/security-middleware.ts#L65-L114)