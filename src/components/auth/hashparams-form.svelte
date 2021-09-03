<script lang="ts">
  import { parseByteSize, formatByteSize } from '$lib/byte-size'
  import type { RegisterActions } from './actions'

  export let actions: RegisterActions

  let timeCost = 1
  let memoryCost = 10 * 1024 * 1024
  $: {
    actions.hashParams.timeCost = timeCost
    actions.hashParams.memoryCost = memoryCost / 1024 // argon2 expects memory cost in # of 1KiB pages
  }
  let memoryCostFormatted = formatByteSize(memoryCost)
  export let form: HTMLFormElement
  export let show = false

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
      // TODO: pass up error handling to register form
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
</script>

<form on:submit|preventDefault bind:this={form} class:hidden={!show}>
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
  <button>Perform test run</button>
</form>

<style lang="scss">
  .hidden {
    width: 0;
    height: 0;
  }
  header {
    border-top: #aaa 1px solid;
    padding: 0.3rem 0;
  }
  button {
    background: var(--background-dark);
  }
  form {
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
      width: 50%;
      margin-left: auto;
      margin-right: auto;
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
