import client from "./client";

export const AuthAPI = {
  login(data: any) {
    return client.post("/auth/login", data); // <-- thêm dấu /
  },

  
  register(data: any) {
    return client.post("/auth/register", data);
  },
  getProfile() {
    return client.get("/auth/user");
  }
  ,
  me() {
  return client.get("/auth/me");
}

};
