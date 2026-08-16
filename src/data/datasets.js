/**
 * Mock data for the demos. All of it is deterministic (a seeded PRNG rather
 * than Math.random) so charts look identical across reloads — makes visual
 * regressions obvious and screenshots comparable.
 */

/** mulberry32: tiny, fast, good enough for fixtures. */
export function makeRandom(seed = 42) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = makeRandom(2026);
const jitter = (base, spread) => Math.round(base + (rnd() - 0.5) * spread);

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const HOURS = ['00', '03', '06', '09', '12', '15', '18', '21'];

/* ------------------------------------------------------------------ trends */

export const revenueTrend = {
  categories: MONTHS,
  series: [
    { name: 'Subscriptions', colorIndex: 0, data: [128, 134, 141, 152, 149, 163, 175, 181, 178, 192, 205, 219].map((v) => v * 1000) },
    { name: 'Services', colorIndex: 1, data: [64, 61, 70, 72, 79, 77, 84, 88, 91, 89, 97, 104].map((v) => v * 1000) },
    { name: 'Marketplace', colorIndex: 2, data: [22, 26, 25, 31, 36, 39, 44, 47, 52, 58, 61, 68].map((v) => v * 1000) },
  ],
};

export const trafficByChannel = {
  categories: MONTHS.slice(0, 8),
  series: [
    { name: 'Organic', colorIndex: 0, data: [42, 45, 48, 51, 55, 58, 62, 67] },
    { name: 'Paid', colorIndex: 1, data: [28, 30, 29, 33, 31, 36, 34, 38] },
    { name: 'Referral', colorIndex: 2, data: [12, 14, 15, 14, 18, 19, 21, 23] },
    { name: 'Social', colorIndex: 3, data: [8, 9, 11, 12, 12, 15, 16, 18] },
  ],
};

export const responseTimes = {
  categories: WEEKDAYS,
  series: [
    { name: 'p50', colorIndex: 0, data: [120, 118, 126, 131, 122, 98, 94] },
    { name: 'p95', colorIndex: 1, data: [310, 298, 342, 366, 351, 244, 231] },
    { name: 'p99', colorIndex: 7, data: [640, 612, 720, 812, 764, 498, 471] },
  ],
};

/* ------------------------------------------------------------ compositions */

export const planMix = [
  { name: 'Free', y: 4820, colorIndex: 0 },
  { name: 'Starter', y: 2140, colorIndex: 1 },
  { name: 'Team', y: 1360, colorIndex: 2 },
  { name: 'Business', y: 640, colorIndex: 3 },
  { name: 'Enterprise', y: 180, colorIndex: 4 },
];

export const deviceSplit = [
  { name: 'Desktop', y: 58.2 },
  { name: 'Mobile', y: 34.6 },
  { name: 'Tablet', y: 7.2 },
];

export const regionRevenue = {
  categories: ['North America', 'Europe', 'APAC', 'LATAM', 'MEA'],
  series: [
    { name: 'New', colorIndex: 0, data: [420, 310, 260, 120, 70] },
    { name: 'Expansion', colorIndex: 2, data: [180, 140, 96, 44, 22] },
    { name: 'Renewal', colorIndex: 3, data: [610, 470, 330, 150, 88] },
  ],
};

/* -------------------------------------------------------------- relational */

export const featureUsage = {
  // [engagement score, retention %, seats] — bubble takes a z value.
  series: [
    {
      name: 'Core',
      colorIndex: 0,
      data: [
        { x: 82, y: 91, z: 4200, name: 'Dashboards' },
        { x: 74, y: 88, z: 3100, name: 'Reports' },
        { x: 66, y: 84, z: 2600, name: 'Alerts' },
      ],
    },
    {
      name: 'Collaboration',
      colorIndex: 1,
      data: [
        { x: 58, y: 79, z: 1900, name: 'Comments' },
        { x: 51, y: 72, z: 1400, name: 'Sharing' },
        { x: 44, y: 68, z: 900, name: 'Mentions' },
      ],
    },
    {
      name: 'Automation',
      colorIndex: 2,
      data: [
        { x: 39, y: 64, z: 800, name: 'Webhooks' },
        { x: 31, y: 55, z: 520, name: 'Scheduled jobs' },
        { x: 24, y: 47, z: 300, name: 'Custom scripts' },
      ],
    },
  ],
};

export const scatterSample = {
  series: [
    {
      name: 'Cohort A',
      colorIndex: 0,
      data: Array.from({ length: 40 }, (_, i) => [jitter(20 + i * 1.6, 14), jitter(30 + i * 1.9, 20)]),
    },
    {
      name: 'Cohort B',
      colorIndex: 1,
      data: Array.from({ length: 40 }, (_, i) => [jitter(24 + i * 1.5, 16), jitter(18 + i * 1.4, 22)]),
    },
    {
      name: 'Cohort C',
      colorIndex: 2,
      data: Array.from({ length: 40 }, (_, i) => [jitter(18 + i * 1.7, 15), jitter(48 + i * 1.1, 24)]),
    },
  ],
};

/* ----------------------------------------------------------------- density */

export const activityHeatmap = {
  xCategories: HOURS,
  yCategories: WEEKDAYS,
  // [x, y, value]
  data: WEEKDAYS.flatMap((_, y) =>
    HOURS.map((_, x) => {
      const workday = y < 5;
      const peak = x >= 3 && x <= 5;
      const base = (workday ? 40 : 14) + (peak ? 45 : 0);
      return [x, y, Math.max(0, jitter(base, 26))];
    }),
  ),
};

