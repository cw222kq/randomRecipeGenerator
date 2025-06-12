# Google OAuth Mobile Implementation - Frontend Documentation

## Overview

Complete Google OAuth 2.0 implementation for React Native Expo mobile applications. This implementation provides secure authentication with Google using a backend proxy pattern to overcome Google Console URL scheme limitations.

## Architecture

```
Mobile App → Backend API → Google OAuth → Backend API → Mobile App
    ↓            ↓             ↓             ↓             ↓
  Button     Auth Init    User Login    Token Exchange  JWT Storage
```

The mobile app uses the backend as a secure proxy to handle Google OAuth complexity while maintaining security through CSRF protection and secure token storage.

## Implementation Files

### Core Files Structure
```
hooks/
├── useGoogleAuth.ts          ← Main OAuth orchestration logic
services/
├── authService.ts           ← Backend API communication
lib/
├── secureStorage.ts         ← Secure token storage
schemas/
├── authSchemas.ts           ← Type definitions and validation
├── userSchema.ts            ← User profile type definition
components/
├── GoogleSignInButton.tsx   ← UI component
```

## File-by-File Implementation Guide

### 1. Schema Definitions (`schemas/authSchemas.ts`)

**Purpose:** Type-safe data structures and validation using Zod schemas.

```typescript
import { z } from 'zod'
import { UserSchema } from './userSchema'

// Response from /api/account/mobile-auth-init
export const InitializeAuthResponseSchema = z.object({
  authUrl: z.string().url(),    // Google OAuth URL
  state: z.string(),            // CSRF protection token
})

// Request to /api/account/mobile-auth-complete
export const CompleteAuthRequestSchema = z.object({
  code: z.string(),             // Authorization code from Google
  state: z.string(),            // CSRF protection token
  redirectUri: z.string(),      // Backend callback URL
})

// Response from /api/account/mobile-auth-complete
export const CompleteAuthResponseSchema = z.object({
  user: UserSchema,             // User profile data
  token: z.string(),            // JWT authentication token
  expiresAt: z.string().datetime(), // Token expiration
})

export const AuthStateSchema = z.object({
  isLoading: z.boolean(),       // UI loading state
  error: z.string().nullable(), // Error message for UI
})

// TypeScript type inference
export type InitializeAuthResponse = z.infer<typeof InitializeAuthResponseSchema>
export type CompleteAuthRequest = z.infer<typeof CompleteAuthRequestSchema>
export type CompleteAuthResponse = z.infer<typeof CompleteAuthResponseSchema>
export type AuthState = z.infer<typeof AuthStateSchema>
```

**Key Points:**
- **Line 6:** `authUrl` must be a valid URL format
- **Line 7:** `state` is a string used for CSRF protection
- **Line 17:** `user` validates against UserSchema ensuring type safety
- **Line 18:** `token` is the JWT token string from backend
- **Line 19:** `expiresAt` must be ISO 8601 datetime format

### 1.1. User Schema Definition (`schemas/userSchema.ts`)

**Purpose:** Defines the User type with Google profile data structure.

```typescript
import { z } from 'zod'

export const UserSchema = z.object({
  googleUserId: z.string(),                    // Unique Google user identifier
  email: z.string().email(),                   // User's email address
  firstName: z.string().optional().nullable(), // Optional first name
  lastName: z.string().optional().nullable(),  // Optional last name
})

export type User = z.infer<typeof UserSchema>
```

