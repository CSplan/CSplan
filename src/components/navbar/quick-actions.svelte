<script lang="ts">
  import user from '../../stores/user'
</script>

<section class="dropdown rounded-bl">
  <div class="buttons">
    <a href="/settings">
      <i class="fas fa-cog"/>
      Settings
    </a>
    <button class="transparent" on:click={user.logout}>
      Log Out
    </button>
  </div>
</section>

<style lang="scss">
  button.transparent {
    padding: 0.3rem 0.5rem;
  }
  @media screen and (max-width: 850px) {
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
  .dropdown {
    background: var(--background-alt);
    padding: 0.8rem;
    position: absolute;
    top: calc(100% + 2px);
    right: 0%;
    border-top: 1px #aaa solid;
    border-right: 1px #aaa solid;
    font-size: 1.1rem;
  }
  @media screen and (min-width: 850px) {
    .dropdown {
      min-width: 225px;
    }
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
