<script lang="ts">
  import { route } from '$lib/route'
  import { storage } from '$db/storage'
  import { HTTPerror, csfetch } from '$lib'
  import Spinner from '$components/spinner.svelte'
  import { FormStates as States } from '$lib/form-states'
  import { formatError } from '$lib'
  import { LoginActions, UpgradeActions } from '$lib/auth-actions'
  import userStore from '$stores/user'
  import { goto } from '$app/navigation'

  // #region Mount
  // #endregion
  
  // #region State

  let state = States.Resting
  let message = ''

  // Authentication actions
  let actions: LoginActions

  // Show the box to enter username or email to confirm account deletion
  let showConfirm = false
  // Password used to upgrade to level 2 auth
  let password = ''

  // Token for API confirmation
  type DeleteToken = {
    token: string
  }

  // #endregion

  // #region Logic

  async function deleteAccount(): Promise<void> {
    state = States.Saving
    message = 'Upgrading authentication level'

    try {
      // Upgrade to level 2 auth
      if (actions == null) {
        actions = new LoginActions(
          new Worker(LoginActions.Argon2_WorkerPath),
          new Worker(LoginActions.ED25519_WorkerPath))
        await actions.loadArgon2({ wasmRoot: LoginActions.Argon2_WASMRoot, simd: true })
        await actions.loadED25519({ wasmPath: LoginActions.ED25519_WASMPath })
      }
      // TODO: use TOTP upgrade if available
      await UpgradeActions.passwordUpgrade(actions, password)

      // Request deletion token
      let res = await csfetch(route('/delete_my_account_please'), {
        method: 'DELETE',
        headers: {
          'CSRF-Token': storage.getCSRFtoken()
        }
      })
      if (res.status !== 200) {
        throw new Error(await HTTPerror(res, 'Failed to initialize account deletion'))
      }
      // Store the deletion token, which is required to finalize account deletion
      const token = (await res.json() as DeleteToken).token

      // Finalize deletion
      res = await csfetch(route('/delete_my_account_please'), {
        method: 'DELETE',
        headers: {
          'CSRF-Token': storage.getCSRFtoken(),
          'X-Confirm': token
        }
      })
      if (res.status !== 200) {
        state = States.Errored
        message = await HTTPerror(res, 'Failed to finalize account deletion')
        return
      }
      // Show the user notification that their account has been deleted
      state = States.Saved
      message = 'Your account has been deleted; you will be redirected in 5 seconds.'
    } catch (err) {
      state = States.Errored
      message = formatError(err instanceof Error ? err.message : (err as string).toString())
      await UpgradeActions.downgrade() // If the account wasn't deleted, auth should be downgraded
      return
    }

    userStore.logout()
    setTimeout(() => {
      goto('/')
    }, 5000)
  }


  // #endregion

</script>

<section class="settings-menu-container">
  <article class="delete-account">
    <h2>
      <i class="fas fa-exclamation-circle"></i>
        Delete Account
    </h2>
  
    <p class="warning">
      Warning! Once your account is deleted, all associated data will be immediately and permanently gone from CSplan's servers. This action is irreversible.
    </p>

    {#if state === States.Resting && !showConfirm}
    <button class="delete-account" 
      on:click={() => {
        showConfirm = true
      }}
    >
      Delete CSplan Account
    </button>
    {/if}

    {#if showConfirm}
    <section class="confirmation">
      <h3>Confirm Account Deletion</h3>

      <label>
        <header class="confirm-prompt">Enter your password:</header>
        <input type="password" placeholder={'*'.repeat(30)} bind:value={password}>
      </label>

      <button class="delete-account" disabled={password.length === 0} on:click={() => {
        deleteAccount()
      }}>
        <i class="fas fa-exclamation-circle"></i>
        Permanently Delete CSplan Account
        <i class="fas fa-exclamation-circle"></i>
      </button>

      <Spinner {state} {message}/>

      <button class="cancel" on:click={() => {
        password = ''
        showConfirm = false
      }}>
        <i class="far fa-arrow-left"></i>
        Cancel
      </button>

    </section>
    {/if}
  </article>
</section>

<style lang="scss">
  @import '../position.scss';
  section.settings-menu-container {
    @include settings-menu-container;
  }
  section.settings-menu-container :global {
    @include form-styles;
  }

  article {
    margin: 1.5rem 0;
    color: #111;
    background: #fff;
    border: 1px solid $danger-red;
    padding: $padding-m;
  }
  article,section {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  h2 {
    width: 100%;
    text-align: center;
    border-bottom: 1px solid $danger-red;
    i {
      color: $danger-red;
    }
  }
  h3 {
    width: 100%;
    text-align: center;
    
    padding: 0.5rem 0;
    margin: 0.3rem 0;
  }

  button.delete-account {
    background-color: $danger-red;
    padding: 1rem;
  }
  button.cancel {
    padding: 0.6rem;
    background: $bg-dark;
    align-self: flex-start;
  }

  section.confirmation {
    padding-top: 1rem;
    margin-top: 1rem;
    border-top: 1px solid #ccc;
  }
</style>