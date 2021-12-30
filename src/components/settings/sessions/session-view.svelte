<script lang="ts">
  import { ordered, sessions as sessionStore } from '$stores/sessions'
  import { onMount } from 'svelte'
  import { FormStates as States } from '$lib'
  import Spinner from '$components/spinner.svelte'
  import { AuthLevels } from '$lib/auth-levels'
  import { formatDate } from '$lib/date-format'
  import userStore from '$stores/user'

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
      <header>Log Out</header>
    </div>

    {#each $ordered as session (session.id)}
      <div class="row">
        <div class="id">
          <span class="id">{session.id}</span>
        </div>
        <div class="is-current">
          <span>{session.isCurrent ? 'Yes' : 'No'}</span>
        </div>
        <div class="ip-address" class:empty={session.ip == null}>
          <span>{session.ip || ''}</span>
        </div>
        <div class="os" class:empty={session.os == null}>
          <span>{session.os || ''}</span>
        </div>
        <div class="browser" class:empty={session.browser == null}>
          <span>{session.browser || ''}</span>
        </div>
        <div class="created">
          <span>{formatDate(session.created)}</span>
        </div>
        <div class="last-used">
          <span>{formatDate(session.lastUsed)}</span>
        </div>
        <div class="auth-level">
          <span>{AuthLevels[session.authLevel]}</span>
        </div>
        <div class="logout">
          <button disabled={!session.isCurrent} on:click={session.isCurrent ? userStore.logout : null}>
            <i class="fas fa-times"></i>
          </button>
        </div>
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
    grid-template-columns: repeat(8, 1fr) 0.75fr;
    grid-auto-flow: column;
    border-top: 1px #aaa solid;
    border-bottom: 1px #aaa solid;

    &:first-child {
      border-top: none;
    }
    &:last-child {
      border-bottom: none;
    }
  }
  div.headers {
    header {
      width: 100%;
      text-align: center;
      padding: 0.6rem 0.35rem;

      font-weight: 600;

      $border: 1px #aaa solid;
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

  div.row > * {
    border-left: 1px #aaa solid;
    border-right: 1px #aaa solid;
    padding: 0.3rem 0.45rem;
    margin: 0;
    text-align: center;
    &:first-child {
      border-left: none;
    }
    &:last-child {
      border-right: none;
    }
  }
  // Dates don't need extra margin/spacing, they are already the largest element in the table
  div.created, div.last-used {
    span {
      padding: 0;
      margin: 0;
    }
  }
  div.row span {
    display: block;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  div.row button {
    background: $danger-red;
  }
  div.is-current {
    i {
      font-size: 1.5rem;
      margin: 0.5rem 0;
      color: $success-green;
    }
  }
  div.empty {
    pointer-events: none;
    background-color: rgb(230, 230, 230);
  }
</style>