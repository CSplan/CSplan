<script lang="ts">
  import Modal from './modal.svelte'
  // Show/hide the modal
  export let show = false
  // SVG element QR codes can be rendered to
  export let svg: SVGSVGElement
  // The authentication information itself
  export let info: TOTPinfo
</script>

<Modal {show} flex={true} lock={true}>
  <article class="totp-authinfo">
    <svg bind:this={svg}></svg>
    <span class="step">1.</span>
    <span class="directions"><b>Option 1</b>: Scan this QR code with a TOTP authenticator.</span>

    <b>OR</b>

    <pre>{info.secret}</pre>
    <span class="directions"><b>Option 2:</b> Manually enter your secret into a TOTP authenticator.</span>

    <span class="step">2.</span>
    <label class="directions">
      <span>Enter a TOTP code to verify your authenticator</span>
      <input type="text" placeholder="{'0'.repeat(6)}">
    </label>
    <input type="submit" value="Submit">
  </article> 
</Modal>

<style lang="scss">
  article.totp-authinfo {
    margin-top: 10vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    align-self: center;
    background: white;
    padding: 1.5rem 2rem;
    max-width: 550px;
    svg {
      max-width: 300px;
    }
    .directions {
      margin: 1rem 0;
    }
    .option {
      display: inline;
    }
    span.step {
      align-self: flex-start;
      margin: 0;
    }
    pre {
      margin: 0;
      margin-top: 1rem;
    }
  }
  input[type="submit"] {
    background: $bold-blue;
  }
</style>