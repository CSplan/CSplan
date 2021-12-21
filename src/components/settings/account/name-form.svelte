<script lang="ts">
  import navState, { FormIDs } from '../navigation-state'
  import { DisplayNames } from '$lib'
  import VisibilityForm from '../visibility-form.svelte'
  import nameStore from '$stores/user-name'
  import { onMount } from 'svelte'

  let name: Name = $nameStore

  onMount(async () => {
    await nameStore.init() 
    name = $nameStore
  })


</script>

<form class="name-form" class:disabled={$navState.isEditing !== null && $navState.isEditing !== FormIDs.ChangeName}>
  <label for="firstname">First Name</label>
  <div class="input-group">
    <input id="firstname" type="text" disabled>
    <VisibilityForm bind:visibility={name.visibility.firstName}/>
  </div>

  <label for="lastname">Last Name</label>
  <div class="input-group">
    <input id="lastname" type="text" disabled>
    <VisibilityForm bind:visibility={name.visibility.lastName}/>
  </div>

  <label for="public-name-pref">Display Name</label>
  <select id="public-name-pref">
    <option value={DisplayNames.Anonymous}>Anonymous</option>
    <option value={DisplayNames.Username}>Username</option>
    <option value={DisplayNames.FirstName}>First Name</option>
    <option value={DisplayNames.LastName}>Last Name</option>
    <option value={DisplayNames.FullName}>Full Name</option>
    <option value={DisplayNames.FullNameAndUsername}>Full Name and Username</option>
  </select>

  <label for="private-name-pref">Private Display Name</label>
  <select id="name-pref">
    <option value={DisplayNames.Anonymous}>None (use normal display name)</option>
    <option value={DisplayNames.Username}>Username</option>
    <option value={DisplayNames.FirstName}>First Name</option>
    <option value={DisplayNames.LastName}>Last Name</option>
    <option value={DisplayNames.FullName}>Full Name</option>
  </select>
</form>
