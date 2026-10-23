/*
  Frontend API helper for the resident pages.
  Load this script before the page-specific form script.
  Configure API_BASE if your backend is not at http://localhost:3000.
*/
const IULAT_API_BASE = 'http://localhost:3000/api';

async function iulatApiRequest(path, payload, token) {
  const response = await fetch(`${IULAT_API_BASE}${path}`, {
    method: payload ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(payload ? { body: JSON.stringify(payload) } : {})
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Request failed.');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}
