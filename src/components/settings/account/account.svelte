<script lang="ts">
  import ProfilePictureForm from './pfp-form.svelte'
  import AccountTypeGraphic from './account-type.svelte'
  import EmailForm from './email-form.svelte'
  import PasswordForm from './password-form.svelte'
  import NameForm from './name-form.svelte'
  export let user: App.Locals['user']
  export let settings: App.Locals['settings']
</script>

<section class="account-menu">
  <article class="submenu account-card">

    <ProfilePictureForm/>
    <AccountTypeGraphic {user} {settings}/>
    
    <section class="user-details primary" on:submit|preventDefault>

      <EmailForm {user}/>
      <hr>
      <PasswordForm/>
      <hr>
      <NameForm/>

    </section>
  </article>
</section>


<style lang="scss">
  @import '../position.scss';
  .account-menu :global {
    @include form-styles;
  }

  .account-menu {
    @include settings-menu-container;
  }
  .submenu {
    margin: 1.5rem 0;
  }
  .account-card {
    display: grid;
    @media (min-width: $desktop-min) {
      grid-template-columns: minmax(min-content, 250px) 1fr;
      grid-template-rows: max-content max-content;
    }
    @media (max-width: $mobile-max) {
      grid-template-rows: min-content 1fr;
    }
    >* {
      border: 1px solid $border-alt;
    }

    section.user-details {
      @media (min-width: $desktop-min) {
        grid-column: 2;
        grid-row: 1 / span 2;
      }
      @media (max-width: $mobile-max) {
        grid-row: 2;
      }
      display: flex;
      flex-direction: column;
      padding: $padding-m;

      hr {
        width: 100%;
        color: $border-alt;
        border-top: 1px;
      }
    }
  }
</style>