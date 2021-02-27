<script>
  /* eslint-disable */
  import { onMount, tick } from 'svelte'
  import { flip } from 'svelte/animate'
  import lists from '../../stores/lists'
  import tags from '../../stores/tags'
  import Spinner from '../spinner.svelte'
  import TagForm from '../tagForm.svelte'
  import { CEkeypress, CEtrim } from '../../misc/contenteditable'
  import { fade } from 'svelte/transition'

  export let id

  // Skeleton for new items
  const itemSkeleton = {
    title: '',
    description: '',
    tags: [],
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
    await tags.init()
    list = $lists[id]
    console.log($lists, id)
    console.log(list)
    hasList = true
  })

  // Editing logic
  let editMode = false
  async function toggleEditMode() {
    editMode = !editMode
    if (!editMode) {
      await saveAndCommit()
    }
  }

  function updateTitle(evt) {
    CEtrim(evt)
    list.title = evt.target.textContent
  }
  function updateItemTitle(evt, i) {
    CEtrim(evt)
    list.items[i].title = evt.target.textContent
  }
  function updateItemDescription(evt, i) {
    CEtrim(evt)
    list.items[i].description = evt.target.textContent
  }

  // Normal logic
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

  /**
   * Drag and drop logic
  */
  function ondragstart(evt, index) {
    // Store the item's id in the data transfer
    evt.dataTransfer.setData('text/plain', index)
  }

  function ondragover(evt) {
    evt.preventDefault()
    // Set a blue higlight
    const row = getRow(evt)
    row.style.border = 'var(--bold-blue) 2px solid'
    row.style['border-radius'] = '0.3rem'
  }

  function ondragleave(evt) {
    evt.preventDefault()
    getRow(evt).style = ''
  }

  // Move the item using .splice
  async function ondrop(evt, index) {
    evt.preventDefault()
    getRow(evt).style = ''
    const oldIndex = evt.dataTransfer.getData('text/plain')
    const item = list.items[oldIndex]
    list.items.splice(oldIndex, 1)
    list.items.splice(index, 0, item)
    // Trigger rerender
    list.items = list.items
    await saveAndCommit()
  }

  // Return the first parent element of evt.target to contain the attribute [data-role="row"]
  // Used to highlight the correct element in drag and drop events
  function getRow(evt) {
    let el
    el = evt.target.parentNode
    while (el.getAttribute('data-role') !== 'row') {
      el = el.parentNode
    }
    return el
  }

</script>

<!-- Don't copy content on drop events -->
<svelte:window on:drop|preventDefault/>

