<script>
  import { tweened } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'

  import Medium from './medium.svelte'
  import Small from './small.svelte'
  import Palette from './palette.svelte'

  
  // Initialize custom color picker with size specified by parameter (default medium)
  export let size = 'medium'
  let width = 0
  let height = 0
  let customPicker
  switch (size.toLowerCase()) {
  case 'medium':
    customPicker = Medium
    width = 375
    height = 200
    break
  case 'small':
    customPicker = Small
    width = 250
    height = 160
    break
  }

  const duration = 500 // Duration of tweening/transitions in ms
  const offset = tweened(0, {
    duration,
    easing: cubicOut
  })
</script>

<div class="card" style="--width: {width}px; --height: {height}px">
  <div class="container" style="--offset: {$offset}">

  <div class="content">
    <svelte:component this={customPicker} on:colorchange/>
    <div class="side-menu">
      <i class="fas fa-chevron-right clickable" on:click={() => offset.set(100)}/>
    </div>
  </div>

  <div class="content">
    <div class="side-menu">
      <i class="fas fa-chevron-left clickable" on:click={() => offset.set(0)}/>
    </div>
    <Palette on:colorchange/>
  </div>

  </div>
</div>

<style>
  /* Card containing everything */
  .card {
    margin-top: 10rem;
    width: var(--width);
    height: var(--height);

    /* Turn on for debugging */
    /* overflow: visible; */
  }
  /* Sliding horizontal container of content blocks */
  .container {
    position: absolute;
    left: calc(-1% * var(--offset));

    min-width: calc(2 * 100%);
    height: 100%;

    display: flex;
    flex-direction: row;
  }
  /* An individual content block */
  .content {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    padding: 0.5rem;
  }
  .side-menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
  }
  .side-menu:first-child {
    padding-left: 0;
  }
  .side-menu:last-child {
    padding-right: 0;
  }
</style>
