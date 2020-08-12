<script>
  import navbar from '../../components/navbar.svelte'
  import TitleView from '../../components/titleView.svelte'
  let editMode = false
</script>

<svelte:component this={navbar}></svelte:component>

<main>
  <button class={editMode ? 'bold' : 'transparent off'} on:click={() => editMode = !editMode}>
    <i class="fas fa-edit"></i>
  </button>
  <svelte:component this={TitleView} {editMode}></svelte:component>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  button {
    position: absolute;
    left: 15rem;
    top: 3rem;
    border-radius: 10%;
  }

  button.off {
    border: black solid 2px;
  }
  button.off i {
    color: black;
  }
</style>
