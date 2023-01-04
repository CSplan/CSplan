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
  })
</script>

<Modal bind:show lock={true}>
  <form class="upgrade primary" novalidate on:submit|preventDefault={submit} bind:this={form}>
    <label>
      <header>Password</header>
      <input type="{showPassword ? 'text' : 'password'}" {placeholder} bind:this={passwordInput} required>
    </label>
    <Checkbox value="Show Password" bind:checked={showPassword}/>
    <SubmitCancel on:cancel={cancel}/>
  </form>
</Modal>

<style lang="scss">
  form.upgrade {
    margin-top: 50%;
    width: 25vw;
    margin-right: auto;
    margin-left: auto;

    padding: 0.8rem;
    border: 1px solid $border-normal;
    text-align: left;
  }

</style>