import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const page = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

assert.match(
  page,
  /const RYBBIT_PRODUCTION_HOST = 'mychip\\.vercel\\.app'/,
  'analytics must load only on the production domain',
);
assert.doesNotMatch(
  page,
  /<script src="https:\/\/app\\.rybbit\\.io\/api\/script\\.js"/,
  'analytics must not load unconditionally in previews or development',
);
assert.match(
  page,
  /document\\.head\\.append\(analyticsScript\)/,
  'the production page must load the analytics script dynamically',
);
assert.match(
  app,
  /const guideStartEventKey = 'mychip-guide-started'/,
  'guide starts must have a session deduplication key',
);
assert.match(
  app,
  /sessionStorage\\.getItem\(guideStartEventKey\)/,
  'repeated guide starts in the same session must be ignored',
);
assert.match(
  app,
  /typeof window\\.rybbit\\?\\.trackEvent === 'function'/,
  'the event must wait until Rybbit is ready',
);
assert.doesNotMatch(
  app,
  /trackEvent\\('guide_started',[\\s\\S]{0,160}input\\.value/,
  'the event payload must not include the entered serial number',
);
