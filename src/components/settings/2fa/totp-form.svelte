<script lang="ts">
  import { HTTPerror, route } from '$lib'
  import { onMount } from 'svelte'

  let enabled = false

  onMount(async () => {
    const res = await fetch(route('/totp/status'))
    if (res.status !== 200) {
      throw new Error(await HTTPerror(res, 'Failed to retrieve TOTP status'))
    }
    const status: TOTPStatus = await res.json()
    enabled = status.enabled
  })
</script>

<form class="totp-status" on:submit|preventDefault>
  <p class="totp-info">
    Time based one time passwords allow you to require a second form of authentication for improved log-in security. Enabling this feature requires a separate application capable of manging TOTP codes such as <a href="https://apps.apple.com/us/app/raivo-otp/id1459042137">Ravio OTP</a>, <a href="https://getaegis.app/">Aegis Authenticator</a>, <a href="https://authy.com/">Authy</a>, or <a href="https://keepassxc.org/">KeepassXC</a>.
    <i class="fas fa-info-circle endorsement-tooltip" title="CSplan does not endorse nor test any of the examples provided, users should verify the reliability and security of any TOTP application before trusting it to manage codes."/>
  </p>
  <hr>

  <div class="totp-indicator" class:enabled>
    <i class="{enabled ? 'fas fa-check-circle' : 'far fa-circle'} totp-indicator"></i>
    <span>TOTP is {enabled ? 'enabled' : 'disabled'}</span>
  </div>
  {#if enabled}
    <input class="totp-button disable-button" type="button" value="Disable TOTP">
  {:else}
    <input class="totp-button enable-button" type="button" value="Enable TOTP">
  {/if}

  <label>
    Password
    <input type="password" placeholder="Enter your password to {enabled ? 'disable' : 'enable'} TOTP">
  </label>

  <div class="bottom-buttons">
    <input type="button" value="Cancel" class="cancel-button">
    <input type="submit" value="Confirm" class="submit-button">
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
  i.endorsement-tooltip {
    font-size: 1rem;
    &:hover {
      opacity: 50%;
    }
  }
  div.totp-indicator {
    display: flex;
    flex-direction: row;
    align-items: center;

    font-size: 110%;
    color: rgb(87, 87, 87);
    i {
      font-size: 150%;
      margin-right: 0.5rem;
    }
    &.enabled {
      color: $success-green;
    }
  }

  input.enable-button {
    background-color: $bold-blue;
    color: white;
  }
  input.disable-button {
    background-color: $danger-red;
    color: white;
  }
  input.totp-button {
    width: max-content;
    align-self: center;
  }

  hr {
    width: 100%;
    color: #aaa;
    border-top: 1px;
  }

  div.bottom-buttons {
    display: grid;
    grid-template-columns: max-content 8fr 2fr;
  }
  input.cancel-button {
    grid-column: 1;
    background-color: $danger-red;
    color: white;
  }
  input.submit-button {
    grid-column: 3;
  }
</style>