export const tokenUtils = {
  storeToken: (token: string) => {
    localStorage.setItem('jwt_token', token)
  },

  getToken: (): string | null => {
    return localStorage.getItem('jwt_token')
  },

  removeToken: () => {
    localStorage.removeItem('jwt_token')
  },

  isTokenValid: (): boolean => {
    const token = tokenUtils.getToken()
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expiryTime = payload.exp * 1000 // Convert to milliseconds
      return Date.now() < expiryTime
    } catch {
      return false
    }
  }
}