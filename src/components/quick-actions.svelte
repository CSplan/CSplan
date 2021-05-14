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
      <a href="/settings">
        <i class="fas fa-cog"/>
        Settings
      </a>
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
    background: var(--background-dark);
    padding: 0.25rem;
    position: absolute;
    top: 100%;
    right: 0;
    border: 2px solid #aaa;
  }
  .dropdown.show {
    display: block;
  }
  .dropdown .buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .buttons>* {
    padding: 0.3rem 0.9rem;
    margin: 0.3rem 0;
    border-radius: 0.3rem;
    white-space: nowrap;
    width: 100%;
    color: white;
  }
  .buttons>*:not(:last-child) {
    margin-bottom: 0;
  }
  .buttons>*:hover {
    box-shadow: inset 0 0 0 99em rgba(255,255,255,0.2);
  }

  /* Icon animations */
  @keyframes spin {
    from {transform: rotate(0deg);}
    to {transform: rotate(359deg);}
  }
  .buttons>*:hover>i.fa-cog {
    animation-name: spin;
    animation-duration: 1.5s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }
</style>
