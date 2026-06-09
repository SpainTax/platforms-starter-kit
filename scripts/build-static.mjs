// Builds a static export suitable for GitHub Pages.
//
// The app normally relies on server-only features that a static host can't run:
//   - middleware.ts   (subdomain routing)
//   - app/actions.ts  (Server Actions writing to Redis)
//
// For the static export we temporarily set these aside (swapping the Server
// Actions for client-safe stubs in app/actions.static.ts), run `next build`
// with output: 'export', then restore the originals — even if the build fails.

import { spawnSync } from 'node:child_process';
import { existsSync, renameSync, copyFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Files moved out of the way for the duration of the build.
const middleware = join(root, 'middleware.ts');
const middlewareBak = join(root, 'middleware.ts.export-bak');

// The real Server Actions, swapped for client-safe stubs during the build.
const actions = join(root, 'app/actions.ts');
const actionsBak = join(root, 'app/actions.ts.export-bak');
const actionsStub = join(root, 'app/actions.static.ts');

function prepare() {
  if (existsSync(middleware)) renameSync(middleware, middlewareBak);
  if (existsSync(actions)) renameSync(actions, actionsBak);
  copyFileSync(actionsStub, actions);
}

function restore() {
  // Remove the stub copy and put the originals back.
  if (existsSync(actions)) rmSync(actions);
  if (existsSync(actionsBak)) renameSync(actionsBak, actions);
  if (existsSync(middlewareBak)) renameSync(middlewareBak, middleware);
}

prepare();
try {
  const result = spawnSync('next', ['build'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, GITHUB_PAGES: 'true' },
    shell: true
  });
  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
  }
} finally {
  restore();
}
