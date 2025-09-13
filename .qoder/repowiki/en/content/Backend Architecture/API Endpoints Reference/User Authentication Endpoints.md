# User Authentication Endpoints

<cite>
**Referenced Files in This Document**   
- [index.ts](file://src/worker/index.ts#L118-L806)
- [types.ts](file://src/shared/types.ts#L137-L166)
- [AuthCallback.tsx](file://src/react-app/pages/AuthCallback.tsx#L0-L107)
- [Profile.tsx](file://src/react-app/pages/Profile.tsx#L0-L551)
- [security-utils.ts](file://src/shared/security-utils.ts#L0-L386)
- [security-middleware.ts](file://src/shared/security-middleware.ts#L65-L181)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Authentication Flow Overview](#authentication-flow-overview)
3. [OAuth 2.0 Integration](#oauth-20-integration)
4. [JWT Token Management](#jwt-token-management)
5. [User Profile Management](#user-profile-management)
6. [Security Implementation](#security-implementation)
7. [Frontend Integration](#frontend-integration)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Testing Examples](#testing-examples)

## Introduction
This document provides comprehensive documentation for the user authentication and profile management system in the HabibiStay platform. The system implements Google OAuth 2.0 for secure authentication, JWT-based session management, and comprehensive user profile functionality. The backend is built using Cloudflare Workers with D1 database, while the frontend uses React with TypeScript.

The authentication system is designed to provide a seamless user experience while maintaining high security standards through HttpOnly cookies, proper token validation, and role-based access control. This documentation covers all aspects of the authentication flow, from initial Google OAuth initiation to profile retrieval and updates.

**Section sources**
- [index.ts](file://src/worker/index.ts#L118-L806)
- [types.ts](file://src/shared/types.ts#L137-L166)

## Authentication Flow Overview

```mermaid
sequenceDiagram
participant User as "User"
participant Frontend as "Frontend App"
participant Backend as "API Server"
participant Google as "Google OAuth"
User->>Frontend : Clicks "Sign in with Google"
Frontend->>Backend : GET /api/oauth/google/redirect_url
Backend-->>Frontend : Returns Google OAuth URL
Frontend->>Google : Redirect to Google OAuth URL
Google->>User : Google Sign-in Prompt
User->>Google : Enters credentials
Google->>Frontend : Redirect to /auth/callback?code=...&state=...
Frontend->>Backend : POST /api/sessions {code}
Backend->>Backend : Validates code, creates session
Backend-->>Frontend : Sets HttpOnly cookie, redirects
Frontend->>Backend : GET /api/users/me (with cookie)
Backend-->>Frontend : Returns user profile
```

**Diagram sources**
- [index.ts](file://src/worker/index.ts#L118-L172)
- [AuthCallback.tsx](file://src/react-app/pages/AuthCallback.tsx#L0-L107)

**Section sources**
- [index.ts](file://src/worker/index.ts#L118-L172)
- [AuthCallback.tsx](file://src/react-app/pages/AuthCallback.tsx#L0-L107)

## OAuth 2.0 Integration

### OAuth Flow Implementation
The system implements the OAuth 2.0 authorization code flow with Google as the identity provider. The flow follows these steps:

1. **Initiation**: The frontend requests the Google OAuth redirect URL from the backend
2. **Authorization**: The user is redirected to Google's authorization endpoint
3. **Callback**: Google redirects back to the application with an authorization code
4. **Token Exchange**: The backend exchanges the authorization code for a session token
5. **Session Creation**: The backend creates a session and sets an HttpOnly cookie

### Endpoint: GET /api/oauth/google/redirect_url
This endpoint returns the Google OAuth authorization URL that the frontend should redirect to.

**Request**
```
GET /api/oauth/google/redirect_url
```

**Response**
```json
{
  "redirectUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&response_type=code&scope=..."
}
```

### Endpoint: POST /api/sessions
This endpoint handles the OAuth callback by exchanging the authorization code for a session token.

**Request**
```json
{
  "code": "authorization_code_from_google"
}
```

**Response**
- Success: 200 OK with HttpOnly cookie set
- Error: 400 Bad Request if no code provided

**Section sources**
- [index.ts](file://src/worker/index.ts#L118-L172)
- [AuthCallback.tsx](file://src/react-app/pages/AuthCallback.tsx#L0-L107)

## JWT Token Management

### JWT Implementation
The system uses JWT (JSON Web Token) for session management, with tokens stored in HttpOnly cookies for enhanced security. The JWT implementation includes:

- **Token Structure**: Custom JWT implementation using HMAC-SHA256 for signing
- **Token Storage**: HttpOnly, Secure, SameSite=None cookies
- **Token Expiration**: 24-hour expiration period
- **Token Validation**: Comprehensive validation including signature verification and expiration checks

### JWT Payload Structure
```json
{
  "sub": "user123",
  "email": "user@example.com",
  "role": "guest",
  "iat": 1700000000,
  "exp": 1700086400
}
```

**Key fields:**
- **sub**: User ID (subject)
- **email**: User's email address
- **role**: User role (guest, owner, admin)
- **iat**: Issued at timestamp
- **exp**: Expiration timestamp

### Security Headers
The authentication system implements the following security headers:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.openai.com https://api.myfatoorah.com; frame-src https://js.stripe.com https://checkout.stripe.com;
```

**Section sources**
- [security-utils.ts](file://src/shared/security-utils.ts#L0-L386)
- [index.ts](file://src/worker/index.ts#L174-L208)

## User Profile Management

### Profile Data Structure
The user profile system stores comprehensive user information in the database with the following schema:

**User Profile Schema**
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

**Notification Settings Schema**
```typescript
interface NotificationSettings {
  email_booking_updates: boolean;
  email_marketing: boolean;
  sms_booking_updates: boolean;
  push_notifications: boolean;
}
```

### Endpoint: GET /api/users/me
Retrieves the current user's profile information.

**Request**
```http
GET /api/users/me
Authorization: Bearer <token>
```

**Response Schema**
```json
{
  "success": true,
  "data": {
    "profile": {
      "full_name": "John Doe",
      "phone": "+966123456789",
      "address": "123 Main St",
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

### Endpoint: PUT /api/users/profile
Updates the current user's profile and notification preferences.

**Request**
```json
{
  "profile": {
    "full_name": "John Doe",
    "phone": "+966123456789",
    "address": "123 Main St",
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
```

**Response**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

**Section sources**
- [index.ts](file://src/worker/index.ts#L728-L806)
- [types.ts](file://src/shared/types.ts#L137-L166)
- [Profile.tsx](file://src/react-app/pages/Profile.tsx#L0-L551)

## Security Implementation

### Authentication Middleware
The system implements comprehensive authentication middleware that validates JWT tokens and extracts user information.

```mermaid
flowchart TD
A[Incoming Request] --> B{Has Authorization Header?}
B --> |No| C[Return 401 Unauthorized]
B --> |Yes| D[Extract Bearer Token]
D --> E[Verify JWT Signature]
E --> |Invalid| F[Return 401 Unauthorized]
E --> |Valid| G{Token Expired?}
G --> |Yes| H[Return 401 Unauthorized]
G --> |No| I[Extract User Data]
I --> J[Store in Context]
J --> K[Proceed to Handler]
```

**Diagram sources**
- [security-middleware.ts](file://src/shared/security-middleware.ts#L65-L114)

### Role-Based Access Control
The system implements role-based access control with three primary roles:

- **guest**: Regular users with basic access
- **owner**: Property owners with access to their properties
- **admin**: Administrative users with full system access

The `requireRole` middleware enforces role-based access to protected endpoints.

```typescript
// Example usage
app.get("/api/admin/stats", authMiddleware, requireRole(['admin']), async (c) => {
  // Only accessible to admin users
});
```

### Security Best Practices
The authentication system implements multiple security best practices:

- **HttpOnly Cookies**: Prevents client-side script access to session tokens
- **Secure Flag**: Ensures cookies are only sent over HTTPS
- **SameSite=None**: Allows cross-site requests while maintaining security
- **CSRF Protection**: Token-based protection against cross-site request forgery
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Comprehensive validation of all user inputs
- **SQL Injection Prevention**: Parameterized queries and input sanitization

**Section sources**
- [security-middleware.ts](file://src/shared/security-middleware.ts#L65-L181)
- [security-utils.ts](file://src/shared/security-utils.ts#L0-L386)

## Frontend Integration

### AuthCallback Page Implementation
The AuthCallback page handles the OAuth callback flow and processes the authorization code.

```mermaid
sequenceDiagram
participant Page as "AuthCallback.tsx"
participant Browser as "Browser"
participant Backend as "API Server"
Page->>Browser : Page loads with ?code=... parameter
Page->>Backend : POST /api/sessions {code}
Backend-->>Page : 200 OK, sets HttpOnly cookie
Page->>Page : Set status to 'success'
Page->>Page : Redirect to /dashboard after 2 seconds
```

**Key Implementation Details:**
- Extracts the authorization code from URL parameters
- Sends the code to the backend via POST request
- Handles success and error states with appropriate UI feedback
- Redirects to the dashboard upon successful authentication

### Profile Page Implementation
The Profile page provides a comprehensive interface for managing user profile information and preferences.

**Key Features:**
- **Tabbed Interface**: Organizes settings into Profile, Notifications, Privacy, and Security tabs
- **Form Validation**: Real-time validation of user inputs
- **Loading States**: Displays loading indicators during data fetching
- **Error Handling**: Graceful handling of API errors
- **Responsive Design**: Works across desktop and mobile devices

**Data Flow:**
1. On component mount, fetch profile data from `/api/users/me`
2. Display current profile information in form fields
3. On save, send updated profile to `/api/users/profile`
4. Show success/error feedback to the user

**Section sources**
- [AuthCallback.tsx](file://src/react-app/pages/AuthCallback.tsx#L0-L107)
- [Profile.tsx](file://src/react-app/pages/Profile.tsx#L0-L551)

## API Endpoints Reference

### GET /api/oauth/google/redirect_url
Initiates the Google OAuth flow by providing the authorization URL.

**Response**
```json
{
  "redirectUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
}
```

### POST /api/sessions
Handles the OAuth callback and creates a user session.

**Request Body**
```json
{
  "code": "authorization_code"
}
```

**Response**
- 200 OK: Session created, HttpOnly cookie set
- 400 Bad Request: Missing authorization code

### GET /api/users/me
Retrieves the current user's profile information.

**Response Schema**
```json
{
  "success": boolean,
  "data": {
    "profile": UserProfile,
    "notifications": NotificationSettings
  }
}
```

### PUT /api/users/profile
Updates the user's profile and notification preferences.

**Request Body**
```json
{
  "profile": UserProfile,
  "notifications": NotificationSettings
}
```

**Response**
```json
{
  "success": boolean,
  "message": string
}
```

### Security Requirements
All endpoints except `/api/oauth/google/redirect_url` require authentication via:
- **Authorization Header**: Bearer token
- **OR**: HttpOnly session cookie

**Section sources**
- [index.ts](file://src/worker/index.ts#L118-L806)

## Testing Examples

### Testing OAuth Callback
```bash
# Test with mock authorization code
curl -X POST https://localhost:8787/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"code": "mock-authorization-code"}' \
  -c cookies.txt \
  -v
```

### Fetching User Profile
```bash
# Fetch profile using Bearer token
curl -X GET https://localhost:8787/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -v

# Fetch profile using session cookie
curl -X GET https://localhost:8787/api/users/me \
  -b cookies.txt \
  -v
```

### Updating User Preferences
```bash
curl -X PUT https://localhost:8787/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "profile": {
      "full_name": "Jane Doe",
      "preferred_language": "ar",
      "currency": "SAR"
    },
    "notifications": {
      "email_booking_updates": true,
      "push_notifications": true
    }
  }' \
  -v
```

**Section sources**
- [index.ts](file://src/worker/index.ts#L118-L806)
- [AuthCallback.tsx](file://src/react-app/pages/AuthCallback.tsx#L0-L107)
- [Profile.tsx](file://src/react-app/pages/Profile.tsx#L0-L551)