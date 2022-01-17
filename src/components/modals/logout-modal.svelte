<script lang="ts">
  import SubmitCancel from '$components/forms/submit-cancel.svelte'
  import Modal from './modal.svelte'
  import userStore from '$stores/user'

  export let show = true
</script>

<Modal bind:show lock={true}>
  <form class="logout" on:submit|preventDefault={userStore.logout}>
    <h2>Are you sure you want to log out?</h2>
    <SubmitCancel/>
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
    border-bottom: 1px #aaa solid;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
  }
</style>