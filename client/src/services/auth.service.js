import { apiRequest } from "./api";

export const register = async (userData) => {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const login = async (credentials) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

export const logout = async () => {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
};

export const getCurrentUser = async () => {
  return apiRequest("/auth/me");
};
