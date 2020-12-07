
<script>
  import { onMount } from 'svelte'
  import Navbar from '../../components/navbar.svelte'

  const dev = process.env.NODE_ENV === 'development'
  onMount(async () => {
    if (!dev) {
      return
    }
    const res = await fetch('https://localhost:3030/md/security.md')
    const text = await res.text()
    content = marked(text)
  })
  

  let content = ''
</script>

<Navbar/>
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
  @media screen and (min-width: 960px) {
    div.content {
      width: 800px;
    }
  }
  @media screen and (max-width: 960px) {
    div.content {
      margin: 2rem;
    }
  }
</style>
