<script lang="ts">
  import settings from '$stores/settings'
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

  const version = __APP_VERSION__

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
        },
        {
          title: 'Email',
          user: 'kscr25@csplan.co',
          href: 'mailto:kscr25@csplan.co',
          icon: '/vendor/ProtonMail/protonmail-sign-purple.png'
        }
      ]
    },
    {
      name: 'Josie Satterfield',
      work: 'Logo Design',
      links: [
        {
          title: 'Linktree',
          user: 'Josie',
          href: 'https://linktr.ee/josiesatt',
          icon: '/vendor/Linktree/Linktree-Logo.png'
        }
      ]
    }
  ]

</script>

<main class="container">
  <div class="title">
    <h1 class="title">About</h1>
    <img src="/logo/{$settings.darkMode ? 'Dark' : 'Light'}-CSplan-noslogan.svg" alt="CSplan Logo" class="CSplan-logo">
  </div>

  <article class="card">
    <p>All feedback and suggestions are welcome and greatly appreciated. Please submit feedback to <a href="mailto:feedback@csplan.co">feedback@csplan.co</a> or on <a href="https://github.com/very-amused/CSplan/issues">CSplan's Github Issues</a>.</p>

    <p>Current version: <code>{version}</code></p>

    <h2>Credits</h2>

    {#each credits as credit}
      <p>
        <b>{credit.name}</b>
        <br>
        <span class="work">{credit.work}</span>
      </p>
      {#if credit.links !== undefined}
        <div class="links">
          {#each credit.links as link}
            {#if link.icon !== undefined}
              <img src={link.icon} class="icon" alt="{link.title} icon" title={link.title}>
            {/if}
            <span>{link.title}: <a rel="external" href={link.href}>{link.user}</a></span>
            <br>
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
    @media screen and (min-width: $desktop-min) {
      flex-direction: row;
      margin: $spacing auto;
    }
    @media screen and (max-width: $mobile-max) {
      flex-direction: column;
      margin: auto $spacing;
    }
    align-items: center;
    justify-content: center;


    h1 {
      font-size: 4rem;
      padding-bottom: 0;
      @media screen and (min-width: $desktop-min) {
        padding-top: $spacing;
        margin-right: $spacing;
      }
      @media screen and (max-width: $mobile-max) {
        padding-top: 0;
      }
    }
    img.CSplan-logo {
      margin-right: 0;
      height: 8rem;
      @media screen and (max-width: $mobile-max) {
        margin-bottom: $spacing;
      }
    }
  }

  article {
    padding: $padding-m;
    @media (max-width: $mobile-max) {
      font-size: 110%;
      p {
        padding-left: 0;
        padding-right: 0;
      }
    }
  }
  h2 {
    text-align: center;
    border-top: 1px #ccc solid;
    border-bottom: 1px #ccc solid;
    margin-bottom: $spacing;
    padding-bottom: 0.6rem;
    padding-top: 0.6rem;
  }
  div.links {
    margin-left: $spacing;
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 0.5rem;
    img.icon {
      height: 1.1em;
      margin-bottom: -0.1em;
      grid-column: 1;
      margin-left: auto;
      margin-right: auto;
    }
    span {
      grid-column: 2;
    }
  }
</style>