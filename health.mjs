/** Google Health v4 adapter. API schema verified against:
 * https://health.googleapis.com/$discovery/rest?version=v4 (2026-11-06)
 * https://developers.google.com/health/reference/rest/v4/users.dataTypes.dataPoints/list
 * https://developers.google.com/health/setup
 */
export const HEALTH_SCOPES = [
  'https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly',
  'https://www.googleapis.com/auth/googlehealth.sleep.readonly',
  'https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly',
];
/** Non-sensitive OpenID scopes, used only to greet the person by name. */
export const PROFILE_SCOPES = ['openid', 'profile'];
/** Optional: lets Scoop show when the Fitbit last synced and its battery level. */
export const DEVICE_SCOPES = ['https://www.googleapis.com/auth/googlehealth.settings.readonly'];
/** Optional: ECG readings and irregular-rhythm alerts recorded by compatible Fitbit devices. */
export const RHYTHM_SCOPES = ['https://www.googleapis.com/auth/googlehealth.ecg.readonly', 'https://www.googleapis.com/auth/googlehealth.irn.readonly'];
const BASE = 'https://health.googleapis.com/v4/users/me/dataTypes';
const HISTORY_DAYS = 30;
const SLEEP_GOAL_MINUTES = 480;
// [URL data type, filter field prefix (snake_case, as the API requires), JSON field].
const DAILY = [
  ['daily-resting-heart-rate', 'daily_resting_heart_rate', 'dailyRestingHeartRate'],
  ['daily-heart-rate-variability', 'daily_heart_rate_variability', 'dailyHeartRateVariability'],
  ['daily-respiratory-rate', 'daily_respiratory_rate', 'dailyRespiratoryRate'],
  ['daily-oxygen-saturation', 'daily_oxygen_saturation', 'dailyOxygenSaturation'],
  ['daily-vo2-max', 'daily_vo2_max', 'dailyVo2Max'],
];
const ROLLUPS = ['steps', 'active-energy-burned', 'distance', 'active-zone-minutes'];

export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function addDays(value, days) {
  if (!validDate(value)) throw new TypeError('Expected a valid date in YYYY-MM-DD format.');
  return new Date(Date.parse(value) + days * 86400000).toISOString().slice(0, 10);
}
export const nextDate = value => addDays(value, 1);
const numeric = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) ? Number(value) : null;
const round = (value, digits = 0) => value == null ? null : Math.round(value * 10 ** digits) / 10 ** digits;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const ymd = date => date && date.year ? `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}` : null;
const civilDate = value => { const [year, month, day] = value.split('-').map(Number); return { year, month, day }; };
/** Local date and minutes-of-day for an instant: prefer the record's own UTC offset, then the viewer's time zone. */
function localParts(iso, offset, timeZone) {
  const ms = Date.parse(iso); if (!Number.isFinite(ms)) return null;
  const secs = typeof offset === 'string' && /^-?\d+(\.\d+)?s$/.test(offset) ? Number(offset.slice(0, -1)) : null;
  if (secs != null) { const d = new Date(ms + secs * 1000); return { date: d.toISOString().slice(0, 10), minutes: d.getUTCHours() * 60 + d.getUTCMinutes() }; }
  if (timeZone) {
    try {
      const f = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(ms)).map(p => [p.type, p.value]));
      return { date: `${f.year}-${f.month}-${f.day}`, minutes: Number(f.hour) * 60 + Number(f.minute) };
    } catch { /* unknown zone: fall through */ }
  }
  return { date: iso.slice(0, 10), minutes: new Date(ms).getUTCHours() * 60 + new Date(ms).getUTCMinutes() };
}
const minutesBetween = (start, end) => {
  const minutes = (Date.parse(end) - Date.parse(start)) / 60000;
  return Number.isFinite(minutes) && minutes >= 0 ? minutes : null;
};
const sum = values => { const n = values.map(numeric).filter(x => x !== null); return n.length ? n.reduce((a, b) => a + b, 0) : null; };
const mean = values => { const n = values.filter(x => x != null); return n.length ? n.reduce((a, b) => a + b, 0) / n.length : null; };

/** Lists data points, following pages. Daily summaries use `list`; sessions use `reconcile`
 * to avoid double counting overlapping sources (e.g. watch + phone). */
async function fetchPoints(client, type, filter, { reconcile = false, pageSize } = {}) {
  const points = [];
  let pageToken;
  for (let page = 0; page < 20; page++) {
    const url = new URL(`${BASE}/${type}/dataPoints${reconcile ? ':reconcile' : ''}`);
    url.searchParams.set('filter', filter);
    if (pageSize) url.searchParams.set('pageSize', String(pageSize));
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const { data } = await client.request({ url: url.href, method: 'GET', timeout: 20000 });
    points.push(...(data.dataPoints || []));
    pageToken = data.nextPageToken;
    if (!pageToken) return points;
  }
  throw Object.assign(new Error('The response exceeded the supported page limit.'), { code: 'PAGE_LIMIT' });
}
/** Server-side daily totals, one value per civil day in the person's own time zone. */
async function fetchRollup(client, type, start, end) {
  const points = [];
  let pageToken;
  for (let page = 0; page < 5; page++) {
    const body = { range: { start: { date: civilDate(start) }, end: { date: civilDate(end) } }, windowSizeDays: 1, pageSize: type === 'heart-rate' ? 14 : 90 };
    if (pageToken) body.pageToken = pageToken;
    const { data } = await client.request({ url: `${BASE}/${type}/dataPoints:dailyRollUp`, method: 'POST', data: body, timeout: 20000 });
    points.push(...(data.rollupDataPoints || []));
    pageToken = data.nextPageToken;
    if (!pageToken) return points;
  }
  return points;
}

