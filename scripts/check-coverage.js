const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const THRESHOLD = 90;
const METRICS = ['lines', 'branches', 'functions', 'statements'];

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

console.log(`\nCoverage threshold: ${THRESHOLD}%\n`);
console.log('  Metric        Coverage   Status');
console.log('  ------------- ---------- ------');

for (const metric of METRICS) {
  const pct = total[metric].pct;
  const pass = pct >= THRESHOLD;
  const status = pass ? 'PASS' : 'FAIL';
  const label = metric.padEnd(13);
  const value = `${pct.toFixed(2)}%`.padStart(10);
  console.log(`  ${label} ${value} ${status}`);
  if (!pass) failures.push({ metric, pct });
}

console.log();

if (failures.length > 0) {
  console.error(`Coverage below ${THRESHOLD}% for: ${failures.map(f => f.metric).join(', ')}`);
  process.exit(1);
} else {
  console.log('All coverage thresholds passed.');
}
