const userService = {
  async initializeAuth() {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/account/mobile-auth-init`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redirectUri: 'randomrecipe://auth',
        }),
      },
    )

    return response.json()
  },
}

export default userService
