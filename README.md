# Scoop

Scoop is a personal health dashboard for Fitbit data. Anyone with a Fitbit linked to a Google account can connect, see their sleep, recovery, strain, stress and long-term habits, and get a plan for today and tonight.

Live at **https://scoop-mauve-two.vercel.app**.

## Features

### Today (Overview)
- Three score rings (Sleep, Recovery, Strain) that fill and count up; tap to open, long-press to peek at what each means.
- Vitals card (how many of HRV, resting heart rate, respiratory rate and SpO₂ are within your usual range) and a Stress card.
- Expandable insight cards for recovery, sleep and strain, each with a next step.
- My day: sleep and workouts as coloured score pills with start and end times. A night recorded in several pieces is shown as one sleep; daytime naps are listed separately.
- Tonight's sleep: bedtime worked back from your usual wake time and tonight's sleep need.
- Key statistics against your previous 30 days, Health metrics, Last night (sleep stages), streaks and records, a 7-day strain and recovery chart, and a 30-day summary of workouts and heart stats.
- A floating quick-actions button (add activity, check in, jump to a date, sync now).

### Scores
- **Recovery (1–99%)** compares last night's HRV and resting heart rate with your own 30-day average, adjusted slightly by sleep. It needs at least three days of HRV history.
- **Strain (0–21)** grows with heart-rate zone minutes, steps and active calories, and gets harder to raise as the day fills up.
- **Sleep (0–100%)** is 75% time asleep against an 8-hour goal and 25% sleep efficiency.
- Each score screen has a tap-to-flip ring showing how it was built, a two-step walkthrough, metric rows with 30-day comparison arrows, and an insight.
- Sleep adds a stage doughnut, a stage timeline and tonight's sleep need (baseline + today's strain + catching up − naps).

These are estimates from Fitbit measurements, not medical measurements. The formulas live in `health.mjs`.

### Stress
5-minute heart-rate averages for your local day, compared with your resting heart rate while you're awake and not working out, on a 0–3 scale. Shows a gauge, time in low/medium/high, a scrubbable day chart with sleep and workout bands, and how far behind real time the latest reading is.

### Workout deep dive
Tap any workout for duration, average and peak heart rate, calories, distance and zone minutes, a minute-by-minute heart-rate chart over your personal heart-rate zones, and time in each zone.

### Trends
Overview, Recovery, Strain and Sleep tabs. Overview shows how many days fell in each recovery zone and strain band. The other tabs stack cards for recovery, HRV, resting heart rate, strain, active calories, steps, sleep score, hours against your goal and bedtime, each with its average, min/max lines and range. 7- or 30-day view.

### Coach
- Sleep coach: choose Peak, Perform or Get by and a wake time to get a bedtime, time asleep and time in bed.
- Weekly sleep schedule with separate weekday and weekend wake times.
- Strain coach: a target band based on today's recovery (14–18 green, 10–14 yellow, 4–10 red), a live meter and a curve of strain building through the day.

### Healthspan (Scoop Age)
Locked until you add your exact date of birth (tap the card; it stays on this browser). Scoop Age starts from your age and adds or takes away years for six habits over your last 30 days: daily steps, weekly zone minutes, resting heart rate, average sleep, bedtime consistency and VO₂ max (when available). Pace of aging compares your last 7 days with your 30-day average. Each habit's effect is listed in years. It is an estimate, not medical advice.

### Other screens
- **Others:** Google Health metrics not shown elsewhere, grouped into Activity, Heart & fitness, Heart rhythm (ECG readings and irregular-rhythm alerts), Body and Hydration.
- **Journal:** daily check-in (energy, soreness, stress, illness, injury, notes) and an example impact analysis. Stored on this browser.
- **Profile:** photo, name, connection, device and battery, last sync, member-since date, 30-day totals and a monthly report against last month.
- **Settings:** distance units, 12/24-hour time, sleep goal, date of birth, haptics, the permissions you've shared, Help & FAQ, About, disconnect and clearing browser data.
- **Help:** short FAQ.

### Navigation and interaction
- Top bar: menu, logo, a fixed-width date switcher (tap for a month calendar coloured by recovery, strain or sleep) and a device chip with a battery-fill icon and sync pulse.
- Swipe left or right to change day; swipe from the left edge for the menu. The page behind the menu doesn't scroll.
- Drag or tap any line chart to read exact values; tap trend bars for values; tap records and key statistics for details.
- Haptic taps on Android browsers and, on iPhone (iOS 18+), through Safari's switch-control haptic. Can be turned off in Settings.
- Motion: screen open/close (scale and fade, 300 ms), page slides (200 ms), tab underline (300 ms), tooltips revealed from the top centre (120 ms), card flips (240 ms), bottom sheets (150 ms), plus bars growing, lines drawing, numbers counting up and an animated Healthspan orb. All motion turns off with the system "reduce motion" setting.
- One type scale (12px labels, 12–14px text, 18–32px numbers) and one spacing scale across every screen.

