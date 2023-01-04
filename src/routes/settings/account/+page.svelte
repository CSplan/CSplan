<script lang="ts">
  import Account from '$components/settings/account/account.svelte'
  import type { PageData } from './$types'
  export let data: PageData
</script>

<Account user={data.user}/>