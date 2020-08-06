<script>
  import user from '../stores/user'
  let dropdown = false
  function toggle() {
    if (!dropdown) {
      dropdown = true
      // A small delay is needed to prevent the event from firing on the initial click
      setTimeout(() => window.addEventListener('click', toggle), 10)
    } else {
      window.removeEventListener('click', toggle)
      dropdown = false
    }
  }
</script>

<button class="transparent" on:click={toggle}>
  <i class="fas fa-chevron-down"></i>
  <div class={`dropdown ${dropdown ? 'show' : ''}`}>
    <div class="buttons">
      <button class="transparent" on:click={user.logout}>
        Log Out
      </button>
    </div>
  </div>
</button>

<style>
  @media screen and (max-width: 960px) {
    button.transparent {
      padding: 0;
      width: 90%;
      margin: 0 auto;
    }
    i {
      display: none;
    }
    .dropdown {
      display: block !important;
      position: static !important;
      top: initial;
      border: 2px red solid;
      border-radius: inherit;
    }
  }
  button {
    position: relative;
  }
  div.dropdown {
    display: none;
    background: #333;
    padding: 0.25rem;
    position: absolute;
    top: 2.5em;
    right: 0;
  }
  .dropdown.show {
    display: block;
  }
  .dropdown .buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .buttons button {
    white-space: nowrap; /* Text stays on one line */
  }
</style>
