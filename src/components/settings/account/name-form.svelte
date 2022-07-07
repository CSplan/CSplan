<script lang="ts">
  import navState, { FormIDs } from '../navigation-state'
  import { DisplayNames, Visibilities, FormStates as States } from '$lib'
  import VisibilityForm from '../visibility-form.svelte'
  import nameStore from '$stores/user-name'
  import { onMount, tick } from 'svelte'
  import { slide } from 'svelte/transition'
  import Spinner from '$components/spinner.svelte'

  // Form state
  let name: Name
  name = cloneName($nameStore)
  let open = false
  $: open = $navState.isEditing === FormIDs.ChangeName
  let disabled = !open
  $: disabled = !open

  function toggleEditing(): void {
    if (open) {
      $navState.isEditing = null
    } else {
      $navState.isEditing = FormIDs.ChangeName
    }
  }

  let state = States.Resting
  let status = ''

  // State references used to decide available display name options
  let hasUsername = false
  let hasPublicFirstName = false
  let hasPublicLastName = false
  $: hasUsername = name.username != null
  $: hasPublicFirstName = name.firstName.length > 0 && name.visibility.firstName === Visibilities.Public
  $: hasPublicLastName = name.lastName.length > 0 && name.visibility.lastName === Visibilities.Public


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
        open = false
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

<form class="name-form" class:open on:submit|preventDefault={submit}>
  <i class="fas fa-edit clickable edit-button" class:open on:click={toggleEditing}></i>

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

  {#if open}
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

    <input type="submit" value="Save" class:d-none={[States.Loading, States.Saved].includes(state)}>
  {/if}
</form>

<style lang="scss">
  form {
    display: flex;
    flex-direction: column;
  }
  select#public-name-pref, select#name-pref {
    width: calc(100% - (15.4px + 1.5rem));
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
  i.open {
    color: $bold-blue;
  }
  input[type="submit"] {
    align-self: center;
    min-width: 150px;
  }
</style>