/** The person's trackers with their last sync time. Optional: returns [] when not permitted. */
export async function fetchDevices(client) {
  try {
    const { data } = await client.request({ url: 'https://health.googleapis.com/v4/users/me/pairedDevices', method: 'GET', timeout: 15000 });
    return (data.pairedDevices || []).filter(d => d.deviceType !== 'SCALE').map(d => ({
      name: d.deviceVersion || 'Fitbit', lastSyncTime: d.lastSyncTime || null,
      battery: numeric(d.batteryLevel), batteryStatus: d.batteryStatus || null,
    })).sort((a, b) => (Date.parse(b.lastSyncTime) || 0) - (Date.parse(a.lastSyncTime) || 0));
  } catch { return []; }
}
export async function fetchHealthDay(client, date, timeZone) {
  if (!validDate(date)) throw new TypeError('Expected a valid date in YYYY-MM-DD format.');
  const start = addDays(date, -HISTORY_DAYS), end = nextDate(date);
  const tasks = [
    ...ROLLUPS.map(type => [type, () => fetchRollup(client, type, start, end)]),
    ['heart-rate', () => fetchRollup(client, 'heart-rate', date, end)],
    ...DAILY.map(([type, field]) => [type, () => fetchPoints(client, type, `${field}.date >= "${start}" AND ${field}.date < "${end}"`, { pageSize: 100 })]),
    ['sleep', () => fetchPoints(client, 'sleep', `sleep.interval.civil_end_time >= "${start}" AND sleep.interval.civil_end_time < "${end}"`, { reconcile: true, pageSize: 25 })],
    ['exercise', () => fetchPoints(client, 'exercise', `exercise.interval.civil_start_time >= "${start}" AND exercise.interval.civil_start_time < "${end}"`, { reconcile: true, pageSize: 25 })],
  ];
  const [results, devices] = await Promise.all([Promise.allSettled(tasks.map(([, run]) => run())), fetchDevices(client)]);
  const raw = {}, warnings = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') raw[tasks[index][0]] = result.value;
    else warnings.push({ metric: tasks[index][0], message: 'This data could not be loaded. Check granted permissions and try syncing again.' });
  });
  if (warnings.length === tasks.length) throw Object.assign(new Error('Google Health data could not be loaded. Check API access and granted permissions, then reconnect.'), { status: 502 });
  return { ...normalizeHealth(raw, date, warnings, timeZone), device: devices[0] || null };
}

const emptyDay = date => ({ date, steps: null, activeCalories: null, distanceKm: null, activeZoneMinutes: null, fatBurnMinutes: null, cardioPeakMinutes: null,
  restingHeartRate: null, hrv: null, respiratoryRate: null, spo2: null, vo2Max: null, sleepMinutes: null, sleepEfficiency: null, bedtimeMinutes: null });

/** Original, transparent Scoop estimates. They are not medical measurements. */
export function sleepScore(day) {
  if (day.sleepMinutes == null) return null;
  const duration = Math.min(1, day.sleepMinutes / SLEEP_GOAL_MINUTES);
  return Math.round(100 * (0.75 * duration + 0.25 * (day.sleepEfficiency ?? 90) / 100));
}
export function strainScore(day) {
  if (day.steps == null && day.activeZoneMinutes == null && day.activeCalories == null) return null;
  const load = (day.activeZoneMinutes || 0) + (day.steps || 0) / 1500 + (day.activeCalories || 0) / 60;
  return round(21 * (1 - Math.exp(-load / 80)), 1);
}
export function recoveryScore(day, baseline) {
  if (day.hrv == null || !baseline?.hrv) return null;
  const hrv = clamp((day.hrv / baseline.hrv - 1) / 0.25, -1, 1);
  const rhr = day.restingHeartRate != null && baseline.restingHeartRate ? clamp((baseline.restingHeartRate - day.restingHeartRate) / 5, -1, 1) : 0;
  const sleep = sleepScore(day);
  return Math.round(clamp(62 + 25 * hrv + 12 * rhr + (sleep == null ? 0 : 8 * (sleep - 75) / 25), 1, 99));
}

