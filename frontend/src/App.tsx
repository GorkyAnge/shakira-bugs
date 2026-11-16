import { useCallback, useMemo, useState } from 'react';
import { api } from './api';
import { useLive } from './useLive';
import type { Me, Message } from './types';
import { JoinScreen } from './components/JoinScreen';
import { MessageList } from './components/MessageList';
import { Composer } from './components/Composer';
import { ChallengeBoard, Leaderboard } from './components/Panels';
import { Avatar } from './components/Avatar';
import { Icon } from './components/Icons';

const STORAGE_KEY = 'bug-squad-me';

function loadMe(): Me | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

type Tab = 'chat' | 'retos' | 'ranking';
type Thread = 'squad' | 'shakira';

export default function App() {
  const [me, setMe] = useState<Me | null>(loadMe);
  if (!me) {
    return <JoinScreen onJoin={(m) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(m)); } catch { /* ok */ } setMe(m); }} />;
  }
  return <Shell me={me} onLeave={() => { try { localStorage.removeItem(STORAGE_KEY); } catch { /* ok */ } setMe(null); }} />;
}

interface Toast { id: number; title: string; body: string; kind: string }

function Shell({ me, onLeave }: { me: Me; onLeave: () => void }) {
  const [tab, setTab] = useState<Tab>('chat');
  const [thread, setThread] = useState<Thread>('squad');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [unread, setUnread] = useState(0);

  const onIncoming = useCallback((m: Message) => {
    if (m.kind !== 'ALERT' && m.kind !== 'CELEBRATION') return;
    const title = m.kind === 'ALERT' ? '🚨 Shakira reportó un bug' : '🎉 ¡Bug resuelto!';
    const body = m.challenge?.title ?? m.content.slice(0, 90);
    setToasts((t) => [...t, { id: m.id, title, body, kind: m.kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== m.id)), 6000);
    if (document.hidden) {
      setUnread((n) => n + 1);
      if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body });
    }
  }, []);

  const { messages, players, challenges, connected, addLocal } = useLive(onIncoming);
  const visible = useMemo(
    () => (thread === 'shakira' ? messages.filter((m) => m.senderGithub === null && m.kind !== 'SYSTEM') : messages),
    [messages, thread]
  );
  const myStats = players.find((p) => p.githubUser === me.githubUser);
  const openCount = challenges.filter((c) => c.status === 'ANNOUNCED').length;
  const last = (t: Thread) => [...(t === 'shakira' ? visible : messages)].reverse().find((m) => m.kind !== 'SYSTEM');

  if (typeof document !== 'undefined') document.title = unread ? `(${unread}) Bug Squad` : 'Bug Squad';

  const send = async (text: string) => {
    addLocal(await api.send(me.githubUser, text));
  };

  return (
    <div className="app" onMouseMove={() => unread && setUnread(0)}>
      <header className="topbar">
        <span className="waffle"><Icon.grid /></span>
        <span className="brand">Bug Squad</span>
        <div className="search"><Icon.search /><input placeholder="Buscar" aria-label="Buscar" /></div>
        <div className="me" title={`@${me.githubUser}`}>
          <span className="me-pts">{myStats?.points ?? 0} pts</span>
          <Avatar name={me.displayName} size={30} online={connected} />
          <button className="link" onClick={onLeave}>Salir</button>
        </div>
      </header>

      <nav className="rail">
        <button className={tab === 'chat' ? 'active' : ''} onClick={() => setTab('chat')}><Icon.chat /><span>Chat</span></button>
        <button className={tab === 'retos' ? 'active' : ''} onClick={() => setTab('retos')}>
          <Icon.bug /><span>Retos</span>{openCount > 0 && <i className="dot">{openCount}</i>}
        </button>
        <button className={tab === 'ranking' ? 'active' : ''} onClick={() => setTab('ranking')}><Icon.trophy /><span>Ranking</span></button>
      </nav>

      <aside className="chatlist">
        <h3>Chat</h3>
        <div className="section-label">Fijados</div>
        {(['squad', 'shakira'] as Thread[]).map((t) => {
          const lm = last(t);
          return (
            <button key={t} className={`thread ${thread === t && tab === 'chat' ? 'active' : ''}`} onClick={() => { setThread(t); setTab('chat'); }}>
              {t === 'squad' ? <span className="avatar group" style={{ width: 32, height: 32 }}>🐞</span> : <Avatar name="Shakira" manager online />}
              <span className="thread-text">
                <strong>{t === 'squad' ? 'Bug Squad' : 'Shakira (Manager)'}</strong>
                <small>{lm ? `${lm.senderName}: ${lm.content}` : 'Sin mensajes'}</small>
              </span>
            </button>
          );
        })}
        <div className="section-label">Equipo ({players.length})</div>
        {players.slice(0, 12).map((p) => (
          <div key={p.githubUser} className="thread static">
            <Avatar name={p.displayName} size={28} />
            <span className="thread-text"><strong>{p.displayName}</strong><small>{p.points} pts</small></span>
          </div>
        ))}
      </aside>

      <main className="main">
        <div className="chat-header">
          {thread === 'squad' ? <span className="avatar group" style={{ width: 32, height: 32 }}>🐞</span> : <Avatar name="Shakira" manager />}
          <strong>{thread === 'squad' ? 'Bug Squad' : 'Shakira (Manager)'}</strong>
          <div className="tabs">
            {(['chat', 'retos', 'ranking'] as Tab[]).map((t) => (
              <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
                {t === 'chat' ? 'Chat' : t === 'retos' ? `Retos (${openCount})` : 'Ranking'}
              </button>
            ))}
          </div>
          {!connected && <span className="offline">Reconectando…</span>}
        </div>

        {tab === 'chat' && (
          <>
            <MessageList messages={visible} me={me} />
            <Composer onSend={send} disabled={!connected} />
          </>
        )}
        {tab === 'retos' && <div className="scroll pad"><ChallengeBoard challenges={challenges} /></div>}
        {tab === 'ranking' && <div className="scroll pad"><Leaderboard players={players} me={me} /></div>}
      </main>

      <aside className="side">
        <section>
          <h3>🏆 Ranking</h3>
          <Leaderboard players={players.slice(0, 8)} me={me} />
        </section>
        <section>
          <h3>🐞 Retos abiertos</h3>
          <ChallengeBoard challenges={challenges} compact />
        </section>
      </aside>

      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind.toLowerCase()}`}>
            <strong>{t.title}</strong>
            <span>{t.body}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
