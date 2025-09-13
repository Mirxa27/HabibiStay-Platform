# CMS Module

## Overview

The CMS (Content Management System) module provides a comprehensive solution for managing website content, templates, components, and AI-generated content within the HabibiStay platform.

## Directory Structure

```
src/
├── shared/
│   ├── cms-service.ts          # Backend service for CMS operations
│   └── types.ts               # CMS data types and schemas (extended)
├── worker/
│   └── index.ts               # API endpoints for CMS (extended)
├── react-app/
│   ├── contexts/
│   │   └── CMSContext.tsx     # React context for CMS state management
│   ├── components/
│   │   └── admin/
│   │       └── CMSAdminPanel.tsx  # Admin interface component
│   ├── pages/
│   │   └── CMSPage.tsx        # Public page display component
│   └── App.tsx                # Updated to include CMS routes and context
└── migrations/
    └── 11.sql                 # Database schema for CMS
```

## Key Components

### 1. Database Schema (11.sql)
Defines all necessary tables for CMS functionality:
- Pages, Templates, Components, Media
- AI Providers, Models, Content Jobs
- Content Versioning and History

### 2. Backend Service (cms-service.ts)
Provides methods for all CMS operations:
- CRUD operations for all entities
- Content versioning
- AI integration management

### 3. API Endpoints (worker/index.ts)
RESTful API endpoints for CMS functionality:
- Protected admin endpoints (require authentication)
- Public endpoints for content display

### 4. Frontend Context (CMSContext.tsx)
React context for managing CMS state:
- Data fetching and caching
- CRUD operations with error handling
- Loading states

### 5. Admin Interface (CMSAdminPanel.tsx)
User interface for CMS management:
- Tabbed navigation
- Forms for content creation
- Tables for content display

## Usage

### Backend
```typescript
import { CMSService } from '../shared/cms-service';

const cmsService = new CMSService(env.DB);

// Create a new page
const page = await cmsService.createPage({
  title: 'Home',
  slug: 'home',
  content: '{"blocks":[]}',
  status: 'published'
});

// Get all pages
const pages = await cmsService.getAllPages();
```

### Frontend
```typescript
import { useCMS } from '../contexts/CMSContext';

function MyComponent() {
  const { pages, createPage, updatePage, deletePage } = useCMS();
  
  // Create a new page
  const handleCreatePage = async () => {
    await createPage({
      title: 'New Page',
      slug: 'new-page',
      content: '{"blocks":[]}',
      status: 'draft'
    });
  };
  
  return (
    <div>
      {pages.map(page => (
        <div key={page.id}>{page.title}</div>
      ))}
    </div>
  );
}
```

## Testing

### Backend Tests
```bash
npm run test:run tests/unit/cms-service.test.ts
```

### Frontend Tests
```bash
npm run test:components src/react-app/components/admin/__tests__/CMSAdminPanel.test.tsx
```

## Extending the CMS

To add new content types:
1. Update the database schema in `migrations/11.sql`
2. Add new types to `src/shared/types.ts`
3. Extend the `CMSService` class with new methods
4. Add new API endpoints in `src/worker/index.ts`
5. Create new components in the admin interface
6. Add new routes in `src/react-app/App.tsx` if needed

## Security

- All admin endpoints require authentication
- Role-based access control (admin role required)
- Input validation using Zod schemas
- SQL injection protection through parameterized queries