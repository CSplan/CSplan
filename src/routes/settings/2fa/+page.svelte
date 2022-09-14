<script lang="ts">
  import TwoFactor from '$components/settings/2fa/index.svelte'
  import type { PageData } from './$types'
  export let data: PageData
</script>

<TwoFactor user={data.user}/>