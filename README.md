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
- Windows OS (for local domain setup)

## Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/abdinajiibmohamedkarshe716/maamul360.git
cd maamul360
```

### 2. Install Dependencies
```bash
npmear
 install
```

### 3. Local Domain Setup
1. Open Notepad as Administrator
2. Open the hosts file at `C:\Windows\System32\drivers\etc\hosts`
3. Add the following entries:
```
127.0.0.1       maamul360.local
127.0.0.1       www.maamul360.local
127.0.0.1       admin.maamul360.local
::1             maamul360.local
::1             www.maamul360.local
::1             admin.maamul360.local
```
4. For each tenant, add their subdomain:
```
127.0.0.1       [tenant-name].maamul360.local
::1             [tenant-name].maamul360.local
```
5. Save the file

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Application Configuration
NEXT_PUBLIC_APP_URL="http://maamul360.local:3000"

# Email Configuration (Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM_EMAIL="your-email@gmail.com"
SMTP_FROM_NAME="Maamul360"

# Security Configuration
JWT_SECRET="your-jwt-secret"
ENCRYPTION_KEY="your-encryption-key"
COOKIE_SECRET="your-cookie-secret"

# Tenant Configuration
DEFAULT_TENANT_STATUS="pending"
MAX_BRANCHES_PER_TENANT="10"
```

### 5. Gmail Setup for Email Notifications
1. Enable 2-Factor Authentication in Gmail
2. Generate App Password:
   - Go to Google Account Settings
   - Navigate to Security
   - Under "2-Step Verification", click "App passwords"
   - Select "Other (Custom name)"
   - Name it "Maamul360"
   - Copy the generated password to SMTP_PASSWORD in .env.local

### 6. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 7. Run Development Server
```bash
npm run dev
```

## Troubleshooting

### Email Verification Issues

#### 1. Invalid Verification Attempt
If you see "Verification Failed: Invalid verification attempt" after clicking the verification link:

1. Check Token Expiration:
   - Verification tokens expire after 24 hours
   - Check user record in database for token status

2. Check URL Parameters:
   ```sql
   -- Check user verification status
   SELECT email, "isVerified", "verificationToken", "verificationExpires" 
   FROM "User" 
   WHERE email = 'user@example.com';
   ```

3. Verify Environment Variables:
   - Ensure NEXT_PUBLIC_APP_URL matches your local domain
   - Check SMTP configuration in .env.local

#### 2. Email Not Received
1. Check spam folder
2. Verify email logs in console
3. Test email configuration:
   ```bash
   # Create test-email.js
   node scripts/test-email.js
   ```

#### 3. Domain Access Issues
1. Verify hosts file configuration
2. Clear browser cache and DNS cache:
   ```cmd
   ipconfig /flushdns
   ```
3. Test domain resolution:
   ```cmd
   ping maamul360.local
   ping tenant.maamul360.local
   ```

### Local Domain Setup Examples

#### Main Domain
```
# Main domain
127.0.0.1       maamul360.local
127.0.0.1       www.maamul360.local
::1             maamul360.local
::1             www.maamul360.local
```

#### Tenant Subdomains
```
# Tenant subdomains
127.0.0.1       tenant1.maamul360.local
127.0.0.1       tenant2.maamul360.local
::1             tenant1.maamul360.local
::1             tenant2.maamul360.local
```

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