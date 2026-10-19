import axios from "axios";

const configuredServerUrl = import.meta.env.VITE_SERVER_URL;

export const ServerUrl = configuredServerUrl || (import.meta.env.DEV ? "http://localhost:3000" : "");
export const isServerConfigured = Boolean(ServerUrl);

export const api = axios.create({
  baseURL: ServerUrl,
  withCredentials: true
});

export const readApiError = (error, fallback = "Something went wrong. Please try again.") => {
  if (!isServerConfigured) {
    return "Backend server URL is not configured for this deployment.";
  }

  if (!error.response) {
    return "Cannot connect to the backend server. Please check the deployed server URL and CORS settings.";
  }

  return error.response?.data?.message || error.message || fallback;
};