{#if hasList}
<div class="card {editMode ? 'editable' : ''}">
  <section class="title">
    <div class="spacer"/>
    <header class="title" contenteditable={editMode} spellcheck="false" on:keypress={CEkeypress} on:blur={updateTitle}>{list.title}</header>
    <div class="spacer"/>
    <i class="edit-mode-toggle fas fa-pencil-alt clickable" style="color: {editMode ? 'var(--bold-blue)' : 'initial'}" on:click={toggleEditMode}/>
  </section>

  {#each list.items as item, i (item)}
  <div class="row item-title marginless {!item.tags.length ? 'tagless' : ''}" data-role="row">
    <!-- Checkbox -->
    <i class="clickable checkbox { item.done ? 'fas fa-check-circle' : 'far fa-circle'}" on:click={() => toggleItem(i)}></i>


    <!-- Content -->
    <section class="content">
      <header data-index={i} contenteditable={editMode} spellcheck="false" on:keypress={CEkeypress} on:blur={e => updateItemTitle(e, i)}>{item.title}</header>
      <p class="no-empty-effect" contenteditable={editMode} spellcheck="false" on:blur={(e) => updateItemDescription(e, i)}>{item.description}</p>
    </section>

    <!-- Spacer - positioned behind content, used to drag items to move their position -->
    <div class="spacer" draggable={editMode}
      on:dragstart={e => ondragstart(e, i)} on:dragover={ondragover} on:dragleave={ondragleave} on:dragexit={ondragleave} on:drop={e => ondrop(e, i)}/>

    {#if editMode}
    <div class="icons">
      <i class="fas fa-times clickable" on:click={() => deleteItem(i)}></i>
    </div>
    {/if}

    {#if item.tags.length > 0}
    <div class="tags">
      {#each item.tags as id (id)}
      {#if $tags[id]}
      <span class="tag" style="background-color: {$tags[id].color};">
          <p spellcheck="false">{$tags[id].name}</p>
          <i class="fas fa-times clickable" on:click={untagItem(i, id)}></i>
      </span>
      {/if}
      {/each}
      {#if editMode}
        <span class="tag tag-form">
          <TagForm on:newtag={e => tagItem(i, e.detail)} currentTags={item.tags}/>
        </span>
      {/if}
    </div>
    {/if}
  </div>
  {/each}
  {#if editMode}
    <div class="row-bottom centered clickable" on:click={addItem}>
      <i class="fas fa-plus"></i>
    </div>
  {/if}
  <div class="corner">
    {#if saveState === saveStates.saving}
      <Spinner size="1.5rem"/>
    {:else if saveState === saveStates.success}
      <i class="fas fa-check bold" transition:fade={{ duration: fadeDuration }}></i>
    {/if}
  </div>
</div>
{/if}

<style lang="scss">
  header.title {
    font-size: 24px;
    text-align: center;
  }

  .row header, .row .content p {
    max-width: 100%;
    word-break: break-word;
  }
  .card {
    overflow: visible;
    section.content {
      header {
        margin: auto 0;
      }
      p {
        /* Hide empty descriptions*/
        &:empty {
          display: none;
        }
      }
    }


    /* Edit mode styles */
    &.editable {
      section.content {
        p {
          &:empty {
            display: block;
            &::before {
              content: "Description";
              color: rgba(0, 0, 0, 0.3);
            }
          }
        }
      }
    }

    section.title {
      display: grid;
      grid-template-columns: minmax(5rem, 1fr) max-content minmax(5rem, 1fr) max-content;
      grid-auto-flow: column;
      border-bottom: 1px solid #aaa;
      padding: 0.5rem;
      header {
        padding: 0;
        border-bottom: none;
      }
    }
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

  .checkbox {
    font-size: 1.75rem;
  }

  .row {
    width: 100%;
    line-height: 1.25;
    color: initial;
    text-align: center;
    padding: 0.5rem;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: min-content minmax(0, auto) min-content;
    column-gap: 0.5rem;
    row-gap: 0.25rem;
    grid-template-rows: minmax(0, auto) minmax(0, auto);
    &.tagless {
      grid-template-rows: minmax(0, auto);
    }
    * {
      grid-row: 1 / span 1;
    }
    i.checkbox {
      grid-row: 1 / -1;
    }
    .spacer {
      grid-column: 2 / span 1;
      grid-row: 1 / -1;
    }
    .content, .tags {
      grid-column: 2 / span 1;
      width: max-content;
      z-index: 1;
      padding: 0;
      height: max-content;
    }
  }
  .row-bottom {
    padding: 0.5rem;
  }

  /* Tag styles */
  .tags {
    grid-row: 2 / span 1;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }
  .tag {
    max-width: 100%;
    word-break: break-all;
    --margin: 0.25rem;
    border-radius: 0;
    font-size: small;
    margin-right: 0.25rem;
    padding: 0 0.3rem;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    min-height: 1.6rem;
  }
  .tag.tag-form {
    padding: 0;
    margin-right: 0;
  }

  /* Tag element (text + buttons) styling */
  .tag>* {
    background-color: inherit;
    margin: 0 0.2em;
    padding: 0;
  }
  .tag>*:first-child {
    margin-left: 0;
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

  /* Slight padding above the title and below the description (only if it isn't empty)*/
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

  .corner {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
  }
</style>
