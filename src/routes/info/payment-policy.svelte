<script lang="ts">
</script>

<main class="container">
  <article class="primary">
    <h1>CSplan Payment Policy</h1>
    <p><b>Last Updated:</b> 07/30/2022</p>
    <p>This document is a description of how payments for CSplan Pro are processed and fulfilled, as well as a disclosure of some important privacy implications of this processing.</p>

    <section>
      <h2>Section I: Handling of Payment Information</h2>
      <p>
        CSplan processes card payments via <a href="https://stripe.com">Stripe</a>. No sensitive payment information (including but not limited to card numbers, expiration dates, and CVCs) is ever sent to CSplan's servers. All information that is processed by CSplan, either directly or by Stripe is disclosed in Section I. By paying via Stripe, users acknowledge that they have read, understood, and accepted the sections of <a href="https://stripe.com/privacy">Stripe's Privacy Policy</a> pertaining to "End Customers".
      </p>

        
      <h3>Tax Location</h3>
      <p>
        When a user intends to pay via Stripe for the first time, the user fills out their country code, and their postal code if they are from the US or Canada. The user's country code, along with their postal code if they are from the US or Canada, will be henceforth referred to as the user's "tax location". Tax location is the minimum information needed for CSplan to collect the legally required sales tax/VAT on purchases made by the user. Tax location will only be collected when the user manually fills out the required information and submits it to CSplan. In accordance with CSplan's privacy policy, tax location is never determined by IP address.
      </p>
      <h3>Storage of Payment Information</h3>
      <p>
        Users must send their tax location to CSplan when registering a Stripe Customer ID to be associated with their account. CSplan will send the user's tax location to Stripe, which Stripe will store for the purpose of calculating tax on purchases made by the user. The user's tax location and Stripe Customer ID will be stored encrypted using a AES-256 GCM key generated using a CSPRNG, and this key will be stored encrypted by the user's master public key alongside the encrypted information.
      </p>
      <p>
        Without having the user's password to decrypt the user's master private key, the user's Stripe Customer ID and tax location cannot be decrypted or understood by CSplan. Stripe is never sent CSplan user IDs. Therefore, unless the user has an open transaction, CSplan is unable to link users to their Stripe Customer ID or any information associated with their Stripe Customer ID.
      </p>

      <h3>Deletion of Payment Information</h3>
      <p>
        When a user's account is deleted, CSplan ensures that the user's Stripe Customer ID and associated information is requested for deletion from Stripe beforehand. CSplan will not delete a user account until it has received confirmation from Stripe this request for deletion has been successfully received and understood. A request for deletion from Stripe does not ensure that information is deleted, Stripe may retain data associated with deleted customers for the purposes described in Stripe's privacy policy.
      </p>  
      <p>
        Users may view their Stripe Customer ID (if they have one) in CSplan at any time before deleting their account. This information can be used to file data privacy requests (such as "requests to delete") with Stripe under laws such as the CCPA and GDPR. Filing such requests may provide Stripe with personal information they would not otherwise have linked to the filing user's customer ID as a part of the communications process. In the event that providing such information compromises the privacy of the user filing the request, CSplan shall not be held liable.
      </p>

      <h2>Section II: Handling of Transactions</h2>
      <p>
        An "open transaction" is defined as an open or recurring payment. CSplan will store the ID of the following open transactions: an open Stripe invoice for one-time payment OR an active Stripe subscription. No more than one open transaction will be stored at a time for a given user. CSplan must store open transaction IDs as specified in order to fulfill payment events, by associating the invoice or subscription ID of the payment event sent by Stripe with the CSplan user that made the payment.
      </p>
      
      <h3>Privacy Implications</h3>
      <p>
        For the duration that open transaction ID is stored alongside a CSplan user ID, CSplan is able to associate the user that opened the transaction with their Stripe customer ID. Open Stripe invoices will be voided, and their ID will be deleted from CSplan's servers after 10 minutes has passed from the last time the user interacted with the invoice by attempting to retrieve the invoice, pay the invoice, or create a new invoice. Each time the user interacts with an invoice according to this definition, the invoice is reset to remain open for ten minutes past the time of the interaction. Open Stripe invoice IDs will be deleted from CSplan's servers upon fulfillment of the invoice's successful payment.
      </p>
      <p>
        Subscriptions can be thought of as a continously open transaction. CSplan's servers must be ready at any time to associate the ID of a active subscription that has been paid with the internal ID of the paying user. When a user has an active subscription, their Stripe Customer ID and CSplan account ID can be associated by CSplan. <b>Any user with an active subscription could have their account associated with their full personal identity in the event of a subponea to CSplan, Stripe, and the user's bank.</b> Users who cannot tolerate or wish to avoid this implication should not pay via subscription.
      </p>

      <h2>Section III: Fulfillment</h2>
      <p>
      </p>

      <h2>Section IV: Refunds</h2>
      <p>CSplan currently does not provide refunds or prorate subscription cancellations. CSplan will warn users before account deletion if their account has paid time remaining. In the event of an accidental purchase, email <a href="mailto:support@csplan.co">support@csplan.co</a> with 'refund' in the subject to request a manually issued refund.</p>

      <h2>Section V: Contacts</h2>
      <p>
        For inquiries related to this policy or payment for CSplan Pro in general, email <a href="mailto:support@csplan.co">support@csplan.co</a>. This address should NOT be used for general feedback or inquiries regarding CSplan. Abuse of this address will result in the temporary or permanent blocking of the abusing sender.
      </p>
    </section>
  </article>
</main>

<style lang="scss">
  article {
    border: 1px solid $border-normal;
    padding: $padding-m;
    @media (min-width: $desktop-min) {
      margin-top: 25px;
      max-width: 1200px;
    }
    font-size: 110%;
    p {
      margin: 0.5rem;
    }
    section h2,h3 {
      font-weight: 600;
    }
  }
</style>