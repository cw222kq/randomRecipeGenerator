'use client'

import GoogleButton from 'react-google-button'

export default function GoogleSignInButton() {
  return <GoogleButton onClick={() => console.log('Google sign in')} />
}
