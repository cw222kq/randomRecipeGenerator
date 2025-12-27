interface RequestOptions {
  credentials?: RequestCredentials
}

const getRequest = async <T>(
  endpoint: string,
  options: RequestOptions = {},
  context: string = 'data',
): Promise<T | null> => {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}${endpoint}`,
      options,
    )

    if (!response.ok) {
      console.error(
        `Failed to get ${context}: ${response.status} ${response.statusText}`,
      )
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Error getting ${context}`, error)
    return null
  }
}

export { getRequest }
