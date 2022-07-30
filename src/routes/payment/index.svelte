<script lang="ts">
  import paymentStatus from '$stores/payment-status'
</script>

<main class="container">
  <pre>{JSON.stringify($paymentStatus, '', 2)}</pre>
</main>