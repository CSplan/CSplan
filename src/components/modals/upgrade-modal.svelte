<script lang="ts">
  import Modal from './modal.svelte'
  import SubmitCancel from '$components/forms/submit-cancel.svelte'
  import Checkbox from '$components/forms/checkbox.svelte'
  import { UpgradeActions, LoginActions } from '$lib/auth-actions'
  import { onMount, createEventDispatcher } from 'svelte'
  import storage from '$db/storage'
  import { AuthLevels } from '$lib/auth-levels'

  export let show = false
  export let placeholder = 'Enter your password'

  // Use the modal being opened as a mount trigger
  let initialized = false
  $: if (!initialized && show) (async () => {
    actions = new LoginActions(
      new Worker(LoginActions.Argon2_WorkerPath),
      new Worker(LoginActions.ED25519_WorkerPath)
    )
    await actions.loadArgon2({
      wasmRoot: LoginActions.Argon2_WASMRoot,
      simd: true
    })
    await actions.loadED25519({
      wasmPath: LoginActions.ED25519_WASMPath
    })
    passwordInput.focus()
  })()

  const dispatch = createEventDispatcher()

  let actions: LoginActions

  let showPassword = false

  let form: HTMLFormElement
  let passwordInput: HTMLInputElement

  function cancel(): void {
    show = false
    dispatch('cancel')
  }

  async function submit(): Promise<void> {
    if (!form.checkValidity()) {
      return
    }
    const password = passwordInput.value
    await UpgradeActions.passwordUpgrade(actions, password)
    show = false
    storage.setAuthLevel(AuthLevels.Upgraded)
    dispatch('upgrade')
  }

  onMount(async () => {
  })
</script>

<Modal bind:show lock={true}>
  <svelte:fragment>
  <form class="upgrade primary" novalidate on:submit|preventDefault={submit} bind:this={form}>
    <label>
      <header>Password</header>
      <input type="{showPassword ? 'text' : 'password'}" {placeholder} bind:this={passwordInput} required>
    </label>
    <Checkbox value="Show Password" bind:checked={showPassword}/>
    <SubmitCancel on:cancel={cancel}/>
  </form>
  </svelte:fragment>
</Modal>

<style lang="scss">
  form.upgrade {
    @media (max-height: 1200px) {
      margin-top: 50%;
    }
    margin-top: 30%;
    width: 25vw;
    margin-right: auto;
    margin-left: auto;

    padding: 0.8rem;
    border: 1px solid $border-normal;
    text-align: left;
  }

</style>