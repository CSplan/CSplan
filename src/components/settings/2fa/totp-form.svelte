<script lang="ts">
  import { HTTPerror, route } from '$lib'
  import { onMount } from 'svelte'

  let enabled = false

  onMount(async () => {
    const res = await fetch(route('/totp/status'), {
      method: 'GET',
      headers: {
        'CSRF-Token': localStorage.getItem('CSRF-Token')!
      }
    })
    if (res.status !== 200) {
      console.error(HTTPerror(res, 'Failed to retrieve TOTP status'))
      return
    }
    const status: TOTPStatus = await res.json()
    enabled = status.enabled
  })
</script>

<form class="totp-status">
  <span class="bold">TOTP</span>
  <select bind:value={enabled}>
    <option value="{false}">Disabled</option>
    <option value="{true}">Enabled</option>
  </select>
</form>

<style lang="scss">
  form.totp-status {
    margin: 0.5rem 0;
  }
  span.bold {
    font-weight: 600;
  }
</style>