import userStore from '$stores/user'
import type { UserStore } from '$stores/user'

let userID = ''

userStore.subscribe((value: UserStore) => {
  if (value.isLoggedIn) {
    userID = value.user.id
  } else {
    userID = ''
  }
})

export function getUserID(): string {
  return userID
}