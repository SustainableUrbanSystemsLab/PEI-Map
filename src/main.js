import './styles.css';

// ════════════════════════ CONFIG ════════════════════════
const token = import.meta.env.VITE_MAPBOX_TOKEN || '';
if (!token) {
    const loader = document.getElementById('ld');
    if (loader) {
        loader.innerHTML = '<p style="padding:16px;max-width:360px;text-align:center;color:#fca5a5">Missing VITE_MAPBOX_TOKEN. Add it in your .env file.</p>';
    }
    throw new Error('Missing VITE_MAPBOX_TOKEN');
}
mapboxgl.accessToken = token;

const DEFAULT_VIEW = { center: [-98.35, 39.5], zoom: 3.8 };
const TS = {
    '2013': { url: 'mapbox://mdewitt33.8hxsrcd4', id: 'mdewitt33.8hxsrcd4', sl: null },
    '2017': { url: 'mapbox://mdewitt33.bg9qdffy', id: 'mdewitt33.bg9qdffy', sl: null },
    '2022': { url: 'mapbox://mdewitt33.4yj7jlgm', id: 'mdewitt33.4yj7jlgm', sl: null },
};

const BASES = {
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
    streets: 'mapbox://styles/mapbox/streets-v12',
};

const PEI_GRAD = [0, '#d73027', 0.25, '#fc8d59', 0.5, '#ffffbf', 0.75, '#91cf60', 1, '#1a9850'];
const DIFF_GRAD = [-0.5, '#1a9850', -0.1, '#91cf60', 0, '#ffffbf', 0.1, '#fc8d59', 0.5, '#d73027'];
const PEI_LABELS = {
    PEI_original: 'PEI Original', PEI_new: 'PEI New', PEI_combined: 'PEI Combined',
    CDI: 'Commercial Density', IDI: 'Intersection Density', LDI: 'Land Use Diversity', PDI: 'Population Density',
    RSI: 'Road Safety Index', GSI: 'Green Space Index', BI: 'Bike Infrastructure', PTAL: 'Public Transit Access'
};
const STATE_FIPS_NAMES = {
    '01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas', '06': 'California', '08': 'Colorado',
    '09': 'Connecticut', '10': 'Delaware', '11': 'District of Columbia', '12': 'Florida', '13': 'Georgia',
    '15': 'Hawaii', '16': 'Idaho', '17': 'Illinois', '18': 'Indiana', '19': 'Iowa', '20': 'Kansas',
    '21': 'Kentucky', '22': 'Louisiana', '23': 'Maine', '24': 'Maryland', '25': 'Massachusetts',
    '26': 'Michigan', '27': 'Minnesota', '28': 'Mississippi', '29': 'Missouri', '30': 'Montana',
    '31': 'Nebraska', '32': 'Nevada', '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico',
    '36': 'New York', '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio', '40': 'Oklahoma',
    '41': 'Oregon', '42': 'Pennsylvania', '44': 'Rhode Island', '45': 'South Carolina', '46': 'South Dakota',
    '47': 'Tennessee', '48': 'Texas', '49': 'Utah', '50': 'Vermont', '51': 'Virginia', '53': 'Washington',
    '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming', '60': 'American Samoa', '66': 'Guam',
    '69': 'Northern Mariana Islands', '72': 'Puerto Rico', '78': 'U.S. Virgin Islands'
};

// ════════════════════════ STATE ════════════════════════
const colorSchemeMq = window.matchMedia('(prefers-color-scheme: dark)');
let year = '2013', mode = 'single', base = colorSchemeMq.matches ? 'dark' : 'light', opacity = 0.8;
let cmpObj = null, bMap = null, aMap = null, pSwipeYear = '2013';
let statsTimer = null;
let autoThemeBase = true;
let themeMode = 'auto';
let popupState = null;
const popup = new mapboxgl.Popup({ closeButton: true, closeOnClick: false, maxWidth: '320px' });
const mobileMq = window.matchMedia('(max-width: 980px)');
const bodyEl = document.body;
const rootEl = document.documentElement;
const sidebarEl = document.getElementById('sb');
const sidebarToggleBtn = document.getElementById('sb-toggle');
const sidebarCloseBtn = document.getElementById('sb-close');
const sidebarBackdrop = document.getElementById('sb-backdrop');
const resetViewBtn = document.getElementById('reset-view');
const statsNoteEl = document.getElementById('stats-note');
const THEME_STORAGE_KEY = 'pei-theme-mode';

