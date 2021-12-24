<script lang="ts">
  import { browser } from '$app/env'
  import { TOTPActions } from '$lib/auth-actions'

  import Modal from './modal.svelte'
  // Show/hide the modal
  export let show = false
  // SVG element QR codes can be rendered to
  export let svg: SVGSVGElement
  // The authentication information itself
  export let info: TOTPinfo

  let backupCodesURL = ''
  $: if (browser) {
    if (backupCodesURL.length > 0) {
      URL.revokeObjectURL(backupCodesURL)
    }
    const data = new Blob([info.backupCodes.join('\n')], { type: 'text/plain' })
    backupCodesURL = URL.createObjectURL(data)
  }

  let code: number
  function oncodeinput(evt: SafeEvent<HTMLInputElement>): void {
    code = parseInt(evt.currentTarget.value)
  }

  async function submit(): Promise<void> {
    await TOTPActions.verify(code)
    console.log('success')
  }
</script>

<Modal {show} flex={true} lock={true}>
  <article class="totp-authinfo">
    <section class="step-1">
      <header>1.</header>
      <svg bind:this={svg}></svg>
      <span class="directions"><b>Option 1</b>: Scan this QR code with a TOTP authenticator.</span>

      <b>OR</b>

      <span class="directions"><b>Option 2:</b> Manually enter your secret into a TOTP authenticator.</span>
      <pre>{info.secret}</pre>
    </section>


    <section class="step-2 backup-codes">
      <header>2.</header>
      <p>Save your backup codes. These are one-use codes that can be used to log in without a TOTP code, keep them somewhere safe!</p>
      <pre>{info.backupCodes.join('\n')}</pre>
      <a href={backupCodesURL} download="csplan_backupcodes.txt">
        <button>Save</button>
      </a>
    </section>

    <section class="step-3 verify">
      <header>3.</header>
      <form on:submit|preventDefault={submit}>
        <label class="directions">
          <span>Enter a TOTP code to verify your authenticator</span>
          <input type="text" on:input={oncodeinput} placeholder="{'0'.repeat(6)}">
        </label>
        <input type="submit" value="Submit">
      </form>
    </section>
  </article> 
</Modal>

<style lang="scss">
  article.totp-authinfo {
    margin-top: 10vh;
    align-self: center;

    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: max-content;

    background: white;
    padding: 1.5rem 2rem;
    max-width: 850px;

    section.step-1 {
      grid-column: 1;
      grid-row: 1;
      border-right: solid #aaa 1px;
    }
    section.step-2 {
      grid-column: 2;
      grid-row: 1;
    }
    section.step-3 {
      grid-column: 1 / span 2;
      grid-row: 2;
      border-top: solid #aaa 1px;
    }
    section.step-1,section.step-2,section.step-3 {
      padding: 0.6rem 0.8rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      header {
        align-self: flex-start;
      }
    }

    section.backup-codes {
      pre {
        margin: 0.6rem;
        width: 100%;
        line-height: 1.5;
      }
      a {
        width: 100%;
        button {
          width: 100%;
        }
      }
    }
    section.verify {
      label {
        margin: 0;
      }
    }

    svg {
      max-width: 200px;
    }
    .directions {
      margin: 1rem 0;
    }
    .option {
      display: inline;
    }
    span.step {
      margin: 0;
    }
    pre {
      margin: 0;
      background: rgb(230, 230, 230);
      border-radius: 0;
    }
    pre.backup-codes {
    }
    p {
      align-self: flex-start;
      text-align: left;
      margin-left: 1rem;
    }
    input[type="submit"],button {
      background: $bold-blue;
      margin-bottom: 0;
      line-height: 1.5;
    }
  }
</style>