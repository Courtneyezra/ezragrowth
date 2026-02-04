# Rooketrade Electrical

## Project Overview
Full-stack application for a handyman/electrical contractor business. Manages calls, leads, quotes, invoices, and contractor operations.

## Tech Stack
- **Frontend**: React 19, Vite 7, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express 5, Node.js
- **Database**: PostgreSQL (Neon serverless) with Drizzle ORM
- **Routing**: Wouter (client), Express (server)
- **State Management**: TanStack React Query

## Project Structure
```
├── client/src/          # React frontend
│   ├── components/      # UI components (shadcn/ui based)
│   ├── pages/           # Page components
│   │   ├── admin/       # Admin dashboard pages
│   │   └── QuoteView    # Public quote viewing
│   └── contexts/        # React contexts
├── server/              # Express backend
│   ├── routes/          # API route handlers
│   ├── index.ts         # Server entry point
│   └── db.ts            # Database connection
├── shared/
│   └── schema.ts        # Drizzle schema & Zod validators
```

## Key Features
1. **Call Management** - Twilio integration, ElevenLabs AI transcription
2. **SKU System ("The Brain")** - Productized services with keyword/embedding matching
3. **Quote Generation** - HHH tiered pricing (Essential/Enhanced/Elite), value-based pricing
4. **Invoice Management** - Post-job billing with Stripe integration
5. **Contractor Profiles** - Availability, skills, job dispatch
6. **WhatsApp CRM** - Conversation tracking, message management
7. **Landing Page A/B Testing** - Variant management with conversion tracking

## Commands
```bash
npm run dev          # Start dev server (backend + Vite)
npm run dev:client   # Start Vite only
npm run build        # Build for production
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## Database
- Schema defined in `shared/schema.ts`
- Uses Drizzle ORM with Neon serverless PostgreSQL
- Key tables: calls, leads, quotes (personalized_quotes), invoices, users, handyman_profiles

## API Routes
- `/api/skus` - Service/SKU management
- `/api/leads` - Lead management
- `/api/calls` - Call tracking
- `/api/quotes` - Quote generation & management
- `/api/invoices` - Invoice operations
- `/api/landing-pages` - Landing page variants

## Environment Variables
See `.env.example` for required variables (DATABASE_URL, etc.)

## Current Status
Last worked on: Feb 3, 2025

---
## Session Notes
<!-- Add notes about current work in progress here -->