### Data freshness
Every synced day is cached in the browser. Changing dates shows cached days instantly or a preview from the 31-day history, refreshes in the background with a slim progress bar, and prefetches the previous day. Returning visitors start in a loading state instead of example data.

## Run locally

Requires Node.js 22.23+.

```sh
npm install
npm start
```

Open **http://localhost:3000**. Without a connection the app shows clearly labelled example data.

## Connect Fitbit through Google Health

Google's legacy Fitbit OAuth endpoints are retired; Scoop uses **Google Health v4 with Google OAuth 2.0** (PKCE, single-use state) via `google-auth-library`.

1. Follow [Google Health setup](https://developers.google.com/health/setup): create a Google Cloud project and enable **Google Health API**.
2. Configure the OAuth consent screen and add test users while the app is in testing.
3. Create a **Web application** OAuth client. Authorized origins: `http://localhost:3000` and your production origin. Redirect URIs: `http://localhost:3000/api/oauth/callback` and `https://<your-domain>/api/oauth/callback`.
4. Add these read-only scopes on the consent screen (Data access):
   - `googlehealth.activity_and_fitness.readonly`, `googlehealth.sleep.readonly`, `googlehealth.health_metrics_and_measurements.readonly` (required)
   - `googlehealth.settings.readonly` (device battery and last sync)
   - `googlehealth.ecg.readonly`, `googlehealth.irn.readonly` (ECG readings and irregular-rhythm alerts)
   - `googlehealth.profile.readonly` (member-since date)
   - `openid`, `profile` (name and photo; no email is requested)
5. Copy `.env.example` to `.env` and set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and, when hosted, `SESSION_SECRET` (32+ random characters).

Optional scopes can be declined; the related features show a prompt to reconnect instead.

### Who can connect
Each browser gets its own encrypted session, so any number of people can connect. While the OAuth app is in **Testing**, only listed test users (up to 100) can sign in. To open it to everyone, publish the consent screen and complete Google's verification for the health scopes (privacy policy, homepage, domain verification, demo video).

### Privacy
- Tokens and the person's name and photo URL live only in an AES-256-GCM encrypted, HttpOnly cookie for up to 12 hours. The server stores no health data and logs no tokens or records.
- Journal entries, manual activities, settings and date of birth stay in the browser's local storage.
- Disconnect revokes Google's token and clears the session.

## How data is loaded

- `GET /api/health?date=&tz=` fetches a 31-day window in one sync: daily roll-ups (steps, active energy, distance, active zone minutes, heart rate), daily summaries (resting heart rate, HRV, respiratory rate, SpO₂, VO₂ max), reconciled sleep and exercise sessions, and the paired device. Daily-summary filters use the API's snake_case field names. Sleep is assigned to the local day from each record's UTC offset (or the viewer's time zone).
- `GET /api/stress` rolls heart rate into 5-minute windows for the local day.
- `GET /api/activity` returns 1-minute heart rate for one workout plus personal heart-rate zones.
- `GET /api/others` loads the extra metrics on demand.
- `GET /api/profile`, `/api/permissions` and `/api/diagnostics` (the signed-in person's own sync coverage and granted scopes).

## Hosting on Vercel

Static files come from `public/`; `api/index.mjs` handles `/api/*`. Production environment variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, `APP_ORIGIN`.

```sh
npx vercel@64.7.0 deploy --prod
```

## Development

```sh
npm run check
npm test
npm run dev
```

Tests cover Google Health normalisation (roll-ups, daily summaries, split nights, naps, time zones), score formulas, the stress estimate, the Others mapping, date validation, request shapes and pagination, partial permission failures, encrypted cookie sessions, and the HTTP routes' security checks.

Source map: `public/` frontend (`app.js`, `styles.css`, `index.html`, `assets/`), `server.mjs` HTTP and OAuth server, `health.mjs` Google Health adapter and score logic, `api/index.mjs` Vercel entry, `tests/` tests, `docs/` design notes, `evidence/` research notes.

## Credits

Type is set in **Barlow** and **Figtree**, both under the SIL Open Font License 1.1 (licence files in `public/assets/fonts/`). Branding, icons and copy are Scoop's own.