export function normalizeHealth(raw, date, warnings = [], timeZone = null) {
  if (!validDate(date)) throw new TypeError('Expected a valid date in YYYY-MM-DD format.');
  const start = addDays(date, -HISTORY_DAYS);
  const days = new Map();
  for (let i = 0; i <= HISTORY_DAYS; i++) { const d = addDays(start, i); days.set(d, emptyDay(d)); }
  const at = d => days.get(d);
  for (const point of raw.steps || []) { const d = at(ymd(point.civilStartTime?.date)); if (d) d.steps = numeric(point.steps?.countSum); }
  for (const point of raw['active-energy-burned'] || []) { const d = at(ymd(point.civilStartTime?.date)); if (d) d.activeCalories = round(numeric(point.activeEnergyBurned?.kcalSum)); }
  for (const point of raw.distance || []) { const d = at(ymd(point.civilStartTime?.date)); const mm = numeric(point.distance?.millimetersSum); if (d && mm != null) d.distanceKm = round(mm / 1e6, 2); }
  for (const point of raw['active-zone-minutes'] || []) {
    const d = at(ymd(point.civilStartTime?.date)), z = point.activeZoneMinutes;
    if (!d || !z) continue;
    d.fatBurnMinutes = numeric(z.sumInFatBurnHeartZone) ?? 0;
    d.cardioPeakMinutes = (numeric(z.sumInCardioHeartZone) ?? 0) + (numeric(z.sumInPeakHeartZone) ?? 0);
    d.activeZoneMinutes = d.fatBurnMinutes + d.cardioPeakMinutes;
  }
  // A day with step data but no zone record had zero zone minutes, not missing data.
  if (raw['active-zone-minutes']) for (const d of days.values()) if (d.activeZoneMinutes == null && d.steps != null) { d.fatBurnMinutes = 0; d.cardioPeakMinutes = 0; d.activeZoneMinutes = 0; }
  const daily = (type, field, read) => { for (const point of raw[type] || []) { const item = point[field]; const d = at(ymd(item?.date)); if (d) read(d, item); } };
  daily('daily-resting-heart-rate', 'dailyRestingHeartRate', (d, x) => { d.restingHeartRate = numeric(x.beatsPerMinute); });
  daily('daily-heart-rate-variability', 'dailyHeartRateVariability', (d, x) => { d.hrv = round(numeric(x.averageHeartRateVariabilityMilliseconds), 1); });
  daily('daily-respiratory-rate', 'dailyRespiratoryRate', (d, x) => { d.respiratoryRate = round(numeric(x.breathsPerMinute), 1); });
  daily('daily-oxygen-saturation', 'dailyOxygenSaturation', (d, x) => { d.spo2 = round(numeric(x.averagePercentage), 1); });
  daily('daily-vo2-max', 'dailyVo2Max', (d, x) => { d.vo2Max = round(numeric(x.vo2Max), 1); });

  // Sleep belongs to the civil day on which it ended.
  const sleepsByDay = new Map();
  for (const point of raw.sleep || []) {
    const s = point.sleep; if (!s) continue;
    const key = ymd(s.interval?.civilEndTime?.date) || localParts(s.interval?.endTime, s.interval?.endUtcOffset, timeZone)?.date;
    if (!days.has(key)) continue;
    if (!sleepsByDay.has(key)) sleepsByDay.set(key, []);
    sleepsByDay.get(key).push(s);
  }
  // A night is every session that starts between 6 PM the evening before and noon on the day it ends,
  // so a night broken into pieces shows as one sleep. Other sessions are daytime naps.
  const localStart = s => s.interval?.civilStartTime?.time && s.interval?.civilStartTime?.date
    ? { date: ymd(s.interval.civilStartTime.date), minutes: (s.interval.civilStartTime.time.hours || 0) * 60 + (s.interval.civilStartTime.time.minutes || 0) }
    : localParts(s.interval?.startTime, s.interval?.startUtcOffset, timeZone);
  const isNight = (s, key) => { const p = localStart(s); if (!p) return true; return p.date === key ? p.minutes < 720 : p.minutes >= 1080; };
  const byStart = (a, b) => String(a.interval?.startTime).localeCompare(String(b.interval?.startTime));
  const nights = new Map();
  for (const [key, list] of sleepsByDay) {
    const d = at(key), night = list.filter(s => isNight(s, key)).sort(byStart);
    nights.set(key, night);
    d.sleepMinutes = sum(list.map(s => s.summary?.minutesAsleep));
    const asleep = sum(night.map(s => s.summary?.minutesAsleep)), period = sum(night.map(s => s.summary?.minutesInSleepPeriod));
    d.sleepEfficiency = asleep != null && period > 0 ? Math.round(100 * asleep / period) : null;
    const m = night.length ? localStart(night[0])?.minutes : null;
    if (m != null) d.bedtimeMinutes = m < 720 ? m + 1440 : m;
    const last = night.at(-1);
    if (last) d.wakeMinutes = last.interval?.civilEndTime?.time ? (last.interval.civilEndTime.time.hours || 0) * 60 + (last.interval.civilEndTime.time.minutes || 0) : localParts(last.interval?.endTime, last.interval?.endUtcOffset, timeZone)?.minutes ?? null;
  }

  const history = [...days.values()];
  const today = at(date), prior = history.slice(0, -1);
  const baselineKeys = ['steps', 'activeCalories', 'activeZoneMinutes', 'restingHeartRate', 'hrv', 'respiratoryRate', 'spo2', 'sleepMinutes', 'sleepEfficiency'];
  const baseline = Object.fromEntries(baselineKeys.map(key => {
    const values = prior.map(d => d[key]).filter(v => v != null);
    return [key, values.length >= 3 ? round(mean(values), 1) : null];
  }));
  for (const d of history) d.scores = { recovery: recoveryScore(d, baseline), strain: strainScore(d), sleep: sleepScore(d) };
  const bedtimes = history.slice(-7).map(d => d.bedtimeMinutes).filter(v => v != null);
  const spread = bedtimes.length >= 3 ? Math.sqrt(mean(bedtimes.map(v => (v - mean(bedtimes)) ** 2))) : null;

  const night = nights.get(date) || [];
  const naps = (sleepsByDay.get(date) || []).filter(s => !night.includes(s)).sort(byStart);
  const main = night.length ? {
    interval: { startTime: night[0].interval?.startTime, endTime: night.at(-1).interval?.endTime },
    pieces: night.length,
    summary: {
      minutesAsleep: sum(night.map(s => s.summary?.minutesAsleep)), minutesAwake: sum(night.map(s => s.summary?.minutesAwake)),
      stagesSummary: Object.entries(night.flatMap(s => s.summary?.stagesSummary || []).reduce((acc, st) => { acc[st.type] = (acc[st.type] || 0) + (numeric(st.minutes) || 0); return acc; }, {})).map(([type, minutes]) => ({ type, minutes })),
    },
    stages: night.flatMap(s => s.stages || []),
  } : null;
  const lastNight = [...prior].reverse().find(d => d.sleepMinutes != null);
  // Usual wake time: median wake of recent full nights (3h+), so one broken night doesn't skew it.
  const wakes = prior.slice(-14).filter(d => d.wakeMinutes != null && d.sleepMinutes >= 180).map(d => d.wakeMinutes).sort((a, b) => a - b);
  const usualWakeMinutes = wakes.length ? wakes[Math.floor(wakes.length / 2)] : null;
  const latestNight = lastNight ? { date: lastNight.date, sleepMinutes: lastNight.sleepMinutes, sleepScore: lastNight.scores.sleep, recovery: lastNight.scores.recovery, hrv: lastNight.hrv } : null;
  const stageSummary = (main?.summary?.stagesSummary || []).map(stage => ({ type: stage.type, minutes: numeric(stage.minutes) }));
  const heartRate = (raw['heart-rate'] || []).find(p => ymd(p.civilStartTime?.date) === date)?.heartRate;
  const sleepActivity = [
    ...(main ? [{ id: 'sleep-main', kind: 'sleep', name: main.pieces > 1 ? `Sleep · ${main.pieces} parts` : 'Sleep', start: main.interval.startTime || null, end: main.interval.endTime || null,
      durationMinutes: numeric(main.summary.minutesAsleep), score: today.scores.sleep }] : []),
    ...naps.map((s, i) => ({ id: `nap-${i}`, kind: 'sleep', name: 'Nap', start: s.interval?.startTime || null, end: s.interval?.endTime || null, durationMinutes: numeric(s.summary?.minutesAsleep), score: null })),
  ];
  const toActivity = (point, index) => {
    const item = point.exercise;
    const duration = typeof item.activeDuration === 'string' && /^\d+(\.\d+)?s$/.test(item.activeDuration)
      ? Number(item.activeDuration.slice(0, -1)) / 60 : minutesBetween(item.interval?.startTime, item.interval?.endTime);
    return { id: point.dataPointName || point.name || `activity-${index}`, name: item.displayName || item.exerciseType || 'Activity',
      start: item.interval?.startTime || null, end: item.interval?.endTime || null,
      durationMinutes: round(duration), calories: round(numeric(item.metricsSummary?.caloriesKcal)),
      averageHeartRate: numeric(item.metricsSummary?.averageHeartRateBeatsPerMinute),
      distanceKm: item.metricsSummary?.distanceMillimeters ? round(item.metricsSummary.distanceMillimeters / 1e6, 2) : null,
      zoneMinutes: numeric(item.metricsSummary?.activeZoneMinutes),
      localDate: ymd(item.interval?.civilStartTime?.date) || localParts(item.interval?.startTime, item.interval?.startUtcOffset, timeZone)?.date || null };
  };
  // Workouts for the whole 31-day window feed the 30-day summary; today's list is the subset on this date.
  const allWorkouts = (raw.exercise || []).filter(point => point.exercise).map(toActivity);
  const activities = allWorkouts.filter(a => a.localDate === date);
  const prior30 = allWorkouts.filter(a => a.localDate && a.localDate < date);
  const byType = {};
  for (const a of prior30.concat(activities)) { const k = a.name; byType[k] = byType[k] || { name: k, count: 0, minutes: 0 }; byType[k].count++; byType[k].minutes += a.durationMinutes || 0; }
  const activitySummary = { workouts: prior30.length + activities.length, minutes: round(sum(prior30.concat(activities).map(a => a.durationMinutes))), byType: Object.values(byType).sort((a, b) => b.count - a.count) };
  const { date: _date, scores, bedtimeMinutes, wakeMinutes, ...metrics } = today;
  return {
    source: 'google-health', date, syncedAt: new Date().toISOString(),
    metrics: { ...metrics,
      heartRateAvg: round(numeric(heartRate?.beatsPerMinuteAvg)), heartRateMin: round(numeric(heartRate?.beatsPerMinuteMin)), heartRateMax: round(numeric(heartRate?.beatsPerMinuteMax)),
      minutesAwake: numeric(main?.summary?.minutesAwake), sleepGoalPercent: today.sleepMinutes == null ? null : Math.round(100 * today.sleepMinutes / SLEEP_GOAL_MINUTES),
      sleepConsistency: spread == null ? null : Math.round(clamp(100 - spread / 1.2, 0, 100)) },
    baseline,
    latestNight,
    usualWakeMinutes,
    scores: { recovery: scores.recovery, strain: scores.strain, sleepPerformance: scores.sleep },
    sleep: main ? {
      start: main.interval.startTime || null, end: main.interval.endTime || null, minutesAsleep: numeric(main.summary.minutesAsleep), pieces: main.pieces,
      stages: (main.stages || []).map(stage => ({ type: stage.type, start: stage.startTime, end: stage.endTime, minutes: minutesBetween(stage.startTime, stage.endTime) })),
      summary: stageSummary,
    } : null,
    activities: [...sleepActivity, ...activities],
    history,
    activitySummary,
    warnings,
  };
}

