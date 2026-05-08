# Connekt

Connekt is a modern Next.js job marketplace built with Supabase for authentication and data storage. It includes student/applicant workflows, recruiter dashboards, job listings, application management, profile pages, and admin features.

## Features

- Responsive job board with job listings and details
- Applicant dashboard for tracking applications
- Recruiter dashboard for managing job postings and candidates
- Profile and settings pages for user account management
- Supabase-backed authentication and data access
- Tailwind CSS UI with animated interactions via Framer Motion

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Supabase (`@supabase/supabase-js`)
- TypeScript
- Vite-style modern frontend architecture

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase project with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file at the project root and add your Supabase keys:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser:

   ```
   http://localhost:3000
   ```

## Database Schema

The Supabase schema is available in `supabase_schema.sql`. Use it to recreate the required tables and relationships for profiles, jobs, applications, and any role-based access controls.

## Scripts

- `npm run dev` - start the app in development mode
- `npm run build` - build the production application
- `npm run start` - start the production server
- `npm run lint` - run ESLint
- `npm run clean` - remove build output (`.next`, `dist`)

## Notes

- The app currently uses Supabase for backend services and client-side session handling.
- If you add Gemini or another AI integration later, include any required API keys in `.env.local`.

## License

This repository is currently private. Add your preferred license information here if you publish it.
