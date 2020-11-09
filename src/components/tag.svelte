<script>
  export let id
  import tags from '../stores/tags';
  import { contenteditableKeypress } from '../misc/contenteditable'
  import { onMount } from 'svelte';

  const states = {
    loading: 0,
    resting: 1
  }
  let state = states.loading

  let hasTag = false
  let tag

  onMount(() => {
    tag = $tags[id]
    hasTag = true
  })
</script>

{#if hasTag}
<div class="card">
  <header contenteditable on:keypress={contenteditableKeypress}>{tag.name}</header>
  <div class="icons">
    <i class="fas fa-times clickable"></i>
  </div>
</div>
{/if}

<style>
  .card {
    font-size: 1.25rem;
    margin-bottom: 0;
  }
  .card header {
    padding: 0.5rem;
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
  .icons i:hover {
    transform: scale(1.25)
  }
</style>