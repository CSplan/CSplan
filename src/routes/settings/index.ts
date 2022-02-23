import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler = () => {
  return {
    status: 302,
    headers: {
      Location: '/settings/account'
    }
  }
}
