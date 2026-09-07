'use client';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card">
      <h2 className="font-semibold">Ocurrió un error</h2>
      <p className="mt-1 text-sm text-slate-300">{error.message}</p>
      <button onClick={() => reset()} className="btn-secondary mt-4">
        Reintentar
      </button>
    </div>
  );
}
