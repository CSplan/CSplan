<script lang="ts">
  export let summary = ''
</script>

<details>
  <summary class="clickable">
    <i class="fas fa-chevron-right"/>
    <span>{summary}</span>
  </summary>
  <slot></slot>
</details>

<style lang="scss">
  i.fa-chevron-right {
    transition: transform 200ms var(--cubic-out);
    margin-right: 0.25rem;
  }
  details[open] i.fa-chevron-right {
    transform: rotate(90deg) translateX(1px);
  }
  details>:global(*) {
    display: block;
  }
</style>
