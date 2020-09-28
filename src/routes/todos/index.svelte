<script>
  import navbar from '../../components/navbar.svelte'
  import TitleView from '../../components/titleView.svelte'
  import lists from '../../stores/lists'
  import { onMount } from 'svelte'

  // Notify reactive assignments when the DOM is mounted
  let isMounted = false
  onMount(() => isMounted = true)
  // Save state management
  let saveStates = {
    resting: 0,
    saving: 1,
    success: 2,
    failed: 3
  }
  let saveState = saveStates.resting
  async function save() {
    saveState = saveStates.saving
    try {
      await lists.commitUnsaved()
    } catch (err) {
      saveState = saveStates.failed
      return
    }
    // Show a checkmark and clear after .1s
    saveState = saveStates.success
    setTimeout(() => {
      saveState = saveStates.resting
    }, 100)
  }

  // Subscribe to changes in save states and update the button's icon accordingly
  /** @type {HTMLElement} */
  let saveButton
  $: saveButton = isMounted ? document.querySelector('[data-role="save-icon"]') : null
  $: if (isMounted) switch (saveState) { // Pass null to avoid matching any case if there is no DOM
  case saveStates.resting:
    saveButton.className = 'fas fa-save'
    break
  case saveStates.saving:
    saveButton.className = 'fas fa-circle'
    break
  case saveStates.success:
    saveButton.className = 'fas fa-check'
    break
  case saveStates.failed:
    saveButton.className = 'fas fa-times'
    break
  }
</script>

<svelte:component this={navbar}></svelte:component>

<main>
  <button class="bold" on:click={save}>
    <i data-role="save-icon" class="fas fa-save"></i>
  </button>
  <svelte:component this={TitleView}></svelte:component>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  button {
    position: absolute;
    left: 15rem;
    top: 3rem;
    border-radius: 10%;
  }
</style>
