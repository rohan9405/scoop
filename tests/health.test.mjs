import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeHealth, normalizeOthers, fetchHealthDay, stressFromHeartRate, stressLevel, localDayRange, validDate, addDays, strainScore, sleepScore, recoveryScore } from '../health.mjs';
import { createAppServer, createLimiter } from '../server.mjs';

// Fixture field names and units follow Google's v4 Discovery schema.
const date = '2026-11-06';
const civil = d => { const [year, month, day] = d.split('-').map(Number); return { year, month, day }; };
const rollup = (d, value) => ({ civilStartTime: { date: civil(d) }, civilEndTime: { date: civil(addDays(d, 1)) }, ...value });
const priorDays = Array.from({ length: 10 }, (_, i) => addDays(date, -(i + 1)));
const fixture = {
  steps: [rollup(date, { steps: { countSum: '9120' } }), ...priorDays.map(d => rollup(d, { steps: { countSum: '8000' } }))],
  'active-energy-burned': [rollup(date, { activeEnergyBurned: { kcalSum: 512.4 } })],
  distance: [rollup(date, { distance: { millimetersSum: '6400000' } })],
  'active-zone-minutes': [rollup(date, { activeZoneMinutes: { sumInFatBurnHeartZone: '20', sumInCardioHeartZone: '10', sumInPeakHeartZone: '4' } })],
  'heart-rate': [rollup(date, { heartRate: { beatsPerMinuteAvg: 71.6, beatsPerMinuteMin: 48, beatsPerMinuteMax: 164 } })],
  'daily-resting-heart-rate': [{ dailyRestingHeartRate: { date: civil(date), beatsPerMinute: '52' } }, ...priorDays.map(d => ({ dailyRestingHeartRate: { date: civil(d), beatsPerMinute: '55' } }))],
  'daily-heart-rate-variability': [{ dailyHeartRateVariability: { date: civil(date), averageHeartRateVariabilityMilliseconds: 66.04 } }, ...priorDays.map(d => ({ dailyHeartRateVariability: { date: civil(d), averageHeartRateVariabilityMilliseconds: 60 } }))],
  'daily-respiratory-rate': [{ dailyRespiratoryRate: { date: civil(date), breathsPerMinute: 14.8 } }],
  'daily-oxygen-saturation': [{ dailyOxygenSaturation: { date: civil(date), averagePercentage: 97.5 } }],
  sleep: [{ sleep: { metadata: { mainSleep: true },
    interval: { startTime: '2026-11-05T17:30:00Z', endTime: '2026-11-06T01:30:00Z', civilStartTime: { date: civil('2026-11-05'), time: { hours: 23 } }, civilEndTime: { date: civil(date), time: { hours: 7 } } },
    summary: { minutesAsleep: '450', minutesInSleepPeriod: '480', minutesAwake: '30', stagesSummary: [{ type: 'DEEP', minutes: '90' }] },
    stages: [{ type: 'LIGHT', startTime: '2026-11-05T17:30:00Z', endTime: '2026-11-05T18:00:00Z' }] } }],
  exercise: [{ dataPointName: 'users/me/dataTypes/exercise/dataPoints/run-1', exercise: {
    displayName: 'Running', activeDuration: '1800s', interval: { startTime: '2026-11-06T04:00:00Z', endTime: '2026-11-06T04:35:00Z' }, metricsSummary: { caloriesKcal: 300, distanceMillimeters: 5000000 } } }],
};
test('normalizes rollups, daily summaries and sleep into metrics, a 30-day baseline and history', () => {
  const r = normalizeHealth(fixture, date);
  const m = r.metrics;
  assert.equal(m.steps, 9120); assert.equal(m.activeCalories, 512); assert.equal(m.distanceKm, 6.4);
  assert.equal(m.activeZoneMinutes, 34); assert.equal(m.fatBurnMinutes, 20); assert.equal(m.cardioPeakMinutes, 14);
  assert.equal(m.restingHeartRate, 52); assert.equal(m.hrv, 66); assert.equal(m.respiratoryRate, 14.8); assert.equal(m.spo2, 97.5);
  assert.equal(m.sleepMinutes, 450); assert.equal(m.sleepEfficiency, 94); assert.equal(m.minutesAwake, 30); assert.equal(m.sleepGoalPercent, 94);
  assert.equal(m.heartRateAvg, 72); assert.equal(m.heartRateMax, 164);
  assert.equal(r.baseline.steps, 8000); assert.equal(r.baseline.hrv, 60); assert.equal(r.baseline.restingHeartRate, 55);
  assert.equal(r.history.length, 31); assert.equal(r.history.at(-1).date, date); assert.equal(r.history.at(-2).steps, 8000);
  assert.ok(r.scores.recovery > 62 && r.scores.recovery <= 99);
  assert.ok(r.scores.strain > 0 && r.scores.strain < 21);
  assert.equal(r.scores.sleepPerformance, sleepScore({ sleepMinutes: 450, sleepEfficiency: 94 }));
  assert.equal(r.activities[0].kind, 'sleep'); assert.equal(r.activities[1].durationMinutes, 30); assert.equal(r.activities[1].distanceKm, 5);
  assert.equal(r.sleep.stages[0].minutes, 30);
});
test('missing data stays null; zero steps remains a real zero; scores need their inputs', () => {
  const r = normalizeHealth({ steps: [rollup(date, { steps: { countSum: '0' } })] }, date);
  assert.equal(r.metrics.steps, 0);
  assert.equal(r.metrics.hrv, null); assert.equal(r.metrics.sleepMinutes, null); assert.equal(r.sleep, null);
  assert.equal(r.scores.recovery, null); assert.equal(r.scores.sleepPerformance, null); assert.equal(r.scores.strain, 0);
  assert.deepEqual(r.activities, []);
  assert.equal(recoveryScore({ hrv: 60 }, { hrv: null }), null);
  assert.equal(strainScore({ steps: null, activeZoneMinutes: null, activeCalories: null }), null);
});
test('ignores records outside the window and deep-only HRV cannot masquerade as average HRV', () => {
  const r = normalizeHealth({
    'daily-resting-heart-rate': [{ dailyRestingHeartRate: { date: civil('2026-12-01'), beatsPerMinute: '90' } }],
    'daily-heart-rate-variability': [{ dailyHeartRateVariability: { date: civil(date), deepSleepRootMeanSquareOfSuccessiveDifferencesMilliseconds: 55 } }],
  }, date);
  assert.equal(r.metrics.restingHeartRate, null);
  assert.equal(r.metrics.hrv, null);
});
test('rejects invalid dates including rollover dates', () => {
  assert.equal(validDate('2026-02-30'), false);
  assert.equal(validDate('2024-02-29'), true);
  assert.equal(validDate('2026-11-06" OR 1=1'), false);
  assert.throws(() => normalizeHealth({}, '2026-02-30'));
});
test('uses snake_case daily filters, civil-day rollups, reconciled sessions, and follows pages', async () => {
  const requests = [];
  const client = { async request({ url, method, data }) {
    const parsed = new URL(url); requests.push({ parsed, method, data });
    if (parsed.pathname.endsWith('/daily-resting-heart-rate/dataPoints')) {
      if (!parsed.searchParams.has('pageToken')) return { data: { dataPoints: [{ dailyRestingHeartRate: { date: civil(date), beatsPerMinute: '50' } }], nextPageToken: 'next' } };
      return { data: { dataPoints: [] } };
    }
    if (parsed.pathname.endsWith(':dailyRollUp')) return { data: { rollupDataPoints: parsed.pathname.includes('/steps/') ? [rollup(date, { steps: { countSum: '30' } })] : [] } };
    return { data: { dataPoints: [] } };
  } };
  const result = await fetchHealthDay(client, date);
  assert.equal(result.metrics.steps, 30);
  assert.equal(result.metrics.restingHeartRate, 50);
  const filter = type => requests.find(r => r.parsed.pathname.includes(`/${type}/`))?.parsed.searchParams.get('filter');
  assert.equal(filter('daily-heart-rate-variability'), 'daily_heart_rate_variability.date >= "2026-10-07" AND daily_heart_rate_variability.date < "2026-11-07"');
  assert.equal(filter('sleep'), 'sleep.interval.civil_end_time >= "2026-10-07" AND sleep.interval.civil_end_time < "2026-11-07"');
  const steps = requests.find(r => r.parsed.pathname.endsWith('/steps/dataPoints:dailyRollUp'));
  assert.equal(steps.method, 'POST');
  assert.deepEqual(steps.data.range, { start: { date: civil('2026-10-07') }, end: { date: civil('2026-11-07') } });
  assert.ok(requests.filter(r => /\/(sleep|exercise)\//.test(r.parsed.pathname)).every(r => r.parsed.pathname.endsWith(':reconcile')));
  assert.ok(requests.every(r => r.parsed.origin === 'https://health.googleapis.com'));
});
test('partial scope failure produces warnings and nulls instead of demo values', async () => {
  const client = { async request({ url }) { if (url.includes('/steps/')) return { data: { rollupDataPoints: [rollup(date, { steps: { countSum: '25' } })] } }; throw new Error('denied'); } };
  const result = await fetchHealthDay(client, date);
  assert.equal(result.warnings.length, 11);
  assert.equal(result.metrics.steps, 25);
  assert.equal(result.metrics.sleepMinutes, null);
});
test('fails clearly when every requested collection is unavailable', async () => {
  await assert.rejects(fetchHealthDay({ async request() { throw new Error('denied'); } }, date), { status: 502 });
});
test('groups other Google Health metrics by category with units', () => {
  const o = normalizeOthers({
    floors: [rollup(date, { floors: { countSum: '12' } })],
    altitude: [rollup(date, { altitude: { gainMillimetersSum: '36000' } })],
    'active-minutes': [rollup(date, { activeMinutes: { activeMinutesRollupByActivityLevel: [{ activityLevel: 'VERY_ACTIVE', activeMinutesSum: '22' }] } })],
    'sedentary-period': [rollup(date, { sedentaryPeriod: { durationSum: '36000s' } })],
    weight: [rollup(addDays(date, -3), { weight: { weightGramsAvg: 72450 } })],
    'daily-sleep-temperature-derivations': [{ dailySleepTemperatureDerivations: { date: civil(date), nightlyTemperatureCelsius: 34.1, baselineTemperatureCelsius: 33.8 } }],
    'hydration-log': [rollup(date, { hydrationLog: { amountConsumed: { millilitersSum: 1500 } } })],
  }, date);
  const find = (cat, label) => o.categories.find(c => c.id === cat).items.find(i => i.label === label);
  assert.equal(find('activity', 'Floors climbed').value, 12);
  assert.equal(find('activity', 'Elevation gain').value, 36);
  assert.equal(find('activity', 'Very active minutes').value, 22);
  assert.equal(find('activity', 'Sedentary time').value, 600);
  assert.equal(find('body', 'Weight').value, 72.5);
  assert.match(find('body', 'Weight').note, /Last logged/);
  assert.equal(find('body', 'Skin temperature vs. baseline').value, '+0.3');
  assert.equal(find('hydration', 'Water logged').value, 1500);
  assert.equal(o.categories.find(c => c.id === 'heart').items.length, 0);
});
test('server exposes setup status without credentials and rejects disconnected data and forged callbacks', async t => {
  const server = createAppServer({ env: { PORT: '3000' } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const statusResponse = await fetch(`${base}/api/status`);
  const status = await statusResponse.json();
  assert.equal(status.configured, false);
  assert.equal(status.connected, false);
  assert.equal(status.setup.redirectUri, 'http://localhost:3000/api/oauth/callback');
  assert.equal((await fetch(`${base}/api/connect`)).status, 503);
  assert.equal((await fetch(`${base}/api/health?date=${date}`)).status, 401);
  assert.equal((await fetch(`${base}/api/oauth/callback?state=forged&code=forged`)).status, 400);
  assert.equal((await fetch(`${base}/api/disconnect`, { method: 'POST', headers: { Origin: 'https://attacker.example' } })).status, 403);
  assert.equal((await fetch(`${base}/api/disconnect`, { method: 'POST', headers: { Origin: 'http://localhost:3000' } })).status, 200);
});
test('encrypted cookie sessions: OAuth state round-trips, forged cookies are ignored, hosted mode needs a secret', async t => {
  const env = { PORT: '3000', GOOGLE_CLIENT_ID: 'test-id', GOOGLE_CLIENT_SECRET: 'test-secret', SESSION_SECRET: 'x'.repeat(40) };
  const server = createAppServer({ env });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const forged = await (await fetch(`${base}/api/status`, { headers: { Cookie: 'scoop_session=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' } })).json();
  assert.equal(forged.connected, false);
  const connect = await fetch(`${base}/api/connect`, { redirect: 'manual' });
  assert.equal(connect.status, 302);
  const state = new URL(connect.headers.get('location')).searchParams.get('state');
  const pending = connect.headers.get('set-cookie').split(';')[0];
  assert.match(pending, /^scoop_oauth=/);
  assert.equal((await fetch(`${base}/api/oauth/callback?state=wrong&code=x`, { headers: { Cookie: pending }, redirect: 'manual' })).status, 400);
  const denied = await fetch(`${base}/api/oauth/callback?state=${state}&error=access_denied`, { headers: { Cookie: pending }, redirect: 'manual' });
  assert.equal(denied.headers.get('location'), '/?connection=denied');
  const hosted = createAppServer({ env: { ...env, VERCEL: '1', SESSION_SECRET: '' } });
  await new Promise(resolve => hosted.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => hosted.close(resolve)));
  const hostedStatus = await (await fetch(`http://127.0.0.1:${hosted.address().port}/api/status`)).json();
  assert.equal(hostedStatus.configured, false);
});
test('assigns sleep without civil fields to the local day using the UTC offset or time zone', () => {
  const nap = (start, end, extra = {}) => ({ sleep: { metadata: { nap: true }, interval: { startTime: start, endTime: end, ...extra }, summary: { minutesAsleep: '22', minutesInSleepPeriod: '23' } } });
  const viaOffset = normalizeHealth({ sleep: [nap('2026-11-05T22:48:00Z', '2026-11-05T23:11:00Z', { endUtcOffset: '19800s', startUtcOffset: '19800s' })] }, '2026-11-06');
  assert.equal(viaOffset.metrics.sleepMinutes, 22);
  const viaZone = normalizeHealth({ sleep: [nap('2026-11-05T22:48:00Z', '2026-11-05T23:11:00Z')] }, '2026-11-06', [], 'Asia/Kolkata');
  assert.equal(viaZone.metrics.sleepMinutes, 22);
  const utcOnly = normalizeHealth({ sleep: [nap('2026-11-05T22:48:00Z', '2026-11-05T23:11:00Z')] }, '2026-11-06');
  assert.equal(utcOnly.metrics.sleepMinutes, null);
});
test('stress estimate scales heart rate above resting into 0–3 and local days follow the time zone', () => {
  assert.equal(stressFromHeartRate(70, 70), 0);
  assert.equal(stressFromHeartRate(91, 70), 1.5);
  assert.equal(stressFromHeartRate(200, 70), 3);
  assert.equal(stressFromHeartRate(80, null), null);
  assert.deepEqual([0.4, 1.5, 2.5].map(stressLevel), ['low', 'medium', 'high']);
  assert.deepEqual(localDayRange('2026-11-06', 'Asia/Kolkata'), { start: '2026-11-05T18:30:00.000Z', end: '2026-11-06T18:30:00.000Z' });
  assert.deepEqual(localDayRange('2026-03-08', 'America/New_York'), { start: '2026-03-08T05:00:00.000Z', end: '2026-03-09T04:00:00.000Z' });
});
test('joins a night recorded in pieces into one sleep and keeps afternoon naps separate', () => {
  const piece = (start, end, mins) => ({ sleep: { metadata: { nap: true }, interval: { startTime: start, endTime: end, startUtcOffset: '19800s', endUtcOffset: '19800s' }, summary: { minutesAsleep: String(mins), minutesInSleepPeriod: String(mins + 2), minutesAwake: '2' } } });
  const r = normalizeHealth({ sleep: [
    piece('2026-11-05T19:23:00Z', '2026-11-05T19:45:00Z', 22), piece('2026-11-05T20:31:00Z', '2026-11-05T21:42:00Z', 71),
    piece('2026-11-05T22:48:00Z', '2026-11-05T23:11:00Z', 22), piece('2026-11-06T09:30:00Z', '2026-11-06T10:00:00Z', 28),
  ] }, '2026-11-06');
  assert.equal(r.sleep.start, '2026-11-05T19:23:00Z');
  assert.equal(r.sleep.end, '2026-11-05T23:11:00Z');
  assert.equal(r.sleep.minutesAsleep, 115);
  assert.equal(r.sleep.pieces, 3);
  assert.deepEqual(r.activities.map(a => a.name), ['Sleep · 3 parts', 'Nap']);
  assert.equal(r.metrics.sleepMinutes, 143);
});

test('server and Vercel send the same security headers', async () => {
  const { SECURITY_HEADERS } = await import('../server.mjs');
  const { readFile } = await import('node:fs/promises');
  const vercel = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const sent = Object.fromEntries(vercel.headers[0].headers.map(h => [h.key, h.value]));
  assert.deepEqual(sent, SECURITY_HEADERS);
});

test('rate limits API requests per IP and sign-in attempts, and reports Retry-After', async t => {
  const env = { PORT: '3000', GOOGLE_CLIENT_ID: 'test-id', GOOGLE_CLIENT_SECRET: 'test-secret', SESSION_SECRET: 'x'.repeat(40) };
  const server = createAppServer({ env, limits: { ip: { limit: 5, windowMs: 60e3 }, auth: { limit: 2, windowMs: 60e3 } } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(`${base}/api/connect`, { redirect: 'manual' })).status, 302);
  assert.equal((await fetch(`${base}/api/connect`, { redirect: 'manual' })).status, 302);
  const blocked = await fetch(`${base}/api/connect`, { redirect: 'manual' });
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get('retry-after')) > 0);
  assert.equal((await blocked.json()).error, 'rate_limited');
  assert.equal((await fetch(`${base}/api/status`)).status, 200);
  assert.equal((await fetch(`${base}/api/status`)).status, 200);
  assert.equal((await fetch(`${base}/api/status`)).status, 429);
  assert.equal((await fetch(`${base}/`)).status, 200, 'static pages are not limited');
});
test('limiter windows reset and old keys are evicted', () => {
  const check = createLimiter({ limit: 1, windowMs: 1000, maxKeys: 2 });
  assert.equal(check('a'), 0);
  assert.ok(check('a') > 0);
  check('b'); check('c');
  assert.equal(check('a'), 0, 'evicted key starts a fresh window');
});
