<script lang="ts">
  import Modal from '$components/modals/modal.svelte'
  export let show = false
</script>

<Modal bind:show lock mobile bottom>
  <section class="card" on:submit|preventDefault>
    <button class="transparent delete-button">
      <span>Delete List</span>
      <i class="fas fa-times"></i>
    </button>
  </section>
</Modal>

<style lang="scss">
  section {
    margin-bottom: 0;
  }
  button {
    color: currentColor;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto;
    font-size: 110%;
    span {
      grid-column: 1;
    }
    i {
      margin: auto 1.5rem;
      grid-column: 3;
    }
  }
  button:not(:last-child) {
    border-bottom: 1px #ccc;
  }
  button.delete-button {
    color: $danger-red;
  }
</style>