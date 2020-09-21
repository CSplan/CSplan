<script>
  import navbar from '../../components/navbar.svelte'
  import TitleView from '../../components/titleView.svelte'
  import lists from '../../stores/lists'
  let editMode = false
  async function toggleEditMode() {
    editMode = !editMode
    // If the user is exiting edit mode, commit the changes they made
    if (!editMode) {
      await lists.commitUnsaved()
    }
  }
</script>

<svelte:component this={navbar}></svelte:component>

<main>
  <button class={editMode ? 'bold' : 'transparent off'} on:click={toggleEditMode}>
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