// ---------- "Others": Google Health metrics not shown elsewhere in Scoop ----------
const seconds = value => typeof value === 'string' && /^\d+(\.\d+)?s$/.test(value) ? Number(value.slice(0, -1)) : null;
const humanize = value => String(value || '').toLowerCase().replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
const lastValue = (points, read) => { for (const p of [...(points || [])].reverse()) { const v = read(p); if (v != null) return { value: v, date: ymd(p.civilStartTime?.date) }; } return null; };
export async function fetchOthers(client, date) {
  if (!validDate(date)) throw new TypeError('Expected a valid date in YYYY-MM-DD format.');
  const end = nextDate(date), monthStart = addDays(date, -30);
  const day = ['floors', 'altitude', 'total-calories', 'active-minutes', 'sedentary-period', 'time-in-heart-rate-zone', 'calories-in-heart-rate-zone',
    'heart-rate', 'hydration-log', 'core-body-temperature', 'blood-glucose', 'run-vo2-max', 'swim-lengths-data'];
  const tasks = [
    ...day.map(type => [type, () => fetchRollup(client, type, date, end)]),
    ...['weight', 'body-fat'].map(type => [type, () => fetchRollup(client, type, monthStart, end)]),
    ['daily-vo2-max', () => fetchPoints(client, 'daily-vo2-max', `daily_vo2_max.date >= "${monthStart}" AND daily_vo2_max.date < "${end}"`, { pageSize: 100 })],
    ['daily-sleep-temperature-derivations', () => fetchPoints(client, 'daily-sleep-temperature-derivations', `daily_sleep_temperature_derivations.date >= "${monthStart}" AND daily_sleep_temperature_derivations.date < "${end}"`, { pageSize: 100 })],
    ['daily-heart-rate-zones', () => fetchPoints(client, 'daily-heart-rate-zones', `daily_heart_rate_zones.date >= "${date}" AND daily_heart_rate_zones.date < "${end}"`, { pageSize: 10 })],
    ['electrocardiogram', () => fetchPoints(client, 'electrocardiogram', `electrocardiogram.interval.start_time >= "${addDays(date, -90)}T00:00:00Z"`, { pageSize: 25 })],
    ['irregular-rhythm-notification', () => fetchPoints(client, 'irregular-rhythm-notification', `irregular_rhythm_notification.interval.civil_start_time >= "${addDays(date, -90)}" AND irregular_rhythm_notification.interval.civil_start_time < "${end}"`, { pageSize: 25 })],
  ];
  const settled = await Promise.allSettled(tasks.map(([, run]) => run()));
  const raw = {}, failed = [];
  settled.forEach((r, i) => { if (r.status === 'fulfilled') raw[tasks[i][0]] = r.value; else failed.push(tasks[i][0]); });
  const rhythmShared = !failed.includes('electrocardiogram') || !failed.includes('irregular-rhythm-notification');
  return { ...normalizeOthers(raw, date), failed: failed.filter(t => !['electrocardiogram', 'irregular-rhythm-notification'].includes(t)), rhythmShared };
}
export function normalizeOthers(raw, date) {
  const today = type => (raw[type] || []).find(p => ymd(p.civilStartTime?.date) === date) || null;
  const item = (label, value, unit = '', note = null) => ({ label, value, unit, note });
  const activity = [], heart = [], body = [], hydration = [];
  const floors = numeric(today('floors')?.floors?.countSum); if (floors != null) activity.push(item('Floors climbed', floors));
  const gain = numeric(today('altitude')?.altitude?.gainMillimetersSum); if (gain != null) activity.push(item('Elevation gain', round(gain / 1000), 'm'));
  const total = numeric(today('total-calories')?.totalCalories?.kcalSum); if (total != null) activity.push(item('Total calories burned', round(total), 'kcal', 'Including resting energy'));
  for (const level of today('active-minutes')?.activeMinutes?.activeMinutesRollupByActivityLevel || []) {
    const v = numeric(level.activeMinutesSum); if (v != null) activity.push(item(`${humanize(level.activityLevel)} minutes`, v, 'min'));
  }
  const sedentary = seconds(today('sedentary-period')?.sedentaryPeriod?.durationSum); if (sedentary != null) activity.push(item('Sedentary time', round(sedentary / 60), 'min'));
  const strokes = numeric(today('swim-lengths-data')?.swimLengthsData?.strokeCountSum); if (strokes != null) activity.push(item('Swim strokes', strokes));

  const hr = today('heart-rate')?.heartRate;
  if (hr) heart.push(item('Heart rate range', `${round(numeric(hr.beatsPerMinuteMin)) ?? '—'}–${round(numeric(hr.beatsPerMinuteMax)) ?? '—'}`, 'bpm', `Average ${round(numeric(hr.beatsPerMinuteAvg)) ?? '—'} bpm`));
  for (const zone of today('time-in-heart-rate-zone')?.timeInHeartRateZone?.timeInHeartRateZones || []) {
    const v = seconds(zone.duration); if (v != null) heart.push(item(`Time in ${humanize(zone.heartRateZone).toLowerCase()} zone`, round(v / 60), 'min'));
  }
  for (const zone of today('calories-in-heart-rate-zone')?.caloriesInHeartRateZone?.caloriesInHeartRateZones || []) {
    const v = numeric(zone.kcal); if (v != null) heart.push(item(`Calories in ${humanize(zone.heartRateZone).toLowerCase()} zone`, round(v), 'kcal'));
  }
  const zones = (raw['daily-heart-rate-zones'] || []).map(p => p.dailyHeartRateZones).find(z => ymd(z?.date) === date);
  for (const zone of zones?.heartRateZones || []) heart.push(item(`${humanize(zone.heartRateZoneType)} zone`, `${numeric(zone.minBeatsPerMinute) ?? '—'}–${numeric(zone.maxBeatsPerMinute) ?? '—'}`, 'bpm', 'Your personal zone range'));
  const vo2 = [...(raw['daily-vo2-max'] || [])].map(p => p.dailyVo2Max).filter(x => x?.vo2Max != null).sort((a, b) => ymd(b.date).localeCompare(ymd(a.date)))[0];
  if (vo2) heart.push(item('VO₂ max (cardio fitness)', round(numeric(vo2.vo2Max), 1), 'ml/kg/min', [vo2.cardioFitnessLevel && humanize(vo2.cardioFitnessLevel), ymd(vo2.date) !== date && `as of ${ymd(vo2.date)}`, vo2.estimated && 'estimated'].filter(Boolean).join(' · ') || null));
  const run = today('run-vo2-max')?.runVo2Max; if (run?.rateAvg != null) heart.push(item('Running VO₂ max', round(run.rateAvg, 1), 'ml/kg/min'));

  const weight = lastValue(raw.weight, p => numeric(p.weight?.weightGramsAvg));
  if (weight) body.push(item('Weight', round(weight.value / 1000, 1), 'kg', weight.date !== date ? `Last logged ${weight.date}` : null));
  const fat = lastValue(raw['body-fat'], p => numeric(p.bodyFat?.bodyFatPercentageAvg));
  if (fat) body.push(item('Body fat', round(fat.value, 1), '%', fat.date !== date ? `Last logged ${fat.date}` : null));
  const temp = [...(raw['daily-sleep-temperature-derivations'] || [])].map(p => p.dailySleepTemperatureDerivations).filter(x => x?.nightlyTemperatureCelsius != null && x?.baselineTemperatureCelsius != null).sort((a, b) => ymd(b.date).localeCompare(ymd(a.date)))[0];
  if (temp) { const diff = round(temp.nightlyTemperatureCelsius - temp.baselineTemperatureCelsius, 1); body.push(item('Skin temperature vs. baseline', `${diff > 0 ? '+' : ''}${diff}`, '°C', ymd(temp.date) !== date ? `Night of ${ymd(temp.date)}` : 'Last night')); }
  const core = today('core-body-temperature')?.coreBodyTemperature; if (core?.temperatureCelsiusAvg != null) body.push(item('Core body temperature', round(core.temperatureCelsiusAvg, 1), '°C'));
  const glucose = numeric(today('blood-glucose')?.bloodGlucose?.bloodGlucoseMilligramsPerDeciliterAvg); if (glucose != null) body.push(item('Blood glucose (average)', round(glucose), 'mg/dL'));
  const water = numeric(today('hydration-log')?.hydrationLog?.amountConsumed?.millilitersSum); if (water != null) hydration.push(item('Water logged', round(water), 'ml'));

  const rhythm = [];
  const ecgs = (raw.electrocardiogram || []).map(p => p.electrocardiogram).filter(Boolean).sort((a, b) => String(b.interval?.startTime).localeCompare(String(a.interval?.startTime)));
  if (raw.electrocardiogram) rhythm.push(item('ECG readings (90 days)', ecgs.length, ecgs.length === 1 ? 'reading' : 'readings', ecgs.length ? null : 'Take an ECG in the Fitbit app on a compatible device'));
  for (const e of ecgs.slice(0, 5)) rhythm.push(item(`ECG · ${(e.interval?.startTime || '').slice(0, 10)}`, humanize(e.resultClassification || 'Unclassified'), '', [e.beatsPerMinuteAvg && `Average ${numeric(e.beatsPerMinuteAvg)} bpm`, e.leadNumber && `${e.leadNumber}-lead`].filter(Boolean).join(' · ') || null));
  const irns = (raw['irregular-rhythm-notification'] || []).map(p => p.irregularRhythmNotification).filter(Boolean);
  if (raw['irregular-rhythm-notification']) rhythm.push(item('Irregular rhythm alerts (90 days)', irns.length, irns.length === 1 ? 'alert' : 'alerts', irns.length ? `Most recent ${(irns.map(x => x.interval?.startTime).sort().at(-1) || '').slice(0, 10)}` : 'None recorded'));
  return { date, categories: [
    { id: 'rhythm', title: 'Heart rhythm', items: rhythm },
    { id: 'activity', title: 'Activity', items: activity },
    { id: 'heart', title: 'Heart & fitness', items: heart },
    { id: 'body', title: 'Body', items: body },
    { id: 'hydration', title: 'Hydration', items: hydration },
  ] };
}

