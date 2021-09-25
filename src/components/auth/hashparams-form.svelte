<script lang="ts">
  import { parseByteSize, formatByteSize } from '$lib/byte-size'
  import type { RegisterActions } from './actions'
  import { createEventDispatcher } from 'svelte'
  
  const dispatch = createEventDispatcher()

  export let actions: RegisterActions

  let timeCost = 1
  let memoryCost = 10 * 1024 * 1024
  let memoryCostFormatted = formatByteSize(memoryCost)

  // Save the hashparams to the register actions instance
  function save(): void {
    actions.hashParams.timeCost = timeCost
    actions.hashParams.memoryCost = memoryCost / 1024 // argon2 expects memory cost in # of 1KiB pages
    dispatch('close')
  }

  // #region Form validation
  function setValidity(
    evt: Event & { currentTarget: EventTarget & HTMLInputElement },
    validity: string
  ): void {
    evt.currentTarget.setCustomValidity(validity)
    evt.currentTarget.reportValidity()
  }

  function parseMemoryCost(
    evt: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }
  ): void {
    try {
      memoryCost = parseByteSize(memoryCostFormatted)
    } catch (err) {
      setValidity(evt, err)
      return
    }
    if (memoryCost > 2 * 1024 * 1024 * 1024) {
      setValidity(evt, 'invalid memory cost, max is 2GB')
      return
    } else if (memoryCost < 1024) {
      setValidity(evt, 'invalid memory cost, minimum is 1KiB')
      return
    }
    setValidity(evt, '')
  }

  function checkTimeCost(
    evt: Event & { currentTarget: EventTarget & HTMLInputElement }
  ): void {
    if (timeCost > 10) {
      setValidity(evt, 'invalid time cost, max is 10')
    } else {
      setValidity(evt, '')
    }
  }
  // #endregion
</script>

<div>
  <header>Argon2i Parameters</header>
  <label for="time-cost">Time Cost:</label>
  <input
    name="time-cost"
    type="number"
    bind:value={timeCost}
    min="0"
    max="10"
    on:input={checkTimeCost}
  />
  <label for="memory-cost">Memory Cost:</label>
  <input
    name="memory-cost"
    type="string"
    bind:value={memoryCostFormatted}
    on:blur={parseMemoryCost}
  />
  <!-- Prevent default trigger of form submission when hashparams form is saved -->
  <button on:click|preventDefault={save}>Save</button>
</div>

<style lang="scss">
  header {
    padding: 0.3rem 0 !important;
  }
  div {
    margin: 0;
    * {
      margin: 0.3rem 0;
    }
    display: grid;
    grid-template-columns: minmax(min-content, 1fr) 1fr;
    column-gap: 0.5rem;
    header,button {
      grid-column: 1 / span 2;
    }
    button {
      margin-bottom: 0;
      background: var(--background-dark);
    }
    label {
      grid-column: 1;
    }
    input {
      grid-column: 2;
    }
    label {
      margin-top: auto;
      margin-bottom: auto;
    }
  }
  input {
    padding: 0 0.5rem;
  }
</style>