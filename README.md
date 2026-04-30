# QueueLess

QueueLess is a React Native mobile app designed to reduce waiting-line friction for clinics, banks, salons, and service centers. The app is scoped as a portfolio-ready solo project that demonstrates real backend integration, clean architecture, typed models, reusable UI, and production-style flows.

## Project Summary

- **Project type:** React Native CLI mobile application
- **Primary goal:** Smart queue and appointment manager for service centers
- **Target audience:** consumers who want to book service appointments and avoid waiting in line
- **Platform:** Android / iOS via React Native

## What this document covers

- Project objective, scope, and architecture
- Functional and non-functional requirements
- Phase-by-phase delivery plan
- Acceptance criteria and portfolio positioning

## Project goals

- Build a realistic app that solves a visible real-world problem
- Cover React Native fundamentals and strong app architecture
- Use a real backend integration strategy with Supabase concepts
- Create a portfolio-quality repository with strong interview value

## Core features

- Email/password sign up, login, logout, and session restore
- Browse service centers, categories, hours, and available services
- Book a token or appointment with selectable date/time
- View current queue status and estimated wait time
- Track active, completed, and cancelled bookings
- Search and filter centers and bookings
- Profile view with preferences and settings
- Live queue updates via realtime backend changes

## Tech stack

- React Native CLI with TypeScript
- React Navigation (stack + tabs)
- Zustand for state management
- React Hook Form + Zod for form validation
- Supabase for Auth, Postgres, Realtime, and optional Storage
- AsyncStorage for local preferences and session caching

## Project architecture

Recommended folder structure:

- `src/components/` common UI, cards, badges, forms
- `src/screens/` feature screens for auth, home, centers, bookings, profile, settings
- `src/navigation/` root navigator, auth stack, tab navigator, nested flows
- `src/services/` API and backend services for auth, profile, centers, bookings
- `src/store/` Zustand stores for auth, booking, UI state
- `src/hooks/` reusable hooks like `useAuth()` and `useRealtimeQueue`
- `src/types/` shared models and request/response types
- `src/utils/` validators, formatters, constants, helpers
- `src/theme/` colors, spacing, typography, and design tokens

## Phase plan

1. **Foundation**
   - Setup project, tooling, navigation, and UI shell
   - Deliverable: runnable app shell and stable project structure

2. **Auth**
   - Add Supabase client wiring, login/signup, session restore
   - Deliverable: user can authenticate and remain signed in after restart

3. **Profile**
   - Add profile fetching and update flow
   - Deliverable: user profile data can be viewed and updated

4. **Centers and Services**
   - Build center listing, detail screens, and service details
   - Deliverable: users can browse centers and service offerings

5. **Booking Flow**
   - Build booking form, token generation, and success state
   - Deliverable: appointment creation persists to database

6. **Bookings Module**
   - Add booking history, detail view, and cancel flow
   - Deliverable: users can review and inspect bookings

7. **Realtime Queue**
   - Subscribe to queue updates, render live status changes
   - Deliverable: live queue data updates without manual refresh

8. **Portfolio Polish**
   - Add search/filter, theming, avatar upload, cleanup, documentation
   - Deliverable: repository is clean, documented, and presentation-ready

## Acceptance criteria

- Major flows work on a real device or emulator
- Screens handle loading, empty, success, and error states
- User-specific data protection and secure access are evident
- Reusable components and typed models are used consistently
- The repo includes setup instructions and clear documentation

## Current status

- Base RN project is setup and running
- Navigation shell and authentication flow are implemented
- Profile view exists, but full profile edit and Supabase backend integration are still in progress
- This README is created to describe the planned QueueLess scope and next development steps

## Run locally

```sh
npm install
npm start
npm run android
# or
npm run ios
```

> Note: Android and iOS setup depend on your local React Native development environment. Follow React Native official setup if you have not configured it.

## Notes

This project is intentionally scoped for one developer to deliver end-to-end functionality in phases. The emphasis is on clean architecture, backend integration, real user flows, and interview-friendly implementation.
