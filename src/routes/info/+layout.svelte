<main class="container">
  <article class="primary">
    <slot></slot>
  </article>
</main>

<style lang="scss">
  article {
    border: 1px solid $border-normal;
    padding: $padding-m;
    @media (min-width: $desktop-min) {
      margin-top: 25px;
      min-width: 800px;
      max-width: 1200px;
    }
    @media (max-width: $mobile-max) {
      width: 100%;
    }
    :global {
      p {
        margin: 0.5rem;
      }
      section h2,h3 {
        font-weight: 600;
      }
      h1 {
        border-bottom: 2px solid $border-alt;
        margin-bottom: 1.3rem;
        padding-bottom: 0.8rem;
      }
    }
  }
</style>