import type { Challenge, Me, Player } from '../types';
import { Avatar } from './Avatar';
import { ChallengeCard } from './ChallengeCard';

export function Leaderboard({ players, me }: { players: Player[]; me: Me }) {
  const medal = ['🥇', '🥈', '🥉'];
  if (!players.length) return <p className="muted pad">Nadie se ha unido todavía.</p>;
  return (
    <ol className="leaderboard">
      {players.map((p) => (
        <li key={p.githubUser} className={p.githubUser === me.githubUser ? 'is-me' : ''}>
          <span className="rank">{medal[p.rank - 1] ?? p.rank}</span>
          <Avatar name={p.displayName} size={28} />
          <span className="who">
            <strong>{p.displayName}</strong>
            <small>@{p.githubUser} · {p.solvedCount} bug{p.solvedCount === 1 ? '' : 's'}</small>
          </span>
          <span className="pts">{p.points}</span>
        </li>
      ))}
    </ol>
  );
}

export function ChallengeBoard({ challenges, compact = false }: { challenges: Challenge[]; compact?: boolean }) {
  const open = challenges.filter((c) => c.status === 'ANNOUNCED');
  const solved = challenges.filter((c) => c.status === 'SOLVED');
  const pending = challenges.filter((c) => c.status === 'PENDING').length;
  if (compact) {
    return <div className="board">{open.length ? open.map((c) => <ChallengeCard key={c.id} c={c} />) : <p className="muted">Nada abierto por ahora 😌</p>}</div>;
  }
  return (
    <div className="board">
      <h4>Abiertos ({open.length})</h4>
      {open.length ? open.map((c) => <ChallengeCard key={c.id} c={c} />) : <p className="muted">Nada abierto. Shakira está tramando algo… 😈</p>}
      <h4>Resueltos ({solved.length})</h4>
      {solved.map((c) => <ChallengeCard key={c.id} c={c} />)}
      <p className="muted">{pending} bug{pending === 1 ? '' : 's'} esperando a ser descubiertos.</p>
    </div>
  );
}
