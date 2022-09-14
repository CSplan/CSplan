<script lang="ts">
  import Keys from '$components/settings/keys/index.svelte'
  import type { PageData } from './$types'
  export let data: PageData
</script>

<Keys user={data.user}/>