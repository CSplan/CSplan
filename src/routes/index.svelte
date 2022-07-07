<script lang="ts">
  import user from '$stores/user'
  import settings from '$stores/settings'
  let showFeatureCardsMobile = false
</script>

<main class="container">
  <img src="/logo/{$settings.darkMode ? 'Dark' : 'Light'}-CSplan.svg" alt="CSplan: Own your time." class="title-logo">

  <section class="summary">
    <p>
      CSplan is a time management and project planning suite that stores data with <b>full zero-knowledge encryption.</b> With CSplan, you can create lists, write down plans (including titles, descriptions, and color-coded tags), and track progress for each item on every list. Time is always moving, CSplan helps you move with it.
    </p>
  </section>

  <button class="learn-more" class:rotate={showFeatureCardsMobile} on:pointerup={() => {
    showFeatureCardsMobile = !showFeatureCardsMobile
  }}>
    <i class="fas fa-chevron-right"></i>
    Learn More
  </button>

  <section class="feature-cards" class:show-mobile={showFeatureCardsMobile}>
    <div class="card darker feature-card">
      <div class="icons">
        <i class="fas fa-lock-keyhole"></i>
      </div>
      <header>Completely Secure Plans</header>
      <hr>
      <p>
        <tb></tb>CSplan was built on the belief that security and uncompromising privacy protection should be and must be the foundation of an application. All user data is stored using zero-knowledge encryption, using a combination of 4096-bit RSA and 256-bit AES-GCM encryption.
        <br>
        We never log or store your IP address (unless explicitly enabled in settings), your password is never stored or known to anyone but you, and we guarantee the ability to permanently delete your account and your data at any time.
      </p>
    </div>

    <div class="card darker feature-card" name="#test">
      <div class="icons">
        <i class="fal fa-list-tree"></i>
      </div>
      <header>Comprehensive, Simple Plans</header>
      <hr>
      <p>
        Balanced between power and simplicity, CSplan aims to deliver a full featureset inside a lightweight design. We serve no ads, no trackers, and no sluggish and bloated UI.  Also, CSplan runs on any device that has a web browser. Cutting-edge technologies such as WebAssembly and WebCrypto are utilized to deliver native performance as a web application.
      </p>
    </div>

    <div class="card darker feature-card">
      <div class="icons">
        <i class="fas fa-dumbbell"></i>
      </div>
      <header>Committed, Strong Plans</header>
      <hr>
      <p>
        Every part of CSplan is designed around the basis of respect for its users. We guarantee to uphold the rights to privacy and data sovereignty at the core of all current and future parts of CSplan.
        <br>
        CSplan as a project is committed to growing in both scope and features. Plans exist for <b>calendars and reminder notifications</b>, general-purpose <b>note-taking</b>, a <b>desktop application</b>, and much more.
      </p>
    </div>
  </section>

  {#if !$user.isLoggedIn}
  <section class="register-prompt">
    <a href="/register" class="button bold" title="Register an Account">Register</a>
  </section>
  {/if}
</main>

<style lang="scss">
  .title-logo {
    margin: 2rem 0;
    max-width: 100%;
  }

  .summary {
    padding-right: 10%;
    @media (min-width: $desktop-min) {
      padding-left: 10%;
      text-align: center;
    }
    font-size: 110%;
  }

  button.learn-more {
    @media (max-width: $mobile-max) {
      padding: 1rem 1.5rem;
      font-size: 150%;
      font-weight: bold;
      background: $bg-lessdark;
      box-shadow: none;
      touch-action: none;
      i {
        transition: transform 200ms var(--cubic-out);
        margin-right: 1rem;
      }
      &.rotate {
        i {
          transform: rotate(90deg);
        }
      }
    }
    @media (min-width: $desktop-min) {
      display: none;
    }
  }

  .feature-cards {
    display: grid;
    @media (max-width: $mobile-max) {
      &:not(.show-mobile) {
        display: none;
      }
      grid-auto-flow: row;
      row-gap: 1rem;
    }
    @media (min-width: $desktop-min) {
      grid-auto-flow: column;
      column-gap: 1rem;
      padding: 2rem;
    }
    grid-auto-columns: minmax(min-content, 1fr);

    .feature-card {
      display: grid;
      grid-template-columns: max-content 1fr;
      grid-auto-rows: min-content;
      grid-auto-flow: row;

      .icons {
        padding-right: 0;
        padding-left: 1rem;
        padding-bottom: 0.2rem;
        grid-column: 1;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 150%;
      }

      header {
        grid-column: 2;
        --padding: 1rem;
        padding: var(--padding);
        font-size: 150%;
        border: none;
      }
      hr {
        grid-column: 1 / span 2;
        width: 100%;
        margin: 0;
      }
      p {
        grid-column: 1 / span 2;
        padding: 1rem;
      }
    }
  }

  .register-prompt {
    a.button {
      padding: 1rem 5rem;
      font-size: 150%;
      font-weight: bold;
    }
  }

  .title-card {
    width: 85%;
  }
</style>