<script lang="ts">
  import { parseByteSize, formatByteSize } from '$lib/byte-size'

  export let timeCost = 1
  export let memoryCost = 10 * 1024 * 1024
  let memoryCostFormatted = formatByteSize(memoryCost)
  export let form: HTMLFormElement

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

<form on:submit|preventDefault bind:this={form}>
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
  button {
    background: var(--background-dark);
  }
  form {
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
</style>
