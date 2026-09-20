import type { ReactNode } from 'react';

export default function PageHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-baseline justify-between gap-1.5 border-b-2 border-ink pb-4">
      <h1>{title}</h1>
      {children}
    </div>
  );
}
