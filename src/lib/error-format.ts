export function formatError(err: string): string {
  return err[0].toUpperCase() + err.slice(1)
}
