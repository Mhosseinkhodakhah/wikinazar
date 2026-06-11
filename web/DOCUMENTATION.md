# Web Directory Documentation — Wikinazar

## Overview

The `web/` directory contains the **frontend** of the Wikinazar platform, a **Persian (RTL) social experience-sharing application** built with Next.js 14, TypeScript, and Tailwind CSS. Users can browse subjects (topics), read experiences posted by others, submit their own experiences, request new subjects, and manage their profile dashboard.

---

## Tech Stack

| Technology           | Purpose                              |
| -------------------- | ------------------------------------ |
| **Next.js 14**       | React framework (Pages Router)       |
| **TypeScript**       | Type-safe JavaScript                 |
| **Tailwind CSS 3**   | Utility-first CSS framework          |
| **next-seo**         | SEO / Open Graph meta tags           |
| **classnames**       | Conditional CSS class composition    |
| **styled-jsx**       | Scoped CSS (Next.js default)         |

---

## Project Structure

```
web/
├── public/                     # Static assets
│   ├── favicon.ico / .png      # Favicons
│   ├── apple-touch-icon.png    # PWA icon
│   ├── manifest.json           # PWA manifest
│   └── assets/
│       ├── icon-192.svg        # App icon
│       ├── icon-512.svg        # App icon
│       └── images/             # Partner logos & feature images
├── src/
│   ├── layout/                 # Layout components
│   │   ├── Meta.tsx            # SEO / <head> meta tags
│   │   └── MobileLayout.tsx    # Mobile-only shell with bottom nav
│   ├── pages/                  # Next.js Pages Router routes
│   │   ├── _app.tsx            # Root app wrapper (providers, shell)
│   │   ├── _document.tsx       # Custom HTML document
│   │   ├── index.tsx           # Homepage (landing feed)
│   │   ├── dashboard.tsx       # User profile dashboard
│   │   ├── request.tsx         # Create a new subject request
│   │   ├── requests.tsx        # Browse all subject requests
│   │   ├── subjects.tsx        # Browse all subjects
│   │   ├── submit.tsx          # Submit a new experience
│   │   └── subject/[id].tsx    # Single subject detail (SSG)
│   ├── styles/
│   │   └── global.css          # Tailwind + Vazirmatn font imports
│   ├── templates/              # Page-level view components
│   │   ├── Base.tsx            # Main landing page (hero, stats, feed)
│   │   ├── AllSubjects.tsx     # Subject listing with inline experiences
│   │   ├── Dashboard.tsx       # Desktop & mobile dashboard views
│   │   ├── Footer.tsx          # Site footer
│   │   ├── MobileFeed.tsx      # Mobile-only feed view
│   │   ├── Requests.tsx        # Request listing with voting
│   │   ├── RequestSubject.tsx  # Request creation form
│   │   ├── SubjectDetail.tsx   # Subject detail (desktop & mobile)
│   │   └── SubmitExperience.tsx# Experience submission form
│   └── utils/                  # Utilities, hooks, and context providers
│       ├── api.ts              # API client & DTO types
│       ├── AppConfig.ts        # App configuration constants
│       ├── AuthContext.tsx      # Authentication context provider
│       ├── countMinSketch.js   # Count-Min Sketch probabilistic data structure
│       ├── ErrorBoundary.tsx   # React error boundary
│       ├── Lightbox.tsx        # Full-screen image lightbox
│       ├── Skeleton.tsx        # Loading skeleton card
│       ├── StarRating.tsx      # Interactive star rating component
│       ├── ToastContext.tsx    # Toast notification context
│       └── useMobile.ts        # Mobile detection hook
├── .env.local                  # Environment variables
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS theme
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies & scripts
└── README.md                   # Starter template README
```

---

## Routes (Pages)

