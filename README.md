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

### Single Command Deployment

**Deploy to Development:**

```bash
npm run deploy:dev
```

**Deploy to Production:**

```bash
npm run deploy
```

### Development Environment Management

```bash
# View development logs
npm run dev:logs

# Check development service status
npm run dev:status

# Get development service URL
npm run dev:url

# Delete development service
npm run dev:delete
```

### Terraform Infrastructure Management

```bash
# Initialize Terraform
npm run infra:init

# Plan infrastructure changes
npm run infra:plan:dev    # for development
npm run infra:plan:prod   # for production

# Destroy infrastructure (use with caution)
npm run infra:destroy:dev
npm run infra:destroy:prod
```

### Docker

```bash
# Build the Docker image locally
npm run docker:build
```

## Semantic Versioning & Changelog

This project uses [Changesets](https://github.com/changesets/changesets) for automated semantic versioning and changelog management.

### How to use

- **Create a changeset:**

  ```bash
  npx changeset
  ```

  Follow the prompts to describe your changes. This will create a markdown file in the `.changeset` folder.

- **Version and update changelog:**

  ```bash
  npm run version
  ```

  This will bump the version, update `CHANGELOG.md`, and update `package.json`.

- **Publish (optional):**

  ```bash
  npm run release
  ```

  This will publish your package if you use a registry.

### Step-by-step example

1. **Make code changes** to your application

2. **Create a changeset** to document your changes:

   ```bash
   npx changeset
   ```

   - Select the type of version bump:
     - **patch**: for bug fixes and minor changes
     - **minor**: for new features that don't break existing functionality
     - **major**: for breaking changes
   - Enter a detailed description of your changes for the changelog

3. **Commit your changeset**:

   ```bash
   git add .changeset/*.md
   git commit -m "Add changeset for [feature description]"
   ```

4. **Update the version** in your package.json and create/update the changelog:

   ```bash
   npm run version
   ```

   This will:
   - Consume the changeset files
   - Update package.json with the new version
   - Create or update CHANGELOG.md

5. **Commit the version changes**:

   ```bash
   git add package.json CHANGELOG.md
   git commit -m "Bump version to [new version]"
   ```

6. **Push your changes** to your repository:

   ```bash
   git push
   ```

See the [Changesets documentation](https://github.com/changesets/changesets) for more details.

## Tech Stack

- React
- TypeScript
- Firebase (Authentication, Firestore)
- TailwindCSS
- React Router
- Vite
