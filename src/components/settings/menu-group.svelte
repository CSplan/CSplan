<script lang="ts">
  export let title = ''
  export let icon = ''
  export let color = 'white'
</script>

<button class="transparent" style="color: {color};" on:click>
  <i class={icon}></i>
  <span>{title}</span>
</button>

<style lang="scss">
  button {
    padding: 0.3rem 0.5rem;
    border-radius: 0;
    width: 100%;
  }
  i:not(.indicator) {
    margin: auto 0.3rem;
  }
  i.indicator {
    display: inline;
  }
</style>