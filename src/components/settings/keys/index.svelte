<script lang="ts">
  import KeysForm from './keys-form.svelte'
</script>

<section class="settings-menu-container">
  <article class="keys-menu">
    <KeysForm/>
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

  article.keys-menu {
    margin: 1.5rem 0;
    color: #111;
    border: 1px solid #aaa;
    padding: $padding-m;
    display: flex;
    flex-direction: column;
    align-items: center;

  }
</style>