<script lang="ts">
  import { FormStates as States } from '$lib'
  export let size = '1.25rem'
  // FIXME: only accept bottom margin in spinners, top margin should always be 0
  export let vm = '0rem'
  export let message = ''
  export let state: States = States.Saving
</script>

<i class="fas" 
class:fa-circle-notch={state === States.Saving}
class:fa-check-circle={state === States.Saved} 
class:fa-times-circle={state === States.Errored}
style="--size: {size}; --vm: {vm};"></i>
{#if message.length}
  <p class="message" style="--vm: {vm}">{message}</p>
{/if}

<style lang="scss">
  @keyframes spin {
    from {transform: rotate(0deg);}
    to {transform: rotate(359deg);}
  }
  i {
    margin: var(--vm) 0;
    font-size: var(--size);
    align-self: center;
  }
  i.fa-circle-notch {
    animation-name: spin;
    animation-duration: 1.5s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    color: $bold-blue;
  }
  i.fa-check-circle {
    color: $success-green;
  }
  i.fa-times-circle {
    color: $danger-red;
  }
  p.message {
    margin: 0;
    margin-bottom: calc(var(--vm) / 2);
  }
</style>
