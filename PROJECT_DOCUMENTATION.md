# Maamul360 - Project Documentation

## 1. Project Overview
Maamul360 is a multi-tenant business management system built with Next.js 15, TypeScript, and Prisma. The system provides comprehensive business management capabilities with a focus on security and scalability.

## 2. Technical Stack

### Core Technologies
- **Frontend**: Next.js 15 with React 19 (RC)
- **Backend**: Next.js API Routes
- **Database ORM**: Prisma with PostgreSQL
- **Authentication**: Custom JWT implementation with jose
- **Styling**: Tailwind CSS with custom components
- **Form Handling**: React Hook Form with Zod validation
- **Email Service**: Nodemailer

### Key Dependencies
- Next.js 15.0.3
- React 19.0.0-rc
- TypeScript 5+
- Prisma Client
- bcryptjs for password hashing
- Tailwind CSS for styling
- Hono for API routing
- React Hook Form for form management
- Zod for validation

## 3. Project Structure

```
maamul360/
├── app/                    # Next.js 13+ App Directory
│   ├── (auth)/            # Authentication related pages
│   ├── api/               # API routes
│   └── ...                # Other app routes
├── components/            # Reusable React components
├── lib/                   # Utility functions and shared logic
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── scripts/              # Utility scripts
```

## 4. Key Features

### Authentication System
- Custom JWT-based authentication
- Email verification flow
- Password hashing with bcryptjs
- Middleware protection for routes

### Multi-tenant Architecture
- Subdomain-based tenant isolation
- Tenant-specific data segregation
- Custom middleware for tenant routing

### Security Features
- JWT token management
- Password hashing
- Email verification
- Protected API routes
- Environment variable security

## 5. Component Relationships

### Authentication Flow
1. User Registration
   - Route: `/api/auth/register`
   - Components: Registration form → API route → Email verification
   
2. Email Verification
   - Route: `/api/verify-email`
   - Components: Verification email → Verification page → Success page

3. Authentication Middleware
   - Location: `middleware.ts`
   - Handles: Route protection, token verification, tenant routing

### Database Schema Relationships
- Users → Tenants (Many-to-One)
- Tenants → Businesses (One-to-Many)
- Users → Roles (Many-to-Many)

## 6. Environment Configuration

### Required Environment Variables
```env
DATABASE_URL=
NEXTAUTH_SECRET=
SMTP_USER=
SMTP_PASSWORD=
SMTP_HOST=
SMTP_PORT=
NEXT_PUBLIC_APP_URL=
```

## 7. Development Setup

### Local Development
1. Clone repository
2. Install dependencies: `npm install`
3. Setup local domain in hosts file
4. Configure environment variables
5. Run development server: `npm run dev`

### Database Setup
1. Install PostgreSQL
2. Configure DATABASE_URL in .env
3. Run migrations: `npx prisma migrate dev`
4. Generate Prisma Client: `npx prisma generate`

## 8. Deployment

### Production Deployment Steps
1. Build application: `npm run build`
2. Configure production environment variables
3. Start production server: `npm start`

### Production Considerations
- Configure proper SSL certificates
- Setup proper email service
- Configure database backups
- Setup monitoring and logging

## 9. API Documentation

### Authentication Endpoints
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/verify-email` - Email verification
- POST `/api/auth/reset-password` - Password reset

### Protected Endpoints
- GET `/api/user` - Get user information
- PUT `/api/user` - Update user information
- GET `/api/tenant` - Get tenant information

## 10. UI/UX Design

### Design System
- Uses Tailwind CSS for styling
- Implements Radix UI components
- Custom component library
- Responsive design principles

### Theme Configuration
- Custom Tailwind configuration
- Dark/Light mode support
- Responsive breakpoints
- Animation configurations

## 11. Testing

### Test Setup
- TypeScript type checking
- ESLint configuration
- Component testing capabilities
- API route testing

## 12. Maintenance

### Regular Tasks
- Database backups
- Log monitoring
- Security updates
- Dependency updates

## 13. Future Enhancements
- Enhanced reporting features
- Advanced user analytics
- Additional tenant customization
- Mobile application integration
- API rate limiting
- Enhanced security features

## 14. Support and Resources
- GitHub repository
- Issue tracking
- Documentation updates
- Security policies
