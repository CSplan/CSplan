import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = () => {
  return {
    status: 302,
    headers: {
      Location: '/settings/account'
    }
  }
}
