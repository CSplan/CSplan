<script lang="ts">
  import Spinner from '$components/spinner.svelte'
  import { TOTPActions } from '$lib/auth-actions'
  import { tick, createEventDispatcher } from 'svelte'
  import { FormStates as States } from '$lib'
  import type qrcodegen from '$lib/qrcodegen'
  import Modal from './modal.svelte'

  const dispatch = createEventDispatcher()

  // Show/hide the modal
  export let show = false
  // SVG element QR codes can be rendered to
  export let qrCode: qrcodegen.QrCode
  let svg: SVGSVGElement
  // The authentication information itself
  export let info: TOTPinfo = {
    secret: '',
    backupCodes: []
  }

  let state = States.Resting
  let message = ''

  let backupCodesURL = ''
  $: backupCodesURL = `data:text/plain,${encodeURIComponent(info.backupCodes.join('\n'))}`
  $: if (qrCode != null && svg != null) {
    TOTPActions.qr2svg(qrCode, svg, 0, 'white', 'black')
  }

  let code: number
  function oncodeinput(evt: SafeEvent<HTMLInputElement>): void {
    code = parseInt(evt.currentTarget.value)
  }

  async function submit(): Promise<void> {
    state = States.Saving
    message = ''
    await tick()
    try {
      await TOTPActions.verify(code)
    } catch (err) {
      state = States.Errored
      message = err instanceof Error ? err.message : err as string
      return
    }
    state = States.Saved
    message = 'Successfully verified TOTP authenticator'
    await tick()
    setTimeout(() => {
      state = States.Resting
      message = ''
      // The success event tells the parent form to close this modal and reset its UI
      dispatch('success')
    }, 500)
  }
</script>

<Modal {show} flex lock>
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
      <form class="verify-totp" on:submit|preventDefault={submit}>
        <label class="directions">
          <span>Enter a TOTP code to verify your authenticator</span>
          <input type="text" on:input={oncodeinput} placeholder="{'0'.repeat(6)}">
        </label>
        <input type="submit" value="Submit">

        <Spinner {state} {message} size="2rem"/>
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

    background: $bg-primary;
    padding: 1.5rem 2rem;
    max-width: 850px;

    section.step-1 {
      grid-column: 1;
      grid-row: 1;
      border-right: solid $border-alt 1px;
    }
    section.step-2 {
      grid-column: 2;
      grid-row: 1;
    }
    section.step-3 {
      grid-column: 1 / span 2;
      grid-row: 2;
      border-top: solid $border-alt 1px;
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
      form {
        display: flex;
        flex-direction: column;
        align-items: center;
        input[type="submit"] {
          margin: 0.5rem 0;
          // Larger bottom margin if there's content (assumed to be a progress component) beneath
          &:not(:last-child) {
            margin-bottom: 1rem;
          }
        }
      }
    }

    svg {
      max-width: 200px;
    }
    .directions {
      margin: 1rem 0;
    }
    pre {
      margin: 0;
      background: $bg-disabled;
      border-radius: 0;
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