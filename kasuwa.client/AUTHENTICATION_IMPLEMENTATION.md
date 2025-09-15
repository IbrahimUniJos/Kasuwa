# Kasuwa Marketplace - Authentication System

This document describes the comprehensive login and signup implementation for the Kasuwa Online Marketplace Platform, supporting both Customer and Vendor user types.

## ?? Authentication Overview

The Kasuwa marketplace features a robust authentication system that supports:
- **Customer Registration**: Standard user accounts for shopping
- **Vendor Registration**: Business accounts for selling (requires approval)
- **JWT-based Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for different user types

## ??? Architecture

### Backend Integration
- **Framework**: ASP.NET Core 9.0 with Identity Framework
- **Authentication**: JWT tokens with refresh token support
- **Database**: SQL Server with Entity Framework Core
- **User Types**: Customer (1), Vendor (2), Administrator (3)

### Frontend Implementation
- **Framework**: React 18 with TypeScript
- **State Management**: React Context API with custom hooks
- **UI Components**: Tailwind CSS with Headless UI
- **Form Validation**: Client-side validation with server-side integration

## ?? File Structure

```
kasuwa.client/src/
??? components/
?   ??? ui/
?   ?   ??? AuthModal.tsx              # Main authentication modal
?   ??? vendor/
?   ?   ??? VendorDashboard.tsx        # Vendor dashboard component
?   ??? customer/
?   ?   ??? CustomerDashboard.tsx      # Customer dashboard component
?   ??? layout/
?       ??? Header.tsx                 # Navigation with auth integration
??? contexts/
?   ??? AuthContext.tsx                # Authentication context provider
??? hooks/
?   ??? useAuth.ts                     # Authentication custom hook
??? services/
?   ??? auth.ts                        # Authentication service
?   ??? api.ts                         # API client with token management
??? types/
    ??? api.ts                         # TypeScript definitions
```

## ?? Key Features

### 1. Dual Registration System

#### Customer Registration
- Basic personal information (name, email, password)
- Optional fields (date of birth, preferred language)
- Instant account activation
- Immediate shopping access

#### Vendor Registration
- Business information (business name, description, address)
- Personal information (name, email, password)
- Contact details (business phone)
- **Approval Process**: Account requires admin approval before selling
- Can browse/shop while pending approval

### 2. Authentication Flow

```typescript
// Login Process
const handleLogin = async (credentials: LoginDto) => {
  const response = await authService.login(credentials);
  if (response.success) {
    // User authenticated, update UI state
    // Load user-specific data (cart, wishlist)
  }
};

// Registration Process
const handleRegister = async (userData: RegisterDto) => {
  const response = await authService.register(userData);
  if (response.success) {
    // Account created, user logged in
    // Show appropriate welcome message based on user type
  }
};
```

### 3. JWT Token Management

- **Access Tokens**: Short-lived (3 hours) for API requests
- **Refresh Tokens**: Long-lived (7 days) for token renewal
- **Automatic Refresh**: Background token renewal
- **Secure Storage**: Tokens stored in localStorage with validation

### 4. Role-Based Access Control

```typescript
// Permission checking
const { isCustomer, isVendor, isAdmin, isVendorApproved } = useAuth();

// Vendor-specific features
if (isVendorApproved) {
  // Show product management features
}

// Customer-specific features
if (isCustomer) {
  // Show shopping features
}
```

## ?? User Interface

### Authentication Modal
- **Tabbed Interface**: Switch between Login and Register
- **User Type Selection**: Choose between Customer and Vendor
- **Dynamic Forms**: Form fields change based on selected user type
- **Validation**: Real-time form validation with error messages
- **Cultural Elements**: Hausa greetings and Northern Nigerian context

### Dashboard Components
- **Vendor Dashboard**: Business metrics, approval status, product management
- **Customer Dashboard**: Order history, wishlist, account settings
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## ?? API Integration

### Authentication Endpoints

```typescript
// Backend API Endpoints
POST /api/auth/login          // User login
POST /api/auth/register       // User registration
POST /api/auth/refresh        // Token refresh
POST /api/auth/logout         // User logout
GET  /api/auth/profile        // Get user profile
POST /api/auth/change-password // Change password
```

### Request/Response Types

```typescript
interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: UserType;
  // Vendor-specific fields
  businessName?: string;
  businessDescription?: string;
  businessAddress?: string;
  businessPhone?: string;
}

interface AuthResponseDto {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  user?: UserDto;
}
```

## ??? Security Features

### Frontend Security
- **Input Validation**: Client-side validation before API calls
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Secure token handling
- **Password Strength**: Minimum 8 characters with complexity requirements

