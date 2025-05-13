'use client'

import GoogleButton from 'react-google-button'

export default function GoogleSignInButton() {
  return (
    <GoogleButton
      onClick={() =>
        (window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/login-google`)
      }
    />
  )
}
