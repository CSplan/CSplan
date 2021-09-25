<script lang="ts">
  import MenuGroup from './menu-group.svelte'
</script>

<div class="side-menu">
  <MenuGroup/>
</div>

<style lang="scss">
  .side-menu {
    background-color: var(--background-alt);
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 0.2rem;
  }


  // Desktop styles
  @media screen and (min-width: 850px) {
    .side-menu {
      min-width: 225px;
    }
  }
</style>