<script>
  // @ts-nocheck
  import Navbar from '../components/navbar/navbar.svelte'
  import { onMount } from 'svelte'
  import user from '../stores/user'
  import { route } from '../core'
  class AuthError extends Error {
    constructor({ message = '', code = '' }) {
      super(message)
      this.code = code
    }
  }

  // Authenticate the user before providing clientside login information
  onMount(async () => {
    if (!$user.isLoggedIn && localStorage.getItem('isLoggedIn')) {
      user.login(JSON.parse(localStorage.getItem('user'))) // Temporarily pretend the user is authenticated while we await verification
      try {
        const res = await fetch(route('/whoami'), {
          headers: {
            'CSRF-Token': localStorage.getItem('CSRF-Token')
          },
          credentials: 'include'
        })
        const body = await res.json()
        if (res.status === 200) {
          user.login({
            ...JSON.parse(localStorage.getItem('user')),
            id: body.id
          })
        } else {
          throw new AuthError({
            code: 'NOT_LOGGED_IN'
          })
        }
        // If user does not authenticate for any reason, log out clientside
      } catch (err) {
        if (err.code === 'NOT_LOGGED_IN') {
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
</svelte:head>

<Navbar/>

<slot></slot>
