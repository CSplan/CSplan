<main class="container">
  <section class="title-card">
    <h1>CSplan</h1>
    <hr>
    <h2>The completely secure planner.</h2>
  </section>

  <section class="summary">
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque consectetur elit est, at aliquet nibh fermentum et. Pellentesque aliquam aliquam elit sed facilisis. Vestibulum lorem lorem, volutpat et ultrices in, tincidunt quis velit. Praesent non porttitor odio. Maecenas sollicitudin, nibh ultricies consectetur tincidunt, erat odio luctus eros, vel mollis sapien dolor at ipsum. Etiam eget odio quis odio rutrum suscipit. Etiam fermentum, elit eget faucibus feugiat, turpis lacus ullamcorper erat, vel feugiat magna massa ac est. In dignissim est vestibulum, tincidunt est quis, sollicitudin sem. Quisque ullamcorper urna vitae nisi semper egestas. Duis auctor lorem eu porttitor posuere. Nulla facilisi. 
    </p>
  </section>

  <section class="feature-cards">
    <div class="card feature-card">
      <div class="icons">
        <i class="fas fa-lock"></i>
      </div>
      <header>Top of the Line E2E Encryption</header>
      <hr>
      <p>
        Mauris accumsan felis massa, sit amet finibus erat dignissim et. Quisque venenatis lacus tincidunt felis pharetra iaculis. Fusce lobortis, nisl id ullamcorper facilisis, elit tellus tempor mi, id eleifend turpis odio sed magna. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla elementum volutpat urna ac tincidunt. Nam efficitur ultricies felis id efficitur. Ut eget laoreet mi, et interdum purus. Praesent ut urna sit amet erat dictum volutpat. Vestibulum consectetur tincidunt arcu at fringilla. Sed accumsan risus tellus, sed congue est auctor sit amet. 
      </p>
    </div>

    <div class="card feature-card" name="#test">
      <header>Fast, Focused Interface</header>
      <hr>
      <p>
        Fusce dignissim pretium metus vel tincidunt. Aliquam erat volutpat. Aenean in turpis id ligula imperdiet aliquam vel sed leo. Vestibulum nunc eros, rutrum in vehicula in, tempus nec erat. Nullam aliquet lacus nec lectus consectetur, sed faucibus velit molestie. Donec et suscipit justo, quis condimentum felis. Vivamus et pharetra mi. Nullam tincidunt nisi sagittis nunc pellentesque sagittis. Ut sagittis ex in fringilla feugiat. Vivamus quis faucibus ligula. Nunc consequat, sapien id fringilla feugiat, erat turpis euismod lectus, quis volutpat odio lorem ut turpis. 
      </p>
    </div>

    <div class="card feature-card">
      <header>Some Other Feature</header>
      <hr>
      <p>
        Phasellus euismod semper justo quis malesuada. Suspendisse potenti. Curabitur volutpat ante eros, sed aliquet sem pellentesque at. Nulla vestibulum ex vel lacus maximus euismod. Suspendisse iaculis blandit libero, sit amet convallis quam sollicitudin et. Nam vulputate convallis lacus, et hendrerit elit tempus in. Nam pellentesque ligula ante. Vivamus posuere nulla non mauris tempus vestibulum. Fusce vitae urna libero. Sed sit amet molestie orci, eget dapibus sapien. 
      </p>
    </div>
  </section>
</main>

<style lang="scss">
  h1 {
    font-size: 3rem;
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
        grid-column: 2;
        padding: 1rem;
      }
    }
  }

  .title-card {
    width: 85%;
  }
</style>