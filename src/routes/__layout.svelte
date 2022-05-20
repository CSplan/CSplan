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
          // If a CSRF-Token header is sent from /whoami, it signals that the old CSRF token has expired and the new token must be used for further requests
          user.login({
            ...JSON.parse(localStorage.getItem('user')),
            id: body.userID
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
          // user.logout()
        } else {
          alert('Either you\'re offline or the API is down. Check /status for more information.')
        }
      }
    }
  })
</script>

<svelte:head>
  <title>CSplan</title>
</svelte:head>

<Navbar/>

<slot></slot>