| Route              | File               | Description                              |
| ------------------ | ------------------ | ---------------------------------------- |
| `/`                | `index.tsx`        | Landing page — hero, stats, categories, trending, experiences feed, requests, CTA |
| `/subjects`        | `subjects.tsx`     | Browse all subjects with search, category filter, and inline experience accordion |
| `/subject/[id]`    | `subject/[id].tsx` | Subject detail page — images, info, experiences list, new experience form, related subjects (SSG) |
| `/submit`          | `submit.tsx`       | Submit a new experience — search/select or create a subject, star rating, comment, image upload |
| `/request`         | `request.tsx`      | Create a new subject request (auth required) |
| `/requests`        | `requests.tsx`     | Browse all subject requests with voting and sort |
| `/dashboard`       | `dashboard.tsx`    | User dashboard — profile, experiences CRUD, requests list |

---

## Key Files Explained

### `src/utils/api.ts`
Central API client module. Key exports:
- **`api` object** — methods for all backend endpoints (auth, subjects, experiences, requests, dashboard)
- **`setTokens()` / `clearTokens()` / `loadTokens()`** — JWT token management in localStorage
- **`ApiError` class** — typed API error with status code
- **DTO interfaces** — `UserDTO`, `SubjectDTO`, `ExperienceDTO`, `RequestDTO`, `DashboardDTO`
- **`request<T>()`** — generic fetch wrapper with auth header injection and error handling
- API base URL from `NEXT_PUBLIC_API_URL` env (default `http://localhost:3001/api/v1`)

### `src/utils/AuthContext.tsx`
Authentication context provider:
- **`AuthProvider`** — wraps app, loads stored tokens on mount, fetches profile
- **`useAuth()`** hook — exposes `user`, `login()`, `register()`, `logout()`, `isExpert`, `loading`
- Maps backend `UserDTO` to frontend `User` interface
- Fallback avatar via `ui-avatars.com`

### `src/utils/ToastContext.tsx`
Toast notification system:
- **`ToastProvider`** — manages toast queue, auto-dismisses after 3 seconds
- **`useToast()`** hook — returns `toast(message, type)` and `toasts` array
- Styles: green (success), red (error), blue (info)

### `src/utils/useMobile.ts`
Responsive hook:
- Detects viewport width < 768px
- Listens to window resize events
- Used throughout app to switch between Desktop / Mobile view components

### `src/utils/StarRating.tsx`
Interactive star rating component:
- Props: `value` (controlled), `onChange` (optional), `max` (default 5)
- Hover state for preview, click to set value

### `src/utils/Lightbox.tsx`
Full-screen image overlay:
- Props: `src` (image URL), `onClose`
- Closes on Escape key or backdrop click

### `src/utils/Skeleton.tsx`
Loading placeholder card matching the subject card layout. Props: `compact` for smaller variant.

### `src/utils/ErrorBoundary.tsx`
React class-based error boundary:
- Catches render errors, shows friendly Persian error message with return link
- Accepts optional `fallback` prop

### `src/utils/countMinSketch.js`
Probabilistic data structure for frequency estimation (space-efficient counting). Not currently integrated into UI flow.

### `src/utils/AppConfig.ts`
App metadata constants: site name, title, description, locale (`fa`).

---

## Templates (View Components)

### `Base.tsx` — Main Landing Page
The most complex template (~1513 lines). Composed of inline sections:
- **Hero** — gradient background, animated blobs, search bar with suggestions, CTA buttons, login modal
- **StatsBar** — 4-column stat cards (subjects count, experiences, requests, avg rating)
- **CategoryGrid** — 14 category buttons with icons
- **TrendingSection** — horizontal scroll of top-8 subjects by review count
- **AllSubjects** — grid of subject cards with category filter, search, load more
- **ExperiencesSection** — circular avatar carousel with auto-rotation, active experience card
- **RecommendedSection** — personalized recommendations (shown to logged-in users)
- **RequestSection** — recent request cards with direct submit link
- **CTASection** — gradient call-to-action banner
- **Banner** — top notification bar with dark mode toggle
- **LoginModal** — email/password login form overlay
- **Mobile bottom nav** — persistent 4-item navigation bar
- **Dark mode** — CSS custom properties toggle via `styled-jsx` global styles
- **Accessibility** — skip-to-content link, keyboard navigation for carousel

