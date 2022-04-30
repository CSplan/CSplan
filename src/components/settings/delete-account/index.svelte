<script lang="ts">
  import { route } from '$lib/route'
  import { storage } from '$db/storage'
  import { HTTPerror } from '$lib'
  import Spinner from '$components/spinner.svelte'
  import { FormStates as States } from '$lib/form-states'
  
  // #region State

  let state = States.Resting
  let message = ''

  // Show the box to enter username or email to confirm account deletion
  let showConfirm = true
  // Email entered to confirmation box, must match with account email to confirm account deletion
  let email: string
  let emailMatches = false
  $: emailMatches = email === storage.getUser().email

  // Token for API confirmation
  type DeleteToken = {
    token: string
  }

  // #endregion

  // #region Logic

  async function deleteAccount(): Promise<void> {
    state = States.Loading
    message = 'Preparing account deletion'
    const res = await fetch(route('/delete_my_account_please'), {
      method: 'POST',
      headers: {
        'CSRF-Token': storage.getCSRFtoken()
      }
    })
    if (res.status !== 200) {
      state = States.Errored
      message = await HTTPerror(res, 'Failed to initialize account deletion')
      return
    }
    // Store the deletion token, which is required to finalize account deletion
    const token = (await res.json() as DeleteToken).token
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
        <header class="confirm-prompt">Enter your account's email address:</header>
        <input type="email" placeholder="user@csplan.co" bind:value={email}>
      </label>

      <button class="delete-account" disabled={!emailMatches}>
        <i class="fas fa-exclamation-circle"></i>
        Permanently Delete CSplan Account
        <i class="fas fa-exclamation-circle"></i>
      </button>

      <button class="cancel" on:click={() => {
        showConfirm = false
      }}>
        <i class="far fa-arrow-left"></i>
        Cancel
      </button>

    </section>
    {/if}

    <Spinner {state} {message}/>
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