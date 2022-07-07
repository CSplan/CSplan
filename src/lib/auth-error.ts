export default class AuthError extends Error {
  code: string

  static readonly NotLoggedIn = 'NOT_LOGGED_IN'

  constructor(message: string, code: string) {
    super(message)
    this.code = code
  }
}
