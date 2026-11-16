import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { api } from './api';
import type { Challenge, Message, Player } from './types';

/** Carga el estado inicial y se suscribe a los topics STOMP del backend. */
export function useLive(onIncoming: (m: Message) => void) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [connected, setConnected] = useState(false);
  const incoming = useRef(onIncoming);
  incoming.current = onIncoming;

  useEffect(() => {
    const load = () =>
      Promise.all([api.messages(), api.players(), api.challenges()])
        .then(([m, p, c]) => { setMessages(m); setPlayers(p); setChallenges(c); })
        .catch(console.error);

    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const client = new Client({
      brokerURL: `${proto}://${location.host}/ws`,
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true);
        load(); // re-sincroniza tras (re)conectar
        client.subscribe('/topic/messages', (frame) => {
          const msg: Message = JSON.parse(frame.body);
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
          incoming.current(msg);
        });
        client.subscribe('/topic/leaderboard', (frame) => setPlayers(JSON.parse(frame.body)));
        client.subscribe('/topic/challenges', (frame) => setChallenges(JSON.parse(frame.body)));
      },
      onWebSocketClose: () => setConnected(false)
    });
    client.activate();
    return () => { client.deactivate(); };
  }, []);

  const addLocal = (m: Message) =>
    setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));

  return { messages, players, challenges, connected, addLocal };
}
