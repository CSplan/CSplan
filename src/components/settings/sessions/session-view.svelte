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
    <table>
      <tr class="headers">
        <th class="id">ID</th>
        <th class="is-current">Current Session</th>
        <th class="ip-address">IP Address</th>
        <th class="os">OS</th>
        <th class="browser">Browser</th>
        <th class="created">Created</th>
        <th class="last-used">Last Used</th>
        <th class="auth-level">Auth Level</th>
        <th class="logout">Log Out</th>
      </tr>
      
      {#each $ordered as session (session.id)}
        <tr class="session">
          <td class="id">{session.id}</td>
          <td class="is-current">{session.isCurrent ? 'Yes' : 'No'}</td>
          <td class="ip-address" class:empty={session.ip == null}>{session.ip || ''}</td>
          <td class="os" class:empty={session.os == null}>{session.os || ''}</td>
          <td class="browser" class:empty={session.browser == null}>{session.browser || ''}</td>
          <td class="created">{formatDate(session.created)}</td>
          <td class="last-used">{formatDate(session.lastUsed)}</td>
          <td class="auth-level">{AuthLevels[session.authLevel]}</td>
          <td class="logout">
            <button disabled={!session.isCurrent} on:click={session.isCurrent ? userStore.logout : null}>
              <i class="fas fa-times"></i>
            </button>
          </td>
        </tr>
      {/each}
    </table>
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

  table {
    th {
      font-weight: 600;
      padding: 0.6rem 0.35rem;
    }
    td {
      padding: 0.3rem 0.35rem;
    }
    tr {
      background: white;
      $border: 1px #aaa solid;
      &:not(:first-child) {
        border-top: $border;
      }
      &:not(:last-child) {
        border-bottom: $border;
      }
    }
    th,td {
      text-align: center;
      background: inherit;
      color: inherit;
      $border: 2px #aaa solid;
      &:not(:first-child) {
        border-left: $border;
      }
      &:not(:last-child) {
        border-right: $border;
      }
    }
  }

  td.logout button {
    background: $danger-red;
  }
  td.empty {
    pointer-events: none;
    cursor: not-allowed;
    background-color: rgb(230, 230, 230);
  }
</style>