**Key Features:**
- **Line 4:** `googleUserId` is the primary user identifier from Google
- **Line 5:** `email` validates email format and is always present
- **Lines 6-7:** `firstName` and `lastName` are optional (Google doesn't always provide names)
- **Line 10:** TypeScript type inference creates the `User` type

### 2. Secure Storage (`lib/secureStorage.ts`)

**Purpose:** Secure storage interface using Expo SecureStore for sensitive data.

```typescript
import { User, UserSchema } from '@/schemas/userSchema'
import * as SecureStore from 'expo-secure-store'

const KEYS = {
  APP_TOKEN: 'app_auth_token',      // JWT token storage key
  USER_DATA: 'user_data',           // User profile storage key
  TOKEN_EXPIRY: 'token_expiry',     // Token expiration storage key
} as const

export const secureStorage = {
  // Store JWT authentication token
  async setAppToken(token: string, expireAt?: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.APP_TOKEN, token)
    if (expireAt) {
      await SecureStore.setItemAsync(KEYS.TOKEN_EXPIRY, expireAt)
    }
  },

  async getAppToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(KEYS.APP_TOKEN)
  },

  async isTokenExpired(): Promise<boolean> {
    const expiry = await SecureStore.getItemAsync(KEYS.TOKEN_EXPIRY)
    if (!expiry) {
      return false  // No expiry means token doesn't expire
    }
    return new Date(expiry) <= new Date()  // Compare dates
  },

  // Store user profile data with validation
  async setUserData(userData: User): Promise<void> {
    await SecureStore.setItemAsync(KEYS.USER_DATA, JSON.stringify(userData))
  },

  async getUserData(): Promise<User | null> {
    const userData = await SecureStore.getItemAsync(KEYS.USER_DATA)
    if (!userData) {
      return null
    }
    try {
      const parsedUserData = JSON.parse(userData)
      const validatedUserData = UserSchema.safeParse(parsedUserData)

      if (!validatedUserData.success) {
        console.error('User validation failed:', validatedUserData.error.format())
        await SecureStore.deleteItemAsync(KEYS.USER_DATA)  // Remove invalid data
        return null
      }
      return validatedUserData.data
    } catch (error) {
      console.error('Error parsing user data:', error)
      await SecureStore.deleteItemAsync(KEYS.USER_DATA)  // Remove corrupted data
      return null
    }
  },

  async clearAllAuthData(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.APP_TOKEN),
      SecureStore.deleteItemAsync(KEYS.USER_DATA),
      SecureStore.deleteItemAsync(KEYS.TOKEN_EXPIRY),
    ])
  },

  // Generic secure storage methods
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value)
  },

  async getItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key)
  },

  async deleteItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key)
  },
}
```

**Key Security Features:**
- **Lines 14-17:** Stores JWT token and expiration securely on device
- **Lines 24-29:** Checks token expiration before use
- **Lines 37-50:** Validates user data with Zod schema before storage
- **Lines 42-46:** Removes invalid data if validation fails
- **Lines 52-57:** Clears all auth data simultaneously (logout)

### 3. Backend Communication (`services/authService.ts`)

**Purpose:** Handles all HTTP communication with the backend OAuth endpoints.

```typescript
import {
  CompleteAuthResponseSchema,
  InitializeAuthResponseSchema,
  CompleteAuthRequest,
} from '@/schemas/authSchemas'

const authService = {
  // Initialize OAuth flow - get Google URL and state
  async initializeAuth() {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/account/mobile-auth-init`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Backend callback URL (Google Console accepts HTTPS)
            redirectUri: `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/account/mobile-auth-callback`,
          }),
        },
      )

      if (!response.ok) {
        console.error('Failed to initialize authentication', response.status)
        return null
      }

      const data = await response.json()

      // Validate response structure with Zod
      const validatedData = InitializeAuthResponseSchema.safeParse(data)
      if (!validatedData.success) {
        console.error('Invalid response data from initializeAuth', validatedData.error)
        return null
      }

      return validatedData.data  // Returns { authUrl, state }
    } catch (error) {
      console.error('Failed to initialize authentication', error)
      return null
    }
  },

  // Complete OAuth flow - exchange code for JWT token
  async completeAuth(request: CompleteAuthRequest) {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/account/mobile-auth-complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),  // { code, state, redirectUri }
        },
      )

      if (!response.ok) {
        console.error('Failed to complete authentication', response.status)
        return null
      }

      const data = await response.json()

      // Validate response structure with Zod
      const validatedData = CompleteAuthResponseSchema.safeParse(data)
      if (!validatedData.success) {
        console.error('Invalid response data from completeAuth', validatedData.error)
        return null
      }

      return validatedData.data  // Returns { user, token, expiresAt }
    } catch (error) {
      console.error('Failed to complete authentication', error)
      return null
    }
  },
}

export default authService
```

**Key Implementation Details:**
- **Line 18:** Uses backend callback URL (not deep link) for Google Console compatibility
- **Lines 28-33:** Validates all responses with Zod schemas for type safety
- **Line 34:** Returns validated data or null on error
- **Lines 49-54:** Sends authorization code, state, and redirect URI to backend
- **Lines 59-64:** Validates completion response structure

### 4. Main OAuth Hook (`hooks/useGoogleAuth.ts`)

**Purpose:** Main orchestration logic for the complete OAuth flow.

#### Import Section and Setup

```typescript
import { useState } from 'react'
import {
  AuthState,
  CompleteAuthResponseSchema,
  CompleteAuthResponse,
} from '@/schemas/authSchemas'
import authService from '@/services/authService'
import { secureStorage } from '@/lib/secureStorage'
import * as WebBrowser from 'expo-web-browser'
import * as Updates from 'expo-updates'
import { useRouter } from 'expo-router'
import * as Linking from 'expo-linking'

