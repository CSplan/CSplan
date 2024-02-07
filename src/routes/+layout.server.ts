import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = ({ locals, route }) => {
  authenticateRoute(route.id, locals.user?.authLevel || 0)
  return locals
}

type RouteAuth = {
  authLevel: number // Required auth level
  recursive: boolean // If the auth requirement also applies to child routes
}

// Generate a map of route authentication levels
const routeAuth = new Map<string, RouteAuth>() // Route auth requirements that don't apply to children
{
  // Routes to prevent any authenticated (identified) user from accessing
  const lvl0Auth = ['login/', 'register/']
  // Routes that only may be accessed by lvl1+ authenticated users
  const lvl1Auth = ['lists/', 'tags/', 'settings/', 'payment']

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const assignRoute = (path: string, authLevel: number) => {
    if (path.endsWith('/')) {
      routeAuth.set(path.slice(0, path.length-1), {
        authLevel,
        recursive: true
      })
    } else {
      routeAuth.set(path, {
        authLevel,
        recursive: false
      })
    }
  }

  for (const path of lvl0Auth) assignRoute(path, 0)
  for (const path of lvl1Auth) assignRoute(path, 1)
}

/** Returns whether a route should be redirected. */
function authenticateRoute(routeID: string|null, authLevel: number): void {
  if (routeID === null) {
    return
  }
  const path = routeID.split('/')
  const auth = routeAuth.get(path[0])
  if (auth != null) {
    if (path.length > 1 && !auth.recursive) {
      return
    }
    // If authlevel 0 is specified, an exact match is required
    if (auth.authLevel === 0) {
      // Redirecting a logged in user from a lvl0 only page is not insufficient auth, so a 303 (see other) is used instead
      if (authLevel === auth.authLevel) {
        return
      }
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw redirect(303, '/lists')
    }
    if (authLevel >= auth.authLevel) {
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw authLevel > 0 ? redirect(303, '/lists') : redirect(303, '/')
  }
}
