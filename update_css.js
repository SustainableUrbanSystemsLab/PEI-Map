import fs from 'fs';

let css = fs.readFileSync('src/styles.css', 'utf8');

// The replacement logic matching original intent
css = css.replace(/:root\s*\{[^}]+\}/, `:root {
    color-scheme: dark;
    --sb: 285px;
    --bg: #0d1117;
    --panel: #161b22;
    --card: #21262d;
    --bdr: #30363d;
    --acc: #2f81f7;
    --txt: #c9d1d9;
    --mut: #8b949e;
    --panel-grad-start: #161b22;
    --panel-grad-end: #0d1117;
    --control-bg: #21262d;
    --floating-bg: #161b22;
    --chip-bg: #21262d;
    --geocoder-bg: #161b22;
    --geocoder-hover: #30363d;
    --geocoder-active: #0d1117;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
}`);

css = css.replace(/:root\[data-theme='light'\]\s*\{[^}]+\}/, `:root[data-theme='light'] {
    color-scheme: light;
    --bg: #f6f8fa;
    --panel: #ffffff;
    --card: #f3f4f6;
    --bdr: #d0d7de;
    --acc: #0969da;
    --txt: #24292f;
    --mut: #57606a;
    --panel-grad-start: #ffffff;
    --panel-grad-end: #f6f8fa;
    --control-bg: #f3f4f6;
    --floating-bg: #ffffff;
    --chip-bg: #f3f4f6;
    --geocoder-bg: #ffffff;
    --geocoder-hover: #f3f4f6;
    --geocoder-active: #e1e4e8;
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
}`);

css = css.replace(/:root:not\(\[data-theme='light'\]\):not\(\[data-theme='dark'\]\)\s*\{[^}]+\}/, `:root:not([data-theme='light']):not([data-theme='dark']) {
    color-scheme: light;
    --bg: #f6f8fa;
    --panel: #ffffff;
    --card: #f3f4f6;
    --bdr: #d0d7de;
    --acc: #0969da;
    --txt: #24292f;
    --mut: #57606a;
    --panel-grad-start: #ffffff;
    --panel-grad-end: #f6f8fa;
    --control-bg: #f3f4f6;
    --floating-bg: #ffffff;
    --chip-bg: #f3f4f6;
    --geocoder-bg: #ffffff;
    --geocoder-hover: #f3f4f6;
    --geocoder-active: #e1e4e8;
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
}`);

css = css.replace(/#sb\s*\{[^}]+\}/, `#sb {
    width: var(--sb);
    min-width: var(--sb);
    background: var(--panel);
    border-right: 1px solid var(--bdr);
    box-shadow: var(--shadow-md);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    z-index: 10;
}`);

css = css.replace(/\.br\s*\{[^}]+\}/, `.br {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    background: var(--card);
    padding: 4px;
    border-radius: 8px;
    border: 1px solid var(--bdr);
}`);

css = css.replace(/\.btn\s*\{[^}]+\}/, `.btn {
    flex: 1;
    padding: 6px 8px;
    border: none;
    background: transparent;
    color: var(--mut);
    border-radius: 6px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;
    transition: all .2s ease;
    text-align: center;
    font-family: inherit;
    white-space: nowrap;
}`);

css = css.replace(/\.btn:hover\s*\{[^}]+\}/, `.btn:hover {
    color: var(--txt);
    background: var(--geocoder-hover);
}`);

css = css.replace(/\.btn\.on\s*\{[^}]+\}/, `.btn.on {
    background: var(--panel);
    color: var(--txt);
    font-weight: 700;
    box-shadow: var(--shadow-sm);
}`);

css = css.replace(/select\s*\{[^}]+\}/, `select {
    width: 100%;
    padding: 8px 10px;
    background: var(--card);
    border: 1px solid var(--bdr);
    border-radius: 8px;
    color: var(--txt);
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    outline: none;
    transition: all .2s ease;
}
select:hover {
    border-color: var(--mut);
}`);

css = css.replace(/select:focus\s*\{[^}]+\}/, `select:focus {
    border-color: var(--acc);
    box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.2);
}`);

css = css.replace(/input\[type=range\]\s*\{[^}]+\}/, `input[type=range] {
    flex: 1;
    -webkit-appearance: none;
    height: 4px;
    background: var(--bdr);
    border-radius: 2px;
    outline: none;
}`);

css = css.replace(/input\[type=range\]::-webkit-slider-thumb\s*\{[^}]+\}/, `input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: var(--acc);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    transition: transform .1s;
}
input[type=range]::-webkit-slider-thumb:hover {
    transform: scale(1.1);
}`);

css = css.replace(/\.fp\s*\{[^}]+\}/, `.fp {
    position: absolute;
    background: var(--floating-bg);
    border: 1px solid var(--bdr);
    border-radius: 12px;
    padding: 12px 14px;
    font-size: 12px;
    z-index: 5;
    box-shadow: var(--shadow-lg);
}`);

css = css.replace(/\.ptabs\s*\{[^}]+\}/, `.ptabs {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
    background: var(--card);
    padding: 4px;
    border-radius: 8px;
    border: 1px solid var(--bdr);
}`);

css = css.replace(/\.ptab\s*\{[^}]+\}/, `.ptab {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--mut);
    border-radius: 6px;
    padding: 6px 0;
    font-size: 10px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: all .2s ease;
}
.ptab:hover {
    color: var(--txt);
    background: var(--geocoder-hover);
}`);

css = css.replace(/\.ptab\.on\s*\{[^}]+\}/, `.ptab.on {
    background: var(--panel);
    color: var(--txt);
    box-shadow: var(--shadow-sm);
}`);

css = css.replace(/\.mapboxgl-popup-content\s*\{[^}]+\}/, `.mapboxgl-popup-content {
    background: var(--panel) !important;
    border: 1px solid var(--bdr) !important;
    border-radius: 12px !important;
    padding: 0 !important;
    color: var(--txt) !important;
    max-width: 320px;
    box-shadow: var(--shadow-lg) !important;
}`);

fs.writeFileSync('src/styles.css', css);
console.log('done via JS');
