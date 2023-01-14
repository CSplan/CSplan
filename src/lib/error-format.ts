export function formatError(err: string): string {
  return err[0].toUpperCase() + err.slice(1)
}

export async function HTTPerror(res: Response, fallbackMessage: string): Promise<Error> {
  let message = `${fallbackMessage} (status ${res.status})`
  try {
    const err: ErrorResponse = await res.json()
    if (err.title && err.message) {
      message = `${err.title}: ${err.message}`
    }
  } catch{}
  return new Error(message)
}