<script lang="ts">
  import { Visibilities } from '$lib'

  export let visibility: Visibilities
  export let disabled = false
  let savedVisibility = visibility

  let showVisibilities = false
  let visibilityIcon: string

  // Icons used
  const enum Icons {
    Encrypted = 'fa-lock',
    SemiPublic = 'fa-user-unlock',
    Public = 'fa-user'
  }

  $: switch (visibility) {
  case Visibilities.Encrypted:
    visibilityIcon = `fas ${Icons.Encrypted}`
    break
  case Visibilities.SemiPublic:
    visibilityIcon = `fas ${Icons.SemiPublic}`
    break
  case Visibilities.Public:
    visibilityIcon = `fas ${Icons.Public}`
  }

  // If the visibility has changed from its last setting, hide the form
  function onChange(): void {
    if (visibility !== savedVisibility) {
      savedVisibility = visibility
      showVisibilities = false
    }
  }

  function onclick(evt: MouseEvent): void {
    if (disabled) {
      evt.preventDefault()
    }
  }
</script>

<svelte:window on:click={() => showVisibilities = false} />

<details class="visibility" bind:open={showVisibilities} on:click|stopPropagation={onclick}>
  <summary>
    <i class="visibility {visibilityIcon} clickable" title="{Visibilities[visibility]}"/>
  </summary>

  <section class="visibilities">
    <header>Visibility</header>

    <label>
      <i class="{visibility === Visibilities.Encrypted ? 'fas' : 'far'} {Icons.Encrypted}"/>
      <span>Encrypted</span>
      <i class="{visibility === Visibilities.Encrypted ? 'fas' : 'far'} fa-circle indicator"></i>
      <input type="radio" bind:group={visibility} value={Visibilities.Encrypted} on:change={onChange}>
    </label>

    {#if false}
    <label>
      <i class="{visibility === Visibilities.SemiPublic ? 'fas' : 'far'} {Icons.SemiPublic}"></i>
      <span>Semi-Public</span>
      <i class="{visibility === Visibilities.SemiPublic ? 'fas' : 'far'} fa-circle indicator"></i>
      <input type="radio" disabled>
    </label>
    {/if}

    <label>
      <i class="{visibility === Visibilities.Public ? 'fas' : 'far'} {Icons.Public}"></i>
      <span>Public</span>
      <i class="{visibility === Visibilities.Public ? 'fas' : 'far'} fa-circle indicator"></i>
      <input type="radio" id="vis-public" bind:group={visibility} value={Visibilities.Public} on:change={onChange}>
    </label>
  </section>
</details>

<style lang="scss">
  
  details.visibility {
    position: relative;
    float: right;
  }
  i.visibility {
    display: block;
    text-align: right;
  }
  section.visibilities {
    min-width: 10rem;
    font-size: 0.95rem;
    position: absolute;
    z-index: 1;
    right: 0;
    margin-top: 0.5rem;
    border: 1px solid $border-alt;
    border-radius: 3px;
    background: $bg-primary;

    display: flex;
    flex-direction: column;
    align-items: center;
    input {
      display: none;
    }
    label,header {
      padding: 0.6rem 0.8rem;
      width: 100%;
      border-bottom: 1px solid $border-alt;
      text-align: left;
    }
    label {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      i:first-of-type {
        margin-right: 0.4rem;
        margin-top: -0.2rem;
      }
      i.indicator {
        margin-left: auto;
        font-size: 75%;
      }
      &:hover {
        background: $bg-hover;
      }
    }
    header {
      padding-bottom: 0.3rem;
      font-size: 1rem;
    }
    label:last-of-type {
      border-bottom: none;
    }
  }
  span {
    margin: 0 !important;
  }
</style>