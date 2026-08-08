"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="next-error-page">
      <h1>Não foi possível abrir o Nextuber</h1>
      <p>Tente carregar a plataforma novamente.</p>
      <button type="button" onClick={reset}>
        Tentar novamente
      </button>
    </main>
  );
}
