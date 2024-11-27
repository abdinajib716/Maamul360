# Maamul360 - Multi-tenant Business Management System

## Overview
Maamul360 is a comprehensive business management system designed for multi-tenant environments. It provides robust authentication, user management, and business operations capabilities.

## Features
- Multi-tenant architecture
- Secure authentication system
- Email verification
- Role-based access control
- Business management tools

## Prerequisites
- Node.js >= 16
- PostgreSQL database
- Gmail account for email notifications

## Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/abdinajiibmohamedkarshe716/maamul360.git
cd maamul360
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Application Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Email Configuration (Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM_EMAIL="your-email@gmail.com"
SMTP_FROM_NAME="Maamul360"

# Security Configuration
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="24h"
```

### 4. Gmail Setup for Email Notifications
1. Enable 2-Factor Authentication in Gmail
2. Generate App Password:
   - Go to Google Account Settings
   - Navigate to Security
   - Under "2-Step Verification", click "App passwords"
   - Select "Other (Custom name)"
   - Name it "Maamul360"
   - Copy the generated password to SMTP_PASSWORD in .env

### 5. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 6. Run Development Server
```bash
npm run dev
```

## Testing Email Configuration
```bash
# Test email setup
node scripts/test-email.js

# Check user verification status
node scripts/check-users.js

# Fix tenant status if needed
node scripts/fix-tenant.js
```

## API Documentation
- [Authentication API](/docs/authentication.md)
- [API Documentation](/docs/api-documentation.txt)

## Development Tools
- Next.js 13
- TypeScript
- Prisma ORM
- PostgreSQL
- Nodemailer
- JWT Authentication

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- Email verification
- Input validation with Zod
- Rate limiting
- Secure headers

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.