import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

type SecurityApi = {
  escapeHtml(value: unknown): string;
  escapeAttr(value: unknown): string;
  safeUrl(value: unknown, options?: { allowImageData?: boolean }): string;
};

const projectRoot = process.cwd();
const securityPaths = ["public/legacy/security.js", "assets/js/security.js"];
const applicationPaths = ["public/legacy/app.js", "assets/js/app.js"];

function loadSecurityApi(path: string): SecurityApi {
  const source = readFileSync(`${projectRoot}/${path}`, "utf8");
  const sandbox = {
    URL,
    location: { origin: "https://nextuber.com.br" },
  } as Record<string, unknown>;
  vm.runInNewContext(source, sandbox, { filename: path });
  return sandbox.NextuberSecurity as SecurityApi;
}

test("encodes executable markup before inserting database text into HTML", () => {
  for (const path of securityPaths) {
    const security = loadSecurityApi(path);
    const payload = `<img src=x onerror="globalThis.xss=true">'&`;
    const encoded = security.escapeHtml(payload);

    assert.equal(
      encoded,
      "&lt;img src=x onerror=&quot;globalThis.xss=true&quot;&gt;&#39;&amp;",
    );
    assert.equal(encoded.includes("<img"), false);
    assert.equal(encoded.includes("onerror=\""), false);
  }
});

test("encodes quotes and backticks in HTML attributes", () => {
  const security = loadSecurityApi(securityPaths[0]);
  assert.equal(
    security.escapeAttr(`abc\"'` + "` onmouseover=alert(1)"),
    "abc&quot;&#39;&#96; onmouseover=alert(1)",
  );
});

test("allows trusted links and blocks executable or insecure URL schemes", () => {
  const security = loadSecurityApi(securityPaths[0]);

  assert.equal(security.safeUrl("javascript:alert(1)"), "");
  assert.equal(security.safeUrl("data:text/html,<script>alert(1)</script>"), "");
  assert.equal(security.safeUrl("http://example.com/file.pdf"), "");
  assert.equal(
    security.safeUrl("https://storage.example.com/file.pdf"),
    "https://storage.example.com/file.pdf",
  );
  assert.equal(
    security.safeUrl("data:image/png;base64,iVBORw0KGgo=", { allowImageData: true }),
    "data:image/png;base64,iVBORw0KGgo=",
  );
});

test("keeps the GitHub Pages and Next.js security helpers identical", () => {
  assert.equal(
    readFileSync(`${projectRoot}/${securityPaths[0]}`, "utf8"),
    readFileSync(`${projectRoot}/${securityPaths[1]}`, "utf8"),
  );
});

test("legacy renderers do not contain the previously vulnerable raw interpolations", () => {
  const forbidden = [
    "+enc.titulo+",
    "+enc.descricao+",
    "+r.e.nome+",
    `class="nc-name">'+e.nome`,
    `class="cad-list-name">'+e.nome`,
    `class="cad-list-name">'+g.nome`,
    `'<span>'+e.nome+'</span>'`,
    "+a.titulo+",
    "+a.descricao+",
    "+a.gestor_nome+",
    `href="'+a.arquivo_url+'"`,
    "+a.arquivo_nome+",
    "+p.observacao+",
    "innerHTML = fmtDate(updVal)+",
  ];

  for (const path of applicationPaths) {
    const source = readFileSync(`${projectRoot}/${path}`, "utf8");
    for (const unsafeInterpolation of forbidden) {
      assert.equal(
        source.includes(unsafeInterpolation),
        false,
        `${path} ainda contém interpolação sem proteção: ${unsafeInterpolation}`,
      );
    }
  }
});
