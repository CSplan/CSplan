<script lang="ts">
  import { mustGetByKey } from '$db'
  import { onMount } from 'svelte'



  let publicKey: CryptoKey

  function keyType(key: CryptoKey): string {
    switch (key.algorithm.name) {
    case 'RSA-OAEP':
      const algorithm = key.algorithm as RsaHashedKeyAlgorithm
      return `${algorithm.name} ${algorithm.modulusLength} bit`

    default:
      return key.algorithm.name
    }
  }

  onMount(async () => {
    const userID = (JSON.parse(localStorage.getItem('user')!) as UserStore['user']).id
    const keys = await mustGetByKey<MasterKeys>('keys', userID)
    publicKey = keys.publicKey
  })
</script>

<section class="settings-menu-container">
  <article class="keys-menu">
    <span>Public Key</span>
    {#if publicKey !== undefined}
      <span>Type: <span class="key-info">{keyType(publicKey)}</span></span>
    {/if}
  </article>
</section>

<style lang="scss">
  @import '../position.scss';
  section.settings-menu-container {
    @include settings-menu-container;
  }
  section.settings-menu-container :global {
    @include form-styles;
  }

  article.keys-menu {
    margin: 1.5rem 0;
    color: #111;
    border: 1px solid #aaa;
    padding: $padding-m;
    display: flex;
    flex-direction: column;

    span.key-info {
      padding: 0.3rem 0.45rem;
      border: 1px solid #aaa;
      background: rgb(230, 230, 230);
    }
  }
</style>