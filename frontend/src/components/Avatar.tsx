const COLORS = ['#c4314b', '#0f6cbd', '#8764b8', '#038387', '#ca5010', '#498205', '#986f0b', '#c239b3'];

function hash(s: string) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || '?';
}

export function Avatar({ name, size = 32, manager = false, online }: { name: string; size?: number; manager?: boolean; online?: boolean }) {
  const style = {
    width: size,
    height: size,
    fontSize: size * 0.38,
    background: manager ? 'linear-gradient(135deg,#f7b733,#c2410c)' : COLORS[hash(name) % COLORS.length]
  };
  return (
    <span className="avatar" style={style} title={name}>
      {manager ? '💃' : initials(name)}
      {online !== undefined && <span className={`presence ${online ? 'on' : 'away'}`} />}
    </span>
  );
}
