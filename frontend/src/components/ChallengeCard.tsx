import type { Challenge } from '../types';
import { Icon } from './Icons';

export function DifficultyBadge({ c }: { c: Pick<Challenge, 'difficulty' | 'difficultyLabel' | 'points'> }) {
  return <span className={`badge ${c.difficulty.toLowerCase()}`}>{c.difficultyLabel} · +{c.points} pts</span>;
}

export function StatusChip({ c }: { c: Challenge }) {
  if (c.status === 'SOLVED') return <span className="chip solved">✓ Resuelto por @{c.solvedBy}</span>;
  if (c.status === 'ANNOUNCED') return <span className="chip open">● Abierto</span>;
  return <span className="chip pending">Sin reportar</span>;
}

export function ChallengeCard({ c }: { c: Challenge }) {
  return (
    <div className={`card-adaptive ${c.difficulty.toLowerCase()}`}>
      <div className="card-head">
        <strong>{c.title}</strong>
        <DifficultyBadge c={c} />
      </div>
      <div className="card-meta">
        <a href={c.fileUrl} target="_blank" rel="noreferrer" className="file"><Icon.file /> {c.file}</a>
        <StatusChip c={c} />
      </div>
      <div className="card-foot">
        Reto <code>{c.id}</code> · pruébalo con <code>npm run challenges</code>
      </div>
    </div>
  );
}
