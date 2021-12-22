<script lang="ts">
  import navState, { FormIDs } from '../navigation-state'
  import { DisplayNames, Visibilities, FormStates as States } from '$lib'
  import VisibilityForm from '../visibility-form.svelte'
  import nameStore from '$stores/user-name'
  import { onMount, tick } from 'svelte'
  import { slide } from 'svelte/transition'
  import Spinner from '$components/spinner.svelte'

  let name: Name
  name = cloneName($nameStore)
  let editing = true
  let disabled = !editing
  $: disabled = !editing

  // Form state
  let state = States.Resting
  let status = ''

  // State references used to decide available display name options
  let hasUsername = false
  let hasPublicFirstName = false
  let hasPublicLastName = false
  $: hasUsername = name.username != null
  $: hasPublicFirstName = name.firstName.length > 0 && name.visibility.firstName === Visibilities.Public
  $: hasPublicLastName = name.lastName.length > 0 && name.visibility.lastName === Visibilities.Public

  function toggleEditing(): void {
    editing = !editing
  }

  // Copy a name object without any references (cryptoKey may still be a reference)
  function cloneName(n: Name): Name {
    return {
      ...n,
      visibility: { ...n.visibility }
    }
  }

  async function submit(): Promise<void> {
    try {
      state = States.Saving
      status = 'Saving'
      await nameStore.create(name)
      // FIXME: visual indication of name form submission error/success
      state = States.Saved
      status = 'Saved'
      await tick()
      setTimeout(() => {
        state = States.Resting
        status = ''
        editing = false
      }, 500)
    } catch (err) {
      state = States.Errored
      status = err instanceof Error ? err.message : err as string
    }
  }

  onMount(async () => {
    await nameStore.init() 
    name = cloneName($nameStore)
  })
</script>

<form class="name-form" class:disabled={$navState.isEditing !== null && $navState.isEditing !== FormIDs.ChangeName} class:editing on:submit|preventDefault={submit}>
  <i class="fas fa-edit clickable edit-button" class:editing on:click={toggleEditing}></i>

  <label for="firstname">First Name</label>
  <div class="input-group">
    <input id="firstname" type="text" bind:value={name.firstName} {disabled}>
    <VisibilityForm bind:visibility={name.visibility.firstName} {disabled}/>
  </div>

  <label for="lastname">Last Name</label>
  <div class="input-group">
    <input id="lastname" type="text" bind:value={name.lastName} {disabled}>
    <VisibilityForm bind:visibility={name.visibility.lastName} {disabled}/>
  </div>

  {#if editing}
    <div class="editable" transition:slide={{ duration: 50 }}>
      <!-- FIXME: HTML selects look terrible, but provide good keyboard and accessibility. These need to be replaced sooner than later with a custom component that doesn't sacrifice functoinality -->
      <label for="public-name-pref">Display Name</label>
      <select id="public-name-pref" {disabled} bind:value={name.displayName}>
        <option value={DisplayNames.Anonymous}>Anonymous</option>
        {#if hasUsername}
          <option value={DisplayNames.Username}>Username</option>
        {/if}
        {#if hasPublicFirstName}
          <option value={DisplayNames.FirstName}>First Name</option>
        {/if}
        {#if hasPublicLastName}
          <option value={DisplayNames.LastName}>Last Name</option>
        {/if}
        {#if hasPublicFirstName && hasPublicLastName}
          <option value={DisplayNames.FullName}>Full Name</option>
        {/if}
        {#if hasPublicFirstName && hasPublicLastName && hasUsername}
          <option value={DisplayNames.FullNameAndUsername}>Full Name and Username</option>
        {/if}
      </select>

      <label for="private-name-pref">Private Display Name</label>
      <select id="name-pref" {disabled} bind:value={name.privateDisplayName}>
        <option value={DisplayNames.Anonymous}>None (use normal display name)</option>
        <option value={DisplayNames.Username}>Username</option>
        <option value={DisplayNames.FirstName}>First Name</option>
        <option value={DisplayNames.LastName}>Last Name</option>
        <option value={DisplayNames.FullName}>Full Name</option>
      </select>
      </div>

    {#if state !== States.Resting}
      <Spinner size="2rem" vm="0.25rem" {state}/>
    {/if}
    <p class="form-status" class:error={state === States.Errored} class:success={state === States.Saved} class:d-none={status.length === 0}>
      {status}
    </p>

    <input type="submit" value="Submit" class:d-none={[States.Loading, States.Saved].includes(state)}>
  {/if}
</form>

<style lang="scss">
  form {
    display: flex;
    flex-direction: column;
  }
  p.form-status {
    align-self: center;
    line-height: 1.5;
    &.error {
      color: $danger-red;
    }
    &.success {
      color: $success-green;
    }
  }
  i.edit-button {
    margin-left: auto;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
  }
  i.editing {
    color: $bold-blue;
  }
</style>