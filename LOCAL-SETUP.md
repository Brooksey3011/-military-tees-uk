# Military Tees UK - Local Development Setup

This guide will help you set up the Military Tees UK e-commerce platform for local development on `localhost:3000`.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)

## Quick Start

### 1. Clone the Repository (if not already done)

```bash
git clone <your-repository-url>
cd military-tees-uk
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
# Copy the example file
cp .env.example .env.local
```

Edit `.env.local` with the following minimum configuration for local development:

```env
# Database - Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Authentication
NEXTAUTH_SECRET="your-local-secret-key-generate-this"
NEXTAUTH_URL="http://localhost:3000"

# Development
NODE_ENV="development"

# Email (Optional for local development)
EMAIL_PROVIDER="smtp"
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_USER=""
SMTP_PASS=""

# Stripe (Optional - can use test keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-key"
STRIPE_SECRET_KEY="sk_test_your-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
```

### 4. Database Setup

The project uses Supabase as the database. You have two options:

#### Option A: Use Existing Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and keys to `.env.local`
3. Run the database migrations:

```bash
# Run each schema file in order
# You can copy and paste these into the Supabase SQL Editor
```

Schema files to run in order:
1. `database/schema.sql` - Core tables
2. `database/inventory-schema.sql` - Inventory management
3. `database/reviews-schema.sql` - Reviews system
4. `database/marketing-schema.sql` - Marketing automation
5. `database/monitoring-schema.sql` - Analytics and monitoring

#### Option B: Local Development Database (Optional)
If you prefer a local database, you can use Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase locally
supabase init

# Start local Supabase
supabase start

# Your local database will be available at:
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## Development Features Available

### Core E-commerce
- ✅ Product catalog with categories
- ✅ Shopping cart and checkout
- ✅ User authentication and accounts
- ✅ Order management
- ✅ Search and filtering

### Advanced Features
- ✅ Custom quote system with image uploads
- ✅ Customer reviews with photos
- ✅ Inventory management
- ✅ Marketing automation suite
- ✅ Admin dashboard with 2FA

### Admin Access

To access the admin dashboard:

1. Create a user account at `/signup`
2. In your Supabase dashboard, go to Authentication > Users
3. Find your user and update their `raw_user_meta_data` to include:
   ```json
   {"role": "admin"}
   ```
4. Access admin at: `http://localhost:3000/admin`

## Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run deployment-check # Validate deployment readiness

# Testing
npm run test         # Run tests with Vitest
npm run test:ui      # Run tests with UI
npm run test:coverage # Generate test coverage report
```

## Project Structure

```
military-tees-uk/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── admin/          # Admin dashboard
│   │   ├── api/            # API routes
│   │   ├── products/       # Product pages
│   │   └── ...
│   ├── components/         # React components
│   │   ├── admin/          # Admin components
│   │   ├── cart/           # Shopping cart
│   │   ├── product/        # Product display
│   │   └── ui/             # UI components
│   ├── lib/                # Utilities and services
│   │   ├── marketing/      # Marketing automation
│   │   ├── monitoring/     # Analytics
│   │   └── search/         # Search functionality
│   └── types/              # TypeScript types
├── database/               # Database schemas
├── public/                 # Static assets
└── docs/                   # Documentation
```

## Key Development URLs

- **Homepage**: http://localhost:3000
- **Products**: http://localhost:3000/products
- **Admin Dashboard**: http://localhost:3000/admin
- **Custom Orders**: http://localhost:3000/custom
- **API Documentation**: Check `/src/app/api/` folder

## Database Schema Overview

The project includes comprehensive database schemas for:

- **Core E-commerce**: Products, orders, customers
- **Inventory Management**: Stock tracking, alerts, movements
- **Reviews System**: Customer reviews with photos and moderation
- **Marketing Automation**: Campaigns, segmentation, A/B testing
- **Monitoring**: Analytics, error tracking, performance metrics

## Development Tips

### 1. Hot Reload
The project uses Next.js with Turbopack for fast hot reloading. Changes to files will automatically refresh the browser.

### 2. API Testing
You can test API endpoints using tools like:
- **Postman** or **Insomnia**
- **curl** commands
- Browser developer tools

### 3. Database Debugging
- Use Supabase dashboard to view and edit data
- Check the Network tab for API calls
- Enable SQL logging in Supabase for debugging

### 4. Component Development
- Components are organized by feature in `/src/components/`
- Use the existing UI components in `/src/components/ui/`
- Follow the military heritage design theme

## Troubleshooting

### Common Issues:

**Port 3000 already in use:**
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use a different port
npm run dev -- -p 3001
```

**Database connection issues:**
- Verify your Supabase URL and keys in `.env.local`
- Check if your Supabase project is active
- Ensure RLS policies are properly configured

**Build errors:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**Module not found errors:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Additional Configuration

### Email Development
For local email testing, you can use:
- **MailHog** - Local email testing tool
- **Ethereal Email** - Online email testing
- **Console logging** - Emails logged to console in development

### Payment Testing
Use Stripe test mode with test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002

### File Uploads
File uploads use Supabase Storage. Ensure your bucket policies allow uploads from localhost.

## Getting Help

- Check the `docs/` folder for additional documentation
- Review the `DEPLOYMENT.md` for production setup
- Check the `database/setup-instructions.md` for database help
- Look at existing components for implementation examples

## Ready to Deploy?

Once you've tested locally, check out:
- `DEPLOYMENT.md` - Production deployment guide
- `DEPLOYMENT-CHECKLIST.md` - Pre-deployment checklist
- Run `npm run deployment-check` to validate readiness

---

**Happy coding! 🛡️ Military Tees UK - Honoring Military Heritage with Pride**