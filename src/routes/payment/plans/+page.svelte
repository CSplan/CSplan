<script lang="ts">
  import Plans from '$components/payment/plans.svelte'
  import type { PageData } from './$types'
  export let data: PageData
</script>

<main class="container">
  <Plans user={data.user} settings={data.settings}/>
</main>