import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const projectRoot = process.cwd();
const nextApplication = "public/legacy/app.js";

test("Next.js runtime delegates authentication and production to protected bridges", () => {
  const source = readFileSync(`${projectRoot}/${nextApplication}`, "utf8");

  assert.equal(source.includes("var PWD"), false);
  assert.equal(source.includes("window.nextuberReads.bootstrap()"), true);
  assert.equal(source.includes("window.nextuberAuth.loginTutor"), true);
  assert.equal(source.includes("window.nextuberAuth.loginManager"), true);
  assert.equal(source.includes("window.nextuberTracking.open"), true);
  assert.equal(source.includes("window.nextuberProduction.verifyToday"), true);
});

test("React production panel keeps the required save confirmation", () => {
  const source = readFileSync(
    `${projectRoot}/src/components/tracking/ProductionTrackingIsland.tsx`,
    "utf8",
  );

  assert.equal(source.includes("Dados salvos"), true);
  assert.equal(source.includes("quantityWeeksInMonth"), true);
  assert.equal(source.includes("nextuberProductionBridge.saveBatch"), true);
});

test("bootstrap limits production rows to readable students", () => {
  const source = readFileSync(
    `${projectRoot}/src/app/api/data/bootstrap/route.ts`,
    "utf8",
  );

  assert.equal(source.includes("readableStudentIds.has(row.estagiario_id)"), true);
});

test("React student monitoring section includes filters, excel export, and drawer integration", () => {
  const sectionSource = readFileSync(
    `${projectRoot}/src/components/tracking/StudentMonitoringSection.tsx`,
    "utf8",
  );
  const drawerSource = readFileSync(
    `${projectRoot}/src/components/tracking/StudentProfileDrawer.tsx`,
    "utf8",
  );

  assert.equal(sectionSource.includes("Acompanhamento <em>individual</em>"), true);
  assert.equal(sectionSource.includes("handleExportExcel"), true);
  assert.equal(sectionSource.includes("StudentProfileDrawer"), true);

  assert.equal(drawerSource.includes("Fase 1 | Decolar"), true);
  assert.equal(drawerSource.includes("Marcar produção como verificada hoje"), true);
  assert.equal(drawerSource.includes("handleToggleAttention"), true);
});

test("React home overview section includes KPIs, rankings, and project details modal", () => {
  const homeSource = readFileSync(
    `${projectRoot}/src/components/overview/HomeOverviewSection.tsx`,
    "utf8",
  );
  const modalSource = readFileSync(
    `${projectRoot}/src/components/overview/ProjectDetailsModal.tsx`,
    "utf8",
  );

  assert.equal(homeSource.includes("Desenvolvendo o futuro comercial do Itaú"), true);
  assert.equal(homeSource.includes("Ranking do Trimestre"), true);
  assert.equal(homeSource.includes("calculateConsolidatedKpis"), true);
  assert.equal(modalSource.includes("Objetivo do Programa"), true);
  assert.equal(modalSource.includes("saveSetting"), true);
});

test("React registration section includes student card, manager card, and deletion actions", () => {
  const regSectionSource = readFileSync(
    `${projectRoot}/src/components/registration/RegistrationSection.tsx`,
    "utf8",
  );
  const studentCardSource = readFileSync(
    `${projectRoot}/src/components/registration/StudentRegistrationCard.tsx`,
    "utf8",
  );
  const managerCardSource = readFileSync(
    `${projectRoot}/src/components/registration/ManagerRegistrationCard.tsx`,
    "utf8",
  );

  assert.equal(regSectionSource.includes("Cadastro de <em>estagiários e gestores</em>"), true);
  assert.equal(regSectionSource.includes("handleDeleteStudent"), true);
  assert.equal(regSectionSource.includes("handleDeleteManager"), true);

  assert.equal(studentCardSource.includes("validateStudentRegistrationInput"), true);
  assert.equal(studentCardSource.includes("createStudent"), true);

  assert.equal(managerCardSource.includes("validateManagerRegistrationInput"), true);
  assert.equal(managerCardSource.includes("createManager"), true);
});

test("React program sections include trilhas tabs, appointment forms, and deadline settings", () => {
  const trilhasSource = readFileSync(
    `${projectRoot}/src/components/program/TrilhasSection.tsx`,
    "utf8",
  );
  const appSource = readFileSync(
    `${projectRoot}/src/components/program/AppointmentsSection.tsx`,
    "utf8",
  );
  const cfgSource = readFileSync(
    `${projectRoot}/src/components/program/SettingsSection.tsx`,
    "utf8",
  );

  assert.equal(trilhasSource.includes("Trilhas de <em>aprendizado</em>"), true);
  assert.equal(trilhasSource.includes("TRILHAS_FULL_DATA"), true);

  assert.equal(appSource.includes("Registrar Novo Agendamento"), true);
  assert.equal(appSource.includes("uploadAppointment"), true);
  assert.equal(appSource.includes("createAppointment"), true);

  assert.equal(cfgSource.includes("Prazo para Atualização de Produção Semanal"), true);
  assert.equal(cfgSource.includes("formatDeadlineStatus"), true);
  assert.equal(cfgSource.includes("/api/settings/production-deadline"), true);
});

test("React AI assistant includes floating drawer, suggested prompts, and secure API integration", () => {
  const assistantModalSource = readFileSync(
    `${projectRoot}/src/components/assistant/AiAssistantModal.tsx`,
    "utf8",
  );

  assert.equal(assistantModalSource.includes("Nextuber IA"), true);
  assert.equal(assistantModalSource.includes("SUGGESTED_QUESTIONS"), true);
  assert.equal(assistantModalSource.includes("/api/assistant"), true);
  assert.equal(assistantModalSource.includes("sanitizeAssistantText"), true);
});

test("Next.js runtime includes native React navigation decoupled from legacy app.js", () => {
  const runtimeSource = readFileSync(
    `${projectRoot}/src/components/legacy/LegacyRuntime.tsx`,
    "utf8",
  );

  assert.equal(runtimeSource.includes("handleNativeNavigation"), true);
  assert.equal(runtimeSource.includes("dataset.page"), true);
  assert.equal(runtimeSource.includes("Executando em modo 100% React nativo"), true);
});
