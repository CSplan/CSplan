<script lang="ts">
  import TOTPForm from './totp-form.svelte'
</script>

<section class="settings-menu-container">
  <article class="twofactor-menu">
    <TOTPForm/>
  </article>
</section>

<style lang="scss">
  @import '../position.scss';
  section.settings-menu-container {
    @include settings-menu-container;
  }
  section.settings-menu-container :global {
    @include form-styles;
  }

  article.twofactor-menu {
    header {
      font-size: 1.5rem;
    }
    margin: 1.5rem 0;
    border: 1px solid $border-normal;
    background: $bg-primary;
    padding: $padding-m;
  }
</style>