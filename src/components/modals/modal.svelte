<script lang="ts">
  export let show = false

  import { fade } from 'svelte/transition'
  import { quintOut } from 'svelte/easing'
  import { formElementIsFocused } from '$lib'

  function onkeydown(evt: KeyboardEvent): void {
    if (!formElementIsFocused() && evt.key === 'Escape') {
      show = false
    }
  }
</script>

<svelte:window on:keydown={onkeydown}/>

{#if show}
<main 
  class="modal"
  on:click|self={() => show = false}
  transition:fade={{ duration: 200, easing: quintOut }}>

  <!-- Placebo exit button, does the same thing as clicking anywhere else on the form -->
  <i class="fas fa-times clickable" on:click|self={() => show = false}></i>

  <section class="content" transition:fade={{ duration: 200, easing: quintOut }}>
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