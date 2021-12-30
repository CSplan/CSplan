<script lang="ts">
  import { mustGetByKey } from '$db'
  import { onMount, onDestroy } from 'svelte'
  import { rsa } from 'cs-crypto'
  import DetailDropdown from '$components/templates/_detail-dropdown.svelte'

  let publicKeyURL = ''

  let publicKey: CryptoKey

  let privateKeyExportEnabled = false

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

<form class="keys-form" on:submit|preventDefault>
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

    <hr>
  </section>


  <section class="private-key">
    <header>Private Key</header>
    <DetailDropdown summary="Private Key Export Warnings">
        <p class="key-info">
          Private key backups are not recommended. CSplan recommends backing up your account password using a secure password manager. 
        </p>
        <p class="private-key-warning">
          WARNING: Do not proceed unless you are absolutely sure of what you're doing, and understand that mishandling your private key can and will endanger the security of your account.
          CSplan is not responsible nor liable for the handling of user-exported private keys.
        </p>

        <label class="checkable">
          <input type="checkbox" bind:checked={privateKeyExportEnabled}>
          <span class="checkable">I have read, understood, and accepted the above warnings and disclaimers</span>
        </label>
    </DetailDropdown>

    <button class="export-button" disabled={!privateKeyExportEnabled}>
      <i class="fas fa-lock"></i>
      Export Private Key
    </button>
  </section>
</form>

<style lang="scss">
  form.keys-form,section {
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

  p.private-key-warning {
    color: rgb(230, 0, 0);
    border-left: 2px solid rgb(230, 0, 0);
    padding-left: 0.5rem;
  }
  label.checkable {
    margin-top: 1.5rem !important;
  }

  span.key-type {
    padding: 0.3rem 0.45rem;
    border: 1px solid #aaa;
    background: rgb(230, 230, 230);
  } 
  a.export-button {
    width: max-content;
    margin: 0;
  }
  a.export-button, button.export-button {
    border-radius: $br-light;
    line-height: 1.5;
    padding: 0.3rem 0.45rem;
    margin: 0.5rem 0;
    // Let picnic styling take over when a button is disabled
    &:not(:disabled) {
      background: $bold-blue;
      color: white;
    }
  }


  hr {
    width: 100%;
    border-top: 1px #aaa solid;
    border-bottom: none;
  }
</style>