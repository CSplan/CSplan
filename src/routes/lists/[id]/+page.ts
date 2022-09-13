import type { PageLoad } from './$types'

export const load: PageLoad<{id: string}> = ({ params }) => {
  return {
    id: params.id
  }
}
