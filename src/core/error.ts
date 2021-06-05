export async function checkResponse(res: Response, expectedStatus: number): Promise<void> {
  if (res.status !== expectedStatus) {
    try {
      const err: ErrorResponse = await res.json()
      throw new Error(`${err.message || 'error processing response'} (status ${res.status})`)
    } catch {
      throw new Error('unknown error processing response')
    }
  }
}