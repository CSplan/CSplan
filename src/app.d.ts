/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

/// <reference types="@sveltejs/kit"/>
declare namespace App {
  interface Locals {
    isLoggedIn: boolean
    user?: {
      id: string
      email: string
      verified: boolean
      accountType: import('$lib/account-types').AccountTypes
    }
    paymentStatus?: {
      accountType: import('$lib/account-types').AccountTypes // TODO: dedup accountType prop
      paidUntil?: number
      subscribed: number
    }
    settings: {
      darkMode: boolean
    }
  }

  import LayoutServerData = App.Locals
}