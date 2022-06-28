<script lang="ts">
  //import user from '$stores/user'
  import Spinner from '$components/spinner.svelte'


</script>

<footer class="verification-banner">
  <i class="fas fa-triangle-exclamation"></i>
  <span>Please verify your CSplan account's email address.
    <span class="clickable resend-link">
      <i class="far fa-envelope"></i>
      Resend Verification Email
    </span>
  </span>
  <Spinner colorOverride='white'/>
</footer>

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
  span.resend-link {
    font-weight: 600;
    border-bottom: 2px white solid;
  }
</style>