import Link from "next/link";

export default function NotFound() {
  return (
    <main className="next-error-page">
      <h1>Página não encontrada</h1>
      <Link href="/">Voltar ao Nextuber</Link>
    </main>
  );
}
