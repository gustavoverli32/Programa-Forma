import { LegacyRuntime } from "@/components/legacy/LegacyRuntime";
import legacyShell from "@/legacy/shell.json";

export default function Home() {
  return (
    <>
      <div
        id="nextuber-root"
        // Conteudo confiavel, gerado mecanicamente do HTML versionado do projeto.
        dangerouslySetInnerHTML={{ __html: legacyShell.html }}
      />
      <LegacyRuntime />
    </>
  );
}
