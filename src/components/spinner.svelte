<script>
  export let size = '1.25rem'
  export let vm = '0rem'
  export let message = ''
</script>

<i class="fas fa-circle-notch" style="--size: {size}; --vm: {vm};"></i>
{#if message.length}
  <p class="message" style="--vm: {vm}">{message}</p>
{/if}

<style>
  @keyframes spin {
    from {transform: rotate(0deg);}
    to {transform: rotate(359deg);}
  }
  i.fa-circle-notch {
    margin: var(--vm) 0;
    font-size: var(--size);
    animation-name: spin;
    animation-duration: 1.5s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    color: var(--bold-blue)
  }
  p.message {
    margin: 0;
    margin-bottom: calc(var(--vm) / 2);
  }
</style>
