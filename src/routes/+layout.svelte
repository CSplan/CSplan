<script lang="ts">
  import Navbar from '$components/navbar/navbar.svelte'
  import { onMount } from 'svelte'
  import { route, csfetch, HTTPerror } from '$lib'
  import type { LayoutServerData } from './$types'
  import { pageStorage, userActions } from '$lib/page'
  export let data: LayoutServerData

  // Authenticate the user before providing clientside login information
  onMount(async () => {
    if (data.isLoggedIn) { // If SSR succeeded, we know the user is successfully logged in and all data is accurate
      pageStorage.setAll(data)
      return
    }

    if (pageStorage.getItem('isLoggedIn') === 'true') { // If SSR didn't succeed, but isLoggedIn is set in localStorage, attempt to validate authentication with whoami
      try {
        const res = await csfetch(route('/whoami'))
        if (res.status === 401) { // If the user is unauthorized, logout of their session
          await userActions.logout()
          return
        } else if (res.status !== 200) {
          throw await HTTPerror(res, 'Failed to authenticate.')
        }
        // If auth is valid, but SSR failed, it means SSR is broken
        alert('Failed to initialize page data. You should never see this error.\n' +
        'If you\'re seeing it anyway, it means part of CSplan\'s rendering is broken.\n' +
        'Check https://status.csplan.co for details, and email support@csplan.co if the issue hasn\'t been reported.')
      } catch (err) {
        alert('Either you\'re offline or CSplan\'s API is down.\n' +
        'Check https://status.csplan.co for details.')
      }
    }
  })
</script>

<svelte:head>
  <title>CSplan</title>
  <link rel="stylesheet" href="/css/theme/{data.settings.darkMode ? 'dark' : 'light'}.css">
</svelte:head>

<Navbar user={data.user}/>

<slot></slot>
