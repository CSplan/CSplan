<script lang="ts">
  import { onMount, tick } from 'svelte'
  // import { flip } from 'svelte/animate'
  import lists from '$stores/lists'
  import tags from '$stores/tags'
  import Spinner from '$components/spinner.svelte'
  import TagForm from '$components/tag-form.svelte'
  import { CEkeypress, CEtrim } from '../../misc/contenteditable'
  import { formElementIsFocused } from '$lib'
  import { fade } from 'svelte/transition'
  import { flip } from 'svelte/animate'
  import DOMPurify from 'dompurify'

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
      await save()
    }
  }

  function updateTitle(evt: SafeEvent): void {
    CEtrim(evt)
    // If the title is null or empty, set it to the last known value
    const title = evt.currentTarget
    if (title.textContent == null || !title.textContent.length) {
      title.textContent = list.title
      return
    }
    list.title = title.textContent
  }
  function updateItemTitle(evt: SafeEvent, i: number): void {
    CEtrim(evt)
    const title = evt.currentTarget
    if (title.textContent == null || !title.textContent.length) {
      title.textContent = list.items[i].title
      return
    }
    list.items[i].title = title.textContent
  }
  function updateItemDescription(evt: SafeEvent, i: number): void {
    const description = CEtrim(evt) // Will be sanitized before API storage
    list.items[i].description = description
  }

  // Toggle an item's completion
  async function toggleItem(index: number): Promise<void> {
    list.items[index].done = !list.items[index].done
    lists.update(id, {
      items: list.items
    })
    await save()
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

    await save(false)
  }

  async function tagItem(index: number, id: string): Promise<void> {
    list.items[index].tags.push(id)
    list = list
    await save()
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
    await save()
  }

  async function deleteItem(index: number): Promise<void> {
    list.items.splice(index, 1)
    list.items = list.items // Trigger render update
    await save()
  }
  // #endregion

  // #region Keyboard shortcuts
  function onkeypress(evt: KeyboardEvent): void {
    const shortcut = keyboardShortcuts[evt.key]
    if (shortcut != null) {
      if (shortcut.ignoreInForm && formElementIsFocused()) {
        return
      }
      shortcut.handler()
    }
  }

  const keyboardShortcuts: { [key: string]: KeyboardShortcut } = {
    e: {
      handler: toggleEditMode,
      ignoreInForm: true
    }
  }
  // #endregion

  // #region Save animation
  const fadeDuration = 250
  let cooldown = false
  async function save(commit = true): Promise<void> {
    if (state !== States.Resting || cooldown) {
      return
    }
    // Wait .5s before showing a loading icon
    // Clientside sanitization is performed before display, and this is all encrypted serverside, so the only purpose this serves 
    lists.update(id, {
      ...list
    })
    if (!commit) {
      return
    }
    cooldown = true
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
  const highlightRow: {
    [index: number]: boolean
  } = {}

  function ondragstart(evt: DragEvent, index: number): void {
    // Store the item's id in the data transfer
    evt.dataTransfer!.setData('text/plain', index.toString())
  }

  function ondragover(evt: DragEvent, index: number): void {
    // Apply a blue higlight
    highlightRow[index] = true
  }

  function ondragleave(evt: DragEvent, index: number): void {
    // Remove highlight
    highlightRow[index] = false
  }

  // Move an item using .splice
  async function ondrop(evt: DragEvent, index: number): Promise<void> {
    // Move the item
    const oldIndex = parseInt(evt.dataTransfer!.getData('text/plain'))
    await moveItem(oldIndex, index)
    highlightRow[index] = false
  }

  async function moveItem(oldIndex: number, newIndex: number): Promise<void> {
    const item = list.items[oldIndex]
    list.items.splice(oldIndex, 1)
    list.items.splice(newIndex, 0, item)

    // Trigger rerender and save
    list.items = list.items
    await save()
  }
  // #endregion
  
  onMount(async () => {
    await lists.init()
    await tags.init()
    list = $lists[id]
    state = States.Resting
  })
</script>

<!-- Don't copy content on drop events -->
<svelte:window on:drop|preventDefault on:keypress={onkeypress}/>

{#if state !== States.Error && state !== States.Loading}
<div class="card {editMode ? 'editable' : ''}">
  <section class="title">
    <div class="spacer"/>
    <header class="title" contenteditable={editMode} spellcheck="false" on:keypress={CEkeypress} on:blur={updateTitle}>{list.title}</header>
    <div class="spacer"/>
    <i class="edit-mode-toggle fas fa-pencil-alt clickable" style="color: {editMode ? 'var(--bold-blue)' : 'initial'}" on:click={toggleEditMode}/>
  </section>

  {#each list.items as item, i (item)}
  <div class="row item-title marginless {item.tags.length === 0 ? 'tagless' : ''}" animate:flip={{ duration: 200 }}
    class:highlighted={highlightRow[i]}
    on:dragover|preventDefault={e => ondragover(e, i)}
    on:dragexit|preventDefault={e => ondragleave(e, i)}
    on:dragleave|preventDefault={e => ondragleave(e, i)}
    on:drop|capture|preventDefault={e => ondrop(e, i)}>

    <!-- Checkbox -->
    <i class="clickable checkbox {item.done === true ? 'fas fa-check-circle' : 'far fa-circle'}" on:click={() => toggleItem(i)}></i> <!-- TODO: check to see if eslint-plugin-svelte3 has fixed type aware rules in template syntax-->

    <!-- Content -->
    <section class="content">
      <header data-index={i} contenteditable={editMode} spellcheck="false" on:keypress={CEkeypress} on:blur={e => updateItemTitle(e, i)}>{item.title}</header>
      <p class="no-empty-effect" contenteditable={editMode} spellcheck="false" on:blur={(e) => updateItemDescription(e, i)}>
        {@html DOMPurify.sanitize(item.description.replaceAll('\n', '<br>'))}
      </p>
    </section>

    {#if editMode}
    <div class="icons">
      {#if list.items.length > 1}
        {#if i > 0}
          <i class="fas fa-arrow-up clickable" on:click={() => moveItem(i, i-1)} title="Move item up"></i>
        {/if}
        {#if i < list.items.length - 1}
          <i class="fas fa-arrow-down clickable" on:click={() => moveItem(i, i+1)} title="Move item down"></i>
        {/if}
        <i class="fas fa-grip-vertical clickable" draggable="true" on:dragstart={e => ondragstart(e, i)} title="This item is draggable"></i>
      {/if}
      <i class="fas fa-times clickable" on:click={() => deleteItem(i)}></i>
    </div>
    {/if}

    {#if item.tags.length > 0 || editMode}
      <section class="tags">
        <div class="tags">
        {#each item.tags as id (id)}
          {#if $tags[id]}
            <span class="tag" style:background-color={$tags[id].color} style:color={$tags[id].textColor}>
                <p spellcheck="false">{$tags[id].name}</p>
                <i class="fas fa-times clickable" on:click={() => untagItem(i, id)}></i>
            </span>
          {/if}
        {/each}
        </div>
        {#if editMode}
          <span class="tag tag-form">
            <TagForm on:newtag={e => tagItem(i, e.detail)} currentTags={item.tags}/>
          </span>
        {/if}
        </section>
    {/if}
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
    overflow: visible; // Don't clip any forms or dropdowns that extend beyond the edges of the list
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
  @media screen and (min-width: 850px) {
    .card {
      min-width: 800px;
      max-width: 1200px;
    }
  }
  @media screen and (max-width: 850px) {
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
        padding: 0.2rem 0;
      }
      // Hide empty descriptions
      p:empty {
        display: none;
      }
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
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      row-gap: 0.4rem;
      column-gap: 0.25rem;
      i.fa-times {
        grid-column: 2;
        grid-row: 1;
      }
      i.fa-grip-vertical {
        grid-column: 2;
        grid-row: 2;
      }
      i.fa-arrow-up {
        grid-column: 1;
        grid-row: 1;
      }
      i.fa-arrow-down {
        grid-column: 1;
        grid-row: 2;
      }
      i:hover {
        transform: scale(1.25);
      }
    }
  }
  .row.highlighted {
    border-left: var(--bold-blue) 2px solid;
    border-right: var(--bold-blue) 2px solid;
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
  section.tags {
    grid-row: 2 / span 1;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    div.tags {
      padding-top: 0.25rem;
      border-top: dashed #aaa 1px;
    }
  }
  .tag {
    max-width: 100%;
    word-break: break-all;
    border-radius: 0;
    font-size: small;
    margin-right: 0.25rem;
    &:last-child {
      margin-right: 0;
    }
    padding: 0.3rem 0.5rem;
    padding-top: 0.3rem;
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
