<script lang="ts">
  import Modal from './modal.svelte'
  import SubmitCancel from '$components/forms/submit-cancel.svelte'
  import { createEventDispatcher } from 'svelte'

  export let show = false
  export let message = ''

  const dispatch = createEventDispatcher()

  function cancel(): void {
    show = false
    dispatch('cancel')
  }
  function submit(): void {
    show = false
    dispatch('submit')
  }
</script>

<Modal bind:show lock flex>
    <form on:submit|preventDefault={submit}>
      <h2>{message}</h2>
      <SubmitCancel on:cancel={cancel}/>
    </form>
</Modal>

<style lang="scss">
  form {
    padding: 0.8rem 1.5rem;
    background: white;
    @media screen and (min-width: $desktop-min) {
      width: 25vw;
    }
    margin-top: 35vh;
    align-self: center;
  }
</style>