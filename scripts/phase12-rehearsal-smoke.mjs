import fs from 'node:fs/promises';

const projectRef = 'dyhkhnjmnmktpjlqcqej';
const endpoint = `https://${projectRef}.${['supabase', 'co'].join('.')}/functions/v1/${['capture', 'marketing', 'lead'].join('-')}`;
const allowedOrigin = 'https://gameplan-landing-git-phase-12-producti-f5a01e-rmoniizs-projects.vercel.app';
const legacyAllowedOrigin = 'https://gameplan-landing-git-phase-12-lead-magnet-mvp-rmoniizs-projects.vercel.app';
const productionOrigin = 'https://gameplan-landing.vercel.app';
const runId = process.env.GITHUB_RUN_ID || String(Date.now());
const runAttempt = process.env.GITHUB_RUN_ATTEMPT || '1';
const email = `phase12-readiness-${runId}-${runAttempt}@example.invalid`;
const outputDir = 'phase12-validation-evidence';
const checks = [];
const failures = [];

const record = (name, passed, detail = '') => {
  checks.push({ name, passed: Boolean(passed), detail });
  if (!passed) failures.push(detail ? `${name}: ${detail}` : name);
};

const request = async ({ method = 'POST', origin, body }) => {
  const headers = {};
  if (origin) headers.Origin = origin;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(endpoint, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let json = {};
  try { json = text ? JSON.parse(text) : {}; } catch {}
  return {
    status: response.status,
    allowOrigin: response.headers.get('access-control-allow-origin'),
    json,
  };
};

const basePayload = {
  name: 'GamePlan Phase 12 Readiness Test',
  email,
  company: '',
  language: 'en',
  consentCapture: true,
  utmSource: 'github-actions',
  utmMedium: 'phase12-readiness-smoke',
  utmCampaign: 'production-readiness',
};

try {
  const preflight = await request({ method: 'OPTIONS', origin: allowedOrigin });
  record('actual readiness Preview preflight returns 204', preflight.status === 204, `status=${preflight.status}`);
  record('actual readiness Preview preflight reflects exact origin', preflight.allowOrigin === allowedOrigin, `acao=${preflight.allowOrigin}`);

  const legacyPreflight = await request({ method: 'OPTIONS', origin: legacyAllowedOrigin });
  record('legacy audited Preview remains allowed', legacyPreflight.status === 204 && legacyPreflight.allowOrigin === legacyAllowedOrigin, `status=${legacyPreflight.status} acao=${legacyPreflight.allowOrigin}`);

  const productionBlocked = await request({ origin: productionOrigin, body: basePayload });
  record('Rehearsal blocks production origin', productionBlocked.status === 403 && productionBlocked.json.error === 'origin_not_allowed', `status=${productionBlocked.status} error=${productionBlocked.json.error}`);

  const blocked = await request({ origin: 'https://example.com', body: basePayload });
  record('foreign origin is blocked', blocked.status === 403 && blocked.json.error === 'origin_not_allowed', `status=${blocked.status} error=${blocked.json.error}`);
  record('foreign origin is never reflected', blocked.allowOrigin !== 'https://example.com', `acao=${blocked.allowOrigin}`);

  const missingOrigin = await request({ body: basePayload });
  record('missing origin is blocked', missingOrigin.status === 403 && missingOrigin.json.error === 'origin_not_allowed', `status=${missingOrigin.status} error=${missingOrigin.json.error}`);

  const missingConsent = await request({ origin: allowedOrigin, body: { ...basePayload, consentCapture: false } });
  record('missing consent is rejected', missingConsent.status === 422 && missingConsent.json.error === 'consent_required', `status=${missingConsent.status} error=${missingConsent.json.error}`);

  const accepted = [];
  for (let i = 0; i < 6; i += 1) {
    accepted.push(await request({ origin: allowedOrigin, body: basePayload }));
  }

  record('first five accepted requests succeed', accepted.slice(0, 5).every((item) => item.status === 200 && item.json.ok === true), accepted.slice(0, 5).map((item) => `${item.status}:${item.json.error || 'ok'}`).join(','));
  record('duplicate request is identified', accepted[1]?.json?.duplicate === true, `duplicate=${accepted[1]?.json?.duplicate}`);
  record('sixth request is rate limited', accepted[5]?.status === 429 && accepted[5]?.json?.error === 'rate_limited', `status=${accepted[5]?.status} error=${accepted[5]?.json?.error}`);
  record('successful response reflects exact CORS origin', accepted[0]?.allowOrigin === allowedOrigin, `acao=${accepted[0]?.allowOrigin}`);
} catch (error) {
  failures.push(`network/runtime failure: ${error instanceof Error ? error.message : String(error)}`);
}

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(`${outputDir}/rehearsal-smoke.json`, JSON.stringify({
  generatedAt: new Date().toISOString(),
  endpointHost: new URL(endpoint).host,
  allowedOrigin,
  syntheticEmail: email,
  checks,
  failures,
}, null, 2));

console.log(JSON.stringify({ checks: checks.length, failures }, null, 2));
if (failures.length) process.exit(1);
