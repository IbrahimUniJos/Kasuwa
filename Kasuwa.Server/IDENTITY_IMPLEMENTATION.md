# Kasuwa Marketplace - Identity Implementation

This document outlines the complete identity system implementation for the Kasuwa Online Marketplace Platform based on the PRD requirements.

## 🏗️ Architecture Overview

The identity system is built using ASP.NET Core Identity with JWT authentication, providing secure user management for the three main user types:

- **Customers**: End users who purchase products
- **Vendors**: Sellers who list and manage products  
- **Administrators**: Platform managers with full system access

## 📁 Project Structure

```
Kasuwa.Server/
├── Controllers/
│   ├── AuthController.cs          # Authentication endpoints
│   ├── AdminController.cs         # Admin user management
│   └── WeatherForecastController.cs
├── Data/
│   └── ApplicationDbContext.cs    # Entity Framework context
├── DTOs/
│   └── AuthDTOs.cs               # Data transfer objects
├── Models/
│   ├── ApplicationUser.cs        # Custom user model
│   └── UserAddress.cs           # User address model
├── Services/
│   └── TokenService.cs          # JWT token management
├── Migrations/                   # Entity Framework migrations
└── Identity-API-Tests.http      # API testing file
```

## 🔐 Features Implemented

### Authentication & Authorization
- [x] JWT-based authentication
- [x] Role-based access control (RBAC)
- [x] User registration with email validation
- [x] Secure login with lockout protection
- [x] Password change functionality
- [x] Token refresh mechanism
- [x] Logout functionality

### User Management
- [x] Custom user model with vendor/customer properties
- [x] Multiple user addresses support
- [x] Vendor approval workflow
- [x] User activation/deactivation
- [x] Role assignment and management

### Admin Features
- [x] User listing with pagination and filtering
- [x] Vendor approval/rejection
- [x] User status management
- [x] Role assignment/removal
- [x] Comprehensive user search

## 🚀 Getting Started

### Prerequisites
- .NET 9.0 SDK
- SQL Server or LocalDB
- Visual Studio 2022 or VS Code

### Database Setup

1. **Update Connection String** (if needed):
   ```json
   // appsettings.json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=KasuwaDB;Trusted_Connection=true;MultipleActiveResultSets=true"
     }
   }
   ```

2. **Apply Migrations**:
   ```bash
   cd Kasuwa.Server
   dotnet ef database update
   ```

3. **Run the Application**:
   ```bash
   dotnet run
   ```

### JWT Configuration

Update the JWT settings in `appsettings.json`:

```json
{
  "JWT": {
    "ValidAudience": "https://localhost:7290",
    "ValidIssuer": "https://localhost:7290", 
    "Secret": "YourSuperSecretKeyThatShouldBeAtLeast32Characters",
    "TokenValidityInMinutes": 180,
    "RefreshTokenValidityInDays": 7
  }
}
```

## 📚 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/refresh` | Refresh JWT token | No |
| POST | `/api/auth/logout` | User logout | Yes |
| GET | `/api/auth/profile` | Get user profile | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | Get all users (paginated) | Admin |
| GET | `/api/admin/users/{id}` | Get user by ID | Admin |
| POST | `/api/admin/users/{id}/approve-vendor` | Approve/reject vendor | Admin |
| POST | `/api/admin/users/{id}/toggle-status` | Activate/deactivate user | Admin |
| POST | `/api/admin/users/{id}/roles` | Assign role to user | Admin |
| DELETE | `/api/admin/users/{id}/roles/{role}` | Remove role from user | Admin |
| GET | `/api/admin/roles` | Get all available roles | Admin |

## 🔑 User Types & Roles

### User Types (Enum)
```csharp
public enum UserType
{
    Customer = 1,      // Regular customers
    Vendor = 2,        // Product sellers  
    Administrator = 3  // Platform admins
}
```

### Default Roles
- **Customer**: Basic shopping privileges
- **Vendor**: Product management privileges (requires approval)
- **Administrator**: Full system access

## 🛡️ Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one digit
- Non-alphanumeric characters optional

### Account Lockout
- Maximum 5 failed attempts
- 5-minute lockout duration
- Automatic reset after successful login

### JWT Token Security
- HMAC SHA256 signing
- 3-hour token expiration
- Refresh token support
- Secure token validation

## 📋 Testing the API

Use the provided `Identity-API-Tests.http` file to test all endpoints. Update the token variables as needed:

```http
### Login first to get a token
POST https://localhost:7290/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin123!"
}

### Then use the token in subsequent requests
GET https://localhost:7290/api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

## 🔄 User Registration Flow

### Customer Registration
1. User submits registration form
2. System validates input data
3. Creates user with Customer role
4. Account is immediately active
5. Returns JWT token for automatic login

### Vendor Registration  
1. User submits vendor registration form
2. System validates input and business details
3. Creates user with Vendor role
4. Sets `IsVendorApproved = false`
5. Admin must approve before vendor can sell
6. Returns JWT token but limited privileges until approved

### Admin Registration
1. Creates user with Administrator role
2. Full system access immediately available
3. Can manage all users and platform settings

## 🗃️ Database Schema

### ApplicationUser Table
- Extends `IdentityUser` with custom properties
- Stores user type, business info, addresses
- Tracks approval status for vendors
- Maintains activity and login history

### UserAddress Table
- Stores multiple addresses per user
- Supports default address marking
- Full address validation and formatting

### Identity Tables
- Standard ASP.NET Identity tables
- Roles, user roles, claims, etc.
- Password history and security stamps

## 🔮 Future Enhancements

### Security Improvements
- [ ] Email confirmation requirement
- [ ] Two-factor authentication (2FA)
- [ ] Password reset via email
- [ ] Account recovery mechanisms
- [ ] Audit logging for admin actions

### User Management
- [ ] Bulk user operations
- [ ] Advanced user filtering
- [ ] User activity monitoring
- [ ] Vendor performance metrics
- [ ] Customer purchase history

### Integration Features
- [ ] Social media login (Google, Facebook)
- [ ] External identity providers
- [ ] Single sign-on (SSO)
- [ ] API rate limiting
- [ ] Webhook notifications

## 🤝 Contributing

1. Follow the existing code structure and patterns
2. Add unit tests for new functionality
3. Update documentation for API changes
4. Ensure all security validations are in place
5. Test with different user roles and scenarios

## 📄 License

This project is part of the Kasuwa Marketplace Platform and follows the project's licensing terms.

---

**Note**: This implementation provides a solid foundation for the marketplace identity system. Remember to update JWT secrets and connection strings for production deployment.