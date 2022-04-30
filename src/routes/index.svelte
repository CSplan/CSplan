<main class="container">
  <img src="/logo/Light-CSplan.svg" alt="CSplan: Own your time." class="title-logo">

  <section class="summary">
    <p>
      CSplan is a time management and project planning suite delivered as a web application with <b>full zero access encryption.</b> CSplan allows you to create lists; jot down plans including titles, descriptions, and custom-colored tags; and track progress for each item on each list. This process is carefully crafted to be secure, simple, fast, and pleasant. Time is always moving, CSplan helps you move with it.
    </p>
  </section>

  <section class="feature-cards">
    <div class="card feature-card">
      <div class="icons">
        <i class="fas fa-lock-keyhole"></i>
      </div>
      <header><i>C</i>ompletely <i>S</i>ecure Plans</header>
      <hr>
      <p>
        <tb></tb>CSplan is designed believing that security and uncompromising privacy protection can be, and must be, the foundation of an application. CSplan encrypts all user data by default, using a combination of 4096-bit RSA and 256-bit AES-GCM encryption. Furthermore, CSplan does not log or store IPs (unless explicitly enabled in settings), does not store passwords or hashes, and guarantees the ability to permanently delete your account at any time. 
      </p>
    </div>

    <div class="card feature-card" name="#test">
      <div class="icons">
        <i class="fal fa-list-tree"></i>
      </div>
      <header><i>C</i>omprehensive, <i>S</i>imple Plans</header>
      <hr>
      <p>
        Balanced in the contrast between completeness and simplicity, CSplan feels as light as a notepad and pencil, yet as powerful as a pipe organ. CSplan serves no ads, no trackers, and no bloated UI that impedes upon its users' actions. CSplan delivers organized productivity to any device, scaling as a PWA, and never letting the mobile experience rot in the name of native applications.
      </p>
    </div>

    <div class="card feature-card">
      <div class="icons">
        <i class="fas fa-dumbbell"></i>
      </div>
      <header><i>C</i>ommitted, <i>S</i>trong Plans</header>
      <hr>
      <p>
        Every part of CSplan is designed around the basis of respect for its users. CSplan is committed to growing its scope and its capabilities, with plans for a future desktop application, calendars and reminders, and general note-taking support. CSplan will continue to work to build a privacy-first future, supporting users every step of the way.
      </p>
    </div>
  </section>
</main>

<style lang="scss">
  .title-logo {
    margin: 2rem 0;
  }

  .summary {
    width: 85%;
    float: left;
    padding-right: 10%;
  }

  .feature-cards {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(min-content, 1fr);
    column-gap: 1rem;
    padding: 2rem;

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
        text-indent: 0.5in;
      }
    }
  }

  .title-card {
    width: 85%;
  }
</style>