<script lang="ts">
  import settings from '$stores/settings'
  import steps from './steps'
  import MenuGroup from './menu-group.svelte'
</script>

<article class="side-menu" class:shadow={!$settings.darkMode}>
  {#each $steps.steps as step, i}
    <MenuGroup
    title={step}
    icon={(() => {
      if (i === $steps.currentStep) {
        return 'fas fa-circle'
      } else if (i < $steps.currentStep) {
        return 'fas fa-circle-check'
      } else {
        return 'far fa-circle' 
      }
    })()}
    />
  {/each}
</article>

<style lang="scss">
  .side-menu {
    background-color: $bg-dark;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.8rem;
    border-radius: 0.2rem;
    font-size: 1.1rem;
    &.shadow {
      box-shadow: 0.3rem 0.3rem 1.25rem $bg-dark;
    }
  }
</style>