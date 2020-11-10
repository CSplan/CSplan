<script>
  export let id
  import tags from '../stores/tags';
  import { contenteditableKeypress } from '../misc/contenteditable'
  import { onMount } from 'svelte';

  let hasTag = false
  let tag

  onMount(() => {
    tag = $tags[id]
    hasTag = true
  })
</script>

{#if hasTag}
<div class="card">
  <header contenteditable spellcheck="false" on:keypress={contenteditableKeypress} on:input={(e) => tags.update(id, { name: e.target.textContent })} on:blur={tags.commit(id)}>{tag.name}</header>
  <div class="icons">
    <i class="fas fa-times clickable" on:click={tags.delete(id)}></i>
  </div>
</div>
{/if}

<style>
  .card {
    font-size: 1.25rem;
    margin-bottom: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .card header {
    margin: 0.5rem;
    padding: 0;
    border-bottom: none;
  }
  .card:first-child {
    margin-top: 2rem;
  }
  .card:not(:first-child) {
    margin-top: 1rem;
  }
  @media screen and (min-width: 1200px) {
    .card {
      min-width: 800px;
      max-width: 1200px;
    }
  }

  .icons {
    position: absolute;
    right: 0;
    margin: 0.25rem;
  }
  .icons i {
    margin: 0.5rem;
  }
  .icons i:hover {
    transform: scale(1.25)
  }
</style>