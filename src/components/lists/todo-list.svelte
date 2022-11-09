<script lang="ts">
  import { onMount, tick } from 'svelte'
  // import { flip } from 'svelte/animate'
  import lists, { itemsTotal } from '$stores/lists'
  import tags from '$stores/tags'
  import Spinner from '$components/spinner.svelte'
  import TagForm from '$components/tag-form.svelte'
  import { CEkeypress, CEtrim } from '../../lib/contenteditable-deprecated'
  import { formElementIsFocused } from '$lib'
  import { fade } from 'svelte/transition'
  import { flip } from 'svelte/animate'
  import DOMPurify from 'dompurify'
  import { FormStates as States } from '$lib/form-states'
  import Limits from '$lib/limits'
  import AccountTypes from '$lib/account-types'

  export let id: string
  export let user: App.Locals['user']
  $: isLoggedIn = user != null

  // #region State
  let list: List
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
      if (list.items[i].title.length === 0) {
        list.items[i].title = 'Untitled Item'
        list.items = list.items
      }
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
    if (itemLimitHit) {
      return
    }
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
    },
    n: {
      handler: () => {
        if (editMode) {
          addItem()
        }
      },
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

  function ondragover(_: DragEvent, index: number): void {
    // Apply a blue higlight
    highlightRow[index] = true
  }

  function ondragleave(_: DragEvent, index: number): void {
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
  
  // #region Limits
  let itemLimitHit = false
  $: if (list != null) {
    const l = isLoggedIn && user!.accountType === AccountTypes.Pro ? Limits.pro : Limits.free
    itemLimitHit = list.items.length >= l.itemsPerList || $itemsTotal >= l.totalItems
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

{#if state !== States.Errored && state !== States.Loading}
<div class="card {editMode ? 'editable' : ''}">
  <div class="corner">
    {#if [States.Saving, States.Saved].includes(state)}
    <div transition:fade={{ duration: fadeDuration }}>
      <Spinner size="1.5rem" iconSaved="fa-check" classSaved="bold" bind:state/>
    </div>
    {/if}
  </div>

  <section class="title">
    <div class="spacer"/>
    <header class="title" contenteditable={editMode} spellcheck="false" on:keypress={CEkeypress} on:blur={updateTitle}>{list.title}</header>
    <div class="edit-icon-container">
      <i class="edit-mode-toggle fas fa-pencil-alt clickable" style="color: {editMode ? 'var(--bold-blue)' : 'inherit'}" on:click={toggleEditMode}/>
    </div>
  </section>

  {#each list.items as item, i (item)}
  <div class="row item-title marginless {item.tags.length === 0 ? 'tagless' : ''}" animate:flip={{ duration: 200 }}
    class:highlighted={highlightRow[i]}
    on:dragover|preventDefault={e => ondragover(e, i)}
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
        <i class="fas fa-grip-vertical clickable drag-icon" draggable="true" on:dragstart={e => ondragstart(e, i)} title="This item is draggable"></i>
      {/if}
      <i class="fas fa-times clickable" on:click={() => deleteItem(i)}></i>
    </div>
    {/if}

    {#if item.tags.length > 0 || editMode}
      <section class="tags">
        {#if item.tags.length > 0}
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
        {/if}
        {#if editMode}
          <div class="flex-break"/>
          <span class="tag tag-form">
            <TagForm on:newtag={e => tagItem(i, e.detail)} currentTags={item.tags}/>
          </span>
        {/if}
        </section>
    {/if}
  </div>
  {/each}
  {#if editMode}
    {#if !itemLimitHit}
    <div class="row-bottom centered clickable" on:click={addItem}>
      <i class="fas fa-plus"></i>
    </div>
    {:else}
    <div class="row-bottom centered">
      <i class="fas fa-times" style:color="var(--danger-red)"></i> 
      <div class="flex-break"></div>
      <span>Free accounts are limited to 10 items per list.</span>
    </div>
    {/if}
  {/if}
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
        cursor: text;
        &:empty {
          display: block;
          &::before {
            content: "Description";
            color: $text-disabled-light;
          }
        }
      }
    }
  }

  section.title {
    display: grid;
    @media (min-width: $desktop-min) {
      grid-template-columns: 1fr auto 1fr;
    }
    @media (max-width: $mobile-max) {
      grid-template-columns: 1fr auto minmax(min-content, 1fr);
    }
    grid-auto-flow: column;
    border-bottom: 1px solid $border-alt;
    padding: var(--padding-m);
    header {
      padding: 0;
      border-bottom: none;
    }
    .edit-icon-container {
      i {
        float: right;
      }
    }
  }

  // Responsiveness
  @media all and (min-width: $desktop-min) {
    .card {
      min-width: 800px;
      max-width: 1200px;
    }
  }
  @media all and (max-width: $mobile-max) {
    .card {
      width: 100%;
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
    &:not(:last-child) {
      border-bottom: $border-normal 1px solid;
    }
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
      background: $bg-hover;
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

    .flex-break {
      height: 0;
      @media (max-width: $mobile-max) {
        flex-basis: 100%;
      }
    }

    .content, .tags {
      grid-column: 2 / span 1;
      width: max-content;
      max-width: 100%;
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
      @media all and (max-width: $mobile-max) {
        font-size: 1.3rem;
        column-gap: 0.8rem;
      }
      i.fa-times {
        grid-column: 2;
        grid-row: 1;
      }
      i.fa-grip-vertical {
        grid-column: 2;
        grid-row: 2;
        @media all and (max-width: $mobile-max) {
          display: none;
        }
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
    padding: 0.5rem;
    text-align: center;
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
      border-top: dashed $border-alt 1px;
    }
  }
  .tag {
    max-width: 100%;
    word-break: break-all;
    border-radius: 0;
    @media all and (min-width: $desktop-min) {
      font-size: small;
    }
    @media all and (max-width: $mobile-max) {
      font-size: medium;
    }
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
      color: inherit;
      margin: 0 0.2em;
      padding: 0;
    }

    // Form for adding new tags
    &.tag-form {
      padding: 0;
      padding-top: 0.3rem;
      margin-right: 0;
      margin-left: 0.5rem;
      &:nth-child(2) { // 2nd child after the flex break element
        margin-left: 0;
      }
    }
  }
  // #endregion

  .corner {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
  }
</style>
