import assert from 'node:assert/strict';
import vm from 'node:vm';
import test from 'node:test';
import { build } from 'esbuild';
const output = await build({ entryPoints: ['src/pages/master-data/formDesignSaveQueue.ts'], bundle: true, write: false, platform: 'node', format: 'cjs' });
const module = { exports: {} };
vm.runInNewContext(output.outputFiles[0].text, { module, exports: module.exports });
const { createFormDesignSaveQueue } = module.exports;
const response = revision => ({ data: { data: { revision } } });

test('concurrent autosave and manual save use sequential acknowledged revisions', async () => {
  const queue = createFormDesignSaveQueue(4);
  const seen = [];
  let release;
  const first = queue.save(async revision => { seen.push(['auto', revision]); await new Promise(resolve => { release = resolve; }); return response(5); });
  const second = queue.save(async revision => { seen.push(['manual', revision]); return response(6); });
  await Promise.resolve();
  assert.deepEqual(seen, [['auto', 4]]);
  release();
  await Promise.all([first, second]);
  assert.deepEqual(seen, [['auto', 4], ['manual', 5]]);
});
test('failed or unknown save blocks queued writes; reopen uses freshly read revision', async () => {
  const queue = createFormDesignSaveQueue(4);
  const failed = queue.save(async () => { throw new Error('connection lost'); });
  let writes = 0;
  const later = queue.save(async () => { writes++; return response(5); });
  await Promise.all([assert.rejects(failed, /connection lost/), assert.rejects(later, /connection lost/)]);
  assert.equal(writes, 0);
  let actual;
  await createFormDesignSaveQueue(7).save(async revision => { actual = revision; return response(8); });
  assert.equal(actual, 7);
});
