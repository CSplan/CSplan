<script lang="ts">
  export let title = ''
  export let icon = ''
  export let color = 'white'
</script>

<button class="transparent" style="color: {color};">
  <i class={icon}></i>
  <span>{title}</span>
</button>

<style lang="scss">
  button {
    padding: 0.3rem 0.5rem;
    width: 100%;
  }
  i {
    margin: auto 0.3rem;
  }
</style>