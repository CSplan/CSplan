<script lang="ts">
  export let title = ''
  export let icon = ''
  export let color = 'white'
  export let href = ''
</script>

<a {href}>
<button class="transparent" style="color: {color};">
  <slot name="icon">
    <i class={icon}></i>
  </slot>
  <span>{title}</span>
</button>
</a>

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