<script lang="ts">
  import navState, { FormIDs } from '../navigation-state'
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
    <input id="password" type="{showOldPassword ? 'text' : 'password'}" placeholder={oldPlaceholder}>
    <i class="fas fa-edit clickable" class:open on:click={onOpen}></i>
  </div>
  {#if open}
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
  {/if}
</form>

<style lang="scss">
  form.password-form {
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