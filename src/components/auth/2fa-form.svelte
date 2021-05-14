<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  let codeInput: HTMLInputElement

  const dispatch = createEventDispatcher()

  function dispatchCode(): void {
    codeInput.setCustomValidity('')
    if (codeInput.value.length < 6) {
      codeInput.setCustomValidity('Code must be at least 6 digits.')
      return
    }
    const code = parseInt(codeInput.value, 10)
    if (code === NaN) {
      codeInput.setCustomValidity('Code must be a number.')
      return
    }
    dispatch('code-submit', code)
  }
</script>

<div class="card 2fa-form">
  <header>Enter a 6 digit two-factor code or an 8 digit backup code</header>
  <form on:submit|preventDefault={dispatchCode}>
    <input type="text" placeholder="000000" bind:this={codeInput}>
    <input type="submit" value="Submit">
  </form>
</div>
