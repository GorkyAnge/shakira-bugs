import { useEffect, useRef } from 'react';
import type { Me, Message } from '../types';
import { Avatar } from './Avatar';
import { ChallengeCard } from './ChallengeCard';
import { RichText } from './RichText';

const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const day = (iso: string) => new Date(iso).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });

export function MessageList({ messages, me }: { messages: Message[]; me: Me }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  if (messages.length === 0) {
    return <div className="empty">Aún no hay mensajes. Shakira está revisando la tienda… 👀</div>;
  }

  return (
    <div className="messages">
      {messages.map((m, i) => {
        const prev = messages[i - 1];
        const newDay = !prev || day(prev.createdAt) !== day(m.createdAt);
        const mine = m.senderGithub === me.githubUser;
        const manager = m.senderGithub === null && m.kind !== 'SYSTEM';
        const grouped = !newDay && prev && prev.senderName === m.senderName && prev.kind !== 'SYSTEM' && m.kind === 'TEXT'
          && new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < 3 * 60_000;

        return (
          <div key={m.id}>
            {newDay && <div className="day-divider"><span>{day(m.createdAt)}</span></div>}
            {m.kind === 'SYSTEM' ? (
              <div className="system-msg">{m.content}</div>
            ) : (
              <div className={`msg ${mine ? 'mine' : ''} ${grouped ? 'grouped' : ''}`}>
                {!mine && <div className="msg-avatar">{!grouped && <Avatar name={m.senderName} manager={manager} />}</div>}
                <div className={`bubble ${m.kind.toLowerCase()}`}>
                  {!grouped && (
                    <div className="bubble-head">
                      {!mine && <span className="sender">{m.senderName}{manager && <span className="role">Manager</span>}</span>}
                      <span className="time">{time(m.createdAt)}</span>
                    </div>
                  )}
                  {m.kind === 'ALERT' && <div className="alert-label">🚨 Nuevo bug reportado</div>}
                  {m.kind === 'CELEBRATION' && m.points ? <div className="celebrate-label">🎉 +{m.points} puntos</div> : null}
                  <div className="text"><RichText text={m.content} me={me.githubUser} /></div>
                  {m.challenge && m.kind === 'ALERT' && <ChallengeCard c={m.challenge} />}
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div ref={end} />
    </div>
  );
}
