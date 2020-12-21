<script>
  import { onMount, tick } from 'svelte'
  import lists from '../stores/lists'
  import tags from '../stores/tags'
  import Spinner from './spinner.svelte'
  import TagForm from './tagForm.svelte'
  import { CEkeypress, CEtrim } from '../misc/contenteditable'
  import { fade } from 'svelte/transition'

  export let id

  // Skeleton for new items
  const itemSkeleton = {
    title: '',
    description: '',
    category: '',
    done: false
  }

  let list
  let hasList = false
  let saveStates = {
    resting: 0,
    saving: 1,
    success: 2,
    error: 3
  }
  let saveState = saveStates.resting
  const fadeDuration = 250

  onMount(async () => {
    await lists.init()
    list = $lists[id]
    hasList = true
  })

  async function toggleItem(index) {
    const updatedItems = list.items
    updatedItems[index].done = !updatedItems[index].done
    await lists.update(id, {
      items: updatedItems
    })
    list = $lists[id] // Trigger render update
    await saveAndCommit()
  }

  async function addItem() {
    list.items.push({ ...itemSkeleton, tags: [] }) // js randomly implementing pointers amirite
    list.items = list.items
    // Wait for the DOM to update and focus the new item 
    await tick()
    document.querySelector(`[data-index="${list.items.length - 1}"]`).focus()

    await saveAndCommit()
  }

  async function tagItem(index, id) {
    list.items[index].tags.push(id)
    console.log(list.items)
    list = list
    await saveAndCommit()
  }
  async function untagItem(index, id) {
    const tags = list.items[index].tags
    for (let i = 0; i < tags.length; i++) {
      if (tags[i] == id) {
        tags.splice(i, 1)
        list.items[index].tags = tags
        break
      }
    }
    await saveAndCommit()
  }

  async function deleteItem(index) {
    list.items.splice(index, 1)
    await saveAndCommit()
    list.items = list.items // Trigger render update
  }

  let cooldown = false
  async function saveAndCommit() {
    if (saveState !== saveStates.resting || cooldown) {
      return
    }
    cooldown = true
    // Wait .5s before showing a loading icon
    lists.update(id, {
      ...list
    })
    const timeout = setTimeout(() => {
      saveState = saveStates.saving
    }, 500)
    await lists.commit(id)
    clearTimeout(timeout)
    saveState = saveStates.success
    setTimeout(() => {
      saveState = saveStates.resting
    }, fadeDuration)
    // To avoid DOM errors, we need to wait for 2*fadeDuration before allowing the user to save again (fade in + fade out)
    setTimeout(() => {
      cooldown = false
    }, 2*fadeDuration)
  }
</script>

{#if hasList}
<div class="card">
  <header class="title" contenteditable spellcheck="false" on:keypress={CEkeypress} on:blur={CEtrim} bind:textContent={list.title}>{list.title}</header>
  {#each list.items as item, i (i)}
  <div class="row item-title marginless">
    <i class="clickable checkbox { item.done ? 'fas fa-check-circle' : 'far fa-circle'}" on:click={() => toggleItem(i)}></i>


    <div class="content">
      <header data-index={i} contenteditable spellcheck="false" on:keypress={CEkeypress} on:blur={CEtrim} bind:textContent={list.items[i].title} on:blur={saveAndCommit}>{item.title}</header>
      <p class="no-empty-effect" contenteditable spellcheck="false" bind:textContent={list.items[i].description} on:blur={CEtrim} on:blur={saveAndCommit}>{item.description}</p>
    </div>

    <div class="spacer"/>

    <div class="icons">
      <i class="fas fa-times clickable" on:click={() => deleteItem(i)}></i>
    </div>

    <div class="tags">
      {#each item.tags as id (id)}
      {#if $tags[id]}
      <span class="tag" style="background-color: {$tags[id].color};">
          <p contenteditable spellcheck="false" on:keypress={CEkeypress} on:blur={CEtrim}>{$tags[id].name}</p>
          <i class="fas fa-times clickable" on:click={untagItem(i, id)}></i>
      </span>
      {/if}
      {/each}
      <span class="tag tag-form">
        <TagForm on:newtag={e => tagItem(i, e.detail)} currentTags={item.tags}/>
      </span>
    </div>
  </div>
  {/each}
  <div class="row-bottom centered clickable" on:click={addItem}>
    <i class="fas fa-plus"></i>
  </div>
  <div class="corner">
    {#if saveState === saveStates.saving}
      <Spinner size="1.5rem"/>
    {:else if saveState === saveStates.success}
      <i class="fas fa-check bold" transition:fade={{ duration: fadeDuration }}></i>
    {/if}
  </div>
</div>
{/if}

<style>
  header.title {
    font-size: 24px;
    padding: 0.5rem;
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .row header, .row .content p {
    max-width: 100%;
    word-break: break-word;
    margin-right: 2rem;
  }
  .card {
    overflow: visible;
  }
  @media screen and (min-width: 960px) {
    .card {
      min-width: 800px;
      max-width: 1200px;
    }
  }
  @media screen and (max-width: 960px) {
    .card {
      margin: 2rem;
    }
  }

  i.checkbox {
    font-size: 1.75rem;
  }

  .row {
    width: 100%;
    color: initial;
    text-align: center;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: min-content minmax(0, auto) minmax(0, 1fr) minmax(0, auto);
    grid-template-rows: max-content minmax(0, auto);
  }
  .row * {
    grid-row: 1 / span 1;
  }

  /* Tag styles */
  .tags {
    grid-column: 2 / span 2;
    grid-row: 2 / span 1;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .tag {
    max-width: 100%;
    word-break: break-all;
    --margin: 0.25rem;
    font-size: small;
    border-radius: 0;
    margin-right: var(--margin);
    margin-bottom: var(--margin);
    padding: 0 0.3rem;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
  }
  .tag.tag-form {
    padding: 0;
  }
  .tag:last-child {
    margin-right: 0;
  }

  /* Tag element (text + buttons) styling */
  .tag>* {
    background-color: inherit;
    margin: 0 0.2rem;
    padding: 0;
  }
  .tag>*:first-child {
    margin-left: 0;
  }
  .tag>*:last-child {
    margin-right: 0;
  }


  .row-bottom {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  .row .content {
    color: initial;
    text-align: center;
    display: flex;
    flex-direction: column;
    text-align: left;
  }
  .row .content * {
    border: none;
    padding: 0;
    margin-top: 0;
    margin-bottom: 0;
  }
  .row .content p:empty:not(:focus)::before {
    content: "Description";
    color: rgba(0, 0, 0, 0.3);
  }

  /* Slight padding above the title and below the description (only if it isn't empty)*/
  .row .content header {
    padding: 0.2rem 0;
  }
  .row .content p {
    padding-bottom: 0.2rem;
  }
  .row .icons i:hover {
    transform: scale(1.25);
  }
  .row:hover {
    background: whitesmoke;
  }
  /* Create separators */
  .row {
    border-bottom: #ccc 1px solid;
  }
  i {
    margin: 0.5rem;
  }

  .corner {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
  }
</style>
