<script lang="ts">
  import AccountTypes from '$lib/account-types'
  import type { PageData } from './$types'
  export let data: PageData
  let showFeatureCardsMobile = false

  const description = 'CSplan is a fast, modular, and uncompromisingly secure digital planner. With CSplan, you can create lists, write down plans (including titles, descriptions, and color-coded tags), and track progress for each item on every list. While this is happening, all of your data is encrypted using a key derived from your password before being sent to any servers. This process (zero-knowledge encryption) ensures that your plans are kept private and secure by default, no compromises.'
</script>

<svelte:head>
  <meta name="description" content="{description}">
</svelte:head>

<main class="container">
  <img src="/logo/{data.settings.darkMode ? 'Dark' : 'Light'}-CSplan.svg" alt="CSplan: Own your time." class="title-logo">

  {#if data.user != null}
    <section class="action-buttons">
      <a href="/lists" data-sveltekit-prefetch>
        <button>
          <i class="fas fa-list" style:color="var(--bold-blue)"></i>
          My Lists
        </button>
      </a>
      <a href="/tags" data-sveltekit-prefetch>
        <button>
          <i class="fas fa-tag" style:color="var(--bold-blue)"></i>
          My Tags
        </button>
      </a>
    </section> 
    {#if data.paymentStatus?.accountType === AccountTypes.Free}
    <section class="action-buttons">
      <a href="/payment/plans">
        <button>
          <i class="fad fa-credit-card" style:color="var(--success-green)"></i>
          CSplan Pro
        </button>
      </a>
    </section>
    {/if}
  {/if}

  <section class="summary">
    <p>
      {description}
      <br>
      <span class="end"><u>Time is always moving, CSplan helps you move with it.</u></span>
    </p>
  </section>

  {#if !data.user}
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

    <div class="card darker feature-card">
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
  {/if}

  {#if data.user == null}
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
    @media (min-width: $desktop-min) {
      text-align: center;
      max-width: 800px;
    }
    @media(max-width: $mobile-max) {
      padding-right: 5%;
      padding-left: 5%;
    }
    font-size: 110%;
    span.end {
      text-align: center;
      display: inline-block;
      line-height: 2;
      font-size: 110%;
    }
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

  .action-buttons {
    display: flex;
    flex-direction: row;
    justify-content: center;
    button {
      padding: 1rem 3rem;
      @media (min-width: $desktop-min) {
        font-size: 140%;
      }
      @media (max-width: $mobile-max) {
        font-size: 125%;
      }
      font-weight: bold;
      background-color: $bg-primary;
    }
    a {
      margin-right: 1rem;
      margin-left: 1rem;
    }
  }

  .title-card {
    width: 85%;
  }
</style>