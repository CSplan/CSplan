<script>
  import Tag from '../components/tag.svelte'
  import { onMount } from "svelte";
  import Navbar from "../components/navbar.svelte";
  import { ordered, tags} from '../stores/tags'

  onMount(() => {
    tags.init().catch((err) => {
      // TODO: proper error handling
      alert(err)
    })
  })
</script>

<Navbar/>
<main class="align-center">
  {#each $ordered as tag}
  <Tag id={tag.id}></Tag>
  {/each}
  <Tag/>
</main>


<style>
  main.align-center {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>