### `AllSubjects.tsx` — Subject Listing
- Sticky header with search input and category pills (14 categories)
- Accordion-style subject cards — click to expand/collapse inline experiences
- Like/unlike experiences with optimistic UI update
- Share via native Web Share API
- Empty state with filter reset

### `SubjectDetail.tsx` — Subject Detail Page
- Dual rendering: `MobileSubjectDetail` and `DesktopSubjectDetail` components
- Hero image with dot indicators (multiple images)
- Subject info panel (name, description, category, stats grid)
- New experience form (star rating, text, optional photo) — shown only to authenticated users
- Experiences list with like button and share
- Related subjects horizontal scroll section
- Lightbox integration for image fullscreen

### `SubmitExperience.tsx` — Experience Submission
- Auth guard — redirects unauthenticated users to login prompt
- Subject selector with search dropdown (live filter of existing subjects)
- Option to create a new subject if not found in list
- Star rating, comment textarea, image upload (preview with remove), tags input
- Sidebar with tips and user info card

### `RequestSubject.tsx` — Create Request
- Auth guard (must be logged in)
- Form: title, category dropdown, description, optional image upload
- Tips sidebar explaining how requests work
- Recent requests display on side and bottom sections

### `Requests.tsx` — Browse Requests
- Sticky header with category tabs, sort toggle (newest / top)
- Request cards with vote button, submit experience link
- Empty state with filter reset
- CTA section at bottom

### `Dashboard.tsx` — User Dashboard
- Dual rendering: `DesktopDashboardView` and `MobileDashboardView`
- Profile header with avatar, name, email, stats badges
- Tabbed content: "My Experiences" and "My Requests"
- Experience CRUD — inline edit (content, rating), delete with API calls
- Auth guard — redirects to home if not authenticated

### `MobileLayout.tsx` — Mobile Navigation Shell
- Fixed bottom tab bar with 5 icons: Home, Subjects, Submit, Requests, Profile
- Active tab highlighting based on route matching
- Max-width content container

### `Footer.tsx` — Site Footer
- Three-column grid: brand description, quick links, social media
- Social icons (GitHub, Twitter, LinkedIn) using SVG paths

### `MobileFeed.tsx` — Mobile Feed
- Sticky header with search and category pills
- Accordion-style subject/experience cards optimized for mobile
- Like button with live count update
- Share via Web Share API

---

## Data Flow

1. **Authentication**: `AuthContext` manages JWT tokens in localStorage. On mount, stored token loads user profile via `GET /auth/profile`. `api.ts` attaches `Authorization: Bearer <token>` to all requests.

2. **API Communication**: All data fetching goes through `api.ts` methods which call the backend at `/api/v1`. Responses follow `{ success: boolean, data: T }` pattern.

3. **State**: Components use local `useState` for fetched data. No global state management library. `ToastContext` provides cross-component notifications.

4. **Responsive Design**: `useMobile()` hook determines viewport. Many templates render separate Desktop / Mobile components (`SubjectDetail`, `Dashboard`, landing page).

5. **SSG**: `subject/[id].tsx` uses `getStaticPaths` (pre-generates 20 pages) and `getStaticProps` for static generation.

---

## Styling Conventions

- **Tailwind CSS** for all styling with custom theme (teal/cyan primary palette, extended gray scale)
- **Persian (RTL)** layout — `dir="rtl"` on all page containers
- **Vazirmatn** font loaded from Google Fonts
- **Custom animations** via `styled-jsx` global styles: `fade-in-up`, `fade-in-right`, `shimmer`, `slide-up`, `pulse-glow`
- **Scrollbar hiding** utility class `.scrollbar-hide` for horizontal scroll sections
- **Dark mode** via CSS custom properties toggle (partial implementation on landing page)

---

## Config & Environment

| Variable                 | Default                     | Description              |
| ------------------------ | --------------------------- | ------------------------ |
| `NEXT_PUBLIC_API_URL`    | `http://localhost:3001/api/v1` | Backend API base URL |

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Lint fix + Prettier
npm run check-types  # TypeScript type checking
npm run clean        # Remove .next, .swc, out
```
