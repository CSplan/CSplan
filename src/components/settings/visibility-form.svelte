<script lang="ts">
  import { Visibilities } from '$lib'

  export let visibility: Visibilities
  export let disabled = false
  let savedVisibility = visibility

  let showVisibilities = false
  let visibilityIcon: string
  $: switch (visibility) {
  case Visibilities.Encrypted:
    visibilityIcon = 'fas fa-lock'
    break
  case Visibilities.SemiPublic:
    visibilityIcon = 'far fa-eye-slash' // FIXME: Change to user-unlock with FA pro
    break
  case Visibilities.Public:
    visibilityIcon = 'fas fa-user'
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
      <i class="fas fa-lock"/>
      <span>Encrypted</span>
      <!-- FIXME: These indicator icons are ugly, will be removed when better control of icon texture is available w FA-pro -->
      <i class="{visibility === Visibilities.Encrypted ? 'fas' : 'far'} fa-circle indicator"></i>
      <input type="radio" bind:group={visibility} value={Visibilities.Encrypted} on:change={onChange}>
    </label>

    <label class="d-none">
      <i class="far fa-eye-slash"></i>
      <span>Semi-Public</span>
      <i class="{visibility === Visibilities.SemiPublic ? 'fas' : 'far'} fa-circle indicator"></i>
      <input type="radio" disabled>
    </label>

    <label>
      <i class="fas fa-user"></i>
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
    border: 1px solid #aaa;
    border-radius: 3px;
    background: white;

    display: flex;
    flex-direction: column;
    align-items: center;
    input {
      display: none;
    }
    label,header {
      padding: 0.6rem 0.8rem;
      width: 100%;
      border-bottom: 1px solid #aaa;
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
        background: whitesmoke;
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