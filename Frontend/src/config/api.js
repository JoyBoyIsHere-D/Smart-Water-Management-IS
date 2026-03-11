/**
 * Dynamic API URL configuration.
 *
 * In development (npm run dev): uses VITE_API_URL from .env
 * In production (Docker):       derives the host from the browser's current URL
 *                                so it works on localhost, LAN IP, or any domain
 *                                without rebuilding the image.
 */

const getApiUrl = () => {
  // If explicitly set via env var, always respect it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Otherwise derive from the current browser host (works for localhost and LAN IP)
  const hostname = window.location.hostname;
  return `http://${hostname}:5000`;
};

export const API_URL = getApiUrl();
