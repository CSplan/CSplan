import userStore from '$stores/user'

let userID = ''

userStore.subscribe((user) => {
  if (user.isLoggedIn) {
    userID = user.id
  } else {
    userID = ''
  }
})

export function getUserID(): string {
  return userID
}