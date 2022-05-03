<script lang="ts">
  type Credit = {
    name: string
    work: string
    links?: CreditLink[]
  }
  type CreditLink = {
    title: string // Title of the website
    user: string // Username on the website
    href: string
    icon?: string
  }

  const credits: Credit[] = [
    {
      name: 'Keith Scroggs',
      work: 'Lead Developer, Owner',
      links: [
        {
          title: 'GitHub',
          user: 'very-amused',
          href: 'https://github.com/very-amused',
          icon: '/vendor/GitHub/GitHub-Mark/PNG/GitHub-Mark-64px.png'
        }
      ]
    },
    {
      name: 'Josie Satterfield',
      work: 'Logo Design'
    }
  ]

</script>

<main class="container">
  <div class="title">
    <h1 class="title">About</h1>
    <img src="/logo/Light-CSplan-noslogan.svg" alt="CSplan Logo" class="CSplan-logo">
  </div>

  <article class="card">
    <p>All feedback and suggestions are welcome, please submit to <a href="mailto:feedback@csplan.co">feedback@csplan.co</a> or on <a href="https://github.com/very-amused/CSplan/issues">CSplan's Github Issues</a>.</p>

    <p>Current version: <code>Private-Beta</code></p>

    <h2>Credits</h2>

    {#each credits as credit}
      <p>
        <b>{credit.work}</b> - {credit.name}
      </p>
      {#if credit.links !== undefined}
        <div class="links">
          {#each credit.links as link}
            {#if link.icon !== undefined}
              <img src={link.icon} class="icon" alt="{link.title} icon">
            {/if}
            <span>{link.title}: <a href={link.href}>{link.user}</a></span>
          {/each}
        </div>
      {/if}
    {/each}
  </article>
</main>

<style lang="scss">
  $spacing: 1.5rem;
  div.title {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    margin: $spacing auto;

    h1 {
      font-size: 4rem;
      padding-bottom: 0;
      margin-right: $spacing;
      margin-top: -1rem;
    }
    img.CSplan-logo {
      margin-right: 0;
      height: 8rem;
    }
  }

  article {
    padding: $padding-m;
  }
  h2 {
    text-align: center;
    border-bottom: 1px #ccc solid;
    margin-bottom: $spacing;
    padding-bottom: 0.6rem;
  }
  div.links {
    margin-left: $spacing;
    img.icon {
      height: 1.1em;
      margin-bottom: -0.1em;
    }
  }
</style>