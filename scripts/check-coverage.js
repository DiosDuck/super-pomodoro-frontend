const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const THRESHOLDS = {
  lines: 90,
  branches: 80,
  functions: 90,
  statements: 90,
};

const summaryPath = join(__dirname, '..', 'coverage', 'coverage-summary.json');

let summary;
try {
  summary = JSON.parse(readFileSync(summaryPath, 'utf-8'));
} catch {
  console.error('Could not read coverage-summary.json.');
  console.error('Run "ng test --code-coverage --watch=false" first.');
  process.exit(1);
}

const total = summary.total;
const failures = [];

console.log('\nCoverage thresholds:');
for (const [metric, threshold] of Object.entries(THRESHOLDS)) {
  console.log(`  ${metric.padEnd(13)} >= ${threshold}%`);
}
console.log();

console.log('  Metric        Coverage   Threshold Status');
console.log('  ------------- ---------- --------- ------');

for (const [metric, threshold] of Object.entries(THRESHOLDS)) {
  const pct = total[metric].pct;
  const pass = pct >= threshold;
  const status = pass ? 'PASS' : 'FAIL';
  const label = metric.padEnd(13);
  const value = `${pct.toFixed(2)}%`.padStart(10);
  const limit = `>= ${threshold}%`.padStart(9);
  console.log(`  ${label} ${value} ${limit} ${status}`);
  if (!pass) failures.push({ metric, pct, threshold });
}

console.log();

if (failures.length > 0) {
  console.error('Coverage below threshold:');
  for (const f of failures) {
    console.error(`  ${f.metric}: ${f.pct.toFixed(2)}% < ${f.threshold}%`);
  }
  process.exit(1);
} else {
  console.log('All coverage thresholds passed.');
}