function showLoaderMessage(message) {
    const loader = document.getElementById('ld');
    if (!loader) return;
    loader.innerHTML = `<p style="padding:16px;max-width:360px;text-align:center;color:#fca5a5">${message}</p>`;
    loader.classList.remove('gone');
}

function resetStats(message = 'Current viewport') {
    statsNoteEl.textContent = message;
    document.getElementById('s-n').textContent = '-';
    document.getElementById('s-mean').textContent = '-';
    document.getElementById('s-min').textContent = '-';
    document.getElementById('s-max').textContent = '-';
}

// ⚡ Bolt: Cache normalized keys for Mapbox feature properties using WeakMap
// Prevents expensive O(N*M) string allocation and regex executions when querying the same object repeatedly.
const normalizedPropsCache = new WeakMap();

function getPropValue(props, keys) {
    if (!props || typeof props !== 'object') return null;

    let normalizedKeys = null;

    for (const key of keys) {
        // Fast path: try exact match first for this specific key
        const val = props[key];
        if (val != null && `${val}`.trim() !== '') return `${val}`.trim();

        // Slow path: normalized matching
        if (!normalizedKeys) {
            normalizedKeys = normalizedPropsCache.get(props);
            if (!normalizedKeys) {
                normalizedKeys = [];
                for (const [propKey, propValue] of Object.entries(props)) {
                    if (propValue != null && `${propValue}`.trim() !== '') {
                        normalizedKeys.push([
                            propKey.toLowerCase().replace(/[^a-z0-9]/g, ''),
                            `${propValue}`.trim()
                        ]);
                    }
                }
                normalizedPropsCache.set(props, normalizedKeys);
            }
        }

        const targetKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        for (let i = 0; i < normalizedKeys.length; i++) {
            if (normalizedKeys[i][0] === targetKey) {
                return normalizedKeys[i][1];
            }
        }
    }
    return null;
}

function getStateName(props) {
    const explicitState = getPropValue(props, ['STATE_NAME', 'STATE', 'STATENAME', 'STUSPS', 'STATE_ABBR', 'STATEABBR']);
    if (explicitState) return explicitState;
    const geoid = getPropValue(props, ['GEOID']);
    if (geoid && geoid.length >= 2) return STATE_FIPS_NAMES[geoid.slice(0, 2)] || null;
    return null;
}

function getCountyName(props) {
    const explicitCounty = getPropValue(props, ['NAMELSADCO', 'COUNTY_NAME', 'COUNTYNAME', 'COUNTY_NAM', 'COUNTY', 'COUNTYNAMELSAD']);
    if (explicitCounty) return explicitCounty;
    const countyFips = getPropValue(props, ['COUNTYFP', 'COUNTYFP20', 'COUNTYFP10']);
    if (countyFips) return `County FIPS ${countyFips}`;
    const geoid = getPropValue(props, ['GEOID']);
    if (geoid && geoid.length >= 5) return `County FIPS ${geoid.slice(2, 5)}`;
    return null;
}

function getNumericProp(props, keys) {
    const value = getPropValue(props, keys);
    if (value == null) return null;
    const num = Number(String(value).replace(/,/g, ''));
    return Number.isFinite(num) ? num : null;
}

function getAreaKm2(props) {
    const areaKm2 = getNumericProp(props, ['Polygon Area', 'POLYGON_AREA', 'POLYGONAREA', 'AREA_KM2', 'AREAKM2', 'SQKM']);
    if (areaKm2 != null) return areaKm2;
    const areaM2 = getNumericProp(props, ['ALAND', 'AREA_M2', 'AREAM2', 'SHAPE_AREA', 'Shape_Area']);
    if (areaM2 != null) return areaM2 / 1000000;
    return null;
}

function getFirstAvailable(sources, getter) {
    for (const source of sources) {
        if (!source) continue;
        const value = getter(source);
        if (value != null && value !== '') return value;
    }
    return null;
}

