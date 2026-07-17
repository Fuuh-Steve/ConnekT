# ConnekT

ConnekT is a modern, high-performance tech internship marketplace specifically designed for university students and recruiters in Cameroon. Built with **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS 4**, it delivers a seamless connection between academic talent and leading companies, featuring real-time application tracking, automated matching, and robust administration.

---

## 🏗️ Folder Structure (App Layout)

The project follows a modular Next.js architecture separating UI routing, business logic views, reusable components, and API controllers.

```
connekt/
├── public/                 # Static assets (images, icons, etc.)
├── src/
│   ├── app/                # Next.js App Router (Routing & Route Handlers)
│   │   ├── [locale]/       # Internationalized page routes (English / French)
│   │   └── api/            # Serverless API routes (Supabase admin operations)
│   ├── components/         # Reusable global design system UI components
│   │   ├── admin/          # Admin-specific helper components
│   │   ├── dev/            # Developer utility panels
│   │   ├── Navigation.tsx  # Main navbar and mobile menu drawer
│   │   └── SplashLoader.tsx# Interactive initial load screen
│   ├── context/            # React Context Providers (AuthContext, etc.)
│   ├── i18n/               # i18n configuration for next-intl routing
│   ├── lib/                # Shared utilities & database clients
│   │   ├── supabase.ts     # Client-side Supabase setup (Anon key)
│   │   └── supabase-admin.ts# Server-side admin Supabase setup (Service Role key)
│   ├── messages/           # Localization translations
│   │   └── (home)/         # Home & About Us page translations (en.json, fr.json)
│   ├── views/              # View-level container components (Page bodies)
│   │   ├── LandingPage.tsx # Hero, features, vision/mission statements, footer
│   │   ├── ProfilePage.tsx # Candidate/recruiter profile builder and viewer
│   │   ├── RecruiterDashboard.tsx # Recruiter applicants and job posting panel
│   │   └── StudentDashboard.tsx   # Student application tracking board
│   └── index.css           # Global CSS variables, custom themes & Tailwind 4 setup
├── .env.local              # Local environment credentials (git ignored)
├── package.json            # Script commands and project dependencies
├── supabase_schema.sql     # Database tables, policies, and triggers
└── tsconfig.json           # TypeScript compilation settings
```

---

## 🚦 Application Routes (Page Layout)

The application handles routing using the Next.js `[locale]` structure for automatic translation support:

| Route Path                     | View Component                            | Description                                              | Access Level   |
| :----------------------------- | :---------------------------------------- | :------------------------------------------------------- | :------------- |
| `/[locale]`                    | `LandingPage`                             | Platform intro, custom Mission/Vision, stats, and footer | Public         |
| `/[locale]/auth`               | `AuthPage`                                | Dual student/recruiter login & signup workflows          | Public         |
| `/[locale]/dashboard`          | `StudentDashboard` / `RecruiterDashboard` | Specialized dashboard according to the user's role       | Auth Required  |
| `/[locale]/jobs`               | `JobBoard`                                | Searchable index of active internship postings           | Public         |
| `/[locale]/jobs/[jobId]`       | `JobDetails`                              | Detail specifications and application action             | Auth Required  |
| `/[locale]/post`               | `RecruiterDashboard` (Post Form)          | Dedicated route to publish new internship listings       | Recruiter Only |
| `/[locale]/applicants/[jobId]` | `ApplicantView`                           | Candidate evaluation and pipeline management             | Recruiter Only |
| `/[locale]/profile`            | `ProfilePage`                             | Interactive user resume builder and editor               | Auth Required  |
| `/[locale]/profile/[username]` | `ProfilePage` (Read-only)                 | Public shareable profile / student resume card           | Public         |
| `/[locale]/settings`           | `SettingsPage`                            | Language selection, notifications, and security          | Auth Required  |
| `/[locale]/admin`              | `AdminDashboard`                          | User moderation, post approvals, and platform stats      | Admin Only     |

---

## 🛠️ Tech Stack

- **Core Framework:** Next.js 16.2 (Turbopack) & React 19
- **Styling & Theme:** Tailwind CSS 4, Custom HSL Color Tokens, Dark/Light Mode
- **Animations:** Framer Motion (page transitions, micro-animations, modal entries)
- **Backend & Database:** Supabase (`auth`, `postgresql`, `storage`)
- **Localization:** `next-intl` (English `en` & French `fr` routing)
- **Icons:** Lucide React

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or newer
- A Supabase project

