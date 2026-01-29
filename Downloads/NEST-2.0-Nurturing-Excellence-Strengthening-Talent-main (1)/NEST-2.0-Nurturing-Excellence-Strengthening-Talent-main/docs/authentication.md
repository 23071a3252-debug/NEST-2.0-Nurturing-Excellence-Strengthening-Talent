# Authentication System Documentation

## Overview

The authentication system uses a mock OTP-based flow with role-based access control (RBAC) for route protection.

## Features

✅ **Phone/Email Login** - Support for both email and phone number
✅ **OTP Verification** - Mock OTP flow (accepts 123456)
✅ **Session Management** - localStorage-based session storage
✅ **Role-Based Access Control** - Four user roles with specific permissions
✅ **Protected Routes** - Automatic route guards by role
✅ **Context Provider** - React Context for global auth state
✅ **Clean UI** - Tailwind-styled authentication screens

## User Roles

### DOCTOR
- Access to `/doctor` routes
- Can complete follow-up tasks
- View assigned cases

### PV_OFFICER (PV Officer)
- Access to `/pv` routes
- Manage cases and assign tasks
- Review and validate submissions

### SAFETY_LEAD (Safety Lead)
- Access to `/pv` routes
- All PV Officer permissions
- View audit logs

### ADMIN
- Access to `/admin` routes
- Manage users and system configuration
- Full system access

## Demo Accounts

| Email | Role | Phone |
|-------|------|-------|
| doctor@test.com | DOCTOR | +1234567890 |
| pv@test.com | PV_OFFICER | +1987654321 |
| safety@test.com | SAFETY_LEAD | +1444444444 |
| admin@test.com | ADMIN | +1555555555 |

**Mock OTP for all accounts:** `123456`

## Authentication Flow

### 1. Login (`/login`)
```
User enters email or phone
  ↓
System validates format
  ↓
Request OTP (mock - logs to console)
  ↓
Store identifier in sessionStorage
  ↓
Navigate to /verify-otp
```

### 2. OTP Verification (`/verify-otp`)
```
User enters 6-digit OTP
  ↓
Verify OTP (must be 123456)
  ↓
Create session with user data
  ↓
Store in localStorage
  ↓
Redirect to role-specific dashboard
```

### 3. Session Management
- **Storage:** localStorage (key: `nest_session`)
- **Expiry:** 24 hours
- **Auto-refresh:** Context provider monitors session
- **Cross-tab sync:** Storage event listener

## File Structure

### Auth Pages
- [`app/(auth)/login/page.tsx`](app/(auth)/login/page.tsx) - Login page
- [`app/(auth)/verify-otp/page.tsx`](app/(auth)/verify-otp/page.tsx) - OTP verification

### Auth Utilities
- [`lib/auth/session.ts`](lib/auth/session.ts) - Session management & mock auth
- [`lib/auth/guards.ts`](lib/auth/guards.ts) - Route protection logic

### Components
- [`components/providers/AuthProvider.tsx`](components/providers/AuthProvider.tsx) - Auth context
- [`components/auth/ProtectedRoute.tsx`](components/auth/ProtectedRoute.tsx) - Route guard wrapper
- [`components/layout/TopNav.tsx`](components/layout/TopNav.tsx) - Navigation with auth state

### Protected Pages
- [`app/(doctor)/doctor/page.tsx`](app/(doctor)/doctor/page.tsx) - Doctor dashboard
- [`app/(pv)/pv/page.tsx`](app/(pv)/pv/page.tsx) - PV dashboard
- [`app/(admin)/admin/page.tsx`](app/(admin)/admin/page.tsx) - Admin dashboard

## API Reference

### Session Management

#### `requestOTP(identifier: string)`
Request OTP for login.

```typescript
const result = await requestOTP("doctor@test.com");
// { success: true, message: "OTP sent..." }
```

#### `verifyOTP(identifier: string, otp: string)`
Verify OTP and create session.

```typescript
const result = await verifyOTP("doctor@test.com", "123456");
// { success: true, user: {...}, message: "Login successful" }
```

#### `getCurrentUser()`
Get current authenticated user.