function buildPopupHtml(state, activeYear) {
    const yrs = ['2013', '2017', '2022'];
    const peis = ['PEI_original', 'PEI_new', 'PEI_combined'];
    const selectedYear = yrs.includes(activeYear) ? activeYear : state.defaultYear;
    const p = state.yearData[selectedYear] || state.primaryProps || {};
    const f = (v) => (v != null && !isNaN(v)) ? (+v).toFixed(3) : '—';
    const n = (v) => (v != null) ? (+v).toLocaleString() : '—';
    const bar = (label, val) => {
        const num = +val || 0;
        const col = lerp3('#d73027', '#ffffbf', '#1a9850', num);
        return `<div class="pbar-row"><div class="pbar-h"><span class="pk">${label}</span><span class="pv">${f(val)}</span></div><div class="pbar-bg"><div class="pbar-f" style="width:${(num * 100).toFixed(1)}%;background:${col}"></div></div></div>`;
    };
    let tlRows = '';
    yrs.forEach((yr) => {
        const d = state.yearData[yr];
        const vals = peis.map((pc) => {
            const v = d ? +d[pc] : null;
            const col = d ? lerp3('#d73027', '#ffffbf', '#1a9850', v || 0) : '#666';
            return `<td><span style="background:${col};color:#000;padding:1px 5px;border-radius:3px;font-size:9px;font-weight:600">${d && v != null ? v.toFixed(2) : '—'}</span></td>`;
        }).join('');
        tlRows += `<tr><td class="tl-yr"><b>${yr}</b></td>${vals}</tr>`;
    });
    const yearTabs = yrs.map((yr) => `<button class="ptab${yr === selectedYear ? ' on' : ''}" type="button" aria-pressed="${yr === selectedYear}" onclick="setPopupYear('${yr}')">${yr}</button>`).join('');
    const demographicsMissing = state.population == null && state.commercial == null && state.intersections == null && state.areaKm2 == null;
    return `
  <div class="ph">
    <div class="pid">GEOID: ${state.geoid || '—'}</div>
    <div class="ploc">${state.countyName}, ${state.stateName}</div>
  </div>
  <div class="pb">
    <div class="ptabs">${yearTabs}</div>
    <div class="pst">PEI Scores — ${selectedYear}</div>
    ${bar('PEI Original', p.PEI_original)}
    ${bar('PEI New', p.PEI_new)}
    ${bar('PEI Combined', p.PEI_combined)}
    <div class="pst" style="margin-top:10px">3-Year Timeline</div>
    <table class="tl-table">
      <thead><tr><th></th><th>Original</th><th>New</th><th>Combined</th></tr></thead>
      <tbody>${tlRows}</tbody>
    </table>
    <div class="pst">Indices (${selectedYear}, Normalized)</div>
    <div class="pgr">
      <div class="pr"><span class="pk">CDI</span><span class="pv">${f(p.CDI)}</span></div>
      <div class="pr"><span class="pk">IDI</span><span class="pv">${f(p.IDI)}</span></div>
      <div class="pr"><span class="pk">LDI</span><span class="pv">${f(p.LDI)}</span></div>
      <div class="pr"><span class="pk">PDI</span><span class="pv">${f(p.PDI)}</span></div>
      <div class="pr"><span class="pk">RSI</span><span class="pv">${f(p.RSI)}</span></div>
      <div class="pr"><span class="pk">GSI</span><span class="pv">${f(p.GSI)}</span></div>
      <div class="pr"><span class="pk">BI</span><span class="pv">${f(p.BI)}</span></div>
      <div class="pr"><span class="pk">PTAL</span><span class="pv">${f(p.PTAL)}</span></div>
    </div>
    <div class="pst">Demographics</div>
    ${demographicsMissing ? '<div class="pd-note">Not available in the published Mapbox tilesets.</div>' : `
    <div class="pgr">
      <div class="pr"><span class="pk">Population</span><span class="pv">${n(state.population)}</span></div>
      <div class="pr"><span class="pk">Commercial</span><span class="pv">${n(state.commercial)}</span></div>
      <div class="pr"><span class="pk">Intersections</span><span class="pv">${n(state.intersections)}</span></div>
      <div class="pr"><span class="pk">Area (km2)</span><span class="pv">${state.areaKm2 != null ? state.areaKm2.toFixed(1) : '-'}</span></div>
    </div>`}
  </div>`;
}

function setPopupYear(nextYear) {
    if (!popupState || !popup.isOpen()) return;
    popupState.activeYear = nextYear;
    popup.setHTML(buildPopupHtml(popupState, nextYear));
}

function getSystemBase() {
    return colorSchemeMq.matches ? 'dark' : 'light';
}

function syncBaseButtons() {
    const autoBtn = document.getElementById('b-auto');
    if (autoBtn) {
        const isOn = autoThemeBase && (base === 'light' || base === 'dark');
        autoBtn.classList.toggle('on', isOn);
        autoBtn.setAttribute('aria-pressed', isOn);
    }
    ['light', 'dark'].forEach((x) => {
        const btn = document.getElementById('b-' + x);
        if (btn) {
            const isOn = !autoThemeBase && x === base;
            btn.classList.toggle('on', isOn);
            btn.setAttribute('aria-pressed', isOn);
        }
    });
    ['satellite', 'streets'].forEach((x) => {
        const btn = document.getElementById('b-' + x);
        if (btn) {
            const isOn = x === base;
            btn.classList.toggle('on', isOn);
            btn.setAttribute('aria-pressed', isOn);
        }
    });
}

