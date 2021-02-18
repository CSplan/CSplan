<script>
  import { createEventDispatcher, onMount, tick } from 'svelte'
  import tags, { ordered } from '../stores/tags'
  import { scale } from 'svelte/transition'

  const dispatch = createEventDispatcher()

  let showTagForm = false
  export let currentTags = []

  let defaultSearchOptions = []
  let searchOptions = []
  let searchText = ''
  let inputEl
  $: {
    defaultSearchOptions = []
    for (const tag of $ordered) {
      if (!currentTags.includes(tag.id)) {
        defaultSearchOptions.push(tag)
      }
    }
    defaultSearchOptions = defaultSearchOptions
  }

  $: {
    if (!searchText.length) {
      searchOptions = defaultSearchOptions
    } else {
      searchOptions = searchTags()
    }
  }

  async function toggleForm() {
    showTagForm = !showTagForm
    await tick()
    if (showTagForm) {
      inputEl.focus()
    } else {
      inputEl.value = ''
    }
  }

  function searchTags() {
    const results = []
    for (const tag of $ordered) {
      if (currentTags.includes(tag.id)) {
        continue
      }

      const index = tag.name.toLowerCase().search(searchText.toLowerCase())
      if (index >= 0) {
        if (!Array.isArray(results[index])) {
          results[index] = []
        }
        results[index].push(tag)
      }
    }
    const final = []
    for (const result of results) {
      if (Array.isArray(result)) {
        for (const tag of result) {
          final.push(tag)
        }
      }
    }
    return final
  }

  function addTag(tag) {
    dispatch('newtag', tag.id)
    showTagForm = false
  }

  onMount(async () => {
    await tags.init()
  })
</script>

<div>
  <i class="fas fa-plus clickable toggle-button {showTagForm ? 'rotated' : ''}" on:click={toggleForm}/>
  {#if showTagForm}
    <form class="tag-select" on:submit|preventDefault transition:scale={{ duration: 200 }}>
      <input type="text" autocomplete="on" placeholder="Search Tags" bind:this={inputEl} bind:value={searchText}>
      <div class="options">
        {#if searchOptions.length > 0}
          {#each searchOptions as opt}
            <p class="clickable" style="background-color: {opt.color};" on:click={addTag(opt)}>{opt.name}</p>
          {/each}
        {:else}
          <p>No Tags Found</p>
        {/if}
      </div>
    </form>
  {/if}
</div>

<style lang="scss">
  .toggle-button {
    transition: 0.2s transform;
    &.rotated {
      transform: rotate(45deg);
    }
  }
  /* Add tag button */
  .tag-select {
    display: inline-block;
    position: relative;
    z-index: 1;
  }
  .tag-select .options {
    min-width: 100%;
    margin: 0;
    background-color: white;
    position: absolute;
    top: 100%;
    text-align: left;
    border: 1px solid #aaa;
  }
  .tag-select input {
    transition: none;
    border-radius: 0;
  }
  .options p {
    background-color: inherit;
    padding: 0;
    margin: 0;
  }
  .options p:hover {
    filter: hue-rotate(100deg);
  }
  .options p {
    padding: 0.3rem;
  }

  /* 0.6em margin matches 0.6em vertical padding on the form*/
  i {
    margin: 0.6em 0;
  }
</style>