interface OAuthCallbackParams {
  code?: string    // Authorization code from Google
  state?: string   // CSRF protection token
}

export const useGoogleAuth = () => {
  const router = useRouter()

  const [authState, setAuthState] = useState<AuthState>({
    isLoading: false,    // Controls loading spinner
    error: null,         // Error message for UI display
  })
```

#### CSRF Validation Function

```typescript
  const validateOAuthCallback = async (
    params: OAuthCallbackParams,
  ): Promise<boolean> => {
    const { code, state } = params

    // Step 1: Ensure both parameters exist
    if (!code || !state) {
      console.error('Missing code or state in callback URL')
      return false
    }

    // Step 2: Retrieve stored state for comparison
    const storedState = await secureStorage.getItem('oauth_state')

    // Step 3: CSRF Protection - compare states
    if (state !== storedState) {
      console.error('Invalid OAuth state - possible CSRF attempt')
      await secureStorage.deleteItem('oauth_state')  // Clean up
      return false
    }

    return true  // Validation passed
  }
```

**CSRF Protection Explanation:**
- **Lines 33-36:** Validates that both code and state parameters exist
- **Line 39:** Retrieves the state we stored before opening the OAuth URL
- **Lines 42-46:** Compares URL state with stored state - if they don't match, it's a security threat
- **Line 44:** Cleans up stored state if validation fails

#### Authentication Completion Function

```typescript
  const completeAuthentication = async (
    params: OAuthCallbackParams,
  ): Promise<CompleteAuthResponse | null> => {
    const { code, state } = params

    if (!code || !state) {
      console.error('Missing argument in completeAuthentication')
      return null
    }

    // Step 1: Send completion request to backend
    const authResult = await authService.completeAuth({
      code,
      state,
      redirectUri: `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/account/mobile-auth-callback`,
    })

    if (authResult === null) {
      console.error('Failed to complete authentication')
      return null
    }

    // Step 2: Validate response structure
    const validatedAuthResult = CompleteAuthResponseSchema.safeParse(authResult)
    if (!validatedAuthResult.success) {
      console.error('Invalid authentication result:', validatedAuthResult.error)
      return null
    }

    // Step 3: Store authentication data securely (parallel operations)
    Promise.all([
      secureStorage.setAppToken(authResult.token, authResult.expiresAt),  // JWT token
      secureStorage.setUserData(authResult.user),                        // User profile
      secureStorage.deleteItem('oauth_state'),                           // Cleanup CSRF token
    ])

    console.log('Authentication completed and stored successfully')
    return validatedAuthResult.data
  }
```

**Key Operations:**
- **Lines 55-57:** Sends code, state, and redirect URI to backend for token exchange
- **Lines 63-67:** Double validation with Zod schema
- **Lines 69-73:** Parallel storage operations for efficiency
- **Line 71:** Cleans up OAuth state after successful completion

#### OAuth Callback Handler

```typescript
  const handleOAuthCallback = async (callbackUrl: string): Promise<boolean> => {
    if (!callbackUrl) {
      console.error('No callback URL provided')
      return false
    }

    // Step 1: Parse deep link URL
    const { queryParams } = Linking.parse(callbackUrl)
    const params = queryParams as OAuthCallbackParams

    console.log('Parsed callback - Code:', params.code, 'State:', params.state)

    // Step 2: Validate CSRF protection
    const isValid = await validateOAuthCallback(params)
    if (!isValid) {
      return false
    }

    // Step 3: Complete authentication with backend
    const authResult = await completeAuthentication(params)
    if (!authResult) {
      return false
    }

    return true  // Success
  }
```

**URL Processing:**
- **Line 85:** Uses Expo Linking to parse `randomrecipe://auth?code=ABC&state=XYZ`
- **Line 86:** Extracts query parameters as typed object
- **Line 90:** Validates CSRF protection before proceeding
- **Line 95:** Completes authentication if validation passes

#### Post-Authentication Navigation

```typescript
  const redirectAfterAuth = async (): Promise<void> => {
    await secureStorage.setItem('post_login_redirect', '/hello')

    if (__DEV__) {
      Updates.reloadAsync()    // Reload app in development
    } else {
      router.push('/hello')    // Navigate in production
    }
  }
```

**Smart Navigation:**
- **Line 100:** Stores intended destination for deep link scenarios
- **Lines 102-106:** Development vs production navigation strategies

#### WebBrowser Result Handler

```typescript
  const handleAuthResult = async (
    result: WebBrowser.WebBrowserAuthSessionResult,
  ): Promise<boolean> => {
    switch (result.type) {
      case 'success':
        console.log('OAuth redirect URL:', result.url)
        const success = await handleOAuthCallback(result.url)
        if (success) {
          await redirectAfterAuth()
        }
        return false

      case 'cancel':
        console.log('User cancelled OAuth flow')
        return false

      default:
        console.error('Unknown WebBrowser result type:', result.type)
        console.error('Failed to complete OAuth flow:', result)
        return false
    }
  }
```

**Browser Result Types:**
- **Lines 114-119:** Success case - process callback URL and navigate
- **Lines 121-123:** User cancelled - log and return
- **Lines 125-129:** Error case - log error details

#### Main Sign-In Function

```typescript
  const signInWithGoogle = async () => {
    console.log('Signing in with Google')

    try {
      // Step 1: Set loading state for UI
      setAuthState({ isLoading: true, error: null })

      // Step 2: Get Google OAuth URL from backend
      const response = await authService.initializeAuth()

      if (response === null) {
        console.error('Failed to initialize authentication')
        return
      }

      // Step 3: Store state for CSRF protection
      await secureStorage.setItem('oauth_state', response.state)

      // Step 4: Open system browser with Google OAuth URL
      const result = await WebBrowser.openAuthSessionAsync(
        response.authUrl,
        'randomrecipe://auth',  // Deep link scheme for callback
      )

      // Step 5: Handle browser result
      await handleAuthResult(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error signing in with Google:', errorMessage)
      setAuthState({ isLoading: false, error: errorMessage })
      await secureStorage.deleteItem('oauth_state')  // Cleanup on error
    } finally {
      setAuthState((prev) => ({ ...prev, isLoading: false }))  // Always clear loading
    }
  }
```

**Complete Flow Orchestration:**
- **Line 136:** Sets loading state for UI feedback
- **Line 138:** Calls backend to initialize OAuth flow
- **Line 145:** Stores state for later CSRF validation
- **Lines 147-150:** Opens system browser (not WebView - Google blocks this)
- **Line 152:** Processes browser result and handles success/error
- **Lines 153-160:** Comprehensive error handling with cleanup
- **Lines 161-163:** Always clears loading state

#### Hook Return Interface

```typescript
  return {
    signInWithGoogle,              // Main function to start OAuth
    isLoading: authState.isLoading, // Loading state for UI
    error: authState.error,         // Error message for UI
  }
}
```

### 5. UI Component (`components/GoogleSignInButton.tsx`)

**Purpose:** Simple UI component that uses the OAuth hook.

```typescript
import { Pressable, Text, View, ActivityIndicator } from 'react-native'
import GoogleIcon from '@/components/icons/GoogleIcon'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'

const GoogleSignInButton = () => {
  const { signInWithGoogle, isLoading, error } = useGoogleAuth()

  const handlePress = async () => {
    await signInWithGoogle()  // Trigger OAuth flow
  }

  return (
    <View>
      <Pressable
        onPress={handlePress}
        className="flex-row items-center pl-2 pr-4 py-2 bg-white border border-gray-300 rounded"
      >
        <View className="mr-3">
          {isLoading && <ActivityIndicator size="small" color="#4285f4" />}
          {!isLoading && <GoogleIcon />}
        </View>

        <Text className="text-gray-700">
          {isLoading && 'Signing in...'}
          {!isLoading && 'Sign in with Google'}
        </Text>
      </Pressable>
      {error && (
        <Text className="text-red-500 text-sm mt-2 text-center">{error}</Text>
      )}
    </View>
  )
}

export default GoogleSignInButton
```

**UI State Management:**
- **Lines 18-20:** Shows loading spinner during OAuth process
- **Lines 23-25:** Updates text based on loading state
- **Lines 27-29:** Displays error messages if authentication fails

## OAuth Flow Sequence

### Complete Step-by-Step Flow

1. **User Interaction**
   ```
   User taps GoogleSignInButton → handlePress() → signInWithGoogle()
   ```

2. **Initialize OAuth**
   ```
   setAuthState(loading: true) → authService.initializeAuth() → Backend API call
   ```

3. **Backend Response**
   ```
   Backend returns { authUrl, state } → Store state locally → Open browser
   ```

4. **User Authentication**
   ```
   System browser opens → User logs in → Google redirects to backend callback
   ```

5. **Backend Proxy**
   ```
   Backend receives callback → Validates → Redirects to randomrecipe://auth
   ```

6. **Deep Link Processing**
   ```
   App receives deep link → Parse URL → Validate state → Complete authentication
   ```

7. **Token Exchange**
   ```
   Send code to backend → Backend exchanges with Google → Receive JWT token
   ```

8. **Secure Storage**
   ```
   Store JWT token → Store user profile → Clean up OAuth state → Navigate
   ```

## Security Features

### CSRF Protection
- **State Parameter:** Unique token generated by backend
- **Double Validation:** Validated by both frontend and backend
- **Session Storage:** Temporary storage with automatic cleanup

### Secure Token Storage
- **Expo SecureStore:** Platform secure storage (Keychain/Keystore)
- **Type Validation:** Zod schema validation for all data
- **Automatic Cleanup:** Removes invalid or expired data

### Error Handling
- **Comprehensive Logging:** All operations logged for debugging
- **Graceful Fallbacks:** Returns null/false instead of throwing
- **State Cleanup:** Removes OAuth state on errors

## Environment Configuration

### Required Environment Variables

```bash
# .env file (create this in your project root)
EXPO_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

**Important Notes:**
- **EXPO_PUBLIC_API_BASE_URL**: Must match your backend API domain exactly
- This variable is used throughout the OAuth flow for:
  - `/api/account/mobile-auth-init` endpoint calls
  - `/api/account/mobile-auth-complete` endpoint calls  
  - Setting the `redirectUri` for Google OAuth callbacks
- **Security**: The `EXPO_PUBLIC_` prefix makes this variable available to the client
- **Development**: Use your local development server URL (e.g., `https://localhost:7001`)
- **Production**: Use your deployed API domain

### Deep Link Configuration

```json
// app.json
{
  "expo": {
    "name": "random-recipe-router-mobile",
    "slug": "random-recipe-router-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "randomrecipe",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.anonymous.randomreciperoutermobile"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

**Key Deep Link Configuration:**
- **Line 8:** `"scheme": "randomrecipe"` - This enables the `randomrecipe://auth` deep link
- **Line 21:** `"package": "com.anonymous.randomreciperoutermobile"` - Android package identifier
- **Note:** iOS bundle identifier is automatically generated by Expo based on the slug and account
- **Expo Router:** Uses `expo-router` plugin for navigation (Line 21)

## Usage Examples

### Basic Implementation

```typescript
import { useGoogleAuth } from '@/hooks/useGoogleAuth'

const LoginScreen = () => {
  const { signInWithGoogle, isLoading, error } = useGoogleAuth()

  return (
    <View>
      <GoogleSignInButton />
      {error && <Text>Error: {error}</Text>}
    </View>
  )
}
```

### Token Usage for API Calls

```typescript
import { secureStorage } from '@/lib/secureStorage'

const ApiService = {
  async makeAuthenticatedRequest(endpoint: string) {
    const token = await secureStorage.getAppToken()
    
    if (!token) {
      throw new Error('No authentication token')
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    return response.json()
  }
}
```

## Troubleshooting

### Common Issues

1. **State Mismatch Error**
   - **Cause:** Timing issue or multiple OAuth attempts
   - **Solution:** Clear app storage and try again

2. **Deep Link Not Working**
   - **Cause:** URL scheme not properly configured
   - **Solution:** Check app.json scheme configuration

3. **Backend Connection Errors**
   - **Cause:** Wrong API URL or backend not running
   - **Solution:** Verify EXPO_PUBLIC_API_BASE_URL

4. **Token Storage Fails**
   - **Cause:** Expo SecureStore not available
   - **Solution:** Test on physical device, not simulator

### Debugging Tips

1. **Enable Detailed Logging**
   ```typescript
   // Add to useGoogleAuth.ts
   console.log('OAuth state stored:', response.state)
   console.log('Callback URL received:', result.url)
   ```

2. **Check Token Validity**
   ```typescript
   const isExpired = await secureStorage.isTokenExpired()
   console.log('Token expired:', isExpired)
   ```

3. **Validate Deep Link**
   ```typescript
   // Test deep link parsing
   const parsed = Linking.parse('randomrecipe://auth?code=test&state=test')
   console.log('Parsed:', parsed)
   ```

## Implementation Status

- ✅ **OAuth Flow:** Complete and secure
- ✅ **CSRF Protection:** Implemented with state validation
- ✅ **Secure Storage:** Expo SecureStore integration
- ✅ **Error Handling:** Comprehensive with cleanup
- ✅ **Type Safety:** Full TypeScript with Zod validation
- ✅ **UI Components:** Production-ready components

 