function syncThemeButtons() {
    ['auto', 'light', 'dark'].forEach((x) => {
        const btn = document.getElementById('theme-' + x);
        if (btn) {
            const isOn = x === themeMode;
            btn.classList.toggle('on', isOn);
            btn.setAttribute('aria-pressed', isOn);
        }
    });
}

function setThemeMode(mode) {
    themeMode = ['auto', 'light', 'dark'].includes(mode) ? mode : 'auto';
    if (themeMode === 'auto') rootEl.removeAttribute('data-theme');
    else rootEl.setAttribute('data-theme', themeMode);
    try {
        localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch (error) {
        console.warn('Unable to save theme preference.', error);
    }
    syncThemeButtons();
}

try {
    const storedThemeMode = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedThemeMode) themeMode = storedThemeMode;
} catch (error) {
    console.warn('Unable to read theme preference.', error);
}

if (themeMode === 'light' || themeMode === 'dark') {
    base = themeMode;
    autoThemeBase = false;
} else if (themeMode === 'auto') {
    base = getSystemBase();
    autoThemeBase = true;
}

syncBaseButtons();
setThemeMode(themeMode);

function setSidebarOpen(open) {
    bodyEl.classList.toggle('sb-open', !!open);
}

function closeSidebarIfMobile() {
    if (mobileMq.matches) setSidebarOpen(false);
}

sidebarToggleBtn?.addEventListener('click', () => setSidebarOpen(!bodyEl.classList.contains('sb-open')));
sidebarCloseBtn?.addEventListener('click', () => setSidebarOpen(false));
sidebarBackdrop?.addEventListener('click', () => setSidebarOpen(false));
sidebarEl?.addEventListener('click', (e) => {
    const target = e.target;
    if (mobileMq.matches && target instanceof Element && target.closest('button.btn')) setSidebarOpen(false);
});
sidebarEl?.addEventListener('change', (e) => {
    const target = e.target;
    if (mobileMq.matches && target instanceof Element && target.tagName === 'SELECT') setSidebarOpen(false);
});
window.addEventListener('resize', () => { if (!mobileMq.matches) setSidebarOpen(false); });
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setSidebarOpen(false);
    if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.querySelector('.mapboxgl-ctrl-geocoder--input');
        if (searchInput) {
            searchInput.focus();
        }
    }
});
resetViewBtn?.addEventListener('click', () => {
    map.easeTo({ center: DEFAULT_VIEW.center, zoom: DEFAULT_VIEW.zoom, duration: 900 });
    popup.remove();
    if (map.getLayer('tracts-hover')) map.setFilter('tracts-hover', ['==', 'GEOID', '']);
});

// ════════════════════════ SOURCE LAYER DETECTION ════════════════════════
async function detectSourceLayers() {
    // ⚡ Bolt: Fetch Mapbox tileset metadata in parallel instead of sequentially
    // Reduces initial map render time by eliminating network waterfall
    const fetchPromises = Object.entries(TS).map(async ([yr, ts]) => {
        try {
            const r = await fetch(`https://api.mapbox.com/v4/${ts.id}.json?access_token=${mapboxgl.accessToken}`);
            if (!r.ok) throw new Error(`Metadata request failed (${r.status})`);
            const meta = await r.json();
            const layers = meta.vector_layers || [];
            if (layers.length > 0) { ts.sl = layers[0].id; console.log(`✅ ${yr} → "${ts.sl}"`); }
            else console.warn(`❌ ${yr}: no vector_layers`, meta);
        } catch (e) { console.error(`❌ ${yr}:`, e); }
    });
    await Promise.all(fetchPromises);
}

// ════════════════════════ MAIN MAP ════════════════════════
const map = new mapboxgl.Map({ container: 'map', style: BASES[base], center: DEFAULT_VIEW.center, zoom: DEFAULT_VIEW.zoom, minZoom: 2 });
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

// Add Geocoder
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false,
    placeholder: 'Search address or place... (Press /)'
});
map.addControl(geocoder, 'top-left');

