<script lang="ts">
  let content = 'Edit me!'
  let rendered = ''
  $: console.log(rendered)

  function encode(evt: FocusEvent) {
    const raw = (<HTMLElement>evt.target).innerHTML

    // Replace all breaks with carriage returns
    rendered = raw!
      .replace(/<br>(?!$)/g, '\n')
  }
</script>

<main class="containter">
  <div>
    <span class="editor" contenteditable>{content}</span>
  </div>
</main>

<style lang="scss">
  main {
    display: flex;
    width: 100%;
    height: 100vh;
    justify-content: center;
    align-items: center;
  }

  .editor {
    min-height: 2rem;
    resize: none;
    border: none;
    background: whitesmoke;

  }
</style>