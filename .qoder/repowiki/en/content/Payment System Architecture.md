# Payment System Architecture

<cite>
**Referenced Files in This Document**   
- [PaymentService.ts](file://src/server/services/PaymentService.ts)
- [payment.ts](file://src/shared/payment.ts)
- [PaymentModal.tsx](file://src/react-app/components/PaymentModal.tsx)
- [PaymentSuccess.tsx](file://src/react-app/pages/PaymentSuccess.tsx)
- [PaymentCancel.tsx](file://src/react-app/pages/PaymentCancel.tsx)
- [index.ts](file://src/worker/index.ts)
- [payment-service.test.ts](file://tests/unit/payment-service.test.ts)
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
The Payment System Architecture of HabibiStay is a robust, multi-provider payment processing solution designed to handle secure transactions for property bookings. This system integrates with two primary payment gateways—MyFatoorah and PayPal—providing regional and international payment options. The architecture supports core operations including payment creation, verification, refund processing, and webhook handling for asynchronous payment status updates. It is built with security, idempotency, and user experience in mind, ensuring reliable transaction processing and clear user feedback throughout the payment journey.

## Project Structure
The payment system is distributed across multiple directories in the HabibiStay codebase, following a modular and layered architecture. The backend services are located in the `src/server/services` directory, while shared types and interfaces are maintained in `src/shared`. The frontend components reside in `src/react-app/components` and `src/react-app/pages`, and API routes are defined in the worker entry point `src/worker/index.ts`.

``mermaid
graph TB
subgraph "Frontend"
PM[PaymentModal.tsx]
PS[PaymentSuccess.tsx]
PC[PaymentCancel.tsx]
end
subgraph "Backend"
PSV[PaymentService.ts]
API[index.ts]
end
subgraph "Shared"
SH[payment.ts]
end
PM --> API
PS --> API
PC --> API
API --> PSV
PSV --> SH
SH --> PSV
```

**Diagram sources**
- [PaymentModal.tsx](file://src/react-app/components/PaymentModal.tsx)
- [PaymentSuccess.tsx](file://src/react-app/pages/PaymentSuccess.tsx)
- [PaymentCancel.tsx](file://src/react-app/pages/PaymentCancel.tsx)
- [PaymentService.ts](file://src/server/services/PaymentService.ts)
- [index.ts](file://src/worker/index.ts)
- [payment.ts](file://src/shared/payment.ts)

**Section sources**
- [PaymentService.ts](file://src/server/services/PaymentService.ts)
- [payment.ts](file://src/shared/payment.ts)
- [PaymentModal.tsx](file://src/react-app/components/PaymentModal.tsx)
- [PaymentSuccess.tsx](file://src/react-app/pages/PaymentSuccess.tsx)
- [PaymentCancel.tsx](file://src/react-app/pages/PaymentCancel.tsx)
- [index.ts](file://src/worker/index.ts)

## Core Components
The core of the payment system is the `PaymentService` class, which encapsulates all payment-related business logic. It provides a unified interface for interacting with multiple payment providers (MyFatoorah and PayPal), abstracting away the differences in their APIs. The service handles payment creation, verification, refunds, and webhook processing, while maintaining transaction records in the database.

Key interfaces include:
- `PaymentRequest`: Defines the structure for initiating a payment
- `PaymentResponse`: Represents the result of a payment operation
- `RefundRequest` and `RefundResponse`: Handle refund operations
- `WebhookPayload`: Standardizes incoming webhook data from payment providers

The system is designed with extensibility in mind, allowing for the addition of new payment providers by implementing the same interface pattern.

**Section sources**
- [PaymentService.ts](file://src/server/services/PaymentService.ts#L0-L199)
- [payment.ts](file://src/shared/payment.ts#L0-L165)

## Architecture Overview
The payment system follows a service-oriented architecture with clear separation between frontend, API layer, and payment service. The flow begins with the user initiating a payment through the `PaymentModal`, which calls the `/api/payments/create` endpoint. This triggers the `PaymentService` to communicate with the selected payment provider (MyFatoorah or PayPal) and return a redirect URL. After payment completion, the provider redirects back to callback endpoints, which verify the payment status and update the booking accordingly.

``mermaid
sequenceDiagram
participant User as "User"
participant Frontend as "PaymentModal"
participant API as "API Server"
participant Service as "PaymentService"
participant Provider as "Payment Provider"
participant DB as "Database"
User->>Frontend : Initiate Payment
Frontend->>API : POST /api/payments/create
API->>Service : createPayment(request)
Service->>Provider : Create Payment (MyFatoorah/PayPal)
Provider-->>Service : Payment URL
Service->>DB : Create Payment Record
Service-->>API : Return Payment URL
API-->>Frontend : Redirect URL
Frontend->>User : Redirect to Payment Gateway
User->>Provider : Complete Payment
Provider->>API : Webhook Notification
API->>Service : handleWebhook(payload)
Service->>DB : Update Payment Status
Service->>DB : Update Booking Status
Service-->>API : Webhook Processed
API-->>Provider : Acknowledgment
Provider->>API : Redirect to Callback
API->>Service : verifyPayment(paymentId)
Service-->>API : Verification Result
API->>DB : Finalize Booking
API-->>User : Payment Success Page
```

**Diagram sources**
- [PaymentService.ts](file://src/server/services/PaymentService.ts)
- [index.ts](file://src/worker/index.ts)
- [PaymentModal.tsx](file://src/react-app/components/PaymentModal.tsx)
- [PaymentSuccess.tsx](file://src/react-app/pages/PaymentSuccess.tsx)

## Detailed Component Analysis

### Payment Service Analysis
The `PaymentService` is the central component responsible for all payment operations. It implements a provider-agnostic interface while handling the specific requirements of each payment gateway.

#### Class Diagram
``mermaid
classDiagram
class PaymentService {
+myFatoorahConfig : Object
+paypalConfig : Object
+getPaymentProviders() : Promise~PaymentProvider[]~
+getPaymentMethods(provider, currency) : Promise~PaymentMethod[]~
+createPayment(request, provider) : Promise~PaymentResponse~
+verifyPayment(paymentId, provider) : Promise~PaymentResponse~
+processRefund(paymentId, amount, reason) : Promise~RefundResponse~
+handleWebhook(payload) : Promise~void~
-createPaymentRecord(request, provider) : Promise~string~
-updatePaymentRecord(paymentId, response) : Promise~void~
-getPaymentRecord(paymentId) : Promise~any~
-createRefundRecord(paymentId, response, reason) : Promise~void~
-verifyWebhookSignature(payload) : Promise~boolean~
-handlePaymentCompleted(transactionId, provider) : Promise~void~
-handlePaymentFailed(transactionId, provider) : Promise~void~
}
class PaymentProvider {
+id : string
+name : string
+isActive : boolean
+supportedCurrencies : string[]
+supportedCountries : string[]
}
class PaymentMethod {
+id : string
+type : string
+provider : string
+name : string
+logo? : string
+isActive : boolean
}
class PaymentRequest {
+bookingId : string
+amount : number
+currency : string
+description : string
+customerInfo : Object
+metadata? : Record~string, any~
}
class PaymentResponse {
+success : boolean
+paymentId : string
+transactionId? : string
+status : string
+amount : number
+currency : string
+paymentUrl? : string
+redirectUrl? : string
+error? : string
+provider : string
+metadata? : Record~string, any~
}
class RefundRequest {
+paymentId : string
+amount : number
+reason? : string
+metadata? : Record~string, any~
}
class RefundResponse {
+success : boolean
+refundId : string
+amount : number
+status : string
+error? : string
}
class WebhookPayload {
+provider : string
+event : string
+data : any
+signature? : string
+timestamp : string
+metadata? : Record~string, any~
}
PaymentService --> PaymentProvider : "returns"
PaymentService --> PaymentMethod : "returns"
PaymentService --> PaymentRequest : "consumes"
PaymentService --> PaymentResponse : "returns"
PaymentService --> RefundRequest : "consumes"
PaymentService --> RefundResponse : "returns"
PaymentService --> WebhookPayload : "consumes"
```

**Diagram sources**
- [PaymentService.ts](file://src/server/services/PaymentService.ts#L0-L199)

### Frontend Components Analysis
The frontend payment components provide a seamless user experience for completing bookings. The `PaymentModal` displays booking details and initiates the payment process, while `PaymentSuccess` and `PaymentCancel` pages handle post-payment scenarios.

#### Payment Flow Diagram
``mermaid
flowchart TD
Start([User clicks Pay]) --> Modal[Open PaymentModal]
Modal --> Validate["Validate Booking Data"]
Validate --> Request["Call /api/payments/create"]
Request --> Check["Check Response Success"]
Check --> |Success| Redirect["Redirect to Payment Gateway"]
Check --> |Error| ShowError["Display Error Message"]
ShowError --> Modal
Redirect --> Gateway["User completes payment at gateway"]
Gateway --> |Success| Callback["Redirect to /api/payments/callback"]
Gateway --> |Cancel| Cancel["Redirect to /payment/cancel"]
Callback --> Verify["Verify Payment Status"]
Verify --> |Success| SuccessPage["Show PaymentSuccess Page"]
Verify --> |Failed| ErrorPage["Show Payment Error"]
Cancel --> CancelPage["Show PaymentCancel Page"]
```

**Diagram sources**
- [PaymentModal.tsx](file://src/react-app/components/PaymentModal.tsx)
- [PaymentSuccess.tsx](file://src/react-app/pages/PaymentSuccess.tsx)
- [PaymentCancel.tsx](file://src/react-app/pages/PaymentCancel.tsx)

**Section sources**
- [PaymentModal.tsx](file://src/react-app/components/PaymentModal.tsx#L0-L167)
- [PaymentSuccess.tsx](file://src/react-app/pages/PaymentSuccess.tsx#L0-L199)
- [PaymentCancel.tsx](file://src/react-app/pages/PaymentCancel.tsx#L0-L114)

### API Integration Analysis
The API routes in `index.ts` serve as the integration layer between the frontend and the `PaymentService`. These routes handle authentication, input validation, and error handling before delegating to the service layer.

#### API Sequence Diagram
``mermaid
sequenceDiagram
participant Client as "Frontend"
participant API as "API Server"
participant Service as "PaymentService"
participant DB as "Database"
Client->>API : POST /api/payments/create
API->>API : authMiddleware()
API->>API : Validate request body
API->>API : Get booking details
API->>Service : createPayment(request)
Service->>DB : Create payment record
Service->>Provider : Create payment (MyFatoorah/PayPal)
Provider-->>Service : Payment URL
Service-->>API : PaymentResponse
API->>DB : Log audit event
API-->>Client : 200 OK with payment details
Client->>API : GET /api/payments/callback
API->>Service : verifyPayment(paymentId)
Service->>DB : Get payment record
Service->>Provider : Verify payment status
Provider-->>Service : Status response
Service->>DB : Update payment and booking status
Service-->>API : Verification result
API->>DB : Send confirmation email
API-->>Client : Redirect to success page
```

**Diagram sources**
- [index.ts](file://src/worker/index.ts#L1500-L2100)
- [PaymentService.ts](file://src/server/services/PaymentService.ts)

## Dependency Analysis
The payment system has well-defined dependencies that ensure separation of concerns while maintaining functionality. The `PaymentService` depends on the database for persistence and external payment providers for transaction processing. The frontend components depend on shared types for type safety and the API for data exchange.

``mermaid
graph TD
A[PaymentModal] --> B[/api/payments/create\]
C[PaymentSuccess] --> D[/api/payments/callback\]
E[PaymentCancel] --> F[/payment/cancel\]
B --> G[PaymentService]
D --> G
G --> H[MyFatoorah API]
G --> I[PayPal API]
G --> J[Database]
K[Webhook Endpoints] --> G
G --> L[NotificationService]
```

**Diagram sources**
- [index.ts](file://src/worker/index.ts)
- [PaymentService.ts](file://src/server/services/PaymentService.ts)
- [PaymentModal.tsx](file://src/react-app/components/PaymentModal.tsx)
- [PaymentSuccess.tsx](file://src/react-app/pages/PaymentSuccess.tsx)
- [PaymentCancel.tsx](file://src/react-app/pages/PaymentCancel.tsx)

**Section sources**
- [PaymentService.ts](file://src/server/services/PaymentService.ts)
- [index.ts](file://src/worker/index.ts)

## Performance Considerations
The payment system is designed with performance and reliability in mind. Key considerations include:

- **Idempotency**: Webhook processing includes idempotency checks to prevent duplicate processing of the same event
- **Error Handling**: Comprehensive error handling with logging ensures issues can be diagnosed and resolved
- **Asynchronous Processing**: Webhook handling is designed to be fast and reliable, with best-effort logging even if processing fails
- **Caching**: While not explicitly implemented in the current code, the architecture allows for caching of payment provider configurations and methods
- **Database Operations**: All database operations are parameterized to prevent SQL injection and optimized for the expected query patterns

The system uses environment variables for configuration, allowing different settings for development, staging, and production environments. The PayPal integration uses sandbox mode by default, which can be switched to live mode in production.

## Troubleshooting Guide
Common issues and their solutions:

**Payment Creation Fails**
- Check that required environment variables are set: `MYFATOORAH_API_KEY`, `PAYPAL_CLIENT_ID`, `APP_URL`
- Verify the booking exists and has not already been paid
- Ensure the amount is positive and currency is supported

**Webhook Verification Fails**
- For MyFatoorah: Ensure `MYFATOORAH_WEBHOOK_SECRET` is correctly configured
- For PayPal: Ensure `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are set for signature verification
- Check that the webhook URL is correctly registered with the payment provider

**Payment Status Not Updating**
- Verify that webhook endpoints are publicly accessible
- Check server logs for webhook processing errors
- Ensure the database connection is working properly

**Redirect Issues After Payment**
- Confirm that `APP_URL` environment variable is correctly set
- Verify that callback URLs are registered with the payment provider
- Check for JavaScript errors in the browser console

**Section sources**
- [PaymentService.ts](file://src/server/services/PaymentService.ts)
- [index.ts](file://src/worker/index.ts)
- [payment-service.test.ts](file://tests/unit/payment-service.test.ts)

## Conclusion
The HabibiStay payment system architecture provides a robust, secure, and user-friendly solution for processing property booking payments. By supporting multiple payment providers, it accommodates both regional (MyFatoorah) and international (PayPal) payment methods, increasing conversion rates. The system's modular design, with clear separation between frontend, API, and service layers, ensures maintainability and extensibility. Comprehensive error handling, idempotency controls, and detailed logging provide reliability and ease of troubleshooting. The architecture successfully balances security requirements with a seamless user experience, making it a critical component of the overall booking flow.