// Add Scale Control
map.addControl(new mapboxgl.ScaleControl({ maxWidth: 200, unit: 'imperial' }), 'bottom-left');
map.on('click', closeSidebarIfMobile);
colorSchemeMq.addEventListener('change', () => {
    if (themeMode === 'auto') setThemeMode('auto');
    if (autoThemeBase && (base === 'light' || base === 'dark')) {
        setBase(getSystemBase(), true);
    }
});

map.on('load', async () => {
    await detectSourceLayers();
    if (Object.values(TS).some(ts => !ts.sl)) {
        console.error('Source layer detection failed');
        showLoaderMessage('Unable to load one or more PEI layers. Check the Mapbox token and tileset access.');
        return;
    }

    // Add active year layer
    addLayers(map, year);

    // Add background (opacity-0) layers for all years — needed for cross-year popup timeline
    addBackgroundLayers(map);

    map.on('idle', updateStats);
    map.on('click', 'tracts-fill', onTractClick);
    
    // Cursor hint logic
    map.on('mouseenter', 'tracts-fill', () => map.getCanvas().style.cursor = 'pointer');
    map.on('mouseleave', 'tracts-fill', () => map.getCanvas().style.cursor = '');

    // Clear highlight when popup is genuinely closed (using a small timeout to avoid race conditions when switching tracts)
    popup.on('close', () => {
        setTimeout(() => {
            if (!popup.isOpen() && map.getLayer('tracts-hover')) {
                map.setFilter('tracts-hover', ['==', 'GEOID', '']);
            }
        }, 50);
    });

    updateLayer(); updateLegend();
    document.getElementById('ld').classList.add('gone');
    resetStats();
});

// ════════════════════════ LAYER MANAGEMENT ════════════════════════
function addLayers(m, yr) {
    const ts = TS[yr];
    if (!ts.sl) return;
    ['tracts-fill', 'tracts-line', 'tracts-hover'].forEach(id => { if (m.getLayer(id)) m.removeLayer(id); });
    if (m.getSource('src')) m.removeSource('src');
    m.addSource('src', { type: 'vector', url: ts.url });
    m.addLayer({
        id: 'tracts-fill', type: 'fill', source: 'src', 'source-layer': ts.sl,
        paint: { 'fill-color': peiExpr('PEI_original'), 'fill-opacity': opacity }
    });
    m.addLayer({
        id: 'tracts-line', type: 'line', source: 'src', 'source-layer': ts.sl,
        paint: { 'line-color': '#000', 'line-opacity': 0.07, 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0, 8, 0.5] }
    });
    m.addLayer({
        id: 'tracts-hover', type: 'line', source: 'src', 'source-layer': ts.sl,
        paint: { 'line-color': '#000', 'line-width': 2, 'line-opacity': 1 },
        filter: ['==', 'GEOID', '']
    });
}

function addBackgroundLayers(m) {
    Object.entries(TS).forEach(([yr, ts]) => {
        if (!ts.sl) return;
        if (!m.getSource(`src-${yr}`)) m.addSource(`src-${yr}`, { type: 'vector', url: ts.url });
        if (!m.getLayer(`bg-${yr}`)) m.addLayer({
            id: `bg-${yr}`, type: 'fill', source: `src-${yr}`, 'source-layer': ts.sl,
            paint: { 'fill-opacity': 0, 'fill-color': '#000' }
        });
    });
}

function peiExpr(col) { return ['interpolate', ['linear'], ['coalesce', ['get', col], 0], ...PEI_GRAD]; }
function diffExpr(c1, c2) { return ['interpolate', ['linear'], ['-', ['coalesce', ['get', c1], 0], ['coalesce', ['get', c2], 0]], ...DIFF_GRAD]; }

function updateLayer() {
    if (!map.getLayer('tracts-fill')) return;
    let expr;
    if (mode === 'single') expr = peiExpr(document.getElementById('pei-sel').value);
    else if (mode === 'diff') {
        const d = document.getElementById('diff-sel').value;
        expr = d === 'orig-new' ? diffExpr('PEI_original', 'PEI_new') : diffExpr('PEI_original', 'PEI_combined');
    }
    if (expr) map.setPaintProperty('tracts-fill', 'fill-color', expr);
    map.setPaintProperty('tracts-fill', 'fill-opacity', opacity);
    updateLegend(); updateStats();
}

