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
  <p class="totp-info">
    Time based one time passwords allow you to require a second form of authentication for improved log-in security. Enabling this feature requires a separate application capable of manging TOTP codes such as <a href="https://apps.apple.com/us/app/raivo-otp/id1459042137">Ravio OTP</a>, <a href="https://getaegis.app/">Aegis Authenticator</a>, <a href="https://authy.com/">Authy</a>, or <a href="https://keepassxc.org/">KeepassXC</a>.
  </p>
  <hr>
  <div class="totp-toggle">
    <label>
      <span>TOTP as second factor auth</span>
      <select bind:value={enabled}>
        <option value="{false}">Disabled</option>
        <option value="{true}">Enabled</option>
      </select>
    </label>

  </div>
</form>

<style lang="scss">
  form.totp-status {
    margin: 0.5rem 0;
    display: flex;
    flex-direction: column;
  }
  p.totp-info {
    margin-top: 0 !important;
  }
  hr {
    width: 100%;
    color: #aaa;
    border-top: 1px;
  }
</style>