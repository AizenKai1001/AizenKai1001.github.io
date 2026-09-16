import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const outputDir = path.join(repoRoot, 'public', 'evidence');

const [benchmarkPath, controlsPath, plasticityPath] = process.argv.slice(2);
if (!benchmarkPath || !controlsPath || !plasticityPath) {
  console.error('Usage: node scripts/export-evidence.mjs <benchmark.json> <controls.json> <results-long.json>');
  process.exit(2);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function sourceInfo(filePath, recordedDate) {
  const info = await stat(filePath);
  return {
    basename: path.basename(filePath),
    recordedDate,
    fileModifiedDateUtc: info.mtime.toISOString().slice(0, 10),
  };
}

function sum(items, selector) {
  return items.reduce((total, item) => total + selector(item), 0);
}

function mean(items, selector) {
  return sum(items, selector) / items.length;
}

function metric(metricValue) {
  return {
    n: metricValue.n,
    correct: metricValue.correct,
    accuracy: metricValue.accuracy,
    balancedAccuracy: metricValue.balanced_accuracy,
    brier: metricValue.brier,
  };
}

function buildDistinction(benchmark, controls, sources) {
  assert(benchmark?.schema === 1, 'Unexpected Distinction benchmark schema.');
  assert(Array.isArray(benchmark.results) && benchmark.results.length > 0, 'Distinction benchmark has no results.');
  assert(controls?.schema === 1, 'Unexpected Distinction controls schema.');
  assert(Array.isArray(controls.results) && controls.results.length > 0, 'Distinction controls have no results.');

  const finalN = sum(benchmark.results, (result) => result.final.n);
  const finalCorrect = sum(benchmark.results, (result) => result.final.correct);
  const noMotionN = sum(benchmark.results, (result) => result.final.no_motion_baseline.n);
  const noMotionCorrect = sum(benchmark.results, (result) => result.final.no_motion_baseline.correct);
  const memoryWithN = sum(benchmark.results, (result) => result.memory.with_history.n);
  const memoryWithCorrect = sum(benchmark.results, (result) => result.memory.with_history.correct);
  const memoryWithoutN = sum(benchmark.results, (result) => result.memory.without_history.n);
  const memoryWithoutCorrect = sum(benchmark.results, (result) => result.memory.without_history.correct);
  const informativeQueries = benchmark.results.filter((result) => result.inquiry.informative).length;
  const checkpointEqual = benchmark.results.every((result) => result.checkpoint_continuation_equal === true);

  return {
    schema: 1,
    project: 'Distinction AI',
    evidenceDate: '2026-09-15',
    sources,
    scope: {
      evaluatorVersion: benchmark.evaluator_version,
      trainingSeeds: benchmark.seeds,
      trainingStepsPerSeed: benchmark.training_steps_per_seed,
      benchmark: 'Tiny author-built synthetic visual/action generator with engineered perception measurements.',
      limitation: 'Evidence for learning over supplied features; not autonomous object discovery, unrestricted vision, or general intelligence.',
    },
    benchmark: {
      heldOutVisual: {
        n: finalN,
        correct: finalCorrect,
        accuracy: finalCorrect / finalN,
        noMotionBaseline: {
          n: noMotionN,
          correct: noMotionCorrect,
          accuracy: noMotionCorrect / noMotionN,
        },
      },
      suppliedLagMemory: {
        withHistory: {
          n: memoryWithN,
          correct: memoryWithCorrect,
          accuracy: memoryWithCorrect / memoryWithN,
        },
        withoutHistory: {
          n: memoryWithoutN,
          correct: memoryWithoutCorrect,
          accuracy: memoryWithoutCorrect / memoryWithoutN,
        },
      },
      finitePoolInquiry: {
        trials: benchmark.results.length,
        informative: informativeQueries,
        fraction: informativeQueries / benchmark.results.length,
      },
      checkpointContinuationEqual: checkpointEqual,
    },
    controls: {
      protocol: controls.protocol,
      seeds: controls.seeds,
      casesPerSeed: controls.results[0].full_measurements.n,
      pairedExam: controls.paired_exam,
      noMotionBaselineAccuracy: controls.no_motion_baseline_accuracy,
      maskedDeterministicCeiling: controls.masked_deterministic_ceiling,
      aggregate: {
        fullMeasurementsAccuracy: mean(controls.results, (result) => result.full_measurements.accuracy),
        contactMeasurementRemovedAccuracy: mean(
          controls.results,
          (result) => result.contact_measurement_removed.accuracy,
        ),
        shuffledTrainingOutcomesAccuracy: mean(
          controls.results,
          (result) => result.shuffled_training_outcomes.accuracy,
        ),
      },
      perSeed: controls.results.map((result) => ({
        seed: result.seed,
        steps: result.steps,
        fullMeasurements: metric(result.full_measurements),
        contactMeasurementRemoved: metric(result.contact_measurement_removed),
        shuffledTrainingOutcomes: metric(result.shuffled_training_outcomes),
      })),
      limitation: controls.limitations,
    },
  };
}

function summarizePlasticityArm(arm) {
  const firstDiagnostic = arm.diagnostics.at(0);
  const lastDiagnostic = arm.diagnostics.at(-1);
  assert(firstDiagnostic && lastDiagnostic, `Plasticity arm ${arm.arm} is missing diagnostics.`);

  return {
    firstTenFinalLossMean: arm.first10,
    lastTenFinalLossMean: arm.last10,
    lateToEarlyLossRatio: arm.ratio,
    diagnostics: {
      firstTask: {
        task: firstDiagnostic.task,
        deadUnitFraction: firstDiagnostic.dead,
        meanAbsoluteWeight: firstDiagnostic.wmag,
        effectiveRank: firstDiagnostic.rank,
      },
      lastTask: {
        task: lastDiagnostic.task,
        deadUnitFraction: lastDiagnostic.dead,
        meanAbsoluteWeight: lastDiagnostic.wmag,
        effectiveRank: lastDiagnostic.rank,
      },
    },
  };
}

function buildPlasticity(run, source) {
  const config = run?.config;
  assert(config?.tasks === 400, `Expected 400 plasticity tasks, got ${config?.tasks}.`);
  assert(config?.task_mode === 'permute', `Expected permuted task mode, got ${config?.task_mode}.`);
  assert(config?.optim === 'adam', `Expected Adam optimizer, got ${config?.optim}.`);

  const expectedArms = ['backprop', 'cbp', 'reset'];
  const actualArms = Object.keys(run.arms ?? {}).sort();
  assert(
    JSON.stringify(actualArms) === JSON.stringify([...expectedArms].sort()),
    `Expected exactly three arms (${expectedArms.join(', ')}), got ${actualArms.join(', ')}.`,
  );

  return {
    schema: 1,
    project: 'Plasticity Bench',
    evidenceDate: '2026-09-09',
    sources: [source],
    scope: {
      taskCount: config.tasks,
      stepsPerTask: config.steps,
      batchSize: config.batch,
      inputDimensions: config.in_dim,
      hiddenUnits: config.hidden,
      optimizer: config.optim,
      learningRate: config.lr,
      taskMode: config.task_mode,
      seed: config.seed,
      arms: expectedArms,
      armCount: expectedArms.length,
      benchmark: 'Small continual-learning regression benchmark; three matched arms in this exact 400-task run.',
      limitation: 'This is not a paper-scale replication. A ratio below 1 means later tasks ended with lower loss than early tasks in this run.',
    },
    results: Object.fromEntries(expectedArms.map((name) => [name, summarizePlasticityArm(run.arms[name])])),
  };
}

const [benchmark, controls, plasticity, benchmarkSource, controlsSource, plasticitySource] = await Promise.all([
  readJson(benchmarkPath),
  readJson(controlsPath),
  readJson(plasticityPath),
  sourceInfo(benchmarkPath, '2026-09-15'),
  sourceInfo(controlsPath, '2026-09-15'),
  sourceInfo(plasticityPath, '2026-09-09'),
]);

const distinction = buildDistinction(benchmark, controls, [benchmarkSource, controlsSource]);
const plasticityEvidence = buildPlasticity(plasticity, plasticitySource);

await mkdir(outputDir, { recursive: true });
await Promise.all([
  writeFile(path.join(outputDir, 'distinction.json'), `${JSON.stringify(distinction, null, 2)}\n`, 'utf8'),
  writeFile(path.join(outputDir, 'plasticity.json'), `${JSON.stringify(plasticityEvidence, null, 2)}\n`, 'utf8'),
]);

console.log(`Wrote ${path.relative(repoRoot, path.join(outputDir, 'distinction.json'))}`);
console.log(`Wrote ${path.relative(repoRoot, path.join(outputDir, 'plasticity.json'))}`);
