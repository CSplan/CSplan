<script context="module">
  export async function preload(page, session) {
    return page.params
  }
</script>

<script>
  import lists from '../../stores/lists'
  import { getByKey } from '../../db'
  import { onMount } from 'svelte'
  import navbar from '../../components/navbar.svelte'

  // TODO: this is horrible
  export let id
  let list = {}
  let listFound = false
    list = $lists[id]
  if (!list) {
    getByKey('lists', id).then(
      (l) => {
        list = l
      },
      (err) => {
        // 404
        goto('/')
      }
    )
  }
    
  listFound = true

</script>

<svelte:component this={navbar}></svelte:component>
