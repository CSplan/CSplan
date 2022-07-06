<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit'
  import type { RenderSession } from '$hooks'
  import { settings } from '$stores/settings'

  export const load: Load = ({ session }) => {
    const s = session as RenderSession
    // If the user is logged in, initialize settings from cookies
    if (s.isLoggedIn) {
      if (s.settings != null) {
        settings.init(s.settings) 
      }
    }

    return {}
  }
</script>

<script>
  // @ts-nocheck
  import Navbar from '$components/navbar/navbar.svelte'
  import { onMount } from 'svelte'
  import user from '$stores/user'
  import { route, csfetch } from '$lib'
  class AuthError extends Error {
    constructor({ message = '', code = '' }) {
      super(message)
      this.code = code
    }
  }

  // Authenticate the user before providing clientside login information
  onMount(async () => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!$user.isLoggedIn && localStorage.getItem('isLoggedIn') === 'true') {
      user.login(JSON.parse(localStorage.getItem('user'))) // Temporarily pretend the user is authenticated while we await verification
      try {
        const res = await csfetch(route('/whoami'))
        const body = await res.json()
        if (res.status === 200) {
          user.login({
            ...JSON.parse(localStorage.getItem('user')),
            id: body.userID,
            verified: body.verified,
            email: body.email
          })
        } else {
          throw new AuthError({
            code: 'NOT_LOGGED_IN'
          })
        }
        // If user does not authenticate for any reason, log out clientside
      } catch (err) {
        if (err.code === 'NOT_LOGGED_IN') {
          console.error('failed backend authentication')
          user.logout()
        } else {
          alert('Either you\'re offline or the API is down. Check /status for more information.')
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