// ════════════════════════ MODE ════════════════════════
function setMode(m) {
    mode = m;
    ['single', 'diff', 'pswipe', 'yswipe'].forEach(x => {
        const btn = document.getElementById('m-' + x);
        if (btn) {
            const isOn = x === m;
            btn.classList.toggle('on', isOn);
            btn.setAttribute('aria-pressed', isOn);
        }
    });
    document.getElementById('ctl-year').style.display = ['single', 'diff'].includes(m) ? '' : 'none';
    document.getElementById('ctl-single').style.display = m === 'single' ? '' : 'none';
    document.getElementById('ctl-diff').style.display = m === 'diff' ? '' : 'none';
    document.getElementById('ctl-pswipe').style.display = m === 'pswipe' ? '' : 'none';
    document.getElementById('ctl-yswipe').style.display = m === 'yswipe' ? '' : 'none';
    document.getElementById('map').style.display = ['pswipe', 'yswipe'].includes(m) ? 'none' : '';
    document.getElementById('cmp').style.display = ['pswipe', 'yswipe'].includes(m) ? 'block' : 'none';
    document.getElementById('stats').style.display = ['pswipe', 'yswipe'].includes(m) ? 'none' : '';
    if (['pswipe', 'yswipe'].includes(m)) { teardownSplit(); initSplit(); }
    else { teardownSplit(); updateLayer(); }
    updateLegend();
}

// ════════════════════════ YEAR ════════════════════════
function setYear(yr) {
    year = yr;
    ['2013', '2017', '2022'].forEach(y => {
        const btn = document.getElementById('y-' + y);
        if (btn) {
            const isOn = y === yr;
            btn.classList.toggle('on', isOn);
            btn.setAttribute('aria-pressed', isOn);
        }
    });
    addLayers(map, yr); updateLayer();
}
function setPSwipeYear(yr) {
    pSwipeYear = yr;
    ['2013', '2017', '2022'].forEach(y => {
        const btn = document.getElementById('ps-' + y);
        if (btn) {
            const isOn = y === yr;
            btn.classList.toggle('on', isOn);
            btn.setAttribute('aria-pressed', isOn);
        }
    });
    if (cmpObj) { teardownSplit(); initSplit(); }
}

// ════════════════════════ BASEMAP ════════════════════════
function setBase(b, fromAuto = false) {
    base = b;
    autoThemeBase = fromAuto && (b === 'light' || b === 'dark');
    if (!fromAuto) autoThemeBase = false;
    if (b === 'light' || b === 'dark') setThemeMode(fromAuto ? 'auto' : b);
    syncBaseButtons();
    if (['pswipe', 'yswipe'].includes(mode)) { teardownSplit(); initSplit(); return; }
    const c = map.getCenter(), z = map.getZoom();
    map.once('style.load', () => { addLayers(map, year); addBackgroundLayers(map); map.setCenter(c); map.setZoom(z); });
    map.setStyle(BASES[b]);
}

function setMapTheme(mode) {
    if (mode === 'auto') setBase(getSystemBase(), true);
    else setBase(mode);
}

// ════════════════════════ OPACITY ════════════════════════
function setOpacity(v) {
    opacity = v / 100;
    document.getElementById('opa-v').textContent = v + '%';
    if (map.getLayer('tracts-fill')) map.setPaintProperty('tracts-fill', 'fill-opacity', opacity);
    [bMap, aMap].forEach(m => { if (m?.getLayer('tracts-fill')) m.setPaintProperty('tracts-fill', 'fill-opacity', opacity); });
}

