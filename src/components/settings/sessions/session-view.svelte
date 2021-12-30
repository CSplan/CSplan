<script lang="ts">
  import { ordered, sessions as sessionStore } from '$stores/sessions'
  import { onMount } from 'svelte'
  import { FormStates as States } from '$lib'
  import Spinner from '$components/spinner.svelte'
import { AuthLevels } from '$lib/auth-levels'

  let state = States.Loading

  function dateField(n: number): string {
    return n.toString().padStart(2, '0')
  }
  function dateFormat(d: Date): string {
    const hours = dateField(d.getHours())
    const minutes = dateField(d.getMinutes())
    const month = dateField(d.getMonth())
    const date = dateField(d.getDate())
    const year = d.getFullYear() // padding is not going to be a problem soon enough for me to care
    return `${hours}:${minutes},\n${month}-${date}-${year}`
  }

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
        <span class="ip-address" class:empty={session.ip == null}>{session.ip || 'None'}</span>
        <span class="os" class:empty={session.os == null}>{session.os || 'None'}</span>
        <span class="browser" class:empty={session.browser == null}>{session.browser || 'None'}</span>
        <span class="created">{dateFormat(session.created)}</span>
        <span class="last-used">{dateFormat(session.lastUsed)}</span>
        <span class="authlevel">{AuthLevels[session.authLevel]}</span>
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
    display: block;
    text-overflow: ellipsis;
    overflow: hidden;
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
  span.created, span.last-used {
    white-space: pre-wrap;
  }
  span.empty {
    pointer-events: none;
    background-color: rgb(230, 230, 230);
  }
</style>