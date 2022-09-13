import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = ({ locals, routeId }) => {
  console.log(routeId)
  return locals
}
