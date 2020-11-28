<script>
  import Medium from './medium.svelte'
  import Palette from './palette.svelte'

  
  // Initialize custom color picker with size specified by parameter (default medium)
  export let defaultSize = 'medium'
  let customPicker
  switch (defaultSize) {
  case 'medium':
    customPicker = Medium
  }

  let currentSlide = 0
</script>

<div class="card">
  <span class="container">

  <div class="content">
    <svelte:component this={customPicker}/>
    <div class="side-menu">
      <i class="fas fa-chevron-right clickable" on:click={() => currentSlide = 1}/>
    </div>
  </div>

  <div class="content">
    <div class="side-menu">
      <i class="fas fa-chevron-left clickable" on:click={() => currentSlide = 0}/>
    </div>
    <Palette/>
  </div>

  </span>
</div>

<style>
  .card {
    margin-top: 10rem;
    width: 375px;
    height: 200px;
    overflow: visible;
  }
  .content {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    padding: 0.5rem;
  }
  span {
    min-width: 750px;
    height: 100%;
    display: flex;
    flex-direction: row;
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
