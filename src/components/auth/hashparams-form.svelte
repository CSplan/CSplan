<script lang="ts">
  import { parseByteSize, formatByteSize } from '$lib/byte-size'

  let timeCost = 1
  let memoryCost = 10 * 1024 * 1024
  let memoryCostFormatted = formatByteSize(memoryCost)

  function parseMemoryCost(evt: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }): void {
    try {
      memoryCost = parseByteSize(memoryCostFormatted)
    } catch (error) {
      // TODO: pass up error handling to register form
      evt.currentTarget.setCustomValidity(error)
      console.log(error)
      return
    }
    if (memoryCost > (2 * 1024 * 1024 * 1024)) {
      evt.currentTarget.setCustomValidity('invalid memory cost, max is 2GB')
      console.log('too big')
      return
    }
    evt.currentTarget.setCustomValidity('')
  }
</script>

<form on:submit|preventDefault>
  <pre>Memory Cost: {memoryCost}</pre>
  <label for="time-cost">Time Cost:</label>
  <input name="time-cost" type=number bind:value={timeCost} min=0 max=10>
  <label for="memory-cost">Memory Cost:</label>
  <input name="memory-cost" type=string bind:value={memoryCostFormatted} on:blur={parseMemoryCost}>
</form>
