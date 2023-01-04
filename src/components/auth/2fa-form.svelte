<script lang="ts" context="module">
  export function focus(): void {
    codeInput.focus()
  }

  let codeInput: HTMLInputElement
</script>

<script lang="ts">
  import type { FormStates } from '$lib'
  import Spinner from '$components/spinner.svelte'
  import { createEventDispatcher } from 'svelte'

  export let state: FormStates
  export let message: string

  const dispatch = createEventDispatcher()

  function dispatchCode(): void {
    codeInput.setCustomValidity('')
    if (codeInput.value.length < 6) {
      codeInput.setCustomValidity('Code must be at least 6 digits.')
      return
    }
    const code = parseInt(codeInput.value, 10)
    if (Number.isNaN(code)) {
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

    <Spinner {state} {message} vm="0.5rem"/>
  </form>
</div>

<style lang="scss">
  @import './login-form.scss';
</style>