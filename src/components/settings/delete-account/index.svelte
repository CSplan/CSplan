<script lang="ts">

</script>

<section class="settings-menu-container">
  <article class="delete-account">
    <h2>
      <i class="fas fa-exclamation-circle"></i>
        Delete Account
    </h2>
  
    <p class="warning">
      Warning! Once your account is deleted, all associated data will be immediately and permanently gone from CSplan's servers. This action is irreversible.
    </p>

    <button class="delete-account">
      Delete CSplan Account!
    </button>
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

  article {
    margin: 1.5rem 0;
    color: #111;
    border: 1px solid $danger-red;
    padding: $padding-m;
  }
  article,section {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  h2 {
    width: 100%;
    text-align: center;
    border-bottom: 1px solid $danger-red;
    i {
      color: $danger-red;
    }
  }

  button.delete-account {
    background-color: $danger-red;
    padding: 1.5rem;
    border-radius: 15px;
  }
</style>