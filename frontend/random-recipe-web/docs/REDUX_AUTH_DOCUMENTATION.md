# Redux Authentication Implementation Documentation

## Overview

This documentation covers the complete Redux-based authentication system implemented in the `random-recipe-web` Next.js frontend application. The implementation follows Redux Toolkit best practices with TypeScript integration and Zod-first schema validation.

## Architecture Overview

The authentication system is built using:
- **Redux Toolkit** (`@reduxjs/toolkit`): For state management
- **React Redux** (`react-redux`): For React integration  
- **Zod**: For runtime type validation and TypeScript type inference
- **React Toastify** (`react-toastify`): For user notifications
- **TypeScript**: For compile-time type safety

## Project Structure

```
src/
├── store/
│   ├── index.ts                     # Main store configuration
│   ├── hooks.ts                     # Typed Redux hooks
│   └── features/
│       └── auth/
│           └── authSlice.ts         # Authentication slice
├── schemas/
│   ├── authStateSchema.ts           # Auth state Zod schema
│   └── userSchema.ts               # User data Zod schema
├── components/
│   ├── SignOutButton.tsx           # Sign out component with Redux
│   ├── GoogleSignInButton.tsx      # Sign in component
│   ├── general/
│   │   └── Navbar.tsx              # Navigation with auth state
│   └── common/
│       └── Toast.tsx               # Toast notification config
├── app/
│   ├── layout.tsx                  # App layout with Redux Provider
│   ├── providers.tsx               # Redux Provider wrapper
│   └── hello/
│       └── page.tsx                # User page with auth check
```

## Core Implementation

### 1. Store Configuration

#### `src/store/index.ts`
```typescript
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/auth/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

#### `src/store/hooks.ts`
Typed hooks for Redux usage throughout the application:
```typescript
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './index'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

### 2. Zod Schemas for Type Safety

#### `src/schemas/userSchema.ts`
```typescript
import { z } from 'zod'

export const userSchema = z.object({
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
})

export type User = z.infer<typeof userSchema>
```

#### `src/schemas/authStateSchema.ts`
```typescript
import { z } from 'zod'
import { userSchema } from './userSchema'

export const authStateSchema = z.object({
  user: userSchema.nullable(),
  isAuthenticated: z.boolean(),
  isLoading: z.boolean(),
})

export type AuthState = z.infer<typeof authStateSchema>

export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
}
```

### 3. Auth Slice Implementation

#### `src/store/features/auth/authSlice.ts`
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialAuthState } from '@/schemas/authStateSchema'
import { User } from '@/schemas/userSchema'

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isLoading = false
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const { login, logout, setLoading } = authSlice.actions
export default authSlice.reducer
```

**Actions:**
- `login(user: User)`: Sets user data and authentication state
- `logout()`: Clears user data and authentication state  
- `setLoading(isLoading: boolean)`: Manages loading state during auth operations

### 4. Provider Setup

#### `src/app/providers.tsx`
```typescript
'use client'

import { Provider } from 'react-redux'
import { store } from '@/store'

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>
}
```

#### `src/app/layout.tsx`
Integration in the root layout:
```typescript
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <Toast />
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

## Component Integration

### 1. Navigation Component

#### `src/components/general/Navbar.tsx`
The Navbar component demonstrates conditional rendering based on authentication state:

```typescript
'use client'

export default function Navbar() {
  const { user, isLoading } = useAppSelector((state) => state.auth)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevents hydration mismatch by not rendering auth-dependent content on server
  if (!mounted) {
    return (/* Static navbar without auth buttons */)
  }

  return (
    <nav>
      {/* Navigation items */}
      <div>
        {isLoading && (
          <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
        )}
        {!isLoading && !user && <GoogleSignInButton />}
        {!isLoading && user && <SignOutButton />}
      </div>
    </nav>
  )
}
```

**Key Features:**
- **Hydration Protection**: Uses `mounted` state to prevent server/client mismatch
- **Loading States**: Shows skeleton loader during authentication operations
- **Conditional Rendering**: Displays appropriate buttons based on auth state

### 2. Sign Out Component

#### `src/components/SignOutButton.tsx`
```typescript
'use client'

export default function SignOutButton() {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleLogout = () => {
    try {
      setIsLoading(true)
      logoutWithGoogle()
      dispatch(logout())
      setIsLoading(false)
    } catch (error) {
      console.error('Error logging out:', error)
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={() => handleLogout()}>
      {isLoading ? 'Signing out...' : 'Sign out'}
    </Button>
  )
}
```

**Features:**
- **Local Loading State**: Independent loading management
- **Redux Integration**: Dispatches logout action to clear global state
- **Error Handling**: Graceful error management with console logging

### 3. Authentication Check Page

#### `src/app/hello/page.tsx`
The Hello page handles user session verification after OAuth redirect:

