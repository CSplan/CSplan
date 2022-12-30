<script lang="ts">
  import navState, { FormIDs } from '../navigation-state'
  import { DisplayNames, Visibilities, FormStates as States } from '$lib'
  import VisibilityForm from '../visibility-form.svelte'
  import nameStore from '$stores/user/name'
  import type { NameData } from '$stores/user/name'
  import { onMount, tick } from 'svelte'
  import { slide } from 'svelte/transition'
  import Spinner from '$components/spinner.svelte'

  // Form state
  let name: NameData = {
    firstName: '',
    lastName: '',
    visibility: {
      firstName: Visibilities.Encrypted,
      lastName: Visibilities.Encrypted
    },
    displayName: DisplayNames.Anonymous
  }
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
  let message = ''

  // State references used to decide available display name options
  let hasUsername = false
  let hasPublicFirstName = false
  let hasPublicLastName = false
  $: hasUsername = name.username != null
  $: hasFirstName = name.firstName.length > 0
  $: hasLastName = name.lastName.length > 0
  $: hasPublicFirstName = hasFirstName && name.visibility.firstName === Visibilities.Public
  $: hasPublicLastName = hasLastName && name.visibility.lastName === Visibilities.Public

  async function submit(): Promise<void> {
    try {
      state = States.Saving
      message = 'Saving Name'
      await nameStore.create(name)
      state = States.Saved
      message = 'Saved'
      await tick()
      setTimeout(() => {
        state = States.Resting
        message = ''
        open = false
      }, 500)
    } catch (err) {
      state = States.Errored
      message = `${err}`
    }
  }

  onMount(async () => {
    await nameStore.init() 
    if ($nameStore.exists) {
      name = {
        firstName: $nameStore.firstName,
        lastName: $nameStore.lastName,
        username: $nameStore.username,
        visibility: $nameStore.visibility,
        displayName: $nameStore.displayName,
        privateDisplayName: $nameStore.privateDisplayName
      }
    }
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
        {#if hasUsername}
          <option value={DisplayNames.Username}>Username</option>
        {/if}
        {#if hasFirstName}
          <option value={DisplayNames.FirstName}>First Name</option>
        {/if}
        {#if hasLastName}
          <option value={DisplayNames.LastName}>Last Name</option>
        {/if}
        {#if hasFirstName && hasLastName}
          <option value={DisplayNames.FullName}>Full Name</option>
        {/if}
      </select>
      </div>

    <Spinner size="2rem" vm="0.25rem" {state} message={message}/>

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