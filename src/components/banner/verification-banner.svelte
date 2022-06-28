<script lang="ts">
  import user from '$stores/user'
</script>

{#if $user.isLoggedIn && !$user.user.verified}
  <footer class="verification-banner">
    <i class="fas fa-triangle-exclamation"></i>
    <span>Please verify your CSplan account's email address. Go to <a href="/settings/account">settings</a> to resend a verification email.</span>
  </footer>
{/if}

<style lang="scss">
  footer.verification-banner {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 2.5rem;
    font-size: 110%;
    background: $dark-red;
    color: white;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  span {
    margin: 0.5rem;
  }

  a {
    color: inherit;
    text-decoration: underline;
    font-weight: 600;
  }
</style>