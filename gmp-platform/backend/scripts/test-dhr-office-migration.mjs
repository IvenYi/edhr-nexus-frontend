// Isolated PostgreSQL check; never alters the application's database.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const database = `edhr_office_attachment_${process.pid}_${Date.now()}`;
function run(command, args, input) {
  const result = spawnSync(command, args, { input, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trim();
}
const sql = text => run('psql', ['-X', '-w', '-v', 'ON_ERROR_STOP=1', '-At', '-d', database], text);
const migration = readFileSync(new URL('../src/main/resources/db/changelog/0105-dhr-office-attachments.sql', import.meta.url), 'utf8');
run('createdb', ['-w', database]);
try {
  sql(`CREATE TABLE dhr_attachment(id BIGINT PRIMARY KEY, original_name VARCHAR(255), mime_type VARCHAR(64) NOT NULL, sha256 VARCHAR(64));
    INSERT INTO dhr_attachment VALUES(1,'历史报告.pdf','application/pdf','original-digest');`);
  const before = sql('SELECT row_to_json(a) FROM dhr_attachment a ORDER BY id;');
  sql(`BEGIN; ${migration} ROLLBACK;`);
  assert.equal(sql("SELECT character_maximum_length FROM information_schema.columns WHERE table_name='dhr_attachment' AND column_name='mime_type';"), '64');
  sql(`BEGIN; ${migration} COMMIT;`);
  assert.equal(sql('SELECT row_to_json(a) FROM dhr_attachment a ORDER BY id;'), before);
  assert.equal(sql("SELECT character_maximum_length FROM information_schema.columns WHERE table_name='dhr_attachment' AND column_name='mime_type';"), '128');
  sql(`INSERT INTO dhr_attachment VALUES
    (2,'报告.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document','docx-digest'),
    (3,'报告.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','xlsx-digest');`);
  assert.equal(sql('SELECT count(*) FROM dhr_attachment;'), '3');
  console.log('PASS 0105 MIME expansion preserves existing metadata; DOCX/XLSX fit; transaction rollback preserves old schema');
} finally {
  run('dropdb', ['-w', database]);
}