/** Read-only coverage report for the signed-in person's own data, used to find sync gaps. */
export async function fetchDiagnostics(client, date, days = 7, timeZone = null) {
  const start = addDays(date, -days + 1), end = nextDate(date);
  const sleepFilter = `sleep.interval.civil_end_time >= "${start}" AND sleep.interval.civil_end_time < "${end}"`;
  const describe = p => { const s = p.sleep || {}; return { end: ymd(s.interval?.civilEndTime?.date) || localParts(s.interval?.endTime, s.interval?.endUtcOffset, timeZone)?.date, hasCivilEnd: Boolean(s.interval?.civilEndTime), endUtcOffset: s.interval?.endUtcOffset || null, start: s.interval?.startTime, endTime: s.interval?.endTime,
    minutesAsleep: numeric(s.summary?.minutesAsleep), mainSleep: s.metadata?.mainSleep ?? null, nap: s.metadata?.nap ?? null, processed: s.metadata?.processed ?? null,
    stagesStatus: s.metadata?.stagesStatus || null, source: p.dataSource?.platform || p.dataSource?.device?.displayName || null }; };
  const [list, reconciled, hrv, rhr, steps] = await Promise.allSettled([
    fetchPoints(client, 'sleep', sleepFilter, { pageSize: 25 }),
    fetchPoints(client, 'sleep', sleepFilter, { reconcile: true, pageSize: 25 }),
    fetchPoints(client, 'daily-heart-rate-variability', `daily_heart_rate_variability.date >= "${start}" AND daily_heart_rate_variability.date < "${end}"`, { pageSize: 50 }),
    fetchPoints(client, 'daily-resting-heart-rate', `daily_resting_heart_rate.date >= "${start}" AND daily_resting_heart_rate.date < "${end}"`, { pageSize: 50 }),
    fetchRollup(client, 'steps', start, end),
  ]);
  const ok = r => r.status === 'fulfilled' ? r.value : { error: String(r.reason?.response?.status || r.reason?.message || 'failed') };
  const dates = v => Array.isArray(v) ? v.map(p => ymd((p.dailyHeartRateVariability || p.dailyRestingHeartRate)?.date)).sort() : v;
  return {
    range: { start, end },
    sleepList: Array.isArray(ok(list)) ? ok(list).map(describe) : ok(list),
    sleepReconciled: Array.isArray(ok(reconciled)) ? ok(reconciled).map(describe) : ok(reconciled),
    hrvDates: dates(ok(hrv)), restingHeartRateDates: dates(ok(rhr)),
    stepDays: Array.isArray(ok(steps)) ? ok(steps).map(p => [ymd(p.civilStartTime?.date), numeric(p.steps?.countSum)]) : ok(steps),
    devices: await fetchDevices(client),
    grantedScopes: await client.getAccessToken().then(t => client.getTokenInfo(t.token)).then(i => (i.scopes || []).map(x => x.replace('https://www.googleapis.com/auth/', ''))).catch(e => String(e?.message || 'unavailable').slice(0, 120)),
    devicesRaw: await client.request({ url: 'https://health.googleapis.com/v4/users/me/pairedDevices', method: 'GET', timeout: 15000 })
      .then(r => ({ status: 200, count: (r.data.pairedDevices || []).length, types: (r.data.pairedDevices || []).map(d => d.deviceType), hasSync: (r.data.pairedDevices || []).map(d => Boolean(d.lastSyncTime)) }))
      .catch(e => ({ status: e?.response?.status || e?.status || null, message: String(e?.response?.data?.error?.message || e?.message || '').slice(0, 200) })),
  };
}

