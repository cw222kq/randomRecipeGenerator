import { ZodSchema } from 'zod'

const validateData = <T>(
  data: unknown,
  schema: ZodSchema<T>,
  context: string,
): T | null => {
  const validatedData = schema.safeParse(data)

  if (!validatedData.success) {
    console.error(
      `${context} validation failed: `,
      validatedData.error.format(),
    )
    return null
  }
  return validatedData.data
}

export default validateData
