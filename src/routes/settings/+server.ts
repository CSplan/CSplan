import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = () => {
  return new Response(undefined, {
    status: 302,
    headers: {
      Location: '/settings/account'
    }
  })
}