// ---------- Intraday heart rate and Scoop's stress estimate ----------
/** Milliseconds a time zone is ahead of UTC at instant `ms`. */
function zoneOffsetMs(ms, timeZone) {
  try {
    const f = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(ms)).map(p => [p.type, p.value]));
    return Date.UTC(+f.year, +f.month - 1, +f.day, +f.hour, +f.minute, +f.second) - Math.floor(ms / 1000) * 1000;
  } catch { return 0; }
}
/** UTC instants for local midnight at the start and end of `date` in `timeZone`. */
export function localDayRange(date, timeZone) {
  const at = d => { const guess = Date.parse(`${d}T00:00:00Z`); return guess - zoneOffsetMs(guess - zoneOffsetMs(guess, timeZone), timeZone); };
  return { start: new Date(at(date)).toISOString(), end: new Date(at(nextDate(date))).toISOString() };
}
async function fetchPhysicalRollup(client, type, start, end, windowSize) {
  const points = [];
  let pageToken;
  for (let page = 0; page < 5; page++) {
    const body = { range: { startTime: start, endTime: end }, windowSize, pageSize: 1440 };
    if (pageToken) body.pageToken = pageToken;
    const { data } = await client.request({ url: `${BASE}/${type}/dataPoints:rollUp`, method: 'POST', data: body, timeout: 20000 });
    points.push(...(data.rollupDataPoints || []));
    pageToken = data.nextPageToken;
    if (!pageToken) return points;
  }
  return points;
}
/** Scoop's stress estimate (0–3) for one window: heart rate above resting, while not asleep or exercising. */
export function stressFromHeartRate(avg, resting) {
  if (avg == null || !resting) return null;
  return round(clamp(3 * (avg - resting) / (0.6 * resting), 0, 3), 1);
}
export const stressLevel = v => v == null ? null : v < 1 ? 'low' : v < 2 ? 'medium' : 'high';
export async function fetchStress(client, date, timeZone) {
  if (!validDate(date)) throw new TypeError('Expected a valid date in YYYY-MM-DD format.');
  const { start, end } = localDayRange(date, timeZone || 'UTC');
  const [hr, rhr, sleep, exercise, hrv] = await Promise.allSettled([
    fetchPhysicalRollup(client, 'heart-rate', start, end, '300s'),
    fetchPoints(client, 'daily-resting-heart-rate', `daily_resting_heart_rate.date >= "${addDays(date, -7)}" AND daily_resting_heart_rate.date < "${nextDate(date)}"`, { pageSize: 20 }),
    fetchPoints(client, 'sleep', `sleep.interval.end_time >= "${start}" AND sleep.interval.end_time < "${new Date(Date.parse(end) + 12 * 3600e3).toISOString()}"`, { reconcile: true, pageSize: 25 }),
    fetchPoints(client, 'exercise', `exercise.interval.civil_start_time >= "${date}" AND exercise.interval.civil_start_time < "${nextDate(date)}"`, { reconcile: true, pageSize: 25 }),
    fetchPoints(client, 'heart-rate-variability', `heart_rate_variability.sample_time.physical_time >= "${start}" AND heart_rate_variability.sample_time.physical_time < "${end}"`, { pageSize: 2000 }),
  ]);
  if (hr.status !== 'fulfilled') throw Object.assign(new Error('Intraday heart rate could not be loaded from Google Health.'), { status: 502 });
  const rhrs = rhr.status === 'fulfilled' ? rhr.value.map(p => p.dailyRestingHeartRate).filter(x => x?.beatsPerMinute).sort((a, b) => ymd(a.date).localeCompare(ymd(b.date))) : [];
  const resting = numeric(rhrs.at(-1)?.beatsPerMinute);
  const spans = (list, key) => (list.status === 'fulfilled' ? list.value : []).map(p => p[key]?.interval).filter(i => i?.startTime && i?.endTime).map(i => [Date.parse(i.startTime), Date.parse(i.endTime)]);
  const sleeps = spans(sleep, 'sleep'), workouts = spans(exercise, 'exercise');
  const inside = (t, list) => list.some(([a, b]) => t >= a && t < b);
  const windows = hr.value.map(p => {
    const t = Date.parse(p.startTime), avg = round(numeric(p.heartRate?.beatsPerMinuteAvg));
    const context = inside(t, sleeps) ? 'sleep' : inside(t, workouts) ? 'exercise' : 'awake';
    return { start: p.startTime, end: p.endTime, hr: avg, max: round(numeric(p.heartRate?.beatsPerMinuteMax)), context, stress: avg == null ? null : stressFromHeartRate(avg, resting) };
  }).filter(w => w.hr != null).sort((a, b) => a.start.localeCompare(b.start));
  const awake = windows.filter(w => w.context === 'awake' && w.stress != null);
  const minutesIn = level => awake.filter(w => stressLevel(w.stress) === level).length * 5;
  let longest = null, run = null;
  for (const w of awake) {
    if (stressLevel(w.stress) === 'high') { run = run && Date.parse(w.start) - Date.parse(run.lastEnd) <= 60000 ? { ...run, minutes: run.minutes + 5, lastEnd: w.end } : { start: w.start, minutes: 5, lastEnd: w.end }; if (!longest || run.minutes > longest.minutes) longest = run; }
    else run = null;
  }
  const last = awake.at(-1) || null, lastAny = windows.at(-1) || null;
  const hrvSamples = hrv.status === 'fulfilled' ? hrv.value.map(p => p.heartRateVariability).filter(x => x?.rootMeanSquareOfSuccessiveDifferencesMilliseconds != null) : [];
  return {
    date, resting, windowMinutes: 5,
    windows: windows.map(({ start: s, hr: h, stress, context }) => ({ start: s, hr: h, stress, context })),
    current: last ? { value: last.stress, level: stressLevel(last.stress), at: last.end, context: lastAny?.context } : null,
    latestSampleAt: lastAny?.end || null,
    summary: { lowMinutes: minutesIn('low'), mediumMinutes: minutesIn('medium'), highMinutes: minutesIn('high'), longestHigh: longest ? { start: longest.start, minutes: longest.minutes } : null },
    sleep: sleeps.map(([a, b]) => ({ start: new Date(a).toISOString(), end: new Date(b).toISOString() })),
    exercise: workouts.map(([a, b]) => ({ start: new Date(a).toISOString(), end: new Date(b).toISOString() })),
    hrvSamples: hrvSamples.length,
    hrvLatest: hrvSamples.length ? round(numeric(hrvSamples.at(-1).rootMeanSquareOfSuccessiveDifferencesMilliseconds), 1) : null,
  };
}

