<script>
  export let id
  import { contenteditableKeypress } from '../misc/contenteditable'
</script>

<div class="card">
  <header contenteditable on:keypress={contenteditableKeypress}>Title</header>
</div>

<style>
  .card {
    font-size: 1.25rem;
  }
  .card:first-child {
    margin-top: 2rem;
  }
  .card:not(:first-child) {
    margin-top: 1rem;
  }
  @media screen and (min-width: 1200px) {
    .card {
      min-width: 300px;
      max-width: 800px;
    }
  }
</style>