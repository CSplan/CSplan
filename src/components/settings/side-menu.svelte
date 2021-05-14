<script lang="ts">
  // Menus are a group of submenus, which provide onclick handlers (usually emitting menuchange events)
  class Menu {
    title: string
    icon: string
    items: MenuItem[]
    collapsed = true

    constructor(title: string, icon: string, items: MenuItem[]) {
      this.title = title
      this.icon = icon
      this.items = items
    }

    toggle(): Menu {
      this.collapsed = !this.collapsed
      return this
    }
  }
  /*
  type Menu = {
    title: string
    icon: string
    items: MenuItem[]
    open?: boolean
    collapseIndicator?: HTMLElement
  }
  */
  type MenuItem = {
    icon: string
    title: string
    disabled?: boolean
    onclick?: (evt: MouseEvent) => void
  }
  
  const accountMenu = new Menu('Account', 'fas fa-user', [
    {
      title: 'Email/ID',
      icon: 'fas fa-email'
    }
  ])

  const menus: Menu[] = [
    accountMenu
  ]
</script>

<div class="side-menu">
  {#each menus as menu, i}
    <section class="menu">
      <div class="collapse-indicator {menu.collapsed ? 'collapsed' : ''}" style="{!menu.collapsed ? `grid-row: 1 / -${menu.items.length + 2}` : ''}"></div>
      <button class="transparent" on:click={() => menus[i] = menu.toggle()}>
        <i class={menu.icon}/>
        {menu.title}
      </button>
      {#each menu.items as item}
        <button class="transparent" disabled={item.disabled || false} title={item.disabled ? 'Coming soon' : ''} on:click={item.onclick}>
          <i class={item.icon}/>
          <span>{item.title}</span>
        </button>
      {/each}
    </section>
  {/each}
</div>

<style lang="scss">
  @import '../../scss/colors.scss';

  .side-menu {
    width: 15rem;
    padding: 0.6rem;
    background-color: var(--background-dark);

    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;

    .menu {
      display: grid;
      grid-template-columns: min-content minmax(0, auto);
      grid-auto-rows: auto;
      width: 100%;
      grid-auto-flow: row;
      column-gap: 0.5rem;
      .collapse-indicator {
        grid-column: 1 / span 1;
        width: 0.5rem;
        background-color: white;
        transition: border-radius 500ms, max-height 500ms;
        &.collapsed {
          grid-row: 1 / span 1;
          max-height: 0.5rem;
          margin: auto 0;
          border-radius: 50%;
        }
      }
      button {
        grid-column: 2 / span 1;
        width: 90%;
        $hpad: 2rem;
        text-align: center;
        position: relative;
        padding-left: $hpad;
        padding-right: $hpad;
        border-radius: 0;
        
        &:disabled {
          background-color: rgba(100, 100, 100, 0.25);
          cursor: not-allowed;
        }
        i {
          position: absolute;
          left: 0;
          margin: 0 0.5rem;
          margin-top: 0.25rem;
        }
      }
    }
  }
</style>