### 1. Setup Environment Variables

Create a `.env.local` file at the root of the project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-private-key
```

### 2. Configure Database Schema

Apply the SQL script in `supabase_schema.sql` inside your Supabase project's SQL Editor to instantiate the following structure:

- `profiles` (Stores student/recruiter profile info synced via Auth triggers)
- `jobs` (Stores internship postings created by recruiters)
- `applications` (Stores student applications and resume link pointers)
- Trigger-based triggers to automatically provision profiles upon signup.

### 3. Install & Run Dev Server

```bash
# Install dependencies
npm install

# Run application in development mode
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 💻 Available Scripts

- `npm run dev` - Launches dev server with hot-reloading (using Turbopack)
- `npm run build` - Builds optimized production bundle (TypeScript & Next checking)
- `npm run start` - Starts production server locally
- `npm run lint` - Runs code linting check
- `npm run clean` - Removes Next build outputs and temporary folder caches

---

## 📘 In-depth User Guide

### Browsing & Applying

- From the homepage, select `Jobs` to view the job board. Use filters (location, remote, tags) if present.
- Click a job to open the detail page. Review requirements, deadlines, and attachments.
- To apply: sign in, complete the application form, attach a resume (PDF preferred), and submit. You will receive an in-app confirmation and an email if configured.

### Account Types & Capabilities

- Applicant (Student): build and edit a public `Profile`, apply to jobs, track application status, and manage notifications.
- Recruiter / Employer: post job listings, view applicants for posted jobs, and message or export applicant data.
- Admin: moderate jobs and users, view platform metrics, and perform bulk or corrective actions.

### Profile & Resume Guidance

- Keep your profile `Headline`, `Skills`, and `Experience` sections concise and up to date.
- Upload a single PDF resume; if the application requires multiple files, compress into a single archive.

## 🛡️ Admin & Moderator Workflow

1. Access the admin dashboard at `/[locale]/admin` (requires admin credentials).
2. Review `Job Moderation` for newly-submitted listings; use the status controls to approve/reject.
3. Use `Applications Oversight` to filter by job, status, or date; click an application to view details and add private notes.
4. In `User Management`, you can deactivate accounts, reset roles, or promote users to recruiter/admin as appropriate.

### Admin Safety and Audit

- All admin actions should be logged (check `src/app/api/admin` route handlers for server-side logs).
- Limit usage of `SUPABASE_SERVICE_ROLE_KEY` to server-only environments and rotate keys periodically.

## 🔌 API Routes & Examples

- Admin route handlers are under `src/app/api/admin`. They expect server-side authorization and are not public.
- Example fetch (server-side) to list applications:

```ts
import { getAdminApplications } from "@/lib/supabase-admin";

export async function handler() {
  const { data, error } = await getAdminApplications();
  if (error) throw new Error(error.message);
  return data;
}
```

Refer to the route files for concrete request/response shapes and required headers.

## ⚙️ Environment Variables (complete list)

- `NEXT_PUBLIC_SUPABASE_URL` — public Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public anon key for client
- `SUPABASE_SERVICE_ROLE_KEY` — server-side service role key (keep secret)
- `NEXTAUTH_URL` — base URL used by NextAuth / redirects
- Any additional provider keys (e.g., SENTRY_DSN) used by your deployment

## 🧭 Localization & Adding Languages

- Routes are localized under `src/app/[locale]` and translations live under `src/messages`.
- To add a language: create a new locale folder under `src/app`, add translation JSON files under `src/messages/<route>`, and update navigation config in `src/i18n/navigation.ts`.

## 🧪 Testing & Debugging Tips

- Use `console.log` in server actions to surface errors in terminal output when running `npm run dev`.
- Check Supabase `auth` logs for sign-in issues and Postgres logs for query errors.

## 📄 Exporting This Guide to Word

You can open the included `README.doc` in Microsoft Word and then `Save As` → `Word Document (.docx)`.

Alternatively, convert Markdown to Word using Pandoc:

```bash
pandoc README.md -o README.docx
```

If you prefer an HTML snapshot that Word opens well, use the included `README.doc` (it's HTML formatted).

## ✅ Next Steps

- Review this README and tell me if you want a `README.docx` (binary) generated here — I can create an HTML `.doc` which Word will open, or show commands to convert to `.docx` on your machine.

---

© ConnekT — Project documentation
