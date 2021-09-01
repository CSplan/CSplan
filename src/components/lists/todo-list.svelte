<script lang="ts">
  import { onMount, tick } from 'svelte'
  // import { flip } from 'svelte/animate'
  import lists from '../../stores/lists'
  import tags from '../../stores/tags'
  import Spinner from '../spinner.svelte'
  import TagForm from '../tag-form.svelte'
  import { CEkeypress, CEtrim } from '../../misc/contenteditable'
  import { fade } from 'svelte/transition'

  export let id: string

  // #region State
  let list: List
  enum States {
    Loading,
    Resting,
    Error,
    Saving,
    Saved
  }
  let state = States.Loading
  // #endregion

  // #region Editing/interactive
  let editMode = false
  async function toggleEditMode(): Promise<void> {
    editMode = !editMode
    if (!editMode) {
      await saveAndCommit()
    }
  }

  function updateTitle(evt: SafeEvent): void {
    CEtrim(evt)
    // If the title is null or empty, set it to the last known value
    if (!evt.currentTarget.textContent) {
      evt.currentTarget.textContent = list.title
      return
    }
    list.title = evt.currentTarget.textContent
  }
  function updateItemTitle(evt: SafeEvent, i: number): void {
    CEtrim(evt)
    if (!evt.currentTarget.textContent) {
      evt.currentTarget.textContent = list.items[i].title
      return
    }
    list.items[i].title = evt.currentTarget.textContent
  }
  function updateItemDescription(evt: SafeEvent, i: number): void {
    CEtrim(evt)
    list.items[i].description = evt.currentTarget.textContent || ''
  }

  // Toggle an item's completion
  async function toggleItem(index: number): Promise<void> {
    list.items[index].done = !list.items[index].done
    lists.update(id, {
      items: list.items
    })
    await saveAndCommit()
  }

  // Skeleton for new items
  const itemSkeleton = {
    title: '',
    description: '',
    tags: [],
    done: false
  }
  // Add a new item, and focus the item's title
  async function addItem(): Promise<void> {
    list.items.push({ ...itemSkeleton, tags: [] }) // js randomly implementing pointers amirite
    list.items = list.items
    // Wait for the DOM to update and focus the new item 
    await tick()
    const titleEl: HTMLElement = document.querySelector(`[data-index="${list.items.length - 1}"]`)!
    titleEl.focus()

    await saveAndCommit()
  }

  async function tagItem(index: number, id: string): Promise<void> {
    list.items[index].tags.push(id)
    list = list
    await saveAndCommit()
  }
  async function untagItem(index: number, id: string): Promise<void> {
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

  async function deleteItem(index: number): Promise<void> {
    list.items.splice(index, 1)
    list.items = list.items // Trigger render update
    await saveAndCommit()
  }
  // #endregion

  // #region Save animation
  const fadeDuration = 250
  let cooldown = false
  async function saveAndCommit(): Promise<void> {
    if (state !== States.Resting || cooldown) {
      return
    }
    cooldown = true
    // Wait .5s before showing a loading icon
    lists.update(id, {
      ...list
    })
    const timeout = setTimeout(() => {
      state = States.Saving
    }, 500)
    await lists.commit(id)
    clearTimeout(timeout)
    state = States.Saved
    setTimeout(() => {
      state = States.Resting
    }, fadeDuration)
    // To avoid DOM errors, we need to wait for 2*fadeDuration before allowing the user to save again (fade in + fade out)
    setTimeout(() => {
      cooldown = false
    }, 2*fadeDuration)
  }
  // #endregion

  // #region Drag and drop
  function ondragstart(evt: DragEvent, index: number): void {
    // Store the item's id in the data transfer
    evt.dataTransfer!.setData('text/plain', index.toString())
  }

  function ondragover(evt: DragEvent & SafeEvent): void {
    evt.preventDefault()
    // Apply a blue higlight
    const row = getRow(evt)
    row.style.border = 'var(--bold-blue) 2px solid'
    row.style.borderRadius = '0.3rem'
  }

  function ondragleave(evt: DragEvent & SafeEvent): void {
    evt.preventDefault()
    // Remove highlight
    const row = getRow(evt)
    row.style.border = ''
    row.style.borderRadius
  }

  // Move an item using .splice
  async function ondrop(evt: DragEvent & SafeEvent, index: number): Promise<void> {
    // Remove highlight
    ondragleave(evt)
    
    // Move the item
    const oldIndex = parseInt(evt.dataTransfer!.getData('text/plain'))
    const item = list.items[oldIndex]
    list.items.splice(oldIndex, 1)
    list.items.splice(index, 0, item)

    // Trigger rerender and save
    list.items = list.items
    await saveAndCommit()
  }

  // Return the first parent element of evt.target to contain the attribute [data-role="row"]
  // Used to highlight the correct element in drag and drop events
  function getRow(evt: SafeEvent): HTMLElement {
    let el: HTMLElement = evt.currentTarget as HTMLElement
    while (el.getAttribute('data-role') !== 'row') {
      if (!el.parentNode) {
        throw new Error('Unable to find row to highlight (drag and drop)')
      }
      el = el.parentNode as HTMLElement
    }
    return el
  }
  // #endregion
  
  onMount(async () => {
    await lists.init()
    await tags.init()
    console.log($lists, id)
    list = $lists[id]
    state = States.Resting
  })
</script>

<!-- Don't copy content on drop events -->
<svelte:window on:drop|preventDefault/>

{#if state !== States.Error && state !== States.Loading}
<div class="card {editMode ? 'editable' : ''}">
  <section class="title">
    <div class="spacer"/>
    <header class="title" contenteditable={editMode} spellcheck="false" on:keypress={CEkeypress} on:blur={updateTitle}>{list.title}</header>
    <div class="spacer"/>
    <i class="edit-mode-toggle fas fa-pencil-alt clickable" style="color: {editMode ? 'var(--bold-blue)' : 'initial'}" on:click={toggleEditMode}/>
  </section>

  {#each list.items as item, i (item)}
  <div class="row item-title marginless {!item.tags.length ? 'tagless' : ''}" on:dragover={ondragover} on:dragleave={ondragleave} on:dragexit={ondragleave} on:drop={e => ondrop(e, i)} data-role="row">
    <!-- Checkbox -->
    <i class="clickable checkbox { item.done ? 'fas fa-check-circle' : 'far fa-circle'}" on:click={() => toggleItem(i)}></i>


    <!-- Content -->
    <section class="content">
      <header data-index={i} contenteditable={editMode} spellcheck="false" on:keypress={CEkeypress} on:blur={e => updateItemTitle(e, i)}>{item.title}</header>
      <p class="no-empty-effect" contenteditable={editMode} spellcheck="false" on:blur={(e) => updateItemDescription(e, i)}>{item.description}</p>
    </section>

    <!-- Drag and drop handle -->

    {#if editMode}
    <div class="icons">
      <i class="fas fa-times clickable" on:click={() => deleteItem(i)}></i>
    </div>
    {/if}

    <div class="tags">
    {#if item.tags.length > 0}
      {#each item.tags as id (id)}
      {#if $tags[id]}
      <span class="tag" style="background-color: {$tags[id].color};">
          <p spellcheck="false">{$tags[id].name}</p>
          <i class="fas fa-times clickable" on:click={() => untagItem(i, id)}></i>
      </span>
      {/if}
      {/each}
    {/if}
    {#if editMode}
      <span class="tag tag-form">
        <TagForm on:newtag={e => tagItem(i, e.detail)} currentTags={item.tags}/>
      </span>
    {/if}
    </div>
  </div>
  {/each}
  {#if editMode}
    <div class="row-bottom centered clickable" on:click={addItem}>
      <i class="fas fa-plus"></i>
    </div>
  {/if}
  <div class="corner">
    {#if state === States.Saving}
      <Spinner size="1.5rem"/>
    {:else if state === States.Saved}
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
  .card.editable {
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
    padding: var(--padding-m);
    header {
      padding: 0;
      border-bottom: none;
    }
  }

  // Responsiveness
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

  // #region Rows
  .row {
    // Dimensions + color
    width: 100%;
    line-height: 1.25;
    color: initial;
    border-bottom: #ccc 1px solid;
    // Alignment
    text-align: left;
    padding: var(--padding-m);
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: min-content minmax(0, auto) min-content;
    column-gap: 0.5rem;
    row-gap: 0.3rem;
    grid-template-rows: minmax(0, auto) minmax(0, auto);
    // Modifiers
    &.tagless {
      grid-template-rows: minmax(0, auto);
    }
    &:hover {
      background: whitesmoke;
    }

    // Default child alignment
    * {
      grid-row: 1 / span 1;
    }
    i.checkbox {
      grid-row: 1 / -1;
    }

    // Content contains an item's title and description
    .content {
      color: initial;
      display: flex;
      flex-direction: column;
      text-align: left;
      z-index: 1;
      * {
        border: none;
        padding: 0;
        margin-top: 0;
        margin-bottom: 0;
      }
      p {
        margin: 0.3rem 0;
      }
      // Hide empty descriptions
      p:empty {
        display: none;
      }
    }

    /* Spacers (used for drag and drop) lay underneath the content (title, description, and tags) of a row,
    allowing drag and drop to be performem from anywhere in an item you don't see content or icons */
    .spacer {
      grid-column: 2 / span 1;
      grid-row: 1 / -1;
    }
    .content, .tags {
      grid-column: 2 / span 1;
      width: max-content;
      padding: 0;
      margin-top: auto;
      margin-bottom: auto;
      height: max-content;
    }
    // Scale icons on hover
    .icons {
      i:hover {
        transform: scale(1.25);
      }
    }
  }
  .row-bottom {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
  }
  // #endregion

  // #region Tags
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
    border-radius: 0;
    font-size: small;
    margin-right: 0.25rem;
    padding: 0 0.3rem;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    // TODO: adjust tag height

    // Tag content (text + buttons)
    * {
      background-color: inherit;
      margin: 0 0.2em;
      padding: 0;
    }

    // Form for adding new tags
    &.tag-form {
      padding: 0;
      margin-right: 0;
    }
  }
  // #endregion

  .corner {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
  }
</style>
