export const tokenService = {
  getLocalAccessToken() {
    return localStorage.getItem("access_token");
  },

  getLocalRefreshToken() {
    return localStorage.getItem("refresh_token");
  },

  updateLocalAccessToken(token: string) {
    localStorage.setItem("access_token", token);
  },

  updateLocalRefreshToken(token: string) {
    localStorage.setItem("refresh_token", token);
  },

  clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};
