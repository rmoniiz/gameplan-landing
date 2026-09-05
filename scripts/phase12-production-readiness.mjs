import fs from 'node:fs/promises';

const capture = await fs.readFile('phase12-lead-capture.js', 'utf8');
const failures = [];
const checks = [];

const check = (name, condition, detail = '') => {
  checks.push({ name, passed: Boolean(condition), detail });
  if (!condition) failures.push(detail ? `${name}: ${detail}` : name);
};

check('preview host set is explicit', capture.includes("const auditedPreviewHosts = new Set(["));
check('legacy audited preview remains allowed', capture.includes('gameplan-landing-git-phase-12-lead-magnet-mvp-rmoniizs-projects.vercel.app'));
check('actual production-readiness branch alias is allowed', capture.includes('gameplan-landing-git-phase-12-producti-f5a01e-rmoniizs-projects.vercel.app'));
check('unverified guessed branch alias is not retained', !capture.includes('gameplan-landing-git-phase-12-production-readiness-landing-rmoniizs-projects.vercel.app'));
check('production host is exact', capture.includes("const productionHost = 'gameplan-landing.vercel.app'"));
check('rehearsal project ref is explicit', capture.includes("const auditedRehearsalRef = 'dyhkhnjmnmktpjlqcqej'"));
check('production project ref is explicit', capture.includes("const productionRef = 'ljuwnrbrneedzatbbslr'"));
check('preview maps only to rehearsal', capture.includes('isAuditedPreview') && capture.includes('endpointForRef(auditedRehearsalRef)'));
check('production maps only to production', capture.includes('isProductionHost') && capture.includes('endpointForRef(productionRef)'));
check('unknown hosts default disabled', capture.includes(': {}'));
check('runtime override remains supported', capture.includes('window.__GAMEPLAN_LEAD_CAPTURE_CONFIG__ || environmentConfig'));
check('endpoint remains assembled without literal supabase host', !/https:\/\/[^'"`\s]*supabase\.co/.test(capture));
check('no secret marker in browser code', !/service_role|sb_secret_|SUPABASE_SERVICE_ROLE/i.test(capture));
check('analytics remains consent gated', capture.includes("localStorage.getItem(analyticsConsentKey) !== 'granted'"));
check('request timeout remains 10 seconds', capture.includes('controller.abort(), 10000'));
check('consent remains required', capture.includes('consentCapture: form.elements.consent.checked'));

const report = { generatedAt: new Date().toISOString(), checks, failures };
await fs.mkdir('phase12-validation-evidence', { recursive: true });
await fs.writeFile('phase12-validation-evidence/production-readiness.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ checks: checks.length, failures }, null, 2));
if (failures.length) process.exit(1);