### Token Security
- **JWT Validation**: Token expiry checking
- **Automatic Logout**: Clear tokens on expiry
- **Secure Headers**: Authorization headers for protected requests

## ?? User Experience

### Registration Flow

#### Customer Journey
1. Click "Sign In" ? "Create Account"
2. Select "Customer" user type
3. Fill personal information
4. Submit form
5. **Instant Access**: Immediately logged in and can shop

#### Vendor Journey
1. Click "Become a Vendor" or select "Vendor" in registration
2. Fill business information + personal details
3. Submit application
4. **Pending Status**: Account created but selling features locked
5. **Email Notification**: Receive approval/rejection notification
6. **Approval**: Full vendor features unlocked

### Login Experience
- **Remember Me**: Optional persistent sessions
- **Error Handling**: Clear error messages for failed attempts
- **Account Recovery**: Forgot password functionality (planned)

## ?? User Type Features

### Customer (UserType.Customer = 1)
- ? Browse products
- ? Add to cart/wishlist
- ? Place orders
- ? Track order history
- ? Manage profile

### Vendor (UserType.Vendor = 2)
- ? All customer features
- ? Product management (after approval)
- ? Order management (after approval)
- ? Business analytics (after approval)
- ? Business profile management

### Administrator (UserType.Administrator = 3)
- ? All system features
- ? User management
- ? Vendor approval workflow
- ? Platform administration

## ?? State Management

### Authentication Context
```typescript
const AuthContext = createContext<{
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  // ... helper methods
}>();
```

### Custom Hooks
```typescript
// Primary authentication hook
const auth = useAuth();

// Utility hook with helper methods
const { canManageProducts, getUserTypeDisplayName } = useAuthentication();
```

## ?? Validation Rules

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Special characters optional

### Business Information (Vendors)
- Business name: Required, max 100 characters
- Business description: Required, max 500 characters
- Business address: Optional
- Business phone: Optional, valid phone format

## ?? Getting Started

### Prerequisites
- Node.js 18+
- React 18+
- TypeScript 4.5+
- Tailwind CSS 3+

### Setup Instructions

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Configuration**
```env
VITE_API_BASE_URL=https://localhost:7155/api
```

3. **Start Development Server**
```bash
npm run dev
```

### Usage Example

```tsx
import { AuthProvider } from './contexts/AuthContext';
import AuthModal from './components/ui/AuthModal';

function App() {
  return (
    <AuthProvider>
      <YourAppComponents />
      <AuthModal 
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        defaultTab="register"
        defaultUserType={UserType.Vendor}
      />
    </AuthProvider>
  );
}
```

## ?? Styling & Theming

### Color Scheme
- **Primary**: Kasuwa brand colors (blue tones)
- **Secondary**: Accent colors (orange/amber)
- **Success**: Green for approvals and success states
- **Warning**: Amber for pending states
- **Error**: Red for errors and failures

### Cultural Elements
- Hausa greetings ("Sannu da zuwa!")
- Northern Nigerian context
- Local marketplace terminology
- Nigeria flag emoji and cultural references

## ?? Testing

### Test Scenarios

#### Authentication Tests
- ? Successful customer registration
- ? Successful vendor registration  
- ? Login with valid credentials
- ? Login with invalid credentials
- ? Token refresh functionality
- ? Logout process

#### User Type Tests
- ? Customer access permissions
- ? Vendor approval workflow
- ? Dashboard access control
- ? Role-based feature visibility

## ?? Future Enhancements

### Planned Features
- [ ] Email verification system
- [ ] Two-factor authentication (2FA)
- [ ] Social media login (Google, Facebook)
- [ ] Phone number verification
- [ ] Password reset via email
- [ ] Account suspension/reactivation
- [ ] Bulk vendor operations
- [ ] Advanced vendor analytics

### Security Improvements
- [ ] Rate limiting for login attempts
- [ ] CAPTCHA for registration
- [ ] Device fingerprinting
- [ ] Session management
- [ ] Audit logging

## ?? Support & Documentation

### Resources
- **API Documentation**: Available at `/swagger` endpoint
- **Backend Specs**: See `Backend_Technical_Specifications.md`
- **Identity Implementation**: See `IDENTITY_IMPLEMENTATION.md`

### Support Channels
- **Email**: support@kasuwa.com
- **Phone**: +234 800 KASUWA
- **Documentation**: This README and linked resources

---

**Note**: This authentication system provides a solid foundation for the Kasuwa marketplace. The implementation follows modern security practices and provides an excellent user experience for both customers and vendors in the Northern Nigerian market context.