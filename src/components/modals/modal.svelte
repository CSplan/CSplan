<script lang="ts">
  export let show = false
  export let flex = false
  // Lock the modal, don't show an exit button, modal content is responsible for allowing the user to exit the modal
  export let lock = false

  import { fade } from 'svelte/transition'
  import { quintOut } from 'svelte/easing'
  import { formElementIsFocused } from '$lib'

  function onkeydown(evt: KeyboardEvent): void {
    if (!lock && !formElementIsFocused() && evt.key === 'Escape') {
      show = false
    }
  }

  function onclick(): void {
    if (!lock) {
      show = false
    }
  }
</script>

<svelte:window on:keydown={onkeydown}/>

{#if show}
<main 
  class="modal"
  on:click|self={onclick}
  transition:fade={{ duration: 200, easing: quintOut }}>

  <!-- Placebo exit button, does the same thing as clicking anywhere else on the form -->
  {#if !lock}
    <i class="fas fa-times clickable" on:click|self={onclick}></i>
  {/if}

  <section class="content" class:flex transition:fade={{ duration: 200, easing: quintOut }}>
    <slot></slot>
  </section>
</main>
{/if}

<style lang="scss">
  /* Modal styling */
  .modal {
    z-index: 999;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.8);
    >i.fa-times {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      color: white;
    }
  }
  .modal .content {
    position: fixed;
    z-index: 1000;
    padding: 0;
    margin: 0;
    left: 25%;
    right: 25%;
    &.flex {
      display: flex;
      flex-direction: column;
      left: 0;
      right: 0;
    }
  }

  .modal .content :not(:last-child) {
    margin: 0.75rem 0;
  }
  .modal .content :last-child {
    margin: 0;
  }
  .modal .content input[type="submit"] {
    width: 100%;
  }
  i.ml-05 {
    margin-left: 0.5rem;
  }
</style>