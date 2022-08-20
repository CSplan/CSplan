<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit'
  import type { RenderSession } from '$hooks'
  import settings from '$stores/settings'
  import paymentStatus from '$stores/payment-status'
  import user from '$stores/user'

  export const load: Load = ({ session }) => {
    const s = session as RenderSession
    // If the user is logged in, initialize settings from cookies
    if (s.isLoggedIn) {
      user.set(s.user)
      if (s.paymentStatus != null) {
        paymentStatus.set(s.paymentStatus)
      }
    }
    if (s.settings != null) {
      settings.set(s.settings) 
    }

    return {}
  }
</script>

<script lang="ts">
  import type { User } from '$stores/user'
  import Navbar from '$components/navbar/navbar.svelte'
  import { onMount } from 'svelte'
  import { route, csfetch, HTTPerror } from '$lib'
  import AuthError from '$lib/auth-error'

  // Authenticate the user before providing clientside login information
  onMount(async () => {
    if ($user.isLoggedIn) {
      return
    }
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const localUser: User = JSON.parse(localStorage.getItem('user') || '{}')

    if (localUser.isLoggedIn) {
      user.set(localUser)
      try {
        const res = await csfetch(route('/whoami'))
        if (res.status === 401) {
          throw new AuthError(await HTTPerror(res, 'User is not logged in.'), AuthError.NotLoggedIn)
        } else if (res.status !== 200) {
          throw await HTTPerror(res, 'Failed to authenticate')
        }
        // If user does not authenticate for any reason, log out clientside
      } catch (err) {
        if (err instanceof AuthError && err.code === 'NOT_LOGGED_IN') {
          user.logout()
        } else {
          alert('Either you\'re offline or CSplan\'s API is down.') // TODO: implement status page 
        }
      }
    }
  })
</script>

<svelte:head>
  <title>CSplan</title>
  <link rel="stylesheet" href="/css/theme/{$settings.darkMode ? 'dark' : 'light'}.css">
</svelte:head>

<Navbar/>

<slot></slot>
