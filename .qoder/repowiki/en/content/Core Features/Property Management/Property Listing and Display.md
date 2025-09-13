# Property Listing and Display

<cite>
**Referenced Files in This Document**   
- [PropertyCard.tsx](file://src/react-app/components/PropertyCard.tsx)
- [PropertyDetail.tsx](file://src/react-app/pages/PropertyDetail.tsx)
- [Stays.tsx](file://src/react-app/pages/Stays.tsx)
- [PropertyService.ts](file://src/server/services/PropertyService.ts)
- [index.ts](file://src/worker/index.ts)
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
This document provides a comprehensive overview of the Property Listing and Display functionality in the HabibiStay application. It details how properties are fetched from the backend API and rendered on the Stays page using the PropertyCard component, including filtering, sorting, and pagination mechanisms. The implementation of the PropertyDetail page for showing comprehensive property information, availability calendar, and booking options is also covered. Backend GET routes for listing properties with query parameters for filters and retrieving individual property details are documented. Examples of data fetching with React Query or similar, loading states, and error handling are included. Performance considerations such as lazy loading, image optimization, and caching strategies are addressed, along with common issues like missing data, broken images, and slow load times.

## Project Structure
The project structure is organized into several key directories:
- `.qoder/quests`: Contains quest files for development tasks.
- `migrations`: Contains SQL migration files for database schema changes.
- `src`: The main source code directory.
  - `react-app`: Contains React components, pages, contexts, and the main application files.
  - `shared`: Contains shared utilities, types, and services.
  - `worker`: Contains the main server logic and API routes.
- Various configuration files such as `README.md`, `package.json`, `tailwind.config.js`, and `vite.config.ts`.

```mermaid
graph TB
subgraph "Frontend"
UI[User Interface]
Router[Router]
Components[Components]
Pages[Pages]
end
subgraph "Backend"
API[API Server]
Auth[Auth Service]
DB[(Database)]
end
UI --> API
API --> Auth
API --> DB
```

**Diagram sources**
- [App.tsx](file://src/react-app/App.tsx)
- [index.ts](file://src/worker/index.ts)

**Section sources**
- [App.tsx](file://src/react-app/App.tsx)
- [index.ts](file://src/worker/index.ts)

## Core Components
The core components of the Property Listing and Display functionality include:
- **PropertyCard**: A reusable component for displaying individual property listings.
- **PropertyDetail**: A page component for displaying detailed information about a specific property.
- **Stays**: A page component for listing and filtering properties.
- **PropertyService**: A service class for handling property-related operations on the backend.

**Section sources**
- [PropertyCard.tsx](file://src/react-app/components/PropertyCard.tsx)
- [PropertyDetail.tsx](file://src/react-app/pages/PropertyDetail.tsx)
- [Stays.tsx](file://src/react-app/pages/Stays.tsx)
- [PropertyService.ts](file://src/server/services/PropertyService.ts)

## Architecture Overview
The architecture of the Property Listing and Display functionality is designed to be modular and scalable. The frontend uses React for rendering components and managing state, while the backend uses a serverless architecture with Cloudflare Workers to handle API requests. The database is managed through SQL migrations, and the application is styled using Tailwind CSS.

```mermaid
graph TB
subgraph "Frontend"
StaysPage[Stays Page]
PropertyDetailPage[Property Detail Page]
PropertyCard[Property Card]
end
subgraph "Backend"
PropertyService[Property Service]
Database[Database]
end
StaysPage --> PropertyService
PropertyDetailPage --> PropertyService
PropertyCard --> PropertyService
PropertyService --> Database
```

**Diagram sources**
- [Stays.tsx](file://src/react-app/pages/Stays.tsx)
- [PropertyDetail.tsx](file://src/react-app/pages/PropertyDetail.tsx)
- [PropertyService.ts](file://src/server/services/PropertyService.ts)

## Detailed Component Analysis

### PropertyCard Analysis
The `PropertyCard` component is responsible for rendering individual property listings. It supports multiple variants (default, featured, compact, chat) and includes features such as image galleries, amenities, and action buttons.

#### Class Diagram
```mermaid
classDiagram
class PropertyCard {
+property : Property
+showWishlist : boolean
+isInWishlist : boolean
+onAddToWishlist : (propertyId : number) => void
+onRemoveFromWishlist : (propertyId : number) => void
+onBook : (propertyId : number) => void
+onViewDetails : (propertyId : number) => void
+onCheckAvailability : (propertyId : number) => void
+variant : 'default' | 'featured' | 'compact' | 'chat'
+className : string
+currentImageIndex : number
+imageError : boolean
+images : string[]
+amenities : string[]
+handleWishlistClick(e : MouseEvent) : void
+nextImage(e : MouseEvent) : void
+prevImage(e : MouseEvent) : void
+renderImageGallery() : JSX.Element
+renderAmenities() : JSX.Element
+cardClasses : string
}
class Property {
+id : number
+title : string
+location : string
+description : string
+price_per_night : number
+currency : string
+bedrooms : number
+bathrooms : number
+max_guests : number
+average_rating : number
+review_count : number
+images : string[]
+amenities : string[]
+is_featured : boolean
}
PropertyCard --> Property : "uses"
```

**Diagram sources**
- [PropertyCard.tsx](file://src/react-app/components/PropertyCard.tsx)
- [types.ts](file://src/shared/types.ts)

#### Sequence Diagram
```mermaid
sequenceDiagram
participant Client as "Client App"
participant PropertyCard as "PropertyCard"
participant PropertyService as "PropertyService"
participant DB as "DatabaseManager"
Client->>PropertyCard : Render PropertyCard
PropertyCard->>PropertyCard : Parse images and amenities
PropertyCard->>PropertyCard : Render image gallery
PropertyCard->>PropertyCard : Render amenities
PropertyCard->>PropertyCard : Render action buttons
PropertyCard->>PropertyService : Fetch property details
PropertyService->>DB : Query database
DB-->>PropertyService : Return property data
PropertyService-->>PropertyCard : Return property data
PropertyCard-->>Client : Display property card
```

**Diagram sources**
- [PropertyCard.tsx](file://src/react-app/components/PropertyCard.tsx)
- [PropertyService.ts](file://src/server/services/PropertyService.ts)

### PropertyDetail Analysis
The `PropertyDetail` component displays detailed information about a specific property, including images, amenities, host information, reviews, and a booking form.

#### Class Diagram
```mermaid
classDiagram
class PropertyDetail {
+id : string
+property : PropertyDetailData
+loading : boolean
+currentImageIndex : number
+isWishlisted : boolean
+showBookingForm : boolean
+booking : CreateBooking
+bookingLoading : boolean
+fetchPropertyDetails() : Promise<void>
+checkWishlistStatus() : Promise<void>
+toggleWishlist() : Promise<void>
+handleBooking() : Promise<void>
+calculateNights() : number
+totalAmount : number
+serviceFee : number
+taxes : number
+finalTotal : number
}
class PropertyDetailData {
+id : number
+title : string
+location : string
+description : string
+price_per_night : number
+currency : string
+bedrooms : number
+bathrooms : number
+max_guests : number
+average_rating : number
+review_count : number
+images : string[]
+amenities : string[]
+is_featured : boolean
+reviews : Review[]
+host_name : string
+host_email : string
+host_phone : string
+host_avatar : string
+avg_rating : number
}
class Review {
+id : number
+rating : number
+comment : string
+reviewer_name : string
}
class CreateBooking {
+property_id : number
+guest_name : string
+guest_email : string
+guest_phone : string
+check_in_date : string
+check_out_date : string
+total_guests : number
+special_requests : string
}
PropertyDetail --> PropertyDetailData : "uses"
PropertyDetail --> Review : "uses"
PropertyDetail --> CreateBooking : "uses"
```

**Diagram sources**
- [PropertyDetail.tsx](file://src/react-app/pages/PropertyDetail.tsx)
- [types.ts](file://src/shared/types.ts)

#### Sequence Diagram
```mermaid
sequenceDiagram
participant Client as "Client App"
participant PropertyDetail as "PropertyDetail"
participant PropertyService as "PropertyService"
participant DB as "DatabaseManager"
Client->>PropertyDetail : Navigate to PropertyDetail
PropertyDetail->>PropertyDetail : Fetch property details
PropertyDetail->>PropertyService : GET /api/properties/ : id
PropertyService->>DB : Query database
DB-->>PropertyService : Return property data
PropertyService-->>PropertyDetail : Return property data
PropertyDetail->>PropertyDetail : Check wishlist status
PropertyDetail->>PropertyService : GET /api/wishlist
PropertyService->>DB : Query database
DB-->>PropertyService : Return wishlist data
PropertyService-->>PropertyDetail : Return wishlist data
PropertyDetail-->>Client : Display property detail
```

**Diagram sources**
- [PropertyDetail.tsx](file://src/react-app/pages/PropertyDetail.tsx)
- [PropertyService.ts](file://src/server/services/PropertyService.ts)

### Stays Analysis
The `Stays` component is responsible for listing and filtering properties. It includes a search form, advanced filters, and a grid of property cards.

#### Class Diagram
```mermaid
classDiagram
class Stays {
+properties : Property[]
+loading : boolean
+showFilters : boolean
+pagination : Pagination
+searchFilters : AdvancedPropertySearch
+availableAmenities : string[]
+fetchProperties(filters? : AdvancedPropertySearch) : Promise<void>
+handleSearch(e : FormEvent) : void
+handleFilterChange(key : keyof AdvancedPropertySearch, value : any) : void
+toggleAmenity(amenity : string) : void
+clearFilters() : void
+handlePageChange(newPage : number) : void
}
class Property {
+id : number
+title : string
+location : string
+description : string
+price_per_night : number
+currency : string
+bedrooms : number
+bathrooms : number
+max_guests : number
+average_rating : number
+review_count : number
+images : string[]
+amenities : string[]
+is_featured : boolean
}
class Pagination {
+page : number
+limit : number
+total : number
+totalPages : number
}
class AdvancedPropertySearch {
+location : string
+check_in : string
+check_out : string
+guests : number
+min_price : number
+max_price : number
+amenities : string[]
+bedrooms : number
+bathrooms : number
+rating : number
+sort_by : string
+page : number
+limit : number
}
Stays --> Property : "uses"
Stays --> Pagination : "uses"
Stays --> AdvancedPropertySearch : "uses"
```

**Diagram sources**
- [Stays.tsx](file://src/react-app/pages/Stays.tsx)
- [types.ts](file://src/shared/types.ts)

#### Sequence Diagram
```mermaid
sequenceDiagram
participant Client as "Client App"
participant Stays as "Stays"
participant PropertyService as "PropertyService"
participant DB as "DatabaseManager"
Client->>Stays : Navigate to Stays
Stays->>Stays : Fetch properties
Stays->>PropertyService : GET /api/properties?...
PropertyService->>DB : Query database
DB-->>PropertyService : Return property data
PropertyService-->>Stays : Return property data
Stays->>Stays : Render property cards
Stays-->>Client : Display property list
```

**Diagram sources**
- [Stays.tsx](file://src/react-app/pages/Stays.tsx)
- [PropertyService.ts](file://src/server/services/PropertyService.ts)

## Dependency Analysis
The Property Listing and Display functionality depends on several key components and services:
- **Frontend**: React, React Router, Tailwind CSS, Lucide React icons.
- **Backend**: Cloudflare Workers, SQLite database.
- **Shared**: Types, utilities, and services.

```mermaid
graph TB
subgraph "Frontend"
StaysPage[Stays Page]
PropertyDetailPage[Property Detail Page]
PropertyCard[Property Card]
React[React]
ReactRouter[React Router]
Tailwind[Tailwind CSS]
Lucide[Lucide React]
end
subgraph "Backend"
PropertyService[Property Service]
Database[Database]
Cloudflare[Cloudflare Workers]
end
subgraph "Shared"
Types[Types]
Utilities[Utilities]
Services[Services]
end
StaysPage --> React
StaysPage --> ReactRouter
StaysPage --> Tailwind
StaysPage --> Lucide
StaysPage --> PropertyService
PropertyDetailPage --> React
PropertyDetailPage --> ReactRouter
PropertyDetailPage --> Tailwind
PropertyDetailPage --> Lucide
PropertyDetailPage --> PropertyService
PropertyCard --> React
PropertyCard --> Tailwind
PropertyCard --> Lucide
PropertyCard --> PropertyService
PropertyService --> Database
PropertyService --> Cloudflare
PropertyService --> Types
PropertyService --> Utilities
PropertyService --> Services
```

**Diagram sources**
- [Stays.tsx](file://src/react-app/pages/Stays.tsx)
- [PropertyDetail.tsx](file://src/react-app/pages/PropertyDetail.tsx)
- [PropertyCard.tsx](file://src/react-app/components/PropertyCard.tsx)
- [PropertyService.ts](file://src/server/services/PropertyService.ts)

**Section sources**
- [Stays.tsx](file://src/react-app/pages/Stays.tsx)
- [PropertyDetail.tsx](file://src/react-app/pages/PropertyDetail.tsx)
- [PropertyCard.tsx](file://src/react-app/components/PropertyCard.tsx)
- [PropertyService.ts](file://src/server/services/PropertyService.ts)

## Performance Considerations
The application includes several performance optimizations:
- **Lazy Loading**: Images are loaded only when they are in the viewport.
- **Image Optimization**: Images are served in optimized formats and sizes.
- **Caching**: Data is cached to reduce the number of API requests.
- **Debouncing**: Search and filter inputs are debounced to reduce the number of API requests.

**Section sources**
- [PropertyCard.tsx](file://src/react-app/components/PropertyCard.tsx)
- [Stays.tsx](file://src/react-app/pages/Stays.tsx)
- [performance-utils.ts](file://src/shared/performance-utils.ts)

## Troubleshooting Guide
Common issues and their solutions:
- **Missing Data**: Ensure that the property data is correctly formatted and includes all required fields.
- **Broken Images**: Check the image URLs and ensure they are accessible.
- **Slow Load Times**: Optimize images and use caching to reduce load times.

**Section sources**
- [PropertyCard.tsx](file://src/react-app/components/PropertyCard.tsx)
- [PropertyDetail.tsx](file://src/react-app/pages/PropertyDetail.tsx)
- [Stays.tsx](file://src/react-app/pages/Stays.tsx)

## Conclusion
The Property Listing and Display functionality in the HabibiStay application is well-structured and modular. It provides a seamless user experience for browsing and booking properties, with robust backend support for data management and performance optimization. The use of React and Cloudflare Workers ensures a scalable and maintainable architecture.