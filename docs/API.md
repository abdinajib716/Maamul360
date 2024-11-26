# Maamul360 API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.maamul360.com/api
```

## Authentication
All API endpoints except for registration and login require authentication using JWT tokens.

### Headers
```
Authorization: Bearer <token>
```

## API Endpoints

### Tenant Registration
Register a new tenant in the system.

```http
POST /register
```

#### Request Body
```json
{
  "companyName": "string",
  "companyEmail": "string",
  "subdomain": "string",
  "numberOfBranches": "number"
}
```

#### Response
```json
{
  "message": "Registration successful",
  "tenant": {
    "id": "number",
    "companyName": "string",
    "companyEmail": "string",
    "subdomain": "string",
    "numberOfBranches": "number",
    "status": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

#### Error Responses
```json
{
  "error": "This subdomain is already taken"
}
```
```json
{
  "error": "This email is already taken"
}
```

### Planned Endpoints

#### Authentication

##### Login
```http
POST /login
```
Request:
```json
{
  "email": "string",
  "password": "string"
}
```
Response:
```json
{
  "token": "string",
  "user": {
    "id": "number",
    "email": "string",
    "name": "string",
    "role": "string"
  }
}
```

##### Logout
```http
POST /logout
```

##### Reset Password
```http
POST /reset-password
```
Request:
```json
{
  "email": "string"
}
```

#### User Management

##### Create User
```http
POST /users
```
Request:
```json
{
  "email": "string",
  "name": "string",
  "role": "string",
  "password": "string"
}
```

##### Get Users
```http
GET /users
```
Response:
```json
{
  "users": [
    {
      "id": "number",
      "email": "string",
      "name": "string",
      "role": "string",
      "createdAt": "string"
    }
  ]
}
```

#### Branch Management

##### Create Branch
```http
POST /branches
```
Request:
```json
{
  "name": "string",
  "location": "string"
}
```

##### Get Branches
```http
GET /branches
```
Response:
```json
{
  "branches": [
    {
      "id": "number",
      "name": "string",
      "location": "string",
      "createdAt": "string"
    }
  ]
}
```

## Error Handling

### Error Codes
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

### Error Response Format
```json
{
  "error": "string",
  "message": "string",
  "details": {} // Optional additional information
}
```

## Rate Limiting
- 100 requests per minute per IP
- 1000 requests per hour per tenant

## Data Types

### Tenant
```typescript
{
  id: number
  companyName: string
  companyEmail: string
  subdomain: string
  numberOfBranches: number
  status: "pending" | "active" | "suspended"
  createdAt: string // ISO date
  updatedAt: string // ISO date
}
```

### User
```typescript
{
  id: number
  email: string
  name: string
  role: "admin" | "manager" | "user"
  tenantId: number
  createdAt: string // ISO date
  updatedAt: string // ISO date
}
```

### Branch
```typescript
{
  id: number
  name: string
  location: string
  tenantId: number
  createdAt: string // ISO date
  updatedAt: string // ISO date
}
```

## Webhooks (Planned)
Webhooks will be available for the following events:
- Tenant registration
- User creation
- Branch creation
- Status changes

## API Versioning
API versioning will be handled through the URL:
```
/api/v1/...
/api/v2/...
```

## Security
- All endpoints use HTTPS
- JWT token expiration: 24 hours
- CORS enabled for specific domains
- Rate limiting per IP and tenant
- Input validation using Zod
- SQL injection prevention through Prisma
- XSS protection
- CSRF protection
