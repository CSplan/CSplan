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
      max-width: 1200px;
    }
    font-size: 110%;
    :global {
      p {
        margin: 0.5rem;
      }
      section h2,h3 {
        font-weight: 600;
      }
    }
  }
</style>