// ════════════════════════ SPLIT / SWIPE ════════════════════════
function teardownSplit() {
    if (bMap) { try { bMap.remove(); } catch (e) { } }
    if (aMap) { try { aMap.remove(); } catch (e) { } }
    cmpObj = null; bMap = null; aMap = null;
    document.getElementById('cmp').innerHTML = '<div id="before-map"></div><div id="after-map"></div>';
}
function initSplit() {
    const c = map.getCenter(), z = map.getZoom(), s = BASES[base];
    bMap = new mapboxgl.Map({ container: 'before-map', style: s, center: c, zoom: z });
    aMap = new mapboxgl.Map({ container: 'after-map', style: s, center: c, zoom: z });
    let bl = false, al = false;
    function tryInit() {
        if (!bl || !al) return;
        if (mode === 'pswipe') {
            addSplitLayerByVersion(bMap, TS[pSwipeYear], 'left-pei', 'before-map');
            addSplitLayerByVersion(aMap, TS[pSwipeYear], 'right-pei', 'after-map');
        } else { // yswipe
            const lyr = document.getElementById('left-yr').value;
            const ryr = document.getElementById('right-yr').value;
            const pei = document.getElementById('yswipe-pei').value;
            addSplitLayerByYear(bMap, TS[lyr], pei, lyr, 'before-map');
            addSplitLayerByYear(aMap, TS[ryr], pei, ryr, 'after-map');
        }
        cmpObj = new mapboxgl.Compare(bMap, aMap, '#cmp', {});
    }
    bMap.on('load', () => { bl = true; tryInit(); });
    aMap.on('load', () => { al = true; tryInit(); });
}
function addSplitLabel(containerId, text) {
    const el = document.createElement('div');
    el.className = 'cmp-year-label';
    el.textContent = text;
    document.getElementById(containerId).appendChild(el);
}
function addSplitLayerByVersion(m, ts, selId, containerId) {
    const col = document.getElementById(selId).value;
    m.addSource('src', { type: 'vector', url: ts.url });
    m.addLayer({ id: 'tracts-fill', type: 'fill', source: 'src', 'source-layer': ts.sl, paint: { 'fill-color': peiExpr(col), 'fill-opacity': opacity } });
    m.addLayer({ id: 'tracts-line', type: 'line', source: 'src', 'source-layer': ts.sl, paint: { 'line-color': '#000', 'line-opacity': 0.07, 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0, 8, 0.5] } });
    addSplitLabel(containerId, PEI_LABELS[col] || col);
}
function addSplitLayerByYear(m, ts, peiCol, yr, containerId) {
    m.addSource('src', { type: 'vector', url: ts.url });
    m.addLayer({ id: 'tracts-fill', type: 'fill', source: 'src', 'source-layer': ts.sl, paint: { 'fill-color': peiExpr(peiCol), 'fill-opacity': opacity } });
    m.addLayer({ id: 'tracts-line', type: 'line', source: 'src', 'source-layer': ts.sl, paint: { 'line-color': '#000', 'line-opacity': 0.07, 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0, 8, 0.5] } });
    addSplitLabel(containerId, yr);
}
function updateSplit() {
    if (!bMap || !aMap) return;
    if (mode === 'pswipe') {
        const lc = document.getElementById('left-pei').value;
        const rc = document.getElementById('right-pei').value;
        if (bMap.getLayer('tracts-fill')) bMap.setPaintProperty('tracts-fill', 'fill-color', peiExpr(lc));
        if (aMap.getLayer('tracts-fill')) aMap.setPaintProperty('tracts-fill', 'fill-color', peiExpr(rc));
        const leftLabel = document.querySelector('#before-map .cmp-year-label');
        const rightLabel = document.querySelector('#after-map .cmp-year-label');
        if (leftLabel) leftLabel.textContent = PEI_LABELS[lc] || lc;
        if (rightLabel) rightLabel.textContent = PEI_LABELS[rc] || rc;
    } else { teardownSplit(); initSplit(); }
}

// ════════════════════════ STATS ════════════════════════
function updateStats() {
    clearTimeout(statsTimer);
    statsTimer = setTimeout(() => {
        if (!map.getLayer('tracts-fill')) return;
        const feats = map.queryRenderedFeatures({ layers: ['tracts-fill'] });
        if (!feats.length) {
            resetStats('No tracts visible in viewport');
            return;
        }
        const col = mode === 'single' ? document.getElementById('pei-sel').value : 'PEI_original';
        let count = 0;
        let sum = 0;
        let min = Infinity;
        let max = -Infinity;

        // ⚡ Bolt: Use a Set to track unique IDs (GEOID) to avoid duplicate arithmetic operations
        // and artificially skewed stats when a single feature crosses Mapbox vector tile boundaries
        const seen = new Set();

        // ⚡ Bolt: Single pass O(n) loop to calculate stats without intermediate arrays
        // Avoids "Maximum call stack size exceeded" on Math.min(...vals) with large feature counts
        for (let i = 0; i < feats.length; i++) {
            const feat = feats[i];
            const geoid = feat.properties.GEOID;

            if (geoid && !seen.has(geoid)) {
                seen.add(geoid);
                const val = +feat.properties[col];
                if (!isNaN(val)) {
                    count++;
                    sum += val;
                    if (val < min) min = val;
                    if (val > max) max = val;
                }
            }
        }

        if (count === 0) {
            resetStats('No PEI values available');
            return;
        }

        const mean = sum / count;
        statsNoteEl.textContent = 'Current viewport';
        document.getElementById('s-n').textContent = feats.length.toLocaleString();
        document.getElementById('s-mean').textContent = mean.toFixed(3);
        document.getElementById('s-min').textContent = min.toFixed(3);
        document.getElementById('s-max').textContent = max.toFixed(3);
    }, 350);
}

