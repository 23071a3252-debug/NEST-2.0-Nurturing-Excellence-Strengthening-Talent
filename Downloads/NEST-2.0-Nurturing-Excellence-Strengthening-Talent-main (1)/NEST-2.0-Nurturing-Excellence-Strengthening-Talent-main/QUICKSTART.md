# Quick Start Guide

## Getting Started in 3 Steps

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Start Development Server
```bash
npm run dev
```

### 3️⃣ Open Browser
Navigate to [http://localhost:3000](http://localhost:3000)

---

## Try the Authentication Flow

### Step 1: Login
1. Go to http://localhost:3000/login
2. Enter one of the demo accounts:
   - `doctor@test.com`
   - `pv@test.com`
   - `safety@test.com`
   - `admin@test.com`

### Step 2: Verify OTP
1. Enter the mock OTP: `123456`
2. Click "Verify & Continue"
3. You'll be redirected to your role-specific dashboard

### Step 3: Explore Dashboards

**As a Doctor** (`doctor@test.com`)
- Access: `/doctor`
- View pending follow-up tasks
- Complete case follow-ups

**As PV Officer** (`pv@test.com`)
- Access: `/pv`
- Manage cases
- Assign tasks to doctors
- Review submissions

**As Safety Lead** (`safety@test.com`)
- Access: `/pv`
- All PV Officer permissions
- View audit logs

**As Admin** (`admin@test.com`)
- Access: `/admin`
- Manage users
- System configuration

### Step 4: Test Route Protection

Try accessing routes you don't have permission for:

1. Login as `doctor@test.com`
2. Try to visit `/pv` - You'll be redirected
3. Try to visit `/admin` - You'll be redirected
4. Sign out and try `/doctor` - Redirected to login

---

## Project Structure at a Glance

```
NEst/
├── app/
│   ├── (auth)/         # Login & OTP pages
│   ├── (doctor)/       # Doctor dashboard
│   ├── (pv)/          # PV dashboard
│   ├── (admin)/       # Admin dashboard
│   ├── layout.tsx     # Root layout with AuthProvider
│   └── page.tsx       # Home page
├── components/
│   ├── auth/          # ProtectedRoute component
│   ├── providers/     # AuthProvider context
│   ├── ui/            # Button, Input, Card
│   └── layout/        # TopNav
├── lib/
│   ├── auth/          # session.ts, guards.ts
│   ├── validators/    # Entity & field validators
│   └── examples/      # Type usage examples
├── types/
│   ├── enums.ts       # Role, TaskStatus, Priority, Severity
│   └── entities.ts    # All entity interfaces
└── docs/
    ├── authentication.md
    └── type-system.md
```

---

## Key Features to Explore

### 🔐 Authentication
- Email/Phone login
- OTP verification
- Session management
- Auto-redirects based on role

### 🛡️ Route Protection
- Role-based access control
- Automatic guards
- Permission helpers

### 📝 Type System
- Complete TypeScript types
- Entity validation
- Status workflow validation

### 🎨 UI Components
- Tailwind CSS styling
- Dark mode support
- Responsive design
- Reusable components

---

## Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## Mock Data Reference

### OTP Code
Always use: **123456**

### Demo Users
| Email | Password | Role |
|-------|----------|------|
| doctor@test.com | OTP only | DOCTOR |
| pv@test.com | OTP only | PV_OFFICER |
| safety@test.com | OTP only | SAFETY_LEAD |
| admin@test.com | OTP only | ADMIN |

### Session Storage
- **Key:** `nest_session`
- **Expires:** 24 hours
- **Storage:** localStorage

---

## Troubleshooting

### Can't login?
- Make sure you're using a demo email exactly as shown
- Use OTP: `123456`
- Check browser console for errors

### Session lost?
- Check if cookies/localStorage are enabled
- Try clearing browser cache
- Restart dev server

### TypeScript errors?
- Run `npm run build` to see all errors
- Check that all imports use `@/` prefix
- Ensure all types are exported from `@/types`

---

## Next Steps

1. ✅ Authentication is working
2. ✅ Route protection is active
3. ✅ Type system is complete

**Ready to build:**
- API routes for cases
- Database integration
- Form templates
- Task management
- Submission workflow

---

## Need Help?

### Documentation
- [Authentication Guide](docs/authentication.md)
- [Type System](docs/type-system.md)
- [Main README](README.md)

### Code Examples
- [Type Usage Examples](lib/examples/type-usage.ts)
- [Auth Guard Examples](lib/auth/guards.ts)

---

**Happy coding! 🚀**
