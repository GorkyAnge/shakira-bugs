import { useState } from 'react';
import { Icon } from './Icons';

export function Composer({ onSend, disabled }: { onSend: (text: string) => Promise<void>; disabled?: boolean }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  async function send() {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    try {
      await onSend(t);
      setText('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="composer">
      <textarea
        value={text}
        placeholder={disabled ? 'Reconectando…' : 'Escribe un mensaje. Prueba "@Shakira pista"'}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
        rows={1}
        maxLength={1000}
      />
      <button className="send" onClick={send} disabled={!text.trim() || busy || disabled} aria-label="Enviar"><Icon.send /></button>
    </div>
  );
}
