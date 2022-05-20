<script>
  import { onMount } from 'svelte'
  import { dev } from '$app/env'
  import { csfetch } from '$lib'

  onMount(async () => {
    if (!dev) {
      return
    }
    const res = await csfetch('https://localhost:3030/md/security.md')
    const text = await res.text()
    content = marked(text)
  })
  

  let content = ''
</script>

<!-- Import marked from cdn -->
<svelte:head>
  <script src="https://unpkg.com/marked@1.2.0/lib/marked.js"></script>
</svelte:head>

<main class="container">
  <div class="content">
    {@html content}
  </div>
</main>

<style>
  @media all and (min-width: 960px) {
    div.content {
      width: 800px;
    }
  }
  @media all and (max-width: 960px) {
    div.content {
      margin: 2rem;
    }
  }
</style>
