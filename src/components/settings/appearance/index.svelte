<script lang="ts">
  import { invalidate } from '$app/navigation'
  import { csfetch, route } from '$lib'
  export let settings: App.Locals['settings']

  async function saveDarkMode(value: boolean): Promise<void> {
    const body: App.Locals['settings'] = {
      darkMode: value
    }
    const url = route('/settings')
    await csfetch(url, {
      method: 'PATCH',
      body: JSON.stringify(body)
    })
    await invalidate(url)
  }
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
        saveDarkMode(!settings.darkMode)
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
</style>