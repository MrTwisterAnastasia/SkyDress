/* SkyDress mock data — canonical dataset from CLAUDE.md.
   All cities share the same data; switching city only changes the search-input label. */
window.SkyDress = window.SkyDress || {};

(function () {
  'use strict';

  const CITIES_LIST = [
    'Kyiv', 'Kharkiv', 'Odesa', 'Dnipro', 'Zaporizhzhia',
    'Lviv', 'Kryvyi Rih', 'Mykolaiv', 'Poltava', 'Vinnytsia'
  ];

  const SUNRISE = '06:45';
  const SUNSET = '18:30';
  const MOON_PHASE_TODAY = 'Full Moon';
  const POLLEN_LOW = { tree: 'Low', ragweed: 'Low', grass: 'Low', dust: 'Low' };

  /* Hourly forecast — 24 records covering every outfit level, weather icon, UV/AQI tier. */
  const hourly = [
    { hour: 0,  temp: -12, feelsLike: -18, condition: 'Clear Night',         rainChance: 0,  windSpeed: 25, humidity: 55, uvIndex: null, uvLabel: '—',         aqi: 'Good',     visibility: 15,  pressure: 1028, windDir: 'NW', windDeg: 315 },
    { hour: 1,  temp: -13, feelsLike: -20, condition: 'Partly Cloudy Night', rainChance: 5,  windSpeed: 22, humidity: 58, uvIndex: null, uvLabel: '—',         aqi: 'Good',     visibility: 13,  pressure: 1027, windDir: 'NW', windDeg: 315 },
    { hour: 2,  temp: -14, feelsLike: -23, condition: 'Blizzard',            rainChance: 70, windSpeed: 55, humidity: 80, uvIndex: null, uvLabel: '—',         aqi: 'Fair',     visibility: 1,   pressure: 1015, windDir: 'NW', windDeg: 315 },
    { hour: 3,  temp: -5,  feelsLike: -8,  condition: 'Snow',                rainChance: 65, windSpeed: 18, humidity: 88, uvIndex: null, uvLabel: '—',         aqi: 'Good',     visibility: 3,   pressure: 1018, windDir: 'NW', windDeg: 315 },
    { hour: 4,  temp: -3,  feelsLike: -7,  condition: 'Sleet',               rainChance: 75, windSpeed: 25, humidity: 92, uvIndex: null, uvLabel: '—',         aqi: 'Good',     visibility: 4,   pressure: 1016, windDir: 'NW', windDeg: 315 },
    { hour: 5,  temp: 4,   feelsLike: 2,   condition: 'Fog',                 rainChance: 10, windSpeed: 5,  humidity: 95, uvIndex: null, uvLabel: '—',         aqi: 'Moderate', visibility: 0.5, pressure: 1020, windDir: 'NW', windDeg: 315 },
    { hour: 6,  temp: 5,   feelsLike: 3,   condition: 'Overcast',            rainChance: 20, windSpeed: 12, humidity: 80, uvIndex: 1,    uvLabel: 'Low',       aqi: 'Good',     visibility: 8,   pressure: 1021, windDir: 'NW', windDeg: 315 },
    { hour: 7,  temp: 6,   feelsLike: 2,   condition: 'Windy',               rainChance: 15, windSpeed: 42, humidity: 72, uvIndex: 1,    uvLabel: 'Low',       aqi: 'Good',     visibility: 10,  pressure: 1019, windDir: 'NW', windDeg: 315 },
    { hour: 8,  temp: 12,  feelsLike: 10,  condition: 'Drizzle',             rainChance: 55, windSpeed: 18, humidity: 85, uvIndex: 2,    uvLabel: 'Low',       aqi: 'Good',     visibility: 6,   pressure: 1017, windDir: 'NW', windDeg: 315 },
    { hour: 9,  temp: 14,  feelsLike: 12,  condition: 'Cloudy',              rainChance: 25, windSpeed: 15, humidity: 78, uvIndex: 2,    uvLabel: 'Low',       aqi: 'Good',     visibility: 9,   pressure: 1018, windDir: 'NW', windDeg: 315 },
    { hour: 10, temp: 21,  feelsLike: 20,  condition: 'Partly Cloudy',       rainChance: 10, windSpeed: 14, humidity: 60, uvIndex: 4,    uvLabel: 'Moderate',  aqi: 'Good',     visibility: 15,  pressure: 1020, windDir: 'NW', windDeg: 315 },
    { hour: 11, temp: 23,  feelsLike: 22,  condition: 'Mostly Sunny',        rainChance: 5,  windSpeed: 10, humidity: 50, uvIndex: 5,    uvLabel: 'Moderate',  aqi: 'Good',     visibility: 20,  pressure: 1021, windDir: 'NW', windDeg: 315 },
    { hour: 12, temp: 28,  feelsLike: 27,  condition: 'Sunny',               rainChance: 0,  windSpeed: 12, humidity: 40, uvIndex: 7,    uvLabel: 'High',      aqi: 'Good',     visibility: 25,  pressure: 1019, windDir: 'NW', windDeg: 315 },
    { hour: 13, temp: 30,  feelsLike: 29,  condition: 'Partly Cloudy',       rainChance: 5,  windSpeed: 15, humidity: 38, uvIndex: 8,    uvLabel: 'Very High', aqi: 'Good',     visibility: 22,  pressure: 1018, windDir: 'NW', windDeg: 315 },
    { hour: 14, temp: 38,  feelsLike: 40,  condition: 'Sunny',               rainChance: 0,  windSpeed: 8,  humidity: 25, uvIndex: 11,   uvLabel: 'Extreme',   aqi: 'Poor',     visibility: 20,  pressure: 1016, windDir: 'NW', windDeg: 315 },
    { hour: 15, temp: 37,  feelsLike: 36,  condition: 'Thunderstorm',        rainChance: 85, windSpeed: 35, humidity: 70, uvIndex: 2,    uvLabel: 'Low',       aqi: 'Poor',     visibility: 5,   pressure: 1008, windDir: 'NW', windDeg: 315 },
    { hour: 16, temp: 29,  feelsLike: 26,  condition: 'Hail',                rainChance: 65, windSpeed: 28, humidity: 75, uvIndex: 1,    uvLabel: 'Low',       aqi: 'Moderate', visibility: 7,   pressure: 1012, windDir: 'NW', windDeg: 315 },
    { hour: 17, temp: 27,  feelsLike: 25,  condition: 'Heavy Rain',          rainChance: 88, windSpeed: 22, humidity: 82, uvIndex: null, uvLabel: '—',         aqi: 'Good',     visibility: 8,   pressure: 1014, windDir: 'NW', windDeg: 315 },
    { hour: 18, temp: 22,  feelsLike: 21,  condition: 'Partly Cloudy',       rainChance: 15, windSpeed: 12, humidity: 65, uvIndex: 3,    uvLabel: 'Moderate',  aqi: 'Good',     visibility: 18,  pressure: 1017, windDir: 'NW', windDeg: 315 },
    { hour: 19, temp: 20,  feelsLike: 19,  condition: 'Partly Cloudy Night', rainChance: 10, windSpeed: 10, humidity: 68, uvIndex: null, uvLabel: '—',         aqi: 'Good',     visibility: 17,  pressure: 1018, windDir: 'NW', windDeg: 315 },
    { hour: 20, temp: 15,  feelsLike: 13,  condition: 'Clear Night',         rainChance: 5,  windSpeed: 14, humidity: 70, uvIndex: null, uvLabel: '—',         aqi: 'Good',     visibility: 16,  pressure: 1020, windDir: 'NW', windDeg: 315 },
    { hour: 21, temp: 8,   feelsLike: 5,   condition: 'Clear Night',         rainChance: 0,  windSpeed: 18, humidity: 65, uvIndex: null, uvLabel: '—',         aqi: 'Good',     visibility: 14,  pressure: 1022, windDir: 'NW', windDeg: 315 },
    { hour: 22, temp: -4,  feelsLike: -7,  condition: 'Snow',                rainChance: 60, windSpeed: 20, humidity: 88, uvIndex: null, uvLabel: '—',         aqi: 'Good',     visibility: 3,   pressure: 1024, windDir: 'NW', windDeg: 315 },
    { hour: 23, temp: -11, feelsLike: -16, condition: 'Clear Night',         rainChance: 0,  windSpeed: 22, humidity: 58, uvIndex: null, uvLabel: '—',         aqi: 'Good',     visibility: 12,  pressure: 1026, windDir: 'NW', windDeg: 315 }
  ].map(r => Object.assign(r, {
    sunrise: SUNRISE, sunset: SUNSET, moonPhase: MOON_PHASE_TODAY,
    treePollen: POLLEN_LOW.tree, ragweedPollen: POLLEN_LOW.ragweed,
    grassPollen: POLLEN_LOW.grass, dustDander: POLLEN_LOW.dust
  }));

  /* 10-day forecast — each row covers a specific outfit level + condition. */
  const daily = [
    { day: 0, dayLabel: 'Today', dayShort: 'Mon', high: 16,  low: 8,   feelsLike: 14,  condition: 'Mostly Sunny',                outfitCondition: 'Mostly Sunny', rainChance: 0,  windSpeed: 12, humidity: 65, uvIndex: 2,  uvLabel: 'Low',       aqi: 'Good',      visibility: 15, pressure: 1020, sunrise: '06:45', sunset: '18:30', moonPhase: 'Full Moon',         treePollen: 'Low',    ragweedPollen: 'Low',    grassPollen: 'Low',    dustDander: 'Low',    windDir: 'NW', windDeg: 315 },
    { day: 1, dayLabel: 'Tue',   dayShort: 'Tue', high: 22,  low: 13,  feelsLike: 21,  condition: 'Partly Cloudy',               outfitCondition: 'Partly Cloudy', rainChance: 10, windSpeed: 14, humidity: 58, uvIndex: 4,  uvLabel: 'Moderate',  aqi: 'Good',      visibility: 18, pressure: 1019, sunrise: '06:15', sunset: '19:45', moonPhase: 'Waning Gibbous',    treePollen: 'Low',    ragweedPollen: 'Low',    grassPollen: 'Medium', dustDander: 'Low',    windDir: 'NW', windDeg: 315 },
    { day: 2, dayLabel: 'Wed',   dayShort: 'Wed', high: 29,  low: 18,  feelsLike: 28,  condition: 'Sunny',                       outfitCondition: 'Sunny', rainChance: 0,  windSpeed: 10, humidity: 40, uvIndex: 7,  uvLabel: 'High',      aqi: 'Good',      visibility: 22, pressure: 1018, sunrise: '05:45', sunset: '20:20', moonPhase: 'Last Quarter',      treePollen: 'Medium', ragweedPollen: 'Low',    grassPollen: 'Medium', dustDander: 'Low',    windDir: 'NW', windDeg: 315 },
    { day: 3, dayLabel: 'Thu',   dayShort: 'Thu', high: 38,  low: 25,  feelsLike: 40,  condition: 'Sunny AM · Thunderstorm PM',  outfitCondition: 'Thunderstorm', rainChance: 65, windSpeed: 30, humidity: 55, uvIndex: 11, uvLabel: 'Extreme',   aqi: 'Very Poor', visibility: 10, pressure: 1010, sunrise: '05:35', sunset: '20:35', moonPhase: 'Waning Crescent',   treePollen: 'High',   ragweedPollen: 'Medium', grassPollen: 'High',   dustDander: 'Low',    windDir: 'NW', windDeg: 315 },
    { day: 4, dayLabel: 'Fri',   dayShort: 'Fri', high: 27,  low: 19,  feelsLike: 26,  condition: 'Heavy Rain',                  outfitCondition: 'Heavy Rain', rainChance: 85, windSpeed: 25, humidity: 80, uvIndex: 1,  uvLabel: 'Low',       aqi: 'Poor',      visibility: 8,  pressure: 1012, sunrise: '05:45', sunset: '20:20', moonPhase: 'New Moon',          treePollen: 'Low',    ragweedPollen: 'Low',    grassPollen: 'Medium', dustDander: 'Low',    windDir: 'NW', windDeg: 315 },
    { day: 5, dayLabel: 'Sat',   dayShort: 'Sat', high: 14,  low: 7,   feelsLike: 12,  condition: 'Fog',                         outfitCondition: 'Fog', rainChance: 15, windSpeed: 8,  humidity: 92, uvIndex: 1,  uvLabel: 'Low',       aqi: 'Moderate',  visibility: 1,  pressure: 1020, sunrise: '07:00', sunset: '18:00', moonPhase: 'Waxing Crescent',   treePollen: 'Medium', ragweedPollen: 'Low',    grassPollen: 'Low',    dustDander: 'Medium', windDir: 'NW', windDeg: 315 },
    { day: 6, dayLabel: 'Sun',   dayShort: 'Sun', high: 7,   low: 2,   feelsLike: 4,   condition: 'Drizzle',                     outfitCondition: 'Drizzle', rainChance: 55, windSpeed: 20, humidity: 88, uvIndex: 1,  uvLabel: 'Low',       aqi: 'Good',      visibility: 6,  pressure: 1016, sunrise: '07:30', sunset: '17:15', moonPhase: 'First Quarter',     treePollen: 'Low',    ragweedPollen: 'Low',    grassPollen: 'Low',    dustDander: 'Low',    windDir: 'NW', windDeg: 315 },
    { day: 7, dayLabel: 'Mon',   dayShort: 'Mon', high: -4,  low: -9,  feelsLike: -7,  condition: 'Snow',                        outfitCondition: 'Snow', rainChance: 70, windSpeed: 15, humidity: 90, uvIndex: null, uvLabel: '—',       aqi: 'Good',      visibility: 4,  pressure: 1024, sunrise: '08:00', sunset: '16:30', moonPhase: 'Waxing Gibbous',    treePollen: 'Low',    ragweedPollen: 'Low',    grassPollen: 'Low',    dustDander: 'Low',    windDir: 'NW', windDeg: 315 },
    { day: 8, dayLabel: 'Tue',   dayShort: 'Tue', high: -15, low: -20, feelsLike: -22, condition: 'Blizzard',                    outfitCondition: 'Blizzard', rainChance: 75, windSpeed: 60, humidity: 78, uvIndex: null, uvLabel: '—',       aqi: 'Fair',      visibility: 1,  pressure: 1015, sunrise: '08:15', sunset: '16:15', moonPhase: 'Full Moon',         treePollen: 'Low',    ragweedPollen: 'Low',    grassPollen: 'Low',    dustDander: 'Low',    windDir: 'NW', windDeg: 315 },
    { day: 9, dayLabel: 'Wed',   dayShort: 'Wed', high: 3,   low: -2,  feelsLike: 1,   condition: 'Overcast',                    outfitCondition: 'Overcast', rainChance: 20, windSpeed: 18, humidity: 75, uvIndex: 1,  uvLabel: 'Low',       aqi: 'Good',      visibility: 12, pressure: 1026, sunrise: '08:10', sunset: '16:20', moonPhase: 'Waning Gibbous',    treePollen: 'Low',    ragweedPollen: 'Low',    grassPollen: 'Low',    dustDander: 'Low',    windDir: 'NW', windDeg: 315 }
  ];

  /* === Mappings === */

  const OUTFIT_BY_FEELS_LIKE = function (feelsLike) {
    if (feelsLike > 35) return 'very-hot';
    if (feelsLike >= 25) return 'hot';
    if (feelsLike >= 18) return 'warm';
    if (feelsLike >= 10) return 'cool';
    if (feelsLike >= 0) return 'cold';
    if (feelsLike >= -10) return 'freezing';
    return 'very-cold';
  };

  /* Outfit levels in order light → heavy. Index 0 = lightest (Very Hot),
     index 6 = heaviest (Very Cold). The sensitivityOffset is added to the
     base index from OUTFIT_BY_FEELS_LIKE and the result is clamped to this
     array's bounds. See docs/04 section 1 for the full spec. */
  const OUTFIT_LEVELS = ['very-hot', 'hot', 'warm', 'cool', 'cold', 'freezing', 'very-cold'];

  function outfitByFeelsLikeWithOffset(feelsLike, offset) {
    const base = OUTFIT_BY_FEELS_LIKE(feelsLike);
    const baseIndex = OUTFIT_LEVELS.indexOf(base);
    const shifted = baseIndex + (Number(offset) || 0);
    const clamped = Math.max(0, Math.min(OUTFIT_LEVELS.length - 1, shifted));
    return OUTFIT_LEVELS[clamped];
  }

  /* Mascot filenames — note the deliberate typo on ver-cold. */
  const MASCOT_FILENAME = {
    'very-hot': 'very-hot-weather.png',
    'hot': 'hot-weather.png',
    'warm': 'warm-weather.png',
    'cool': 'cool-weather.png',
    'cold': 'cold-weather.png',
    'freezing': 'freezing-weather.png',
    'very-cold': 'ver-cold-weather.png'
  };

  /* Clothing-icon spec per outfit level — uses positions from docs/04 sections 5a–5g.
     Each entry contains the clothing items and their body-part target. Card positions are
     expressed as percentages of the outfit zone so layout scales with viewport. */
  const OUTFIT_CLOTHING = {
    'very-hot': [
      { file: 'very-hot_waistcoat.svg', body: 'torso', side: 'left',  pos: { top: '25%', left: '0%' },  angle: 220 },
      { file: 'very-hot_briefs.svg',    body: 'legs',  side: 'left',  pos: { top: '78%', left: '0%' },  angle: 167 }
    ],
    'hot': [
      { file: 'hot_cap.svg',     body: 'head',  side: 'right', pos: { top: '4%',  right: '0%' }, angle: 333 },
      { file: 'hot_blouse.svg',  body: 'torso', side: 'left',  pos: { top: '25%', left: '0%' },  angle: 208 },
      { file: 'hot_shorts.svg',  body: 'legs',  side: 'left',  pos: { top: '78%', left: '0%' },  angle: 170 }
    ],
    'warm': [
      { file: 'warm_hoodie.svg',      body: 'torso', side: 'left', pos: { top: '29%', left: '0%' }, angle: 219 },
      { file: 'warm_baggy-jeans.svg', body: 'legs',  side: 'left', pos: { top: '77%', left: '0%' }, angle: 172 }
    ],
    'cool': [
      { file: 'cool_beanie.svg',             body: 'head',  side: 'right', pos: { top: '0%',  right: '0%' }, angle: 338 },
      { file: 'cool_turtleneck-sweater.svg', body: 'torso', side: 'left',  pos: { top: '34%', left: '0%' }, angle: 208 },
      { file: 'cool_boyfriend-jeans.svg',    body: 'legs',  side: 'left',  pos: { top: '74%', left: '0%' }, angle: 194 }
    ],
    'cold': [
      { file: 'cold_beanie.svg',             body: 'head',        side: 'right', pos: { top: '0%',  right: '0%' }, angle: 338 },
      { file: 'cold_turtleneck-sweater.svg', body: 'torso',       side: 'left',  pos: { top: '34%', left: '0%' }, angle: 208 },
      { file: 'cold_boyfriend-jeans.svg',    body: 'legs',        side: 'left',  pos: { top: '74%', left: '0%' }, angle: 194 },
      { file: 'cold_down-jacket.svg',        body: 'torso-right', side: 'right', pos: { top: '63%', right: '0%' }, angle: 13 }
    ],
    'freezing': [
      { file: 'freezing_beanie.svg',             body: 'head',        side: 'right', pos: { top: '0%',  right: '0%' }, angle: 333 },
      { file: 'freezing_turtleneck-sweater.svg', body: 'torso',       side: 'left',  pos: { top: '34%', left: '0%' }, angle: 209 },
      { file: 'freezing_boyfriend-jeans.svg',    body: 'legs',        side: 'left',  pos: { top: '74%', left: '0%' }, angle: 194 },
      { file: 'freezing_coat.svg',               body: 'torso-right', side: 'right', pos: { top: '63%', right: '0%' }, angle: 13 }
    ],
    'very-cold': [
      { file: 'very-cold_beanie.svg', body: 'head',  side: 'right', pos: { top: '0%',  right: '0%' }, angle: 340 },
      { file: 'very-cold_coat.svg',   body: 'torso', side: 'left',  pos: { top: '25%', left: '0%' }, angle: 216 },
      { file: 'very-cold_jeans.svg',  body: 'legs',  side: 'left',  pos: { top: '78%', left: '0%' }, angle: 189 }
    ]
  };

  /* Condition → icon-pair definition. Used by hero (54/46 px desktop, 48/40 mobile) and
     the slider's card circle (24 px) when active. */
  const CONDITION_ICON = {
    'Sunny':               { primary: 'fa-sun',                 primaryColor: '#F97316', isPair: false },
    'Mostly Sunny':        { primary: 'fa-sun',                 primaryColor: '#F97316', secondary: 'fa-cloud', secondaryColor: '#FB923C', isPair: true,  pairOpacity: 0.6 },
    'Partly Cloudy':       { primary: 'fa-sun',                 primaryColor: '#F97316', secondary: 'fa-cloud', secondaryColor: '#FB923C', isPair: true,  pairOpacity: 0.6 },
    'Cloudy':              { primary: 'fa-cloud',               primaryColor: '#FB923C', isPair: false },
    'Overcast':            { primary: 'fa-cloud',               primaryColor: '#FB923C', isPair: false },
    'Clear Night':         { primary: 'fa-moon',                primaryColor: '#A78BFA', isPair: false },
    'Partly Cloudy Night': { primary: 'fa-moon',                primaryColor: '#A78BFA', secondary: 'fa-cloud', secondaryColor: '#94A3B8', isPair: true,  pairOpacity: 0.6 },
    'Drizzle':             { primary: 'fa-cloud-rain',          primaryColor: '#60A5FA', isPair: false },
    'Heavy Rain':          { primary: 'fa-cloud-showers-heavy', primaryColor: '#60A5FA', isPair: false },
    'Thunderstorm':        { primary: 'fa-cloud-bolt',          primaryColor: '#FB923C', isPair: false },
    'Hail':                { primary: 'fa-cloud-meatball',      primaryColor: '#60A5FA', isPair: false },
    'Fog':                 { primary: 'fa-smog',                primaryColor: '#94A3B8', isPair: false },
    'Snow':                { primary: 'fa-snowflake',           primaryColor: '#BAE6FD', isPair: false },
    'Blizzard':            { primary: 'fa-snowflake',           primaryColor: '#BAE6FD', secondary: 'fa-wind',  secondaryColor: '#94A3B8', isPair: true,  pairOpacity: 0.8 },
    'Sleet':               { primary: 'fa-cloud-rain',          primaryColor: '#93C5FD', isPair: false },
    'Windy':               { primary: 'fa-wind',                primaryColor: '#94A3B8', isPair: false }
  };

  /* === Derived helpers === */

  const AQI_NUMERIC = { 'Good': 22, 'Fair': 51, 'Moderate': 101, 'Poor': 151, 'Very Poor': 201 };
  const AQI_DESCRIPTION = {
    'Good': 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
    'Fair': 'Air quality is acceptable for most people.',
    'Moderate': 'Sensitive groups may experience health effects from air pollution.',
    'Poor': 'Everyone may begin to experience health effects.',
    'Very Poor': 'Health alert — everyone may experience more serious effects.'
  };

  const MOON_ILLUM = {
    'Full Moon': 100, 'Waning Gibbous': 80, 'Last Quarter': 50, 'Waning Crescent': 20,
    'New Moon': 0, 'Waxing Crescent': 20, 'First Quarter': 50, 'Waxing Gibbous': 80
  };

  function visibilityLabel(km) {
    if (km >= 20) return { label: 'Perfectly Clear', tip: "It's a beautiful day for flying or driving." };
    if (km >= 10) return { label: 'Clear', tip: 'Good day for driving or flying.' };
    if (km >= 5)  return { label: 'Hazy', tip: 'Caution advised for drivers.' };
    if (km >= 1)  return { label: 'Poor', tip: 'Drive carefully — limited visibility.' };
    return { label: 'Very Poor', tip: 'Avoid travel if possible.' };
  }

  function parseHHMM(str) {
    if (!str) return null;
    const [h, m] = str.split(':').map(Number);
    return h * 60 + m;
  }
  function formatRelative(mins, abs) {
    if (mins < 0) return abs ? 'Before sunrise' : 'After sunset';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0 && m === 0) return 'Right now';
    if (h === 0) return abs ? `${m}m ago` : `In ${m}m`;
    if (m === 0) return abs ? `${h}h ago` : `In ${h}h`;
    return abs ? `${h}h ${m}m ago` : `In ${h}h ${m}m`;
  }
  function sunCycleRelative(record, activeHour) {
    const now = (activeHour ?? 15) * 60;
    const sunriseMins = parseHHMM(record.sunrise);
    const sunsetMins = parseHHMM(record.sunset);
    const elapsedSinceSunrise = now - sunriseMins;
    const remainingToSunset = sunsetMins - now;
    return {
      sunriseRelative: elapsedSinceSunrise < 0 ? 'Before sunrise' : formatRelative(elapsedSinceSunrise, true),
      sunsetRelative: remainingToSunset < 0 ? 'After sunset' : formatRelative(remainingToSunset, false)
    };
  }

  function pressureTrend(activeRecord, prevRecord) {
    if (!prevRecord) return 'Stable';
    const diff = activeRecord.pressure - prevRecord.pressure;
    if (diff > 2) return 'Rising';
    if (diff < -2) return 'Falling';
    return 'Stable';
  }
  /* Map a pressure value (typical sea-level 970–1040 hPa) to a 0–1 progress-bar position. */
  function pressureBarFraction(hPa) {
    return Math.max(0, Math.min(1, (hPa - 970) / 70));
  }
  /* Map an AQI numeric value to a 0–1 progress-bar position (AQI scale 0–300). */
  function aqiBarFraction(label) {
    return Math.min(1, AQI_NUMERIC[label] / 300);
  }

  function formatTemp(value) {
    if (value < 0) return '−' + Math.abs(value) + '°';
    return value + '°';
  }
  function formatHour(hour) {
    return String(hour).padStart(2, '0') + ':00';
  }

  /* Next Full Moon countdown (days from today) given today's phase + the 10-day schedule. */
  function nextFullMoon(activeDayIndex) {
    const days = window.SkyDress.data.daily;
    const startIndex = activeDayIndex == null ? 0 : activeDayIndex;
    for (let i = startIndex + 1; i < days.length; i++) {
      if (days[i].moonPhase === 'Full Moon') return i - startIndex;
    }
    return 8; // matches the mock "In 3 days" range; from Today (Full) → +8 (Full) = 8 days
  }

  window.SkyDress.data = {
    CITIES_LIST,
    INITIAL_PILLS: ['Lviv', 'Kyiv', 'Odesa'],
    hourly,
    daily,
    OUTFIT_BY_FEELS_LIKE,
    OUTFIT_LEVELS,
    outfitByFeelsLikeWithOffset,
    MASCOT_FILENAME,
    OUTFIT_CLOTHING,
    CONDITION_ICON,
    AQI_NUMERIC,
    AQI_DESCRIPTION,
    MOON_ILLUM,
    visibilityLabel,
    sunCycleRelative,
    pressureTrend,
    pressureBarFraction,
    aqiBarFraction,
    formatTemp,
    formatHour,
    nextFullMoon
  };
})();
