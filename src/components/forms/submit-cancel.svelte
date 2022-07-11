<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  export let cancelText = 'Cancel'
  export let submitText = 'Confirm'

  function cancel(): void {
    dispatch('cancel')
  }
  function confirm(): void {
    dispatch('confirm')
  }
</script>

<div class="bottom-buttons">
  <input type="button" value="{cancelText}" class="cancel-button" on:click={cancel}>
  <input type="submit" value="{submitText}" class="submit-button" on:click={confirm}>
</div>

<style lang="scss">
  div.bottom-buttons {
    width: 100%;
    display: grid;
    grid-template-columns: max-content 8fr 2fr;
  }
  input {
    border: none;
  }
  input.cancel-button {
    grid-column: 1;
    margin: 0;
    background-color: $danger-red;
  }
  input.submit-button {
    grid-column: 3;
    margin: 0;
  }
</style>