<script lang="ts">
  import Navbar from '$components/navbar/navbar.svelte'
  import { onMount } from 'svelte'
  import { route, csfetch, HTTPerror } from '$lib'
  import AuthError from '$lib/auth-error'
  import type { LayoutServerData } from './$types'
  export let data: LayoutServerData

  // Authenticate the user before providing clientside login information
  onMount(async () => {
    if (data.isLoggedIn) {
      return
    }
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const localUser: LayoutServerData['user'] = JSON.parse(localStorage.getItem('user') || '{}')

    if (localUser.isLoggedIn) {
      try {
        const res = await csfetch(route('/whoami'))
        if (res.status === 401) {
          throw new AuthError((await HTTPerror(res, 'User is not logged in.')).toString(), AuthError.NotLoggedIn)
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
  <link rel="stylesheet" href="/css/theme/{data.settings.darkMode ? 'dark' : 'light'}.css">
</svelte:head>

<Navbar/>

<slot></slot>
