import { useState } from 'react';
import { api } from '../api';
import type { Me } from '../types';

export function JoinScreen({ onJoin }: { onJoin: (me: Me) => void }) {
  const [displayName, setDisplayName] = useState('');
  const [githubUser, setGithubUser] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const p = await api.join(displayName.trim(), githubUser.trim().replace(/^@/, ''));
      if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
      onJoin({ githubUser: p.githubUser, displayName: p.displayName });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo entrar');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="join">
      <form className="join-card" onSubmit={submit}>
        <div className="join-logo">💃</div>
        <h1>Bug Squad</h1>
        <p className="muted">Tu manager Shakira va a reportar bugs de la tienda. Arréglalos con un PR y gana puntos.</p>
        <label>
          Nombre para mostrar
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ana Pérez" required maxLength={40} autoFocus />
        </label>
        <label>
          Usuario de GitHub
          <input value={githubUser} onChange={(e) => setGithubUser(e.target.value)} placeholder="ana-dev" required pattern="@?[A-Za-z0-9][A-Za-z0-9-]{0,38}" />
          <small className="muted">Debe coincidir con quien hace el push/PR para que te lleguen los puntos.</small>
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary" disabled={busy}>{busy ? 'Entrando…' : 'Unirme al chat'}</button>
      </form>
    </div>
  );
}
