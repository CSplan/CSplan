<script lang="ts">
  import { FormStates as States } from '$lib'
  export let size = '2rem'
  // FIXME: only accept bottom margin in spinners, top margin should always be 0
  export let vm = '0rem'
  export let message = ''
  export let state: States = States.Saving
  export let iconSaved = 'fa-check-circle'

  // Custom icon colors/styling through classes
  export let classSaved = 'saved'
</script>

<div class="spinner">
  <i class="fad
    {state === States.Saved ? `${iconSaved} ${classSaved}` : ''}" 
  class:fa-circle-notch={state === States.Saving}
  class:fa-times-circle={state === States.Errored}

  style:--size={size}
  size:--vm={vm}
  ></i>
  
  {#if message.length > 0}
    <span class="message" class:success={state === States.Saved} class:error={state === States.Errored} style="--vm: {vm}">{message}</span>
  {/if}
</div>

<style lang="scss">
  div.spinner {
    margin: 0;
    padding: 0;

    display: flex;
    flex-direction: column;
    align-items: center;
  }
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
  i.saved {
    color: $success-green;
  }
  i.fa-times-circle {
    color: $danger-red;
  }
  span.message {
    margin: 0;
    margin-bottom: calc(var(--vm) / 2);
    &.error {
      color: $danger-red;
    }
    &.success {
      color: $success-green;
    }
  }
</style>
