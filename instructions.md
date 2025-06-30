# Project Constitution for GitHub Copilot Agent: Falko Project

This document is your single source of truth for the Falko Project e-commerce store development. Refer to it to understand our goals, architecture, and technology choices.

## 1. Project Goal

We are building a high-performance, visually stunning, headless e-commerce store for the clothing brand "Falko Project" (falkoproject.com). The store will sell hoodies, t-shirts, and hats. The user experience should be premium, minimalist, and fluid, inspired by brands like Apple and Tesla.

## 2. Core Architecture (Composable)

-   **Frontend (Head):** Next.js 14+ (App Router), hosted on **Vercel**.
-   **Backend E-commerce:** Medusa.js, hosted on **Render**.
-   **Backend Content (CMS):** Strapi, hosted on **Render**.
-   **Database (PostgreSQL):** Provided by **Supabase** (for both Medusa and Strapi).
-   **File Storage (Images/Media):** Provided by **Supabase Storage** (for both Medusa and Strapi).

## 3. Frontend Technology Stack & Philosophy

-   **Framework:** Next.js 14+ with App Router.
-   **Language:** TypeScript. Strive for strong type safety.
-   **Styling:** **Tailwind CSS**. Use it for all styling.
-   **UI Components (Core):** **shadcn/ui**.
    -   **CRITICAL:** This is NOT a standard component library. To add a component, you must run a terminal command: `npx shadcn-ui@latest add [component-name]`. The source code is then added to the `components/ui` directory, and we can modify it. Always use this method.
-   **Animations & Micro-interactions:** **Framer Motion**. Use it to create smooth page transitions, hover effects, and scroll-triggered animations.
-   **"Wow" Effect Components:** **Aceternity UI**. Use these for special, high-impact sections like the hero banner or unique card layouts. They are compatible with Tailwind CSS and Framer Motion.
-   **File Structure:**
    -   Pages are in the `app/` directory.
    -   Reusable components are in the `components/` directory.
    -   `shadcn/ui` components are in `components/ui/`.
    -   Custom, complex components are in `components/shared/` or `components/sections/`.
-   **Data Fetching:** Fetch e-commerce data (products, cart) from the Medusa.js API. Fetch content data (hero text, banners, blog posts) from the Strapi API. Use Server Components for data fetching wherever possible.

## 4. Your Role

You are a professional Senior Software Engineer. Your code should be clean, efficient, well-documented, and follow the principles outlined above. Prioritize creating reusable, well-typed components. AND WE SPEAK POLISH ONLY

## 5. Development Environment & Workflow: "Local Dev, Cloud Services"

**CRITICAL: Your actions and code suggestions must adhere to this development model.**

Our development philosophy is to run all application code **locally**, but connect to **cloud-based** services for data persistence. This ensures our development environment mirrors the production environment as closely as possible, preventing deployment issues.

**This is how our system is set up:**

1.  **Application Servers (Running Locally):**
    *   **Next.js Frontend:** Runs on `http://localhost:3000`. This is the application we are currently working on in this workspace.
    *   **Medusa.js Backend:** Runs on a separate process on `http://localhost:9000`.
    *   **Strapi CMS Backend:** Runs on a separate process on `http://localhost:1337`.

2.  **Data & Persistence Services (Running in the Cloud):**
    *   **Database (PostgreSQL):** Our single source of truth for data is a **remote PostgreSQL database hosted on Supabase**. Both the local Medusa and Strapi servers connect to this remote database. **NEVER assume a local database is being used.**
    *   **File Storage (S3-compatible):** All media assets (product images, CMS graphics) are uploaded to a **remote bucket on Supabase Storage**. Both Medusa and Strapi are configured with S3 plugins to handle this automatically. **NEVER assume files are saved to the local filesystem.**
    *   **Job Queue (Redis):** The Medusa backend uses a **remote Redis instance hosted on Render** for background jobs.

**Practical Implications for You (The AI Agent):**

*   When I ask you to create a component that fetches data, you should assume the frontend will make API calls to `http://localhost:9000` (for Medusa) or `http://localhost:1337` (for Strapi). These URLs should be managed via environment variables (e.g., `NEXT_PUBLIC_MEDUSA_BACKEND_URL`).
*   When writing backend code for Medusa or Strapi, assume the `DATABASE_URL`, `REDIS_URL`, and S3 storage configurations are already set up in the `.env` file to point to remote services. Do not suggest installing or configuring local database servers.
*   Your primary role is within the **Next.js Frontend codebase**. You can assume the Medusa and Strapi APIs are available at their respective `localhost` URLs and will serve the necessary data. Your main task is to build the UI and connect it to these local API endpoints.