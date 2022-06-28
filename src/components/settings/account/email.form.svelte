<script lang="ts">
  import navState, { FormIDs } from '../navigation-state'
  import { FormStates as States } from '$lib/form-states'
  import { slide } from  'svelte/transition'
  import Spinner from '$components/spinner.svelte'
  import user from '$stores/user'

  let open = false
  $: open = $navState.isEditing === FormIDs.ChangeEmail
  function toggleOpen(): void {
    if (open) {
      $navState.isEditing = null
    } else {
      $navState.isEditing = FormIDs.ChangeEmail
    }
  }

  let unverified = false
  $: unverified = !$user.user.verified

  type EmailChangeRequest = {
    email: string
  }

  async function submit(): Promise<void> {
    if (!form.reportValidity()) {
      return
    }

    console.log('ok')
  }

  async function sendVerificationEmail(): Promise<void> {
    try {
      await user.sendVerificationEmail()
    } catch (err) {
      state = States.Errored
      message = err instanceof Error ? err.message : `${err}`
    }
  }

  let form: HTMLFormElement
  let newEmail: HTMLInputElement
  
  let state = States.Resting
  let message = ''
</script>

<form class="email-form" novalidate on:submit|preventDefault={submit} bind:this={form}>
  <label for="email">
    <span>Email</span>
    <div class="input-group">
      <input id="email" type="email" bind:value={$user.user.email} disabled={true} class:unverified>
      <i class="fas fa-edit clickable" class:open on:click={toggleOpen}></i>
    </div>
  </label>
  {#if unverified}
    <span class="unverified-message">This email address isn't verified.</span>
    {#if !open}
      <button class="resend-verification" on:click={sendVerificationEmail}>
        <i class="far fa-envelope"></i>
        Resend Verification Email
      </button>
      <Spinner size="2rem" vm="0.5rem" bind:state bind:message/>
    {/if}
  {:else if !open}
    <span class="verified-message">
      <i class="far fa-envelope-circle-check"></i>
      This email address is verified.
    </span>
  {/if}

  {#if open}
    <div class="editable" transition:slide={{ duration: 50 }}>
      <label>
        <span>New Email</span>
        <input id="new-email" type="email" bind:this={newEmail} required>
      </label>

      <Spinner size="2rem" vm="0.5rem" bind:state bind:message/>
    
      {#if [States.Resting, States.Errored].includes(state)}
        <input type="submit" value="Change Email">
      {/if}
    </div>
  {/if}
</form>

<style lang="scss">
  form.email-form,div.editable {
    display: flex;
    flex-direction: column;
    :global {
      i.fa-circle-notch {
        align-self: center;
      }
    }
  }
  input#email.unverified {
    border-color: $danger-red;
  }
  span.unverified-message {
    color: $danger-red;
    margin-top: 0 !important;
  }
  span.verified-message {
    color: $success-green;
    margin-top: 0 !important;
  }
  input#new-email {
    width: calc(100% - (17.6px + 1.5rem)); // Align with email form
  }
  input[type="submit"], button.resend-verification {
    align-self: center;
  }
  button.resend-verification { 
    width: auto;
    background: $bg-alt;
    color: white;
    line-height: 1.5;
    padding: .3rem .9rem;
  }
  i.fa-edit.open {
    color: $bold-blue;
  }
</style>