# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Development Server
- `npm run dev` - Start React Router dev server on localhost:5173
- `npm run dev:express` - Start Express API server on localhost:5000
- `npm run dev:all` - Run both React and Express servers concurrently

### Build & Production
- `npm run build` - Build the application for production
- `npm run start` - Start React Router production server
- `npm run start:express` - Start Express production server
- `npm run start:all` - Run both production servers

### Code Quality
- `npm run typecheck` - Run TypeScript type checking and generate React Router types

### Deployment
- `npm run deploy` - Deploy directly to Google Cloud Run
- `npm run deploy:local_build_docker` - Build Docker image and deploy to Google Cloud Run

## Architecture Overview

### Dual Server Architecture
This application runs on two servers:
1. **React Router Server** (port 5173/default) - Main React application with SSR
2. **Express Server** (port 5000) - API proxy and direct endpoints

The Express server (`server.js`) provides:
- Health check endpoints (`/health`, `/api/health`)
- Direct API endpoints (`/api/find_image`, `/api/get_product_description`)
- Production SSR when NODE_ENV=production

### Application Structure

#### Route & Component Separation
- **Routes** (`app/routes/*.tsx`) - Handle routing metadata and render components
- **Components** (`app/components/*.tsx`) - Contain UI logic and business logic
- Route files should be minimal, just importing and rendering the main component

#### Canvas System
The Canvas feature is a complex multi-layer system:
- Main Canvas component at `app/components/Canvas/index.tsx`
- Modular architecture with separate components, hooks, and utilities
- Two rendering systems: HTML Canvas and Konva Canvas
- Complex image manipulation and export capabilities

#### Context Providers
Three main contexts wrap the entire application:
1. **ThemeProvider** - Dark/light mode with system preference detection
2. **AuthProvider** - Firebase authentication with Google sign-in
3. **AnalyticsProvider** - Firebase Analytics integration

#### Layout System
- **PageLayout** component provides consistent padding and width constraints
- **ContentCard** component for consistent card styling
- All pages should follow the Header → PageLayout → ContentCard → Footer pattern

### Firebase Integration
- Authentication with email/password and Google sign-in
- Firestore for data persistence
- Firebase Analytics for user tracking
- Admin user system based on Firestore user documents

### API Integration
- Backend API at `BACKEND_API_URL` (default: https://buyit-api.augustyniak.ai)
- API key authentication via `BUYIT_API_KEY_1`
- Express server proxies requests to backend with proper headers

### Konva Canvas System
Special handling for Konva.js library:
- Multiple patches and workarounds for SSR compatibility
- Dynamic imports to prevent server-side issues
- Browser-only rendering with proper fallbacks
- Complex export functionality for canvas content

## Key Development Notes

### File Path Resolution
- Uses `~/*` alias pointing to `app/*` directory
- Import components with `~/components/ComponentName`
- Import utilities with `~/lib/utilityName`

### Environment Variables
The app supports both build-time and runtime configuration:
- Build-time: `VITE_*` variables in `.env`
- Runtime: `window.RUNTIME_CONFIG` object for Docker deployments

### Styling
- TailwindCSS with custom configuration
- Dark mode support throughout
- Responsive design patterns
- Uses shadcn/ui component library patterns

### State Management
- React Context for global state (Auth, Theme, Analytics)
- Local component state for UI interactions
- Custom hooks for complex business logic (Canvas, Products, Programs)

### Testing & Quality
- TypeScript strict mode enabled
- React Router type generation via `react-router typegen`
- No lint scripts currently configured

## Common Patterns

### Route Creation
```tsx
import MyComponent from '~/components/MyComponent';

export function meta() {
  return [{ title: 'Page Title - Buy It' }, { name: 'description', content: 'Description' }];
}

export default function MyRoute() {
  return <MyComponent />;
}
```

### Component Layout
```tsx
import { PageLayout, ContentCard } from '~/components/ui/layout';

export default function MyComponent() {
  return (
    <PageLayout>
      <ContentCard>
        {/* Component content */}
      </ContentCard>
    </PageLayout>
  );
}
```

### Protected Routes
Use `ProtectedRoute` component for authentication-required pages:
```tsx
import ProtectedRoute from '~/components/ProtectedRoute';

export default function MyProtectedComponent() {
  return (
    <ProtectedRoute>
      {/* Protected content */}
    </ProtectedRoute>
  );
}
```
