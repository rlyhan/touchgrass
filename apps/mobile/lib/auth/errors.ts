export class UnauthenticatedError extends Error {
  constructor() {
    super("Not authenticated")
    this.name = "UnauthenticatedError"
  }
}