```typescript
const user = getCurrentUser();
// { id, email, name, role, phone } or null
```

#### `getSession()`
Get full session data.

```typescript
const session = getSession();
// { user, token, expiresAt } or null
```

#### `isAuthenticated()`
Check if user is logged in.

```typescript
const loggedIn = isAuthenticated();
// true or false
```

#### `signOut()`
Sign out and redirect to login.

```typescript
signOut(); // Clears session, redirects to /login
```

### Route Guards

#### `canAccessRoute(allowedRoles?: Role[])`
Check if current user can access a route.

```typescript
const { allowed, reason, redirectTo } = canAccessRoute([Role.DOCTOR]);
```

#### `getRouteGuard(path: string)`
Get route protection config for a path.

```typescript
const config = getRouteGuard("/doctor");
// { requireAuth: true, allowedRoles: [Role.DOCTOR], redirectTo: "/login" }
```

#### `Permissions` object
Role-based permission checks.

```typescript
Permissions.canManageCases(Role.PV_OFFICER); // true
Permissions.canAssignTasks(Role.DOCTOR); // false
```

### React Hooks

#### `useAuth()`
Access auth state and methods.

```typescript
const { user, loading, signOut, refreshUser } = useAuth();

// user: Current user or null
// loading: Auth state loading
// signOut: Function to sign out
// refreshUser: Function to refresh user data
```

## Protected Route Usage

### Wrap components with ProtectedRoute

```typescript
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Role } from "@/types";

export default function DoctorPage() {
  return (
    <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

### Multiple roles

```typescript
<ProtectedRoute allowedRoles={[Role.PV_OFFICER, Role.SAFETY_LEAD]}>
  <div>Content for PV staff</div>
</ProtectedRoute>
```

## Route Protection Matrix

| Route | Required Roles | Redirect |
|-------|---------------|----------|
| `/` | None | - |
| `/login` | None | - |
| `/verify-otp` | None | - |
| `/doctor` | DOCTOR | /login |
| `/pv` | PV_OFFICER, SAFETY_LEAD | /login |
| `/admin` | ADMIN | /login |

## UI Components

All auth pages use:
- **Card** - Container component
- **Input** - Form input with validation
- **Button** - Action buttons with variants
- **Tailwind CSS** - Responsive, dark mode support

## Session Data Structure

```typescript
interface SessionData {
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    phone?: string;
  };
  token: string;
  expiresAt: number; // Unix timestamp
}
```

## Security Notes (MVP)

⚠️ **Current Implementation:**
- Mock OTP (always accepts 123456)
- localStorage storage (client-side)
- No server-side validation
- No rate limiting
- No CSRF protection

✅ **Production Requirements:**
- Implement real OTP service (Twilio, AWS SNS)
- Use httpOnly cookies for tokens
- Server-side session validation
- Rate limiting on OTP requests
- CSRF tokens
- Password fallback option
- MFA support
- Audit logging

## Testing the Auth Flow

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Navigate to login**
   - Go to http://localhost:3000/login

3. **Enter email**
   - Use: `doctor@test.com`
   - Check browser console for mock OTP message

4. **Enter OTP**
   - Type: `123456`
   - Auto-redirects to doctor dashboard

5. **Test role access**
   - Try accessing `/pv` - should redirect to home
   - Try accessing `/admin` - should redirect to home

6. **Sign out**
   - Click "Sign Out" in navigation
   - Redirects to login

## Troubleshooting

### Session not persisting
- Check browser localStorage
- Ensure JavaScript is enabled
- Clear cache and retry

### Redirect loop
- Clear localStorage: `localStorage.clear()`
- Check browser console for errors

### OTP not working
- Ensure you're using exactly `123456`
- Check that identifier matches a demo account

### Protected route not working
- Verify AuthProvider wraps the app
- Check user role matches allowed roles
- Inspect browser console for errors

## Next Steps

To implement production authentication:

1. Replace mock OTP with real service
2. Implement server-side API routes
3. Use httpOnly cookies for sessions
4. Add refresh token logic
5. Implement password authentication
6. Add MFA support
7. Set up session encryption
8. Add audit logging
9. Implement rate limiting
10. Add email verification
