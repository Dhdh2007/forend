import { createClient } from "@/lib/supabaseClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function authorizedFetch(path, options = {}) {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function fetchCampaigns() {
  return authorizedFetch("/api/campaigns", { method: "GET" });
}

export function fetchAnalytics() {
  return authorizedFetch("/api/analytics", { method: "GET" });
}

export function fetchActivity() {
  return authorizedFetch("/api/activity", { method: "GET" });
}

export function createCampaign({ triggerWord, destinationLink, messageTemplate }) {
  return authorizedFetch("/api/campaigns", {
    method: "POST",
    body: JSON.stringify({
      trigger_word: triggerWord,
      destination_link: destinationLink,
      message_template: messageTemplate || null,
    }),
  });
}

export function updateCampaign(campaignId, { triggerWord, destinationLink, messageTemplate, isActive }) {
  const body = {};
  if (triggerWord !== undefined) body.trigger_word = triggerWord;
  if (destinationLink !== undefined) body.destination_link = destinationLink;
  if (messageTemplate !== undefined) body.message_template = messageTemplate;
  if (isActive !== undefined) body.is_active = isActive;

  return authorizedFetch(`/api/campaigns/${campaignId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteCampaign(campaignId) {
  return authorizedFetch(`/api/campaigns/${campaignId}`, { method: "DELETE" });
}

export function disconnectInstagram() {
  return authorizedFetch("/api/instagram/oauth/disconnect", { method: "DELETE" });
}

export function getInstagramConnectUrl() {
  return authorizedFetch("/api/instagram/oauth/start-url", { method: "GET" });
}

export function deleteAccount() {
  return authorizedFetch("/api/account", { method: "DELETE" });
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function signup(email, password, turnstileToken) {
  const response = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      turnstile_token: turnstileToken,
    }),
  });

  return response.json();
}