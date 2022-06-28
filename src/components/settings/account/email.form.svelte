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

  let form: HTMLFormElement
  let newEmail: HTMLInputElement
  
  let state = States.Resting
  let message = ''
</script>

<form class="email-form" novalidate on:submit|preventDefault bind:this={form}>
  <label for="email">Email</label>
  <div class="input-group">
    <input id="email" type="email" bind:value={$user.user.email} disabled={true}>
    <i class="fas fa-edit clickable" class:open on:click={toggleOpen}></i>
  </div>
  {#if open}
    <div class="editable" transition:slide={{ duration: 50 }}>
      <label>
        <span>New Email</span>
        <input type="email" bind:this={newEmail}>
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
  input[type="submit"] {
    align-self: center;
  }
  i.fa-edit.open {
    color: $bold-blue;
  }
</style>