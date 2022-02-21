/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get() { // Redirect /settings to /settings/account with a 302 Found status code
  return {
    status: 302,
    headers: {
      'Location': '/settings/account'
    }
  }
}