<script>
  export let id
  import tags from '../stores/tags';
  import { contenteditableKeypress } from '../misc/contenteditable'
</script>

<div class="card">
  <header contenteditable on:keypress={contenteditableKeypress}>Title</header>
</div>

<!-- Add card button (visible only below the last card) -->

<style>
  .card {
    font-size: 1.25rem;
    margin-bottom: 0;
  }
  .card header {
    padding: 0.5rem;
  }
  .card:first-child {
    margin-top: 2rem;
  }
  .card:not(:first-child) {
    margin-top: 1rem;
  }
  @media screen and (min-width: 1200px) {
    .card {
      min-width: 800px;
      max-width: 1200px;
    }
  }
</style>