// ════════════════════════ LEGEND ════════════════════════
function updateLegend() {
    const bar = document.getElementById('leg-b'), labs = document.getElementById('leg-l'), ttl = document.getElementById('leg-t');
    if (mode === 'single') {
        ttl.textContent = PEI_LABELS[document.getElementById('pei-sel').value] || 'PEI Score';
        bar.style.background = 'linear-gradient(to right,#d73027,#fc8d59,#ffffbf,#91cf60,#1a9850)';
        labs.innerHTML = '<span>0.0</span><span>0.25</span><span>0.5</span><span>0.75</span><span>1.0</span>';
    } else if (mode === 'diff') {
        const d = document.getElementById('diff-sel').value;
        ttl.textContent = d === 'orig-new' ? 'Orig − New' : 'Orig − Combined';
        bar.style.background = 'linear-gradient(to right,#1a9850,#91cf60,#ffffbf,#fc8d59,#d73027)';
        labs.innerHTML = '<span>−0.5</span><span>0</span><span>+0.5</span>';
    } else {
        ttl.textContent = mode === 'yswipe' ? 'Year Comparison' : 'PEI Version Compare';
        bar.style.background = 'linear-gradient(to right,#d73027,#fc8d59,#ffffbf,#91cf60,#1a9850)';
        labs.innerHTML = '<span>0.0</span><span>0.5</span><span>1.0</span>';
    }
}

// ════════════════════════ POPUP WITH 3-YEAR TIMELINE ════════════════════════
function onTractClick(e) {
    const geoid = e.features[0].properties.GEOID;

    if (map.getLayer('tracts-hover')) {
        map.setFilter('tracts-hover', ['==', 'GEOID', geoid]);
    }

    const allLayerIds = ['bg-2013', 'bg-2017', 'bg-2022'].filter(id => map.getLayer(id));
    const allFeats = map.queryRenderedFeatures(e.point, { layers: allLayerIds });
    const yearData = {};
    allFeats.forEach((feature) => {
        if (feature.properties.GEOID !== geoid) return;
        const yr = feature.layer.id.replace('bg-', '');
        if (!yearData[yr]) yearData[yr] = feature.properties;
    });

    const p = yearData[year] || e.features[0].properties;
    const propertySources = [yearData[year], e.features[0].properties, yearData['2013'], yearData['2017'], yearData['2022']];
    popupState = {
        geoid,
        yearData,
        primaryProps: p,
        countyName: getFirstAvailable(propertySources, getCountyName) || '-',
        stateName: getFirstAvailable(propertySources, getStateName) || '-',
        population: getFirstAvailable(propertySources, (source) => getNumericProp(source, ['Population Count', 'POPULATION_COUNT', 'POPULATIONCOUNT', 'POPULATION', 'TOTPOP', 'POP'])),
        commercial: getFirstAvailable(propertySources, (source) => getNumericProp(source, ['Commercial Count', 'COMMERCIAL_COUNT', 'COMMERCIALCOUNT', 'COMMERCIAL', 'COMM_COUNT'])),
        intersections: getFirstAvailable(propertySources, (source) => getNumericProp(source, ['Intersection Count', 'INTERSECTION_COUNT', 'INTERSECTIONCOUNT', 'INTERSECTIONS'])),
        areaKm2: getFirstAvailable(propertySources, getAreaKm2),
        defaultYear: year,
        activeYear: year
    };
    popup.setLngLat(e.lngLat).setHTML(buildPopupHtml(popupState, year)).addTo(map);
}

function lerp3(c0, cMid, c1, t) {
    let a, b, tt;
    if (t <= 0.5) { a = c0; b = cMid; tt = t * 2; } else { a = cMid; b = c1; tt = (t - 0.5) * 2; }
    const h = s => parseInt(s.slice(1), 16), ah = h(a), bh = h(b);
    const r = Math.round(((ah >> 16) & 255) + (((bh >> 16) & 255) - ((ah >> 16) & 255)) * tt);
    const g = Math.round(((ah >> 8) & 255) + (((bh >> 8) & 255) - ((ah >> 8) & 255)) * tt);
    const bl = Math.round((ah & 255) + ((bh & 255) - (ah & 255)) * tt);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}
Object.assign(window, { setMode, setYear, updateLayer, setPSwipeYear, updateSplit, setBase, setMapTheme, setOpacity, setThemeMode, setPopupYear });
    


