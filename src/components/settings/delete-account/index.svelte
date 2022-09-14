<script lang="ts">
  import { route } from '$lib/route'
  import { storage } from '$db/storage'
  import { HTTPerror, csfetch } from '$lib'
  import Spinner from '$components/spinner.svelte'
  import { FormStates as States } from '$lib/form-states'
  import { LoginActions, UpgradeActions } from '$lib/auth-actions'
  import { goto, invalidateAll } from '$app/navigation'
  import AccountTypes from '$lib/account-types'
  import stripeCID from '$stores/stripe/customer-id'
  export let paymentStatus: App.Locals['paymentStatus']

  function formatTimestamp(timestamp: number): string {
    const d = new Date(timestamp * 1000)
    
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const pad = (s: number) => s.toString().padStart(2, '0')

    const offsetHours = Math.floor(d.getTimezoneOffset()/60)
    const offsetMinutes = Math.floor(d.getTimezoneOffset()%60)
    const offset = `UTC${offsetHours > 0 ? '+' : '-'}${Math.abs(offsetHours).toString().padStart(2, '0')}:${Math.abs(offsetMinutes).toString().padStart(2, '0')}`
    return `${pad(d.getHours())}:${pad(d.getMinutes())}, ${pad(d.getMonth())}/${pad(d.getDate())}/${d.getFullYear()} ${offset}`
  }

  // #region State

  let state = States.Resting
  let message = ''

  // Authentication actions
  let actions: LoginActions

  // Show the box to enter username or email to confirm account deletion
  let showConfirm = false
  let paidAccountConfirm = {
    show: false,
    confirmed: false
  }
  let paidUntilTimestamp = ''
  $: if (paymentStatus!.accountType !== AccountTypes.Free) {
    paidUntilTimestamp = formatTimestamp(paymentStatus!.paidUntil!)
  }
  // Password used to upgrade to level 2 auth
  let password = ''

  // Token for API confirmation
  type DeleteToken = {
    token: string
  }

  // #endregion

  // #region Logic

  async function preConfirm(): Promise<void> {
    if (paymentStatus!.accountType !== AccountTypes.Free && !paidAccountConfirm.confirmed) {
      paidAccountConfirm.show = true
      'You will lose this time with no refund upon account deletion.'
      return
    }
    showConfirm = true
  }

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

      // Delete Stripe account
      await stripeCID.init()
      if ($stripeCID.exists) {
        await stripeCID.delete()
      }

      // Confirm deletion if paid time exists
      let token: string
      {
        const headers: Record<string, string> = {}
        if (paymentStatus!.accountType !== AccountTypes.Free && paidAccountConfirm.confirmed) {
          headers['X-Delete-Paid-Account'] = 'true'
        }

        // Request deletion token
        const res = await csfetch(route('/delete_my_account_please'), {
          method: 'DELETE',
          headers
        })
        if (res.status !== 200) {
          throw await HTTPerror(res, 'Failed to initialize account deletion')
        }
        // Store the deletion token, which is required to finalize account deletion
        token = (await res.json() as DeleteToken).token
      }

      // Finalize deletion
      const res = await csfetch(route('/delete_my_account_please'), {
        method: 'DELETE',
        headers: {
          'CSRF-Token': storage.getCSRFtoken(),
          'X-Confirm': token
        }
      })
      if (res.status !== 200) {
        state = States.Errored
        throw await HTTPerror(res, 'Failed to finalize account deletion')
      }
      // Show the user notification that their account has been deleted
      state = States.Saved
      message = 'Your account has been deleted. You will be redirected in 5 seconds.'
      setTimeout(async () => {
        await invalidateAll()
        goto('/')
      }, 5000)
    } catch (err) {
      state = States.Errored
      message = err instanceof Error ? err.message : `${err}`
      await UpgradeActions.downgrade() // If the account wasn't deleted, auth should be downgraded
    }
  }


  // #endregion

</script>

<section class="settings-menu-container">
  <article class="delete-account">
    <h2>
        Delete Account
    </h2>
  
    <p class="warning">
      Warning! Once your account is deleted, all associated data will be immediately and permanently gone from CSplan's servers. This action is irreversible.
    </p>

    {#if state === States.Resting && !showConfirm}
    <button class="delete-account" 
      on:click={() => {
        paidAccountConfirm.confirmed = false
        preConfirm()
      }}
    >
      Delete CSplan Account
    </button>
    {/if}

    {#if paidAccountConfirm.show} 
      <section class="confirmation">
        <h3>
          <i class="fas fa-exclamation-triangle"></i>
          WARNING: Paid Account Deletion
          <i class="fas fa-exclamation-triangle"></i>
        </h3>

        <p class="confirm-paid-account">
          This account has paid for CSplan Pro until {paidUntilTimestamp}.
          <br>
          You will lose this time with no refund upon account deletion.
          <br>
          <b>Are you sure you wish to proceed?</b>
        </p>

          <button class="delete-account confirm-paid-account"
          on:click={() => {
            paidAccountConfirm.show = false
            paidAccountConfirm.confirmed = true
            preConfirm()
          }}>Yes, I'm sure</button>
      <button class="cancel" on:click={() => {
        paidAccountConfirm.show = false
      }}>
        <i class="far fa-arrow-left"></i>
        Cancel
      </button>
      </section>
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
    background: $bg-primary;
    color: $text-normal;
    border: 1px solid $danger-red;
    padding: $padding-m;
  }
  p {
    line-height: 1.5;
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
  }
  h3 {
    width: 100%;
    text-align: center;
    i {
      color: $danger-red;
    }
    
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
    border-top: 1px solid $border-normal;
  }
  p.confirm-paid-account {
    text-align: center;
    margin-top: 0 !important;
  }
  button.confirm-paid-account{
    background: $bg-alt;
  }
</style>