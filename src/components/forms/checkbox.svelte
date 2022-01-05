<script lang="ts">
  export let value = ''
  export let checked = false
</script>

<label class="checkable">
  <input type="checkbox" bind:checked>
  <span>{value}</span>
</label>


<style lang="scss">
  label.checkable {
    display: flex;
    flex-direction: row;
    align-items: center;

    margin: 0 !important;

    span::before,span::after {
      display: none;
    }
    span {
      padding: 0;
    }

    span,input {
      display: inline;
    }
    input {
      margin: 0;
      margin-right: 0.6rem;
      opacity: 100%;
      position: static;
      width: 1rem;
    }
  }
</style>