<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  let showTagForm = false

  let sampleTags = [...Array(5).fill({
    name: 'Sample Tag',
    color: 'lightgreen'
  }), {
    name: 'Other Tag',
    color: 'lightblue'
  }]

  let searchOptions = sampleTags

  function searchTags(evt) {
    const results = []
    for (const tag of sampleTags) {
      const index = tag.name.toLowerCase().search(evt.target.value.toLowerCase())
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
    searchOptions = final
  }

  function addTag(tag) {
    dispatch('newtag', tag)
    showTagForm = false
  } 
</script>

<div>
  <i class="fas fa-plus clickable" on:click={() => showTagForm = !showTagForm}/>
  <form class="tag-select {showTagForm ? 'show' : ''}" on:submit|preventDefault>
    <input type="text" autocomplete="on" on:input={searchTags}>
    <div class="options">
      {#each searchOptions as opt}
        <pre class="clickable" style="background-color: {opt.color};" on:click={addTag(opt)}>{opt.name}</pre>
      {/each}
    </div>
  </form>
</div>

<style>
  /* Add tag button */
  .tag-select {
    display: inline-block;
    position: relative;
    visibility: hidden;
  }
  .tag-select.show {
    visibility: visible;
  }
  .tag-select .options {
    min-width: 100%;
    margin: 0;
    margin-top: 0.3rem;
    background-color: white;
    position: absolute;
    top: 100%;
    z-index: 1;
    text-align: left;
    border: 1px solid #aaa;
  }
  .tag-select input {
    transition: none;
  }
  .options pre {
    border-radius: 0;
    background-color: inherit;
    margin: 0;
    padding: 0.2rem;
  }
  .options pre:hover {
    filter: hue-rotate(100deg);
  }
</style>