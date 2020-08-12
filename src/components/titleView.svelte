<script>
  import { goto } from '@sapper/app'
  import { lists, ordered } from '../stores/lists'
  import { aes, rsa } from 'cs-crypto' 
  import { getByKey, getDB } from '../db'
  import user from '../stores/user'

  // Props
  export let editMode = false

  async function newList() {
    // Start with a blank template
    const list = {
      title: '',
      items: []
    }

    // Encrypt the new list
    await getDB()
    const { publicKey } = await getByKey('keys', $user.user.id)
    const key = await aes.generateKey('AES-GCM')
    const encrypted = await aes.deepEncrypt(list, key)
    const wrapped = (await rsa.wrapKey(key, publicKey)).split(':')[1] // Wrap the AES key

    const res = await fetch('http://localhost:3000/todos', {
      method: 'POST',
      body: JSON.stringify({
        ...encrypted,
        meta: {
          cryptoKey: wrapped
        }
      }),
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': localStorage.getItem('CSRF-Token')
      },
      credentials: 'include'
    })

    // Add the key and id to the template list, and store in state + IDB
    const body = await res.json()
    list.cryptoKey = key
    list.id = body.id
    await lists.addList(list)
  }
</script>

<div class="card">
<pre>{JSON.stringify($lists, null, 2)}</pre>
{#if $ordered.length > 0}
{#each $ordered as list}
  <div class="row {!list.title.length && 'empty'}" on:click={() => !editMode && goto(`/todos/${list.id}`)}>
    <i class="fas fa-minus"></i>
    <header contenteditable={editMode} on:input={(e) => lists.updateList({ ...list, title: e.target.textContent})}>{list.title}</header>
  </div>
{/each}
{:else}
  <div class="row noborder">
    <header>It's empty here...</header>
  </div>
  <div class="row">
    <button class="bold" on:click={newList}>
      Create a Todo List
    </button>
  </div>
{/if}
</div>

<style>
  .card {
    margin-top: 10vh;
    min-width: 800px;
  }
  .row {
    color: initial;
    text-align: center;
    position: relative;
  }
  .row:hover {
    background: whitesmoke;
  }
  /* Create separators */
  .row:not(:last-child) {
    border-bottom: #ccc 1px solid;
  }
  /* Give the correct pointer effect for a clickable div */
  div:not(.empty) {
    cursor: pointer;
  }
  .row.noborder {
    border-bottom: none;
  }
  .row.empty {
    min-height: 3rem;
  }
  button {
    margin: 1rem 0;
  }

  /* Position enum icons */
  .row i {
    top: calc(25% + 0.25rem);
    position: absolute;
    left: 0.5rem;
    color: rgb(60, 60, 60);
  }
</style>
