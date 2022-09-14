<script lang="ts">
  import SubmitCancel from '$components/forms/submit-cancel.svelte'
  import Modal from './modal.svelte'
  import { userActions } from '$lib/page'

  export let show = false

  function cancel(): void {
    show = false
  }
</script>

<Modal bind:show>
  <form class="logout" on:submit|preventDefault={() => {
    userActions.logout()
  }}>
    <h2>Are you sure you want to log out?</h2>
    <SubmitCancel on:cancel={cancel}/>
  </form>
</Modal>

<style lang="scss">
  form.logout {
    margin-top: 35%;
    width: 30vw;
    margin-right: auto;
    margin-left: auto;

    background: white;
    color: #111;
    padding: $padding-m;
    line-height: 1.5;
  }
  h2 {
    font-size: 150%;
    border-bottom: 1px $border-alt solid;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
  }
</style>