<script>
  import { onMount } from 'svelte'
  import user from '../stores/user'
  class AuthError extends Error {
    constructor({ message = '', code = '' }) {
      super(message)
      this.code = code
    }
  }

  // Authenticate the user before providing clientside login information
  onMount(async () => {
    if (!$user.isLoggedIn && localStorage.getItem('isLoggedIn')) {
      try {
        const res = await fetch('http://localhost:3000/whoami', {
          headers: {
            'CSRF-Token': localStorage.getItem('CSRF-Token')
          },
          credentials: 'include'
        })
        if (res.status === 200) {
          user.login(JSON.parse(localStorage.getItem('user')))
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

<slot></slot>
