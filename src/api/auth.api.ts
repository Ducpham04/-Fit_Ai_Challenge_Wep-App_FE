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
  },

  updateProfile(data: { userName?: string; email?: string; linkImage?: string }) {
    return client.put("/auth/profile", data);
  }
};