export const storageTreemap = [
  { name: 'Media', value: 4820, colorValue: 4820 },
  { name: 'Backups', value: 3100, colorValue: 3100 },
  { name: 'Logs', value: 2240, colorValue: 2240 },
  { name: 'Databases', value: 1680, colorValue: 1680 },
  { name: 'Artifacts', value: 980, colorValue: 980 },
  { name: 'Exports', value: 620, colorValue: 620 },
  { name: 'Other', value: 310, colorValue: 310 },
];

/* ------------------------------------------------------------------ shapes */

export const funnelStages = [
  { name: 'Visited site', y: 48200 },
  { name: 'Signed up', y: 18600 },
  { name: 'Activated', y: 9400 },
  { name: 'Subscribed', y: 3120 },
  { name: 'Renewed', y: 2180 },
];

export const budgetWaterfall = [
  { name: 'Opening', y: 1200 },
  { name: 'New sales', y: 640 },
  { name: 'Expansion', y: 210 },
  { name: 'Churn', y: -180 },
  { name: 'Discounts', y: -95 },
  { name: 'Closing', isSum: true },
];

export const teamSkills = {
  categories: ['Delivery', 'Quality', 'Velocity', 'Ownership', 'Comms', 'Design'],
  series: [
    { name: 'Platform', colorIndex: 0, data: [8, 9, 7, 8, 6, 5] },
    { name: 'Growth', colorIndex: 1, data: [7, 6, 9, 6, 8, 8] },
  ],
};

export const latencyBoxplot = {
  categories: ['api', 'auth', 'search', 'billing', 'media'],
  // [low, q1, median, q3, high]
  data: [
    [42, 78, 96, 132, 210],
    [31, 55, 68, 91, 158],
    [88, 140, 186, 244, 402],
    [26, 44, 58, 76, 121],
    [110, 190, 248, 336, 588],
  ],
};

export const signupSankey = [
  { from: 'Ads', to: 'Landing', weight: 3200 },
  { from: 'Organic', to: 'Landing', weight: 5400 },
  { from: 'Referral', to: 'Landing', weight: 1600 },
  { from: 'Landing', to: 'Signup', weight: 4100 },
  { from: 'Landing', to: 'Bounce', weight: 6100 },
  { from: 'Signup', to: 'Activated', weight: 2400 },
  { from: 'Signup', to: 'Dormant', weight: 1700 },
];

export const streamData = {
  categories: MONTHS,
  series: ['Docs', 'Sheets', 'Slides', 'Forms', 'Notes'].map((name, i) => ({
    name,
    colorIndex: i,
    data: MONTHS.map((_, m) => Math.max(0, jitter(30 + i * 6 + Math.sin(m / 2 + i) * 18, 14))),
  })),
};

/* --------------------------------------------------------------- drilldown */

export const browserShare = {
  series: [
    {
      name: 'Browsers',
      colorByPoint: true,
      data: [
        { name: 'Chrome', y: 61.4, drilldown: 'chrome' },
        { name: 'Safari', y: 18.2, drilldown: 'safari' },
        { name: 'Edge', y: 9.1, drilldown: 'edge' },
        { name: 'Firefox', y: 7.3, drilldown: 'firefox' },
        { name: 'Other', y: 4.0, drilldown: null },
      ],
    },
  ],
  drilldown: {
    series: [
      { id: 'chrome', name: 'Chrome versions', data: [['v137', 28.1], ['v136', 19.4], ['v135', 8.6], ['Older', 5.3]] },
      { id: 'safari', name: 'Safari versions', data: [['v19', 9.4], ['v18', 6.1], ['Older', 2.7]] },
      { id: 'edge', name: 'Edge versions', data: [['v137', 5.2], ['v136', 2.6], ['Older', 1.3]] },
      { id: 'firefox', name: 'Firefox versions', data: [['v142', 3.9], ['v141', 2.1], ['Older', 1.3]] },
    ],
  },
};

/* ------------------------------------------------------------- stat tiles */

export const kpis = [
  { label: 'MRR', value: '$219,480', delta: 6.8, deltaLabel: 'vs last month', spark: [128, 134, 141, 152, 149, 163, 175, 181, 178, 192, 205, 219], colorIndex: 0 },
  { label: 'Active accounts', value: '9,140', delta: 2.4, deltaLabel: 'vs last month', spark: [7800, 7960, 8110, 8240, 8390, 8520, 8710, 8830, 8890, 8960, 9020, 9140], colorIndex: 2 },
  { label: 'Net churn', value: '1.9%', delta: -0.4, deltaLabel: 'vs last month', spark: [3.1, 3.0, 2.8, 2.9, 2.6, 2.5, 2.4, 2.3, 2.2, 2.1, 2.0, 1.9], colorIndex: 3 },
  { label: 'p95 latency', value: '366 ms', delta: 12.1, deltaLabel: 'vs last week', spark: [298, 310, 305, 322, 318, 342, 366], colorIndex: 1 },
];

/** Seed for the live chart: 60 seconds of history ending now. */
export function seedLiveSeries(points = 60, now = Date.now()) {
  const r = makeRandom(7);
  let value = 240;
  return Array.from({ length: points }, (_, i) => {
    value = Math.max(80, value + (r() - 0.48) * 40);
    return [now - (points - 1 - i) * 1000, Math.round(value)];
  });
}
