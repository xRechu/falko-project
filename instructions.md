Project Constitution for GitHub Copilot Agent: Falko Project (v2.0 - Optimized)
This document is your single source of truth for the Falko Project e-commerce store development. Refer to it to understand our goals, architecture, and technology choices.

1. Project Goal
We are building a high-performance, visually stunning, headless e-commerce store for the clothing brand "Falko Project" (falkoproject.com). The store will sell hoodies, t-shirts, and hats. The user experience should be premium, minimalist, and fluid, inspired by brands like Apple and Tesla.

2. Core Architecture (Composable & Optimized)
This stack is chosen for maximum performance, reliability, and cost-effectiveness, aiming for a production-ready setup with zero or near-zero initial costs.

ALWAYS LOOK FOR MEDUSA.JS 2.0 DOCUMENTATION.

Frontend (Head): Next.js 14+ (App Router), hosted on Vercel.
Backend E-commerce: Medusa.js 2.0, hosted on Fly.io.
Backend Content (CMS): Strapi, hosted on Fly.io.
Database (PostgreSQL): Provided by Supabase (for both Medusa and Strapi).
File Storage (Images/Media): Cloudinary (for both Medusa and Strapi).
3. Frontend Technology Stack & Philosophy
Framework: Next.js 14+ with App Router.
Language: TypeScript. Strive for strong type safety.
Styling: Tailwind CSS. Use it for all styling.
UI Components (Core): shadcn/ui.
CRITICAL: This is NOT a standard component library. To add a component, you must run a terminal command: npx shadcn-ui@latest add [component-name]. The source code is then added to the components/ui directory, and we can modify it. Always use this method.
Animations & Micro-interactions: Framer Motion. Use it to create smooth page transitions, hover effects, and scroll-triggered animations.
"Wow" Effect Components: Aceternity UI. Use these for special, high-impact sections like the hero banner or unique card layouts. They are compatible with Tailwind CSS and Framer Motion.
State Management: Context API for cart, auth, inventory and pricing. No external state management library needed.
Notifications: Sonner for toast notifications with premium design.
File Structure:
Pages are in the app/ directory.
Reusable components are in the components/ directory.
shadcn/ui components are in components/ui/.
Custom, complex components are in components/shared/ or components/sections/.
Auth components are in components/auth/.
E-commerce components (cart, checkout, products) are in respective subdirectories.
Data Fetching: Fetch e-commerce data (products, cart) from the Medusa.js API. Fetch content data (hero text, banners, blog posts) from the Strapi API. Use Server Components for data fetching wherever possible.
4. Current Project Status & Implemented Features
✅ Already Implemented (July 2025)
🏗️ Core Architecture: Complete Next.js setup with TypeScript, Tailwind CSS, shadcn/ui
🔐 Authentication System: Full registration/login flow with rate limiting, email validation, password strength indicators
🛍️ Product Catalog: Dynamic product pages with variants (sizes, colors), image galleries, specifications
🛒 Shopping Cart: Premium cart drawer with localStorage persistence, quantity management, real-time pricing
💳 Checkout Flow: Multi-step checkout with form validation, order summary, trust indicators
📱 Premium UI Components: Header with sticky navigation, footer, responsive design, mobile-first approach
🎨 Visual Effects: Hero parallax section with Aceternity UI, smooth animations with Framer Motion
⚡ Context Management: AuthContext, CartContext, InventoryContext, PricesContext for state management
📋 Pages Implemented: Home (/), Shop (/sklep), Product Details (/products/[handle]), Login (/login), Register (/register), Checkout (/checkout), Legal pages
🔧 Custom Hooks: useRateLimit, useEmailValidation for enhanced UX
🌐 Polish Localization: Complete Polish language implementation
🚧 Ready for Integration
API Configuration: Environment variables configured for Medusa (localhost:9000) and Strapi (localhost:1337)
Mock Data: Currently using mock products and data, ready to be replaced with real API calls
Type Safety: Strong TypeScript interfaces for Product, Cart, User entities
📋 Project Conventions
Language: All UI text, comments, and documentation in Polish
Design Philosophy: Premium, minimalist, Apple/Tesla-inspired experience
Mobile-First: All components designed responsively
Performance: Server Components where possible, optimized images, lazy loading
5. Your Role
You are a professional Senior Software Engineer. Your code should be clean, efficient, well-documented, and follow the principles outlined above. Prioritize creating reusable, well-typed components. AND WE SPEAK POLISH ONLY.
ALWAYS LOOK INTO DOCUMENTATIONS
6. Development Environment & Workflow: "Local Dev, Cloud Services"
CRITICAL: Your actions and code suggestions must adhere to this development model.

Our development philosophy is to run all application code locally, but connect to cloud-based services for data persistence. This ensures our development environment mirrors the production environment as closely as possible, preventing deployment issues.

This is how our system is set up:

Application Servers (Running Locally):
Next.js Frontend: Runs on http://localhost:3000. This is the application we are currently working on in this workspace.
Medusa.js Backend: Runs on a separate process on http://localhost:9000.
Strapi CMS Backend: Runs on a separate process on http://localhost:1337.
Data & Persistence Services (Running in the Cloud):
Database (PostgreSQL): Our single source of truth for data is a remote PostgreSQL database hosted on Supabase. Both the local Medusa and Strapi servers connect to this remote database. NEVER assume a local database is being used.
File Storage (Images/Media): Cloudinary. All media assets (product images, CMS graphics) are managed and served by Cloudinary. Both Medusa and Strapi are configured with dedicated Cloudinary plugins. This provides best-in-class image optimization, transformations, and a global CDN. NEVER assume files are saved to the local filesystem.
Job Queue (Redis): The Medusa backend uses a remote Redis instance for background jobs, hosted on Fly.io (via Upstash). This keeps our core backend infrastructure consolidated.
Practical Implications for You (The AI Agent):

When I ask you to create a component that fetches data, you should assume the frontend will make API calls to http://localhost:9000 (for Medusa) or http://localhost:1337 (for Strapi). These URLs should be managed via environment variables (e.g., NEXT_PUBLIC_MEDUSA_BACKEND_URL).
When writing backend code for Medusa or Strapi, assume the DATABASE_URL, REDIS_URL, and Cloudinary configurations are already set up in the .env file to point to remote services. Do not suggest installing or configuring local database servers.
Your primary role is within the Next.js Frontend codebase. You can assume the Medusa and Strapi APIs are available at their respective localhost URLs and will serve the necessary data. Your main task is to build the UI and connect it to these local API endpoints.