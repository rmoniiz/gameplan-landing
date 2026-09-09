# GamePlan landing reconciliation — Strix rules of engagement

## Authorized target

This scan is authorized only for the checked-out `rmoniiz/gameplan-landing` source tree on the Phase 13 canonical security reconciliation branch.

Do not scan, attack, enumerate, fuzz, brute-force, or otherwise test third-party infrastructure or external services referenced by the landing, including Supabase, PostHog, Metricool, Paddle, email providers, GitHub, or Vercel control-plane endpoints.

## Goal

Find security and privacy defects in the GamePlan landing while preserving the approved PT-BR/EN experience. Prioritize:

- unsafe DOM rendering, injection and URL handling;
- open redirects or unsafe external navigation;
- consent bypasses for PostHog or Metricool;
- accidental collection or leakage of lead data;
- exposure of privileged credentials;
- insecure lead-capture routing or environment confusion;
- XSS in query parameters, language selection, UTMs or forms;
- CSP/security-header gaps that materially increase exploitability;
- dependency and supply-chain findings with a practical exploit path;
- landing-to-app link integrity and language preservation.

## Safety constraints

- Source/white-box analysis only in this workflow.
- No destructive testing, denial-of-service, load testing or brute force.
- Do not submit real personal data or real lead forms.
- Do not trigger real checkout, payments or Paddle Live.
- Do not modify Production, Supabase, RLS, Edge Functions, secrets, DNS or domains.
- Do not print environment-variable values, tokens, credentials or personal data.
- Do not follow links to attack external providers.
- Report evidence, affected path, impact, confidence and minimal remediation. Do not automatically edit product files.

## Product and privacy invariants

- PT-BR and EN must remain aligned without silently rewriting user-provided content.
- PostHog and Metricool must remain gated by affirmative analytics consent.
- Lead capture must use the environment routing already approved for Preview/Rehearsal and Production/primary.
- The public app CTA may keep the stable public alias, but must not be redirected to a protected temporary Preview.
- No real billing or production payment flow is in scope.
