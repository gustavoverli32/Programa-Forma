import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import manifest from "../app/manifest.ts";

const projectRoot = process.cwd();

test("Next.js manifest has a stable identity and installable icons", () => {
  const config = manifest();
  assert.equal(config.id, "/");
  assert.equal(config.start_url, "/");
  assert.equal(config.scope, "/");
  assert.equal(config.display, "standalone");
  assert.equal(config.lang, "pt-BR");

  const icons = config.icons || [];
  assert.equal(icons.some((icon) => icon.sizes === "192x192" && icon.purpose === "any"), true);
  assert.equal(
    icons.some((icon) => icon.sizes === "192x192" && icon.purpose === "maskable"),
    true,
  );
  assert.equal(icons.some((icon) => icon.sizes === "512x512" && icon.purpose === "any"), true);
  assert.equal(
    icons.some((icon) => icon.sizes === "512x512" && icon.purpose === "maskable"),
    true,
  );
});

test("service worker updates bypass browser cache and refresh an already installed app", () => {
  const registration = readFileSync(
    `${projectRoot}/src/components/pwa/PwaRegistration.tsx`,
    "utf8",
  );
  assert.match(registration, /updateViaCache:\s*"none"/);
  assert.match(registration, /controllerchange/);
  assert.match(registration, /window\.location\.reload\(\)/);
  assert.match(registration, /registration\.update\(\)/);
});

test("Next.js service worker excludes APIs and preloads the protected legacy runtime", () => {
  const worker = readFileSync(`${projectRoot}/public/sw.js`, "utf8");
  assert.match(worker, /url\.pathname\.startsWith\("\/api\/"\)/);
  assert.match(worker, /"\/legacy\/security\.js"/);
  assert.match(worker, /"\/legacy\/app\.js"/);
  assert.match(worker, /key\.startsWith\(CACHE_PREFIX\)/);
  assert.match(worker, /cache-control/);
});

test("GitHub Pages fallback also installs the security layer before the application", () => {
  const htmlFiles = ["index.html", "formaplus_2_0.html", "src/legacy/source.html"];
  for (const path of htmlFiles) {
    const html = readFileSync(`${projectRoot}/${path}`, "utf8");
    const securityPosition = html.indexOf("assets/js/security.js");
    const applicationPosition = html.indexOf("assets/js/app.js");
    assert.notEqual(securityPosition, -1, `${path} não carrega a camada de segurança`);
    assert.equal(
      securityPosition < applicationPosition,
      true,
      `${path} carrega a aplicação antes da camada de segurança`,
    );
  }

  const worker = readFileSync(`${projectRoot}/sw.js`, "utf8");
  assert.match(worker, /assets\/js\/security\.js\?v=1/);
  assert.match(worker, /assets\/js\/app\.js\?v=/);
  assert.match(worker, /CACHE_PREFIX = 'nextuber-github-'/);
});
