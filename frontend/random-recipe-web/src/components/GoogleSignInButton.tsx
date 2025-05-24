'use client'

import GoogleButton from 'react-google-button'
import { login } from '@/services/userService'

export default function GoogleSignInButton() {
  return <GoogleButton onClick={() => login()} />
}
