<script lang="ts">
  import DeleteAccount from '$components/settings/delete-account/index.svelte'
  import type { PageData } from './$types'
  export let data: PageData
</script>

<DeleteAccount paymentStatus={data.paymentStatus}/>