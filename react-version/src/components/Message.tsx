export default function Message({ text, error = false }: { text: string; error?: boolean }) {
  if (!text) return null;
  return <div className={`msg${error ? ' msg-error' : ''}`}>{text}</div>;
}
