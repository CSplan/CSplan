<script lang="ts">
  export let title = ''
  export let icon = ''
</script>

<span>
  <slot name="icon">
    <i class={icon}></i>
  </slot>
  <div class="title">
    {title}
  </div>
</span>

<style lang="scss">
  span {
    margin: 0.5rem;
  }
  i {
    margin-right: 0.3rem;
  }
  span {
    width: 100%;
  }
  div.title {
    display: inline;
    font-weight: bold;
  }
</style>