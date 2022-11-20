import { csfetch } from '$lib/csfetch'
import { route } from '$lib/route'
import { invalidateAll } from '$app/navigation'

export async function saveSetting(setting: keyof App.Locals['settings'], value: boolean): Promise<void> {
  const body: Partial<App.Locals['settings']> = {
    [setting]: value
  }
  await csfetch(route('/settings'), {
    method: 'PATCH',
    body: JSON.stringify(body)
  })
  await invalidateAll()
}
