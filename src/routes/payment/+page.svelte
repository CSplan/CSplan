<script lang="ts">
  import Status from '$components/payment/status.svelte'
  import type { PageData } from './$types'
  export let data: PageData
</script>

<main class="container">
  <Status settings={data.settings} paymentStatus={data.paymentStatus}/>
</main>