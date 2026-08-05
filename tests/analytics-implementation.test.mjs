import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const page = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

assert.match(
  page,
  /const RYBBIT_PRODUCTION_HOST = 'mychip\.vercel\.app'/,
  'analytics must load only on the production domain',
);
assert.doesNotMatch(
  page,
  /<script src="https:\/\/app\.rybbit\.io\/api\/script\.js"/,
  'analytics must not load unconditionally in previews or development',
);
assert.match(
  page,
  /analyticsScript\.src = 'https:\/\/analytics\.earnlearning\.com\/api\/script\.js'/,
  'analytics must use the instructor-provided Rybbit endpoint',
);
assert.match(
  page,
  /analyticsScript\.dataset\.siteId = '29d42ae566b5'/,
  'analytics must use the instructor-provided site ID',
);
assert.doesNotMatch(
  page,
  /app\.rybbit\.io\/api\/script\.js|6ec9b20406aa/,
  'the previous Rybbit endpoint and site ID must be removed',
);
assert.match(
  page,
  /document\.head\.append\(analyticsScript\)/,
  'the production page must load the analytics script dynamically',
);
assert.match(
  app,
  /const guideStartEventKey = 'mychip-guide-started'/,
  'guide starts must have a session deduplication key',
);
assert.match(
  app,
  /sessionStorage\.getItem\(guideStartEventKey\)/,
  'repeated guide starts in the same session must be ignored',
);
assert.match(
  app,
  /typeof window\.rybbit\?\.trackEvent === 'function'/,
  'the event must wait until Rybbit is ready',
);
assert.match(
  app,
  /trackGuideStarted\('serial'\);\s*updateView\('dashboard'\);/,
  'a valid serial must track before opening the guide',
);
assert.match(
  app,
  /trackGuideStarted\('demo'\);\s*updateView\('dashboard'\);/,
  'the demo button must track before opening the guide',
);
assert.doesNotMatch(
  app,
  /trackEvent\('guide_started',[\s\S]{0,160}input\.value/,
  'the event payload must not include the entered serial number',
);
