<script>
  export let size = '1.25rem'
</script>

<i class="fas fa-circle-notch" style="--size: {size};"></i>

<style>
  @keyframes spin {
    from {transform: rotate(0deg);}
    to {transform: rotate(359deg);}
  }
  i.fa-circle-notch {
    font-size: var(--size);
    animation-name: spin;
    animation-duration: 1.5s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    color: var(--bold-blue)
  }
</style>
