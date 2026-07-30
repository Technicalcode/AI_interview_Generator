import axios from "axios";

export const ServerUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: ServerUrl,
  withCredentials: true
});

export const readApiError = (error, fallback = "Something went wrong. Please try again.") => {
  return error.response?.data?.message || error.message || fallback;
};
