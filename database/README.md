# Database Scripts & Migrations

This directory contains all database setup and migration scripts for Military Tees UK.

## 📁 Directory Structure

```
database/
├── setup/                          # Complete database setup scripts
├── migrations/                     # Individual migrations and fixes
└── README.md                      # This file
```

## 🚀 Setup Scripts

### For New Environments
If you have the complete database setup script, place it in `setup/` and use it for:
- ✅ New local development environments
- ✅ Fresh Supabase project setup
- ✅ Complete database initialization
- ✅ Sample data population

## 🔧 Migration Scripts

### Current Migrations (Applied ✅)

**`fix-rls-security-issues.sql`** - *Applied Successfully*
- **Purpose**: Fixed critical RLS security vulnerabilities
- **Issues Resolved**: 
  - Enabled RLS on public tables (categories, products, product_variants, etc.)
  - Created proper public read policies for e-commerce data
  - Added service role management policies
  - Fixed Supabase linter security errors
- **Status**: ✅ Applied and working

**`customer-rls-policies.sql`** - *Reference/Backup*
- **Purpose**: Customer-specific RLS policies  
- **Status**: ✅ Superseded by fix-rls-security-issues.sql

**`database-newsletter-table.sql`** - *Applied Previously*
- **Purpose**: Newsletter subscription functionality
- **Status**: ✅ Applied and working

### Existing Migrations

**`supabase/migrations/20250108_orders_system.sql`** - *Applied Previously*
- **Purpose**: Complete order management system
- **Status**: ✅ Applied and working

## 🛡️ Security Status

**All Critical Security Issues Resolved:**
- ✅ RLS enabled on all public tables
- ✅ Proper access policies implemented  
- ✅ Service role permissions configured
- ✅ Supabase linter errors eliminated
- ✅ 400 API errors fixed

## 📋 Usage Guide

### For New Setup
1. Use complete setup script in `setup/` folder
2. Run in Supabase SQL Editor
3. Verify all tables and data created

### For Existing Database
1. Apply specific migrations from `migrations/` folder
2. Run in order of creation/dependency
3. Test functionality after each migration

## 🎯 Current Status

**Database**: ✅ Fully Operational & Secure  
**RLS Security**: ✅ All Issues Resolved  
**API Functionality**: ✅ Working Correctly  
**Authentication**: ✅ Customer Profiles Auto-Created  

The Military Tees UK database is production-ready with enterprise-grade security! 🛡️