const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const Icon = {
  bell: () => <svg viewBox="0 0 24 24" width="20" height="20" {...P}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>,
  chat: () => <svg viewBox="0 0 24 24" width="20" height="20" {...P}><path d="M4 5h16v11H9l-5 4z" /></svg>,
  bug: () => <svg viewBox="0 0 24 24" width="20" height="20" {...P}><rect x="7" y="7" width="10" height="13" rx="5" /><path d="M12 7V4M9 4l1.5 2M15 4l-1.5 2M3 11h4M17 11h4M3 17h4M17 17h4" /></svg>,
  trophy: () => <svg viewBox="0 0 24 24" width="20" height="20" {...P}><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8" /></svg>,
  send: () => <svg viewBox="0 0 24 24" width="18" height="18" {...P}><path d="M4 12 20 4l-6 16-3-7z" /></svg>,
  search: () => <svg viewBox="0 0 24 24" width="16" height="16" {...P}><circle cx="11" cy="11" r="6" /><path d="m20 20-4.5-4.5" /></svg>,
  grid: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">{[5, 12, 19].flatMap((x) => [5, 12, 19].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.6" />))}</svg>,
  file: () => <svg viewBox="0 0 24 24" width="14" height="14" {...P}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /></svg>
};
