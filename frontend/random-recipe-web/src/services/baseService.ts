interface GetOptions {
  credentials?: RequestCredentials
}

interface PostOptions {
  credentials?: RequestCredentials
}

interface DeleteOptions {
  credentials?: RequestCredentials
}

interface PutOptions {
  credentials?: RequestCredentials
}

const getRequest = async <T>(
  endpoint: string,
  options: GetOptions = {},
  context: string = 'data',
): Promise<T | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
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

const postRequest = async <T>(
  endpoint: string,
  data: unknown,
  options: PostOptions = {},
  context: string = 'data',
): Promise<T | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        ...options,
      },
    )

    if (!response.ok) {
      console.error(
        `Failed to post ${context}: ${response.status} ${response.statusText}`,
      )
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Error posting ${context}`, error)
    return null
  }
}

const deleteRequest = async (
  endpoint: string,
  options: DeleteOptions = {},
  context: string = 'data',
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
      {
        method: 'DELETE',
        credentials: 'include',
        ...options,
      },
    )

    if (!response.ok) {
      console.error(
        `Failed to delete ${context}: ${response.status} ${response.statusText}`,
      )
      return false
    }

    return true
  } catch (error) {
    console.error(`Error deleting ${context}`, error)
    return false
  }
}

const putRequest = async <T>(
  endpoint: string,
  data: unknown,
  options: PutOptions = {},
  context: string = 'data',
): Promise<T | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        ...options,
      },
    )

    if (!response.ok) {
      console.error(
        `Failed to update ${context}: ${response.status} ${response.statusText}`,
      )
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Error updating ${context}`, error)
    return null
  }
}

export { getRequest, postRequest, deleteRequest, putRequest }
