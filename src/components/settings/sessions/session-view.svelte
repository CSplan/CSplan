<script lang="ts">
  import { ordered, sessions as sessionStore } from '$stores/sessions'
  import { onMount } from 'svelte'
  import { FormStates as States } from '$lib'
  import Spinner from '$components/spinner.svelte'

  let state = States.Loading

  onMount(async () => {
    await sessionStore.init()
    state = States.Resting
  })
</script>

<article class="sessions">
  {#if state === States.Loading}
    <Spinner size="1.5rem"/>
  {:else}
    <div class="headers row">
      <header>ID</header>
      <header>Current Session</header>
      <header>IP Address</header>
      <header>OS</header>
      <header>Browser</header>
      <header>Created</header>
      <header>Last Used</header>
      <header>Auth Level</header>
    </div>

    {#each $ordered as session (session.id)}
      <div class="row">
        <span class="id">{session.id}</span>
        <span class="is-current">{session.isCurrent}</span>
        <span class="ip-address"></span>
        <span class="os"></span>
        <span class="browser"></span>
        <span class="created">{session.created}</span>
        <span class="last-used"></span>
        <span class="authlevel"></span>
      </div>
    {/each}
  {/if}
</article>

<style lang="scss">
  article.sessions {
    margin: 1.5rem 0;
    color: #111;
    border: 1px solid #aaa;
    padding: 0;

    display: flex;
    flex-direction: column;
  }

  div.row {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    grid-auto-flow: column;
  }
  div.headers {
    header {
      width: 100%;
      text-align: center;
      padding: 0.6rem 0.35rem;

      font-weight: 600;

      $border: 1px #aaa solid;
      border-bottom: $border;
      border-left: $border;
      border-right: $border;
      &:first-child {
        border-left: none;
      }
      &:last-child {
        border-right: none;
      }
    }
  }

  div.row > span {
    border-left: 1px #aaa solid;
    border-right: 1px #aaa solid;
    padding: 0.3rem 0.45rem;
    margin: 0;
    text-align: center;
    &:first-child {
      border-left: none;
    }
    &:nth-child(8) {
      border-right: none;
    }
  }
  div.id {
    grid-column: 1;
  }
</style>