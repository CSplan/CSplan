/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

/// <reference types="@sveltejs/kit"/>

declare namespace App {
  interface Locals {
    isLoggedIn: boolean
    user?: {
      id: string
      email: string
      username?: string
      displayName?: import('$lib').DisplayNames 
      verified: boolean
      accountType: import('$lib/account-types').AccountTypes
      admin?: bool
      authLevel: number
    }
    paymentStatus?: {
      accountType: import('$lib/account-types').AccountTypes // TODO: dedup accountType prop
      paidUntil?: number
      subscribed: number
    }
    settings: {
      storeSessionMeta: boolean
      darkMode: boolean
      reverseLists: boolean
    }
  }
}