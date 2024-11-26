# Maamul360 Architecture Documentation

## System Architecture

### Technology Stack
- **Frontend**: Next.js 13+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: JWT (jose), bcryptjs
- **Form Handling**: React Hook Form, Zod
- **Notifications**: React Hot Toast

### Multi-tenant Architecture

#### Database Schema
```prisma
model Tenant {
  id              Int      @id @default(autoincrement())
  companyName     String
  companyEmail    String   @unique
  subdomain       String   @unique
  numberOfBranches Int?
  status          String   @default("pending")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  users           User[]   // Relation to User model
}

model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  password      String    // Hashed using bcrypt
  firstName     String?
  lastName      String?
  role          String    @default("user")
  tenant        Tenant    @relation(fields: [tenantId], references: [id])
  tenantId      Int
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Directory Structure
```
maamul360/
├── app/                    # Next.js 13 App Router
│   ├── (auth)/            # Authentication group
│   │   ├── _components/   # Auth-specific components
│   │   │   ├── login-form.tsx
│   │   │   └── register-form.tsx
│   │   ├── register/      # Registration pages
│   │   │   └── page.tsx
│   │   ├── login/         # Login pages
│   │   │   └── page.tsx
│   │   └── registration-success/
│   ├── api/               # API routes
│   │   ├── register/     
│   │   └── login/
│   └── (dashboard)/       # Protected dashboard routes
├── components/            # Shared components
│   └── ui/               # UI components (ShadcnUI)
├── lib/                  # Utility functions and configs
│   └── prisma.ts        # Prisma client
├── prisma/               # Database schema and migrations
└── docs/                # Documentation
```

### Authentication Flow

1. **Registration**
   ```mermaid
   sequenceDiagram
   participant U as User
   participant F as Frontend
   participant A as API
   participant DB as Database
   
   U->>F: Fill registration form
   F->>F: Validate form (Zod)
   F->>A: POST /api/register
   A->>DB: Check existing tenant
   A->>DB: Create tenant
   A->>DB: Create admin user
   A->>F: Return success
   F->>U: Show success toast
   F->>U: Redirect to success page
   ```

2. **Login**
   ```mermaid
   sequenceDiagram
   participant U as User
   participant F as Frontend
   participant A as API
   participant DB as Database
   
   U->>F: Enter credentials
   F->>F: Validate form (Zod)
   F->>A: POST /api/login
   A->>DB: Find tenant by subdomain
   A->>DB: Find & verify user
   A->>A: Create JWT token
   A->>F: Set HTTP-only cookie
   F->>U: Show success toast
   F->>U: Redirect to dashboard
   ```

### Security Measures
1. **Password Security**
   - Passwords hashed using bcrypt
   - Minimum 8 characters required
   - Password confirmation on registration

2. **Session Management**
   - JWT tokens for session handling
   - HTTP-only cookies
   - 24-hour session duration

3. **Form Security**
   - Input validation using Zod
   - CSRF protection (Next.js built-in)
   - Rate limiting (To be implemented)

4. **Multi-tenancy Security**
   - Unique subdomains
   - Email uniqueness validation
   - Tenant isolation in database

### Error Handling
1. **Form Validation**
   - Client-side validation with Zod
   - Specific error messages per field
   - Password matching validation

2. **API Responses**
   - Structured error responses
   - HTTP status codes
   - Detailed error messages

3. **User Feedback**
   - Toast notifications
   - Form error messages
   - Loading states

### Planned Extensions
1. **Dashboard Features**
   - Protected routes
   - User management
   - Branch management
   - Analytics

2. **Additional Security**
   - Rate limiting
   - API authentication
   - Role-based access control

3. **Performance Optimizations**
   - API route caching
   - Static page generation
   - Image optimization
