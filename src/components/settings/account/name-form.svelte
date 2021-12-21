<script lang="ts">
  import navState, { FormIDs } from '../navigation-state'
  import { DisplayNames } from '$lib'
  import VisibilityForm from '../visibility-form.svelte'
  import nameStore from '$stores/user-name'
  import { onMount } from 'svelte'

  let name: Name
  name = cloneName($nameStore)
  let editing = false
  let disabled = !editing
  $: disabled = !editing

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

  onMount(async () => {
    await nameStore.init() 
    name = cloneName($nameStore)
  })
</script>

<form class="name-form" class:disabled={$navState.isEditing !== null && $navState.isEditing !== FormIDs.ChangeName} class:editing>
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

  <label for="public-name-pref">Display Name</label>
  <select id="public-name-pref" {disabled}>
    <option value={DisplayNames.Anonymous}>Anonymous</option>
    <option value={DisplayNames.Username}>Username</option>
    <option value={DisplayNames.FirstName}>First Name</option>
    <option value={DisplayNames.LastName}>Last Name</option>
    <option value={DisplayNames.FullName}>Full Name</option>
    <option value={DisplayNames.FullNameAndUsername}>Full Name and Username</option>
  </select>

  <label for="private-name-pref">Private Display Name</label>
  <select id="name-pref" {disabled}>
    <option value={DisplayNames.Anonymous}>None (use normal display name)</option>
    <option value={DisplayNames.Username}>Username</option>
    <option value={DisplayNames.FirstName}>First Name</option>
    <option value={DisplayNames.LastName}>Last Name</option>
    <option value={DisplayNames.FullName}>Full Name</option>
  </select>


    {#if editing}
      <input type="submit" value="Submit">
    {/if}
</form>

<style lang="scss">
  form {
    display: flex;
    flex-direction: column;
  }
  i.edit-button {
    margin-right: auto;
    margin-bottom: 0.5rem;
  }
  i.editing {
    color: $bold-blue;
  }
</style>