// ---------- Workout deep dive, granted permissions, health profile ----------
/** Minute-by-minute heart rate for one workout, with the person's own heart-rate zones. */
export async function fetchActivityHeart(client, start, end, date) {
  const ms = Date.parse(end) - Date.parse(start);
  if (!Number.isFinite(ms) || ms <= 0 || ms > 12 * 3600e3) throw Object.assign(new Error('Choose a workout up to 12 hours long.'), { status: 400 });
  const [hr, zones] = await Promise.allSettled([
    fetchPhysicalRollup(client, 'heart-rate', new Date(start).toISOString(), new Date(end).toISOString(), '60s'),
    validDate(date) ? fetchPoints(client, 'daily-heart-rate-zones', `daily_heart_rate_zones.date >= "${addDays(date, -7)}" AND daily_heart_rate_zones.date < "${nextDate(date)}"`, { pageSize: 10 }) : Promise.resolve([]),
  ]);
  if (hr.status !== 'fulfilled') throw Object.assign(new Error('Heart rate for this workout could not be loaded.'), { status: 502 });
  const z = zones.status === 'fulfilled' ? zones.value.map(p => p.dailyHeartRateZones).filter(Boolean).sort((a, b) => ymd(b.date).localeCompare(ymd(a.date)))[0] : null;
  return {
    points: hr.value.map(p => ({ t: p.startTime, bpm: round(numeric(p.heartRate?.beatsPerMinuteAvg)), max: round(numeric(p.heartRate?.beatsPerMinuteMax)) })).filter(p => p.bpm != null).sort((a, b) => a.t.localeCompare(b.t)),
    zones: (z?.heartRateZones || []).map(x => ({ type: x.heartRateZoneType, min: numeric(x.minBeatsPerMinute), max: numeric(x.maxBeatsPerMinute) })),
  };
}
export async function fetchGrantedScopes(client) {
  const { token } = await client.getAccessToken();
  const info = await client.getTokenInfo(token);
  return (info.scopes || []).map(x => x.replace('https://www.googleapis.com/auth/', ''));
}
export const PROFILE_HEALTH_SCOPES = ['https://www.googleapis.com/auth/googlehealth.profile.readonly'];
export async function fetchHealthProfile(client) {
  try {
    const { data } = await client.request({ url: 'https://health.googleapis.com/v4/users/me/profile', method: 'GET', timeout: 15000 });
    return { age: numeric(data.age), memberSince: ymd(data.membershipStartDate) };
  } catch (e) { return { missing: true, status: e?.response?.status || null }; }
}
