<script lang="ts">
  import { mustGetByKey } from '$db'
  import { onMount, onDestroy } from 'svelte'
  import { rsa } from 'cs-crypto'
  import userStore from '$stores/user'
  import type { User } from '$stores/user'

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

  async function exportPublic(): Promise<void> {
    // Insert a newline every 50 characters
    const raw = await rsa.exportPublicKey(publicKey)
    pem = pemFormat(raw, false)
    publicKeyURL = URL.createObjectURL(new Blob([pem], { type: 'text/plain' }))
  }

  function pemFormat(raw: string, isPrivate: boolean): string {
    const pemBorder = '-'.repeat(5)
    const pemHeader = `${pemBorder}BEGIN ${isPrivate ? 'PRIVATE' : 'PUBLIC'} KEY${pemBorder}`
    const pemFooter = `${pemBorder}END ${isPrivate ? 'PRIVATE' : 'PUBLIC'} KEY${pemBorder}`
    // Insert a newline every 70 characters
    const body = raw.replaceAll(/(.{70})/g, '$1\n')
    return `${pemHeader}\n${body}\n${pemFooter}`
  }


  onMount(async () => {
    const keys = await mustGetByKey<MasterKeys>('keys', ($userStore as Assert<User, 'isLoggedIn'>).id)
    publicKey = keys.publicKey
    await exportPublic()
  })

  onDestroy(() => {
    URL.revokeObjectURL(publicKeyURL)
  })
</script>

<article class="keys">
  <p class="key-info">
    Your master keypair is the set of cryptographic keys that are used to encrypt and decrypt all data you use CSplan to manage. This includes all lists and tags, any profile fields with visibility set to encrypted, and metadata describing active sessions (if opted in to saving session information). This page is intended for advanced users only.
  </p>

  <hr>

  {#if publicKey !== undefined}
    <header>Master Keypair Type</header>
    <span class="key-type">{keyType(publicKey)}</span>

    <hr>
  {/if}


  <section class="public-key">
    <header>Public Key</header>
    {#if publicKey !== undefined}
      <a class="export-button" href={publicKeyURL} download="csplan_pubkey.pem">
        <i class="fas fa-key"></i>
        Export Public Key
      </a>
    {/if}
  </section>
</article>

<style lang="scss">
  article.keys {
    margin: 1.5rem 0;
    color: #111;
    border: 1px solid #aaa;
    background: #fff;
    padding: $padding-m;
  }
  article.keys,section {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  header {
    margin: 0.5rem 0;
    font-size: 110%;
  }
  span {
    padding: 0.5rem 0;
  }

  span.key-type {
    padding: 0.3rem 0.45rem;
    border: 1px solid #aaa;
    background: rgb(230, 230, 230);
  } 
  a.export-button {
    border-radius: $br-light;
    line-height: 1.5;
    padding: 0.3rem 0.45rem;
    margin: 0.5rem 0;
    background: $bold-blue;
    color: white;
  }

  hr {
    width: 100%;
    border-top: 1px #aaa solid;
    border-bottom: none;
  }
</style>