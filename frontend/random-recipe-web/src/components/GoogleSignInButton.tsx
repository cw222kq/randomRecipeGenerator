'use client'

import GoogleButton from 'react-google-button'
import { loginWithGoogle } from '@/services/userService'

export default function GoogleSignInButton() {
  return <GoogleButton onClick={() => loginWithGoogle()} />
}
