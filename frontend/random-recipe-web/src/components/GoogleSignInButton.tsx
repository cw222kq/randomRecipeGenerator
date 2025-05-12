'use client'

import GoogleButton from 'react-google-button'

export default function GoogleSignInButton() {
  return (
    <GoogleButton
      onClick={() =>
        (window.location.href =
          'https://localhost:7087/api/account/login-google')
      }
    />
  )
}
