# Insbuy React Web App

A modern React application for discovering and exploring TV show inspirations, products, and programs.

## Features

- 🔒 User authentication with email/password and Google sign-in
- 🌙 Dark mode support with consistent styling across all components
- 📱 Responsive design for all device sizes
- 🔍 Search and filter functionality
- ⭐ Save favorite inspirations
- 📊 User profile management

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

## Architecture

### Layout System

The application uses a consistent layout system for all pages:

#### Key Components

- **PageLayout**: A wrapper component that provides consistent padding, width constraints, and vertical centering.
- **ContentCard**: A component for displaying content in a card format with consistent styling.

#### Usage

```tsx
import { PageLayout, ContentCard } from '~/components/ui/layout';

export default function YourComponent() {
  return (
    <>
      <Header />
      <PageLayout>
        <ContentCard>{/* Your content here */}</ContentCard>
      </PageLayout>
      <Footer />
    </>
  );
}
```

### Routing Structure

The application follows a clean separation between routes and components:

- **Route files** (`app/routes/*.tsx`): Simple files that handle routing concerns like metadata and rendering the appropriate component
- **Component files** (`app/components/*.tsx`): Handle the actual UI rendering and business logic

#### Route Example

```tsx
import MyComponent from '~/components/MyComponent';

export function meta() {
  return [{ title: 'Page Title - Insbuy' }, { name: 'description', content: 'Page description' }];
}

export default function MyRoute() {
  return <MyComponent />;
}
```

### Dark Mode

The application features a comprehensive dark mode implementation:

- Consistent dark backgrounds and text colors across all components
- Automatic detection of system preferences
- Manual toggle option in the header
- Persistent theme preference using localStorage
- Proper contrast ratios for accessibility

## Authentication

The app includes a complete authentication system with:

- Sign in/sign up with email and password
- Google authentication
- Password reset functionality
- Profile management
- Password changing

## Deployment

### Docker

```bash
# Build the Docker image
docker build -t insbuy-react-app .

# Run the container
docker run -p 3000:3000 insbuy-react-app
```

## Tech Stack

- React
- TypeScript
- Firebase (Authentication, Firestore)
- TailwindCSS
- React Router
- Vite