```typescript
'use client'

export default function Hello() {
  const dispatch = useAppDispatch()
  const { user, isLoading } = useAppSelector((state) => state.auth)
  const [hasChecked, setHasChecked] = useState<boolean>(false)

  useEffect(() => {
    const setLoggedInUser = async () => {
      try {
        dispatch(setLoading(true))
        const loggedInUser: User | null = await getLoggedInUser()
        
        if (loggedInUser === null) {
          return
        }
        
        dispatch(login(loggedInUser))
        toast.info(`Hello, Welcome ${loggedInUser.firstName}!`)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        dispatch(setLoading(false))
        setHasChecked(true)
      }
    }

    if (user === null && !hasChecked && !isLoading) {
      setLoggedInUser()
    }
  }, [user, dispatch, hasChecked, isLoading])

  return (
    <div>
      {user && (
        <h1>Hello {user.firstName} {user.lastName}!</h1>
      )}
    </div>
  )
}
```

**Key Features:**
- **Session Verification**: Checks for authenticated user after OAuth redirect
- **State Management**: Updates Redux store with user data
- **User Feedback**: Shows welcome toast notification
- **Duplicate Request Prevention**: Uses `hasChecked` flag to prevent multiple API calls

## Toast Notifications

#### `src/components/common/Toast.tsx`
```typescript
import { ToastContainer, Bounce } from 'react-toastify'

export default function Toast() {
  return (
    <ToastContainer
      position="top-center"
      autoClose={5000}
      theme="light"
      transition={Bounce}
      // ... other configuration
    />
  )
}
```

**React Toastify v11 Features:**
- **Auto CSS Injection**: No manual CSS imports required
- **Built-in Styling**: Works out of the box with modern design
- **TypeScript Support**: Full type safety for toast operations

## Authentication Flow

### 1. Initial State
```
user: null
isAuthenticated: false
isLoading: false
```

### 2. Google OAuth Process
1. User clicks `GoogleSignInButton`
2. Redirected to Google OAuth
3. After successful auth, redirected to `/hello` page
4. Hello page calls `getLoggedInUser()` API
5. If user exists, `login(user)` action dispatched
6. Welcome toast displayed

### 3. Sign Out Process
1. User clicks `SignOutButton`
2. Local loading state set to `true`
3. `logoutWithGoogle()` service called
4. `logout()` action dispatched to clear Redux state
5. Local loading state reset

### 4. State Persistence
- **No Automatic Checking**: App doesn't automatically check user session on startup
- **Page-Based Verification**: User state only checked on `/hello` page
- **Clean UX**: Prevents false error messages and button flashing

## Key Design Decisions

### 1. Zod-First Architecture
- **Runtime Validation**: Schemas validate data at runtime
- **Type Inference**: TypeScript types automatically derived from schemas
- **Consistency**: Maintains existing codebase patterns

### 2. No Automatic Session Checking
- **Problem Solved**: Eliminated false "Failed to login" messages
- **Performance**: Reduced unnecessary API calls
- **UX**: Prevented button flashing and loading states on page load

### 3. Hydration-Safe Components
- **SSR Compatibility**: Navbar uses `mounted` state for client-only rendering
- **Prevents Errors**: Eliminates React hydration mismatch warnings
- **Graceful Degradation**: Shows static content until client-side hydration

### 4. Granular Loading States
- **Global Loading**: Redux `isLoading` for app-wide auth operations
- **Local Loading**: Component-level loading for specific actions
- **Better UX**: More precise loading indicators

## Dependencies

### Required Packages
```json
{
  "@reduxjs/toolkit": "^2.8.2",
  "react-redux": "^9.2.0",
  "react-toastify": "^11.0.5",
  "zod": "^3.24.3"
}
```

### TypeScript Types
- All Redux types are properly typed using RTK's built-in TypeScript support
- Zod schemas provide runtime validation and compile-time types
- Custom hooks ensure type safety throughout the application

## Best Practices Implemented

1. **Type Safety**: Full TypeScript integration with runtime validation
2. **Performance**: Efficient state updates using Redux Toolkit's Immer integration
3. **Error Handling**: Graceful error management with user feedback
4. **Code Organization**: Clear separation of concerns with feature-based structure
5. **Developer Experience**: Typed hooks and comprehensive error handling
6. **User Experience**: Loading states, toast notifications, and hydration protection

## Future Considerations

1. **Persistence**: Consider implementing Redux Persist for session persistence across browser restarts
2. **Middleware**: Add authentication middleware for automatic token refresh
3. **Error Boundaries**: Implement React Error Boundaries for auth-related errors
4. **Testing**: Add unit tests for auth slice and component integration
5. **Security**: Implement token expiration handling and refresh logic

This implementation provides a solid foundation for authentication state management that can be extended as the application grows. 