<script>
  /* eslint-disable */
  import TitleView from '$components/lists/title-view.svelte'
  import lists from '$stores/lists'
  import { onMount } from 'svelte'

  // FIXME: this entire route is pretty bad

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

<main class="container">
  <h1>My Lists</h1>
  <TitleView/>
</main>

<style lang="scss">
  @media screen and (min-width: $desktop-min) {
    main.container {
      padding-left: 250px;
      padding-right: 250px;
    }
  }
  h1 {
    border-bottom: 1px solid #aaa;
    width: 100%;
    text-align: center;
  }
  button {
    position: absolute;
    left: 18%;
    top: 3rem;
    border-radius: 10%;
  }
  @media screen and (max-width: $mobile-max) {
    main.container {
      max-width: 100%;
    }
  }
  
</style>
