<script lang="ts">
  import Appearance from '$components/settings/appearance/index.svelte'
  import type { PageData } from './$types'
  export let data: PageData
</script>

<Appearance settings={data.settings}/>
