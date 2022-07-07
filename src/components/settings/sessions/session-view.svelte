<script lang="ts">
  import { ordered, sessions as sessionStore } from '$stores/sessions'
  import { onMount } from 'svelte'
  import { FormStates as States } from '$lib'
  import Spinner from '$components/spinner.svelte'
  import { AuthLevels } from '$lib/auth-levels'
  import { formatDate } from '$lib/date-format'
  import UpgradeModal from '$components/modals/upgrade-modal.svelte'
  import LogoutModal from '$components/modals/logout-modal.svelte'
  import storage from '$db/storage'

  let state = States.Loading

  // Hidden columns
  let hideOS: boolean
  $: hideOS = $ordered.findIndex(session => session.os != null) === -1
  let hideIP: boolean
  $: hideIP = $ordered.findIndex(session => session.ip != null) === -1
  let hideBrowser: boolean
  $: hideBrowser = $ordered.findIndex(session => session.browser != null) === -1

  let showLogoutModal = false
  let showUpgradeModal = false

  const remoteLogout = {
    id: '',
    init: async (id: string) => {
      remoteLogout.id = id
      const authLevel = storage.getAuthLevel()
      if (authLevel === AuthLevels.Upgraded) {
        await remoteLogout.logout()
      } else {
        showUpgradeModal = true
      }
    },
    logout: async () => {
      await sessionStore.logout(remoteLogout.id)
    }
  }


  onMount(async () => {
    await sessionStore.init()
    state = States.Resting
  })
</script>

<LogoutModal bind:show={showLogoutModal}/>

<UpgradeModal bind:show={showUpgradeModal} on:upgrade={remoteLogout.logout}/>

<article class="sessions">
  {#if state === States.Loading}
    <Spinner size="3rem"/>
  {:else}
    <table>
      <tr class="headers">
        <th class="id">ID</th>
        <th class="is-current">Current Session</th>
        <th class="ip-address" class:d-none={hideIP}>IP Address</th>
        <th class="os" class:d-none={hideOS}>OS</th>
        <th class="browser" class:d-none={hideBrowser}>Browser</th>
        <th class="created">Created</th>
        <th class="last-used">Last Used</th>
        <th class="auth-level">Auth Level</th>
        <th class="logout">Revoke Session</th>
      </tr>
      
      {#each $ordered as session (session.id)}
        <tr class="session">
          <td class="id">{session.id}</td>
          <td class="is-current">{session.isCurrent ? 'Yes' : 'No'}</td>
          <td class="ip-address" class:d-none={hideIP} class:empty={session.ip == null}>{session.ip || ''}</td>
          <td class="os" class:d-none={hideOS} class:empty={session.os == null}>{session.os || ''}</td>
          <td class="browser" class:d-none={hideBrowser} class:empty={session.browser == null}>{session.browser || ''}</td>
          <td class="created">{formatDate(session.created)}</td>
          <td class="last-used">{formatDate(session.lastUsed)}</td>
          <td class="auth-level">{AuthLevels[session.authLevel]}</td>
          <td class="logout">
            <button on:click={session.isCurrent ? () => showLogoutModal = true : () => remoteLogout.init(session.id)} class:revoke={!session.isCurrent}>
              {session.isCurrent ? 'Log Out' : 'Revoke'}
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
    color: $text-normal;
    border: 1px solid $border-alt;
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
      background: $bg-primary;
      $border: 1px $border-alt solid;
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
      $border: 2px $border-alt solid;
      &:not(:first-child) {
        border-left: $border;
      }
      &:not(:last-child) {
        border-right: $border;
      }
    }
  }

  td.logout {
    padding: 0.5rem;
  }
  td.logout button {
    background: $danger-red;
    width: 100%;
    height: 100%;
    margin: 0;
    border-radius: $br-light;
    &.revoke {
      background: $bg-alt;
    }
  }
  td.empty {
    pointer-events: none;
    cursor: not-allowed;
    background-color: $bg-disabled;
  }
</style>