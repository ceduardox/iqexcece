# IQEXPONENCIAL

## Overview

IQEXPONENCIAL is a cognitive enhancement web application targeting Spanish-speaking users. The platform helps users identify their age group and cognitive challenges, then provides personalized mental improvement solutions. The app features an engaging onboarding flow with a loading screen, age/problem selection, fingerprint scanner, and options for Tests or Training.

## Recent Changes (Jan 2026)

- Added admin panel at `/gestion` (login: CITEX / GESTORCITEXBO2014)
- Admin panel now uses sidebar layout on desktop, tabs on mobile
- "Remember me" checkbox saves login credentials to localStorage
- PostgreSQL database storage for persistent data (dev and prod)
- Page image editing for preescolar/niños selection pages (main + floating image)
- Mobile-responsive results and sessions with expandable cards
- Category filter for quiz results (Pre-escolar, Niños, All)
- PWA detection and tracking (web vs PWA)
- User session tracking with IP, device, browser, and PWA detection
- Active users count displayed in admin panel
- Age-specific content for cognitive tests (5 age groups with unique content)
- Session tracking with heartbeat and automatic deactivation
- UserContext for passing age group data through the flow
- **Multi-theme support**: Admin panel now supports multiple reading themes per age category
  - Theme selector with numbered buttons (Tema 01, Tema 02, etc.)
  - "+ Nuevo Tema" button to create additional themes
  - Content automatically clears when creating new theme
  - Category change resets to first available theme
  - API endpoints updated to support theme-specific content retrieval
- **Adult categories added**: Three new categories for adults
  - Universitarios (University students)
  - Profesionales (Professionals)
  - Adulto Mayor (Elderly)
  - Full reading test creation from admin panel for all 6 categories
  - Dynamic question editor with add/delete functionality
- **Razonamiento (Reasoning) test system**: Complete reasoning test flow
  - Database table: razonamiento_contents with themes and questions
  - Admin panel "Razonamiento" sub-tab for content management
  - Unlimited theme creation per category (following reading tests pattern)
  - RazonamientoSelectionPage: Fetches themes from database
  - RazonamientoQuizPage: Displays multiple-choice questions with progress tracking
  - RazonamientoResultPage: Shows score, statistics, and navigation options
  - Full user flow: Selection → Quiz → Submit Form → Results
- **Test Cerebral system**: Cognitive exercise flow with multiple exercise types
  - Database table: cerebral_contents with exerciseType, exerciseData JSON fields
  - Admin panel "Test Cerebral" sub-tab for exercise management
  - Exercise types: bailarina (direction visual), secuencia (numeric sequence), memoria (visual memory), patron (visual pattern)
  - CerebralSelectionPage: Displays available exercises from database
  - CerebralExercisePage: Interactive exercise with answer verification
  - Supports image upload with size control (20-100%)
  - Active/inactive toggle for exercises
- **Entrenamiento (Training) system**: Complete training content management
  - Database tables: entrenamiento_cards, entrenamiento_pages, entrenamiento_items
  - Admin panel "Entrenamiento" tab for content management per category
  - Card editor: Main card displayed on selection page (image, title, description, button text)
  - Page config: Banner text, page title, page description
  - Training items: CRUD for individual training options with images, links, and sort order
  - Support for 5 categories: ninos, adolescentes, universitarios, profesionales, adulto_mayor
  - EntrenamientoPage: Displays training options fetched from database
- **Visual Editor System**: In-page style editor for administrators
  - Database table: page_styles with pageName and JSON styles
  - Toggle "Editor: ON/OFF" button in admin panel sidebar
- **Performance Optimizations** (Feb 2026):
  - Style loading with spinner to prevent flash of old styles
  - 2-second timeout fallback ensures UI never hangs
  - Sound preloading at app startup for instant feedback
  - Sound effects for buttons (iphone.mp3) and cards (card.mp3)
  - Hooks: use-sounds.ts, use-preload.ts
  - EditorToolbar component: Floating toolbar with 5 tabs
  - Click-to-select editable elements (hero section, cards)
  - **Fondo tab**: Color picker, gradient presets (Purple→Cyan, Dark), or image URL with size control
  - **Sombra tab**: Blur slider and color input for box shadows
  - **Posición tab**: Directional buttons (up/down/left/right) with reset
  - **Imagen tab**: URL input and size slider (20-200%)
  - **Texto tab**: Color picker, font size slider (10-72px), alignment (left/center/right), weight (normal/bold)
  - Styles persist to PostgreSQL and load automatically on page refresh

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
- **Database**: PostgreSQL (Neon-backed) via `DATABASE_URL`
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with migrations output to `./migrations`
- **Current Storage**: DatabaseStorage class using PostgreSQL for persistent data
- **Tables**: users, user_sessions, quiz_results, reading_contents

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