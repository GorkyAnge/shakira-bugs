import { Fragment } from 'react';

/** Texto con @menciones, `código`, *negritas* y enlaces, sin usar innerHTML. */
export function RichText({ text, me }: { text: string; me?: string }) {
  const parts = text.split(/(https?:\/\/\S+|@[A-Za-z0-9-]+|`[^`]+`|\*[^*\n]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        if (/^https?:\/\//.test(part)) return <a key={i} href={part} target="_blank" rel="noreferrer">{part}</a>;
        if (part.startsWith('@')) {
          const isMe = me && part.slice(1).toLowerCase() === me.toLowerCase();
          return <span key={i} className={`mention ${isMe ? 'is-me' : ''}`}>{part}</span>;
        }
        if (part.startsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>;
        if (part.startsWith('*') && part.length > 2) return <strong key={i}>{part.slice(1, -1)}</strong>;
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
