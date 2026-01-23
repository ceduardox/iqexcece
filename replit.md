# IQEXPONENCIAL

## Overview

IQEXPONENCIAL is a cognitive enhancement web application targeting Spanish-speaking users. The platform helps users identify their age group and cognitive challenges, then provides personalized mental improvement solutions. The app features an engaging onboarding flow with a loading screen, age/problem selection, and completion confirmation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom Replit plugins for development
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **Animations**: Framer Motion for page transitions and interactions

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful endpoints prefixed with `/api`
- **Build**: esbuild for server bundling, Vite for client

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with migrations output to `./migrations`
- **Current Storage**: In-memory storage (`MemStorage` class) as default implementation
- **Database Ready**: Schema and Drizzle config prepared for PostgreSQL connection via `DATABASE_URL`

### Project Structure
```
├── client/           # React frontend application
│   ├── src/
│   │   ├── components/   # UI components (shadcn/ui + custom)
│   │   ├── pages/        # Route page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and query client
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Data access layer
│   ├── static.ts     # Static file serving (production)
│   └── vite.ts       # Vite dev server integration
├── shared/           # Shared code between client/server
│   └── schema.ts     # Drizzle database schema
└── script/           # Build scripts
```

### Path Aliases
- `@/*` → `./client/src/*`
- `@shared/*` → `./shared/*`
- `@assets/*` → `./attached_assets/*`

### Development vs Production
- **Development**: Vite dev server with HMR, served through Express
- **Production**: Static files served from `dist/public`, server bundled to `dist/index.cjs`

## External Dependencies

### Database
- **PostgreSQL**: Required for production (connection via `DATABASE_URL` environment variable)
- **Drizzle ORM**: Database queries and schema management
- **connect-pg-simple**: Session storage for PostgreSQL

### UI/Component Libraries
- **Radix UI**: Headless accessible component primitives
- **shadcn/ui**: Pre-styled component variants
- **Lucide React**: Icon library
- **Framer Motion**: Animation library
- **Embla Carousel**: Carousel component

### Form & Validation
- **Zod**: Schema validation
- **React Hook Form**: Form state management
- **drizzle-zod**: Generate Zod schemas from Drizzle tables

### Development Tools
- **Replit Plugins**: Runtime error overlay, cartographer, dev banner
- **esbuild**: Server bundling for production