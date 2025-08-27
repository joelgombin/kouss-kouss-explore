# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kouss Kouss 2025 is a React/TypeScript web application for discovering restaurants participating in the Kouss Kouss culinary festival in Marseille. It's a single-page application built with Vite that displays restaurants, their dishes, and provides interactive map functionality.

## Development Commands

```bash
# Frontend development (port 8080) - requires backend running separately
npm run dev

# Backend API server (port 3001)
npm run dev:server

# Development workflow (run both):
# Terminal 1: npm run dev:server  (starts API server)
# Terminal 2: npm run dev         (starts frontend with proxy to API)

# Build for production
npm run build

# Run linter
npm run lint

# Production server (serves both frontend + API)
npm start
```

## Architecture Overview

### Core Technologies
- **Vite** - Fast build tool and dev server
- **React 18** with TypeScript - UI framework
- **Express.js** - Backend API server
- **SQLite** (better-sqlite3) - Database for likes storage
- **React Router** - Client-side routing with restaurant and dish detail pages
- **shadcn/ui** - Component library built on Radix UI
- **Tailwind CSS** - Utility-first styling
- **Leaflet** - Interactive maps (OpenStreetMap)
- **TanStack Query** - Data fetching and caching

### Key Application Structure

**Main Pages (src/pages/)**
- `Index.tsx` - Main application with dual view modes (restaurants/dishes), filtering, and routing
- `MentionsLegales.tsx` - Legal mentions page
- `NotFound.tsx` - 404 page

**Core Components (src/components/)**
- `Map.tsx` - Interactive Leaflet map with multiple tile layers
- `FilterBar.tsx` - Smart search, filtering, and sorting system
- `RestaurantCard.tsx` / `RestaurantDetail.tsx` - Restaurant display components
- `PlatCard.tsx` / `PlatDetail.tsx` - Dish display components with likes
- `SmartSearchBar.tsx` - Intelligent search with suggestions
- `LikeButton.tsx` - Chickpea-themed voting system
- `ChickpeaIcon.tsx` - Custom SVG icon for the festival theme
- `ui/` - shadcn/ui component collection

**Data Layer (src/data/)**
- `restaurants.ts` - Data fetching, caching, and TypeScript interfaces
- `likes.ts` - API functions for managing dish likes
- Data is loaded from `/public/restaurants.json`

**Backend API (server/)**
- `index.js` - Express server with SQLite database
- API endpoints: GET/POST `/api/likes`, bulk likes retrieval
- SQLite database automatically created at `server/likes.db`

**Context Providers (src/contexts/)**
- `LikesContext.tsx` - Global likes state management

### URL Routing Structure
- `/` - Home page with restaurant/dish listings
- `/restaurant/:restaurantId` - Individual restaurant detail
- `/restaurant/:restaurantId/plat/:platIndex` - Individual dish detail
- `/mentions-legales` - Legal page

### State Management Pattern
The application uses React state with these key patterns:
- URL-driven state for restaurant/dish selection
- Local state for filtering and UI preferences
- Cached data fetching with promise-based deduplication
- Dual view modes (restaurants vs dishes) with synchronized filtering

### Component Architecture
- Components follow shadcn/ui patterns with Radix UI primitives
- Heavy use of compound components (Cards, Tabs, etc.)
- Responsive design with mobile-first approach
- Toast notifications for user feedback
- Smart search with restaurant/dish suggestions

## Key Features to Understand

1. **Dual View System** - Toggle between restaurant-centric and dish-centric views
2. **Public Likes System** - Chickpea-themed voting without authentication
3. **Smart Filtering & Sorting** - Multi-criteria filtering plus sorting by popularity, name, price
4. **Interactive Maps** - Multiple tile layers, restaurant markers, selection state
5. **URL State Management** - Deep linking to specific restaurants and dishes
6. **Responsive Design** - Mobile-optimized with progressive enhancement

## Development Notes

- Uses path aliasing (`@/` maps to `./src`)
- Leaflet requires manual icon fixes for proper marker display
- Data structure includes geolocation for map markers
- Restaurant data is static (loaded from JSON), likes are dynamic (stored in SQLite)
- Supports dietary filters (vegetarian/vegan) and service types
- Date filtering based on festival schedule (August-September 2025)
- Likes system uses chickpea theming to match festival identity
- Database is automatically created on first server startup
- Sorting includes popularity-based options using real-time likes data