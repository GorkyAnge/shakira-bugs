import type { Challenge, Message, Player } from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers }
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? body?.detail ?? `Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  messages: () => request<Message[]>('/messages'),
  players: () => request<Player[]>('/players'),
  challenges: () => request<Challenge[]>('/challenges'),
  join: (displayName: string, githubUser: string) =>
    request<Player>('/players/join', { method: 'POST', body: JSON.stringify({ displayName, githubUser }) }),
  send: (githubUser: string, content: string) =>
    request<Message>('/messages', { method: 'POST', body: JSON.stringify({ githubUser, content }) })
};
