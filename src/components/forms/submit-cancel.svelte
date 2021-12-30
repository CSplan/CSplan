<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  function cancel(): void {
    dispatch('cancel')
  }
  function confirm(): void {
    dispatch('confirm')
  }
</script>

<div class="bottom-buttons">
  <input type="button" value="Cancel" class="cancel-button" on:click={cancel}>
  <input type="submit" value="Confirm" class="submit-button" on:click={confirm}>
</div>

<style lang="scss">
  div.bottom-buttons {
    width: 100%;
    display: grid;
    grid-template-columns: max-content 8fr 2fr;
  }
  input.cancel-button {
    grid-column: 1;
    background-color: $danger-red;
    color: white;
  }
  input.submit-button {
    grid-column: 3;
  }
</style>