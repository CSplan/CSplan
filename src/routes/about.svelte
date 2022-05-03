<main class="container">
  <div class="title">
    <h1 class="title">About</h1>
    <img src="/logo/Light-CSplan-noslogan.svg" alt="CSplan Logo" class="CSplan-logo">
  </div>

  <article class="card">
    <p>All feedback and suggestions are welcome, please submit to <a href="mailto:feedback@csplan.co">feedback@csplan.co</a> or on <a href="https://github.com/very-amused/CSplan/issues">CSplan's Github Issues</a>.</p>

    <p>Current version: <code>Private-Beta</code></p>
  </article>
</main>

<style lang="scss">
  div.title {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    $spacing: 1.5rem;

    margin: $spacing auto;

    h1 {
      font-size: 4rem;
      padding-bottom: 0;
      margin-right: $spacing;
      margin-top: -1rem;
    }
    img.CSplan-logo {
      margin-right: 0;
      height: 8rem;
    }
  }
  article {
    padding: $padding-m;
  }
</style>