<script lang="ts">
  import { saveSetting } from '$lib/settings'
  export let settings: App.Locals['settings']

</script>

<section class="settings-menu-container">
  <article class="appearance-menu">
    <div class="setting">
      <i class="{settings.darkMode ? 'fas' : 'far'} fa-moon"></i>
      <header>Dark Mode:
        <span style:color={settings.darkMode ? 'var(--success-green)' : 'var(--danger-red)'}>
          {settings.darkMode ? 'Enabled' : 'Disabled'} 
        </span>
      </header>
      
      <i class="clickable checkbox fas {settings.darkMode ? 'fa-circle-check' : 'fa-circle-xmark'}" on:click={async () => {
        saveSetting('darkMode', !settings.darkMode)
      }}></i>
    </div>

    <div class="setting">
      <div class="icons-row">
        <i class="far fa-square-list"></i>
        <i class="fas {settings.reverseLists ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
      </div>
      <header>Reverse List Order:
        <span style:color={settings.reverseLists ? 'var(--success-green)' : 'var(--danger-red)'}>
          {settings.reverseLists ? 'Enabled' : 'Disabled'}
        </span>
      </header>

      <i class="clickable checkbox fas {settings.reverseLists ? 'fa-circle-check' : 'fa-circle-xmark'}"
      on:click={async () => {
        await saveSetting('reverseLists', !settings.reverseLists)
      }}></i>
    </div>
  </article>
</section>

<style lang="scss">
  @import '../position.scss';
  section.settings-menu-container {
    @include settings-menu-container;
    align-items: center;
  }
  section.settings-menu-container :global {
    @include form-styles;
  }
  
  article {
    @media (min-width: $desktop-min) {
      width: 600px;
    }
    margin: 1.5rem 0;
    background: $bg-primary;
    color: $text-normal;
    padding: $padding-m;
    border: 1px solid $border-normal;
    
    display: flex;
    flex-direction: column;
  }
  
  .setting {
    font-size: 110%;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: min-content auto min-content;
    column-gap: 0.5rem;
    margin: 1rem 0;
    i {
      font-size: 1.75rem;
      &.checkbox {
        font-size: 2rem;
      }
    }
    header,i {
      margin: auto 0;
    }
  }
  div.icons-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    i:not(:first-child) {
      margin-left: 0.25rem;
    }
    i:not(:last-child) {
      margin-right: 0.25rem;
    }
  }
</style>