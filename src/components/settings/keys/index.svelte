<script lang="ts">
  import { mustGetByKey } from '$db'
  import { onMount, onDestroy } from 'svelte'
  import { rsa } from 'cs-crypto'
  import Details from '../../templates/_detail-dropdown.svelte'

  let publicKeyURL = ''

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
  let pem = ''

  const pemBorder = '-'.repeat(5)
  const pemHeader = `${pemBorder}BEGIN PUBLIC KEY${pemBorder}`
  const pemFooter = `${pemBorder}END PUBLIC KEY${pemBorder}`
  async function exportPublic(): Promise<void> {
    // Insert a newline every 50 characters
    const raw = (await rsa.exportPublicKey(publicKey)).replaceAll(/(.{50})/g, '$1\n')
    console.log(raw)
    pem = `${pemHeader}\n${raw}\n${pemFooter}`
    publicKeyURL = URL.createObjectURL(new Blob([pem], { type: 'text/plain' }))
  }

  onMount(async () => {
    const userID = (JSON.parse(localStorage.getItem('user')!) as UserStore['user']).id
    const keys = await mustGetByKey<MasterKeys>('keys', userID)
    publicKey = keys.publicKey
    await exportPublic()
  })

  onDestroy(() => {
    URL.revokeObjectURL(publicKeyURL)
  })
</script>

<section class="settings-menu-container">
  <article class="keys-menu">
    <header>Public Key</header>
    {#if publicKey !== undefined}
      <span>Type: <span class="key-info">{keyType(publicKey)}</span></span>
      <a class="export-button" href={publicKeyURL} download="csplan_pubkey.pem">
        <button>Export Public Key
          <i class="fas fa-key"></i>
        </button>
      </a>
    {/if}

    <hr>
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
    align-items: center;

    header {
      margin: 1rem 0;
      font-size: 110%;
    }

    span.key-info {
      padding: 0.3rem 0.45rem;
      border: 1px solid #aaa;
      background: rgb(230, 230, 230);
    } 
    a.export-button {
      line-height: 1.5;
      width: max-content;
    }

    hr {
      width: 100%;
      border-top: 1px #aaa solid;
      border-bottom: none;
    }
  }
</style>