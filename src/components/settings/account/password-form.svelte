<script lang="ts">
  import navState, { FormIDs } from '../navigation-state'
  import { slide } from 'svelte/transition'

  let open = false
  function onOpen(): void {
    open = !open
    if (open) {
      $navState.isEditing = FormIDs.ChangePassword
    } else {
      $navState.isEditing = null
    }
  }
  const oldPlaceholder = '*'.repeat(20)
  const placeholder = '*'.repeat(30)

  let showOldPassword = false
  let showNewPassword = false

  let oldPassword = ''
  let newPassword = ''
  let confirmPassword = ''
</script>

<form class="password-form">
  <label for="password">{open ? 'Old ' : ''}Password</label>
  <div class="input-group">
    <input id="password" disabled={!open} type="{showOldPassword ? 'text' : 'password'}" placeholder={oldPlaceholder}>
    <i class="fas fa-edit clickable" class:open on:click={onOpen}></i>
  </div>
  {#if open}
    <div class="editable" transition:slide={{ duration: 50 }}>
      <label class="checkable">
        <input type="checkbox" bind:checked={showOldPassword}>
        <span class="checkable">Show Old Password</span>
      </label>

      <label for="new-password">New Password</label>
      <input id="new-password" type="password" {placeholder}>
      <label for="confirm-new-password">Confirm New Password</label>
      <input id="confirm-new-password" type="password" {placeholder}>
      <label class="checkable">
        <input type="checkbox" bind:checked={showNewPassword}>
        <span class="checkable">Show New Passwords</span>
      </label>


      <input type="submit" value="Change Password">
    </div>
  {/if}
</form>

<style lang="scss">
  form.password-form,div.editable {
    display: flex;
    flex-direction: column;
  }
  input[type="submit"] {
    align-self: center;
  }
  i.fa-edit { 
    &.open {
      color: var(--bold-blue);
    }
  }
</style>