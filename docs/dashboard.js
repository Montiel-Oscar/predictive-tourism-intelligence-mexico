/* ── CONFIG ─────────────────────────────────────────────────────────────
   El CSV se carga desde la misma URL de GitHub Pages (misma raíz del repo).
   No necesita raw.githubusercontent.com — funciona directamente.          */

// URL absoluta — raw.githubusercontent.com con refs/heads/main
const CSV_PATH = 'https://raw.githubusercontent.com/Montiel-Oscar/predictive-tourism-intelligence-mexico/refs/heads/main/models/xgboost/predicciones_xgb_mejorado.csv';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun',
               'Jul','Ago','Sep','Oct','Nov','Dic'];

/* ── MAPEO PAÍS → REGIÓN (el CSV no tiene columna Región) ─────────── */
const REGION_MAP = {
  'estados unidos':'america del norte','canada':'america del norte',
  'alemania':'europa','francia':'europa','espana':'europa',
  'reino unido':'europa','italia':'europa','paises bajos':'europa',
  'suiza':'europa','austria':'europa','belgica':'europa',
  'suecia':'europa','noruega':'europa','dinamarca':'europa',
  'portugal':'europa','rusia':'europa','polonia':'europa',
  'checa, rep.':'europa','eslovaquia':'europa','hungria':'europa',
  'argentina':'america del sur','brasil':'america del sur',
  'colombia':'america del sur','chile':'america del sur',
  'peru':'america del sur','venezuela':'america del sur',
  'cuba':'centroamerica y caribe','costa rica':'centroamerica y caribe',
  'guatemala':'centroamerica y caribe','panama':'centroamerica y caribe',
  'japon':'asia','china':'asia','corea del sur':'asia',
  'india':'asia','australia':'oceania','nueva zelanda':'oceania',
  'israel':'medio oriente y africa','sudafrica':'medio oriente y africa',
  'egipto':'medio oriente y africa',
};
const getRegion = pais => REGION_MAP[pais] || 'otros';
const FALLBACK = (() => {
  const raw = [
    [2023,1,221806,211469,4.7],[2023,2,213190,202658,4.9],[2023,3,260371,220319,15.4],
    [2023,4,205558,204613,0.5],[2023,5,205572,200603,2.4],[2023,6,259565,213495,17.7],
    [2023,7,268271,215754,19.6],[2023,8,195684,175189,10.5],[2023,9,131970,123998,6.0],
    [2023,10,154433,145952,5.5],[2023,11,199131,179398,9.9],[2023,12,262450,224757,14.4],
    [2024,1,228242,207950,8.9],[2024,2,248937,203569,18.2],[2024,3,302152,222517,26.4],
    [2024,4,207580,202235,2.6],[2024,5,262677,160798,38.8],[2024,6,295894,213642,27.8],
    [2024,7,278541,217001,22.1],[2024,8,203933,176860,13.3],[2024,9,141668,121698,14.1],
    [2024,10,177578,144356,18.7],[2024,11,213618,179577,15.9],[2024,12,271111,224821,17.1],
    [2025,1,243891,208542,14.5],[2025,2,247294,204881,17.2],[2025,3,327314,221834,32.2],
    [2025,4,240831,198714,17.5],[2025,5,244125,198796,18.6],[2025,6,290404,213669,26.4],
    [2025,7,295262,217712,26.3],[2025,8,199061,173026,13.1],[2025,9,130766,124610,4.7],
    [2025,10,182875,146039,20.1],[2025,11,216509,179137,17.3],[2025,12,268268,224625,16.3],
  ];
  return raw.map(([Ano,MesNum,Valor_Residencia,Prediccion_XGB_Mejorado,Error_pct])=>({
    Ano, MesNum,
    Aeropuerto:'cancun, q. roo',
    Pais:'estados unidos',
    Region:'america del norte',
    Sexo:'mujer',
    Valor_Residencia, Prediccion_XGB_Mejorado, Error_pct
  }));
})();

/* ── ESTADO GLOBAL ──────────────────────────────────────────────────── */
let ALL = [];
let segChart = null;
let currentTab = 'cty'; // 'cty' = país, 'reg' = región

/* ── UTILS ──────────────────────────────────────────────────────────── */
const fmtK = v => v >= 1e6 ? `${(v/1e6).toFixed(1)}M`
                            : v >= 1000 ? `${Math.round(v/1000)}k`
                            : `${Math.round(v)}`;

const uniq = arr => [...new Set(arr)].filter(Boolean).sort();

const errPct = (r, p) => r > 0 ? Math.abs((p - r) / r * 100) : 0;

const median = arr => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a,b) => a-b);
  const m = Math.floor(s.length/2);
  return s.length % 2 ? s[m] : (s[m-1]+s[m])/2;
};

/* ── COLORES CHART ──────────────────────────────────────────────────── */
Chart.defaults.color = '#3c4f65';
const C = {
  real: '#dae4f5', pred: '#4f8ef7',
  fill_real: 'rgba(218,228,245,.05)',
  fill_pred: 'rgba(79,142,247,.07)',
  grid: 'rgba(255,255,255,.04)', tick: '#3c4f65',
  green: '#22d68a', amber: '#f5a623', red: '#e85555'
};

/* ── FUNCIÓN DE TABS PAÍS / REGIÓN ──────────────────────────────────── */
window.switchTab = function(tab) {
  currentTab = tab;
  document.getElementById('tab-cty').classList.toggle('active', tab === 'cty');
  document.getElementById('tab-reg').classList.toggle('active', tab === 'reg');
  document.getElementById('s-cty').style.display = tab === 'cty' ? '' : 'none';
  document.getElementById('s-reg').style.display = tab === 'reg' ? '' : 'none';
  renderSegment();
};

/* ── CARGA DEL CSV ──────────────────────────────────────────────────── */
function setLoad(msg, state='loading') {
  const el = document.getElementById('load-bar');
  const msgEl = document.getElementById('load-msg');
  const spin = el.querySelector('.spin');
  msgEl.textContent = msg;
  el.className = 'load-bar ' + (state === 'loading' ? '' : state);
  if (spin) spin.style.display = state === 'loading' ? '' : 'none';
  if (state !== 'loading') {
    setTimeout(() => el.classList.add('hidden'), 4000);
  }
}

Papa.parse(CSV_PATH, {
  download: true,
  header: true,
  dynamicTyping: true,
  complete(result) {
    const rows = result.data.filter(d =>
      d.Aeropuerto && d.Valor_Residencia > 0 && d.Prediccion_XGB_Mejorado > 0
    );
    if (rows.length > 0) {
      ALL = rows;
      // Normalizar Año → Ano y calcular Region desde Pais
      ALL.forEach(d => {
        if (!d.Ano && d['Año']) d.Ano = d['Año'];
        d.Region = getRegion((d.Pais||'').toLowerCase());
      });
      setLoad(`✓ ${ALL.length.toLocaleString()} predicciones cargadas correctamente`, 'ok');
    } else {
      ALL = FALLBACK;
      setLoad('Datos embebidos — CSV no disponible en esta ruta', 'err');
    }
    boot();
  },
  error() {
    ALL = FALLBACK;
    setLoad('Datos embebidos — verifica la ruta del CSV en el repo', 'err');
    boot();
  }
});

/* ── BOOT ───────────────────────────────────────────────────────────── */
function boot() {
  const airports = uniq(ALL.map(d => d.Aeropuerto));
  const countries = uniq(ALL.map(d => d.Pais));
  const regions   = uniq(ALL.map(d => d.Region || ''));

  // Selector aeropuerto
  const sa = document.getElementById('s-air');
  sa.innerHTML = airports.map(a => {
    const lbl = a.split(',')[0].replace(/(^\w|\s\w)/g, c => c.toUpperCase());
    return `<option value="${a}">${lbl}</option>`;
  }).join('');
  if (airports.includes('cancun, q. roo')) sa.value = 'cancun, q. roo';

  // Selector país
  const sc = document.getElementById('s-cty');
  sc.innerHTML = '<option value="">Todos los países</option>' +
    countries.map(c => `<option value="${c}">${c}</option>`).join('');
  if (countries.includes('estados unidos')) sc.value = 'estados unidos';

  // Selector región
  const sr = document.getElementById('s-reg');
  sr.innerHTML = '<option value="">Todas las regiones</option>' +
    regions.map(r => `<option value="${r}">${r}</option>`).join('');

  // Eventos
  ['s-air','s-cty','s-reg','s-sex','s-yr'].forEach(id =>
    document.getElementById(id).addEventListener('change', renderSegment)
  );

  renderRanking();
  renderSegment();
  renderErrorMes();
  renderMonthly();
  renderCompTable();
}

/* ── RANKING ────────────────────────────────────────────────────────── */
function renderRanking() {
  const agg = {};
  ALL.filter(d => d.Ano >= 2024).forEach(d => {
    if (!agg[d.Aeropuerto]) agg[d.Aeropuerto] = 0;
    agg[d.Aeropuerto] += d.Prediccion_XGB_Mejorado;
  });

  const sorted = Object.entries(agg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  const mx = sorted[0][1];

  document.getElementById('rank-body').innerHTML = sorted.map(([a, v], i) => {
    const lbl = a.split(',')[0].replace(/(^\w|\s\w)/g, c => c.toUpperCase());
    const pct = Math.round(v / mx * 100);
    return `<div class="ri">
      <span class="rn">${i+1}</span>
      <div class="ri-info">
        <div class="rnm">${lbl}</div>
        <div class="rv">${fmtK(v)} predichos</div>
      </div>
      <div class="rbar"><div class="rfill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
}

/* ── EXPLORADOR ─────────────────────────────────────────────────────── */
function renderSegment() {
  const air = document.getElementById('s-air').value;
  const sex = document.getElementById('s-sex').value;
  const yr  = document.getElementById('s-yr').value;
  const cty = currentTab === 'cty' ? document.getElementById('s-cty').value : '';
  const reg = currentTab === 'reg' ? document.getElementById('s-reg').value : '';

  let f = ALL.filter(d => d.Aeropuerto === air);
  if (cty) f = f.filter(d => d.Pais === cty);
  if (reg) f = f.filter(d => (d.Region || '') === reg);
  if (sex) f = f.filter(d => d.Sexo === sex);
  if (yr !== 'all') f = f.filter(d => d.Ano == yr);

  // Agregar por mes
  const bm = {};
  f.forEach(d => {
    const k = `${d.Ano}-${String(d.MesNum).padStart(2,'0')}`;
    if (!bm[k]) bm[k] = {real:0, pred:0, ano:d.Ano, mes:d.MesNum};
    bm[k].real += d.Valor_Residencia;
    bm[k].pred += d.Prediccion_XGB_Mejorado;
  });
  const keys = Object.keys(bm).sort();

  if (!keys.length) {
    document.getElementById('seg-stats').innerHTML =
      `<div class="sc"><div class="sl">Resultado</div>
       <div style="font-size:12px;color:var(--t3);padding-top:4px">
         Sin datos para esta combinación</div></div>`;
    if (segChart) {
      segChart.data.labels = [];
      segChart.data.datasets.forEach(d => d.data = []);
      segChart.update();
    }
    return;
  }

  const lbls  = keys.map(k => `${MESES[bm[k].mes-1]} ${String(bm[k].ano).slice(-2)}`);
  const reals = keys.map(k => bm[k].real);
  const preds = keys.map(k => bm[k].pred);

  const tr   = reals.reduce((a,b) => a+b, 0);
  const tp   = preds.reduce((a,b) => a+b, 0);
  const errs = keys.filter(k => bm[k].real >= 50).map(k => errPct(bm[k].real, bm[k].pred));
  const mape = errs.length ? errs.reduce((a,b) => a+b, 0) / errs.length : 0;
  const ec   = mape < 15 ? C.green : mape < 20 ? C.amber : C.red;

  const airLbl  = air.split(',')[0].replace(/(^\w|\s\w)/g, c => c.toUpperCase());
  const origLbl = cty || (reg ? `región: ${reg}` : 'todos los países');
  const genLbl  = sex || 'ambos géneros';

  document.getElementById('seg-stats').innerHTML = `
    <div class="sc">
      <div class="sl">Segmento</div>
      <div style="font-size:11px;color:var(--t2);padding-top:2px">
        ${airLbl} · ${origLbl} · ${genLbl}
      </div>
    </div>
    <div class="sc"><div class="sl">Real total</div>
      <div class="sv" style="color:var(--t1)">${fmtK(tr)}</div></div>
    <div class="sc"><div class="sl">Predicho total</div>
      <div class="sv" style="color:var(--blue-l)">${fmtK(tp)}</div></div>
    <div class="sc"><div class="sl">MAPE negocio</div>
      <div class="sv" style="color:${ec}">${mape.toFixed(1)}%</div></div>
  `;

  const unidad = Math.max(...reals) > 5000 ? 1000 : 1;
  const ylabel = unidad === 1000 ? 'Miles de turistas' : 'Turistas';

  // Separadores visuales de año
  const annotations = {};
  if (yr === 'all') ['2024','2025'].forEach(y => {
    const i = keys.findIndex(k => k.startsWith(y));
    if (i > 0) annotations[`y${y}`] = {
      type:'line', xMin:i-.5, xMax:i-.5,
      borderColor:'rgba(255,255,255,.07)', borderWidth:1, borderDash:[4,3]
    };
  });

  const datasets = [
    {
      label: 'Real',
      data: reals.map(v => +(v/unidad).toFixed(1)),
      borderColor: C.real, backgroundColor: C.fill_real,
      borderWidth: 2, pointRadius: 3, pointHoverRadius: 5,
      fill: true, tension: .3
    },
    {
      label: 'Predicción XGBoost',
      data: preds.map(v => +(v/unidad).toFixed(1)),
      borderColor: C.pred, backgroundColor: C.fill_pred,
      borderWidth: 2, pointRadius: 3, pointHoverRadius: 5,
      borderDash: [5,3], fill: true, tension: .3
    },
  ];

  const opts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: {display:true, position:'top',
        labels:{color:C.tick, font:{size:10}, boxWidth:10, boxHeight:10, padding:12}},
      tooltip: {backgroundColor:'#1c2432', borderColor:C.grid, borderWidth:1,
        titleColor:C.real, bodyColor:C.tick, padding:9},
      annotation: {annotations}
    },
    scales: {
      x: {grid:{color:C.grid}, ticks:{color:C.tick, font:{size:9}, autoSkip:false, maxRotation:45, maxTicksLimit:36}},
      y: {grid:{color:C.grid}, ticks:{color:C.tick, font:{size:9}},
          title:{display:true, text:ylabel, color:C.tick, font:{size:9}}}
    }
  };

  if (segChart) {
    segChart.data = {labels: lbls, datasets};
    segChart.options.plugins.annotation = {annotations};
    segChart.options.scales.y.title.text = ylabel;
    segChart.update('active');
  } else {
    segChart = new Chart(document.getElementById('seg-chart'), {
      type: 'line', data: {labels: lbls, datasets}, options: opts
    });
  }
}

/* ── ERROR POR MES ──────────────────────────────────────────────────── */
function renderErrorMes() {
  const f = ALL.filter(d => d.Ano === 2024 && d.Valor_Residencia >= 50);
  const byMes = {};
  f.forEach(d => {
    if (!byMes[d.MesNum]) byMes[d.MesNum] = [];
    byMes[d.MesNum].push(errPct(d.Valor_Residencia, d.Prediccion_XGB_Mejorado));
  });

  const errs = Array.from({length:12}, (_, i) => {
    const vs = byMes[i+1] || [];
    return vs.length ? +median(vs).toFixed(1) : 0;
  });

  new Chart(document.getElementById('error-mes-chart'), {
    type: 'bar',
    data: {
      labels: MESES,
      datasets: [{
        data: errs,
        backgroundColor: errs.map(v => v > 15 ? 'rgba(232,85,85,.5)' : 'rgba(34,214,138,.4)'),
        borderColor: errs.map(v => v > 15 ? C.red : C.green),
        borderWidth: 1, borderRadius: 3
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: {display:false},
        tooltip: {backgroundColor:'#1c2432', bodyColor:C.tick, padding:8,
          callbacks: {label: c => `Error: ${c.parsed.y}%`}}
      },
      scales: {
        x: {grid:{color:C.grid}, ticks:{color:C.tick, font:{size:9}}},
        y: {grid:{color:C.grid}, ticks:{color:C.tick, font:{size:9},
              callback: v => `${v}%`}, suggestedMin:0}
      }
    }
  });
}

/* ── DISTRIBUCIÓN MENSUAL ───────────────────────────────────────────── */
function renderMonthly() {
  const byMes = {real:{}, pred:{}};
  ALL.filter(d => d.Ano >= 2024).forEach(d => {
    byMes.real[d.MesNum] = (byMes.real[d.MesNum] || 0) + d.Valor_Residencia;
    byMes.pred[d.MesNum] = (byMes.pred[d.MesNum] || 0) + d.Prediccion_XGB_Mejorado;
  });

  const r = Array.from({length:12}, (_, i) => Math.round((byMes.real[i+1]||0)/1000));
  const p = Array.from({length:12}, (_, i) => Math.round((byMes.pred[i+1]||0)/1000));

  new Chart(document.getElementById('monthly-chart'), {
    type: 'bar',
    data: {
      labels: MESES,
      datasets: [
        {label:'Real', data:r,
         backgroundColor:'rgba(218,228,245,.18)', borderColor:'rgba(218,228,245,.35)',
         borderWidth:1, borderRadius:2},
        {label:'Predicho', data:p,
         backgroundColor:'rgba(79,142,247,.4)', borderColor:'rgba(79,142,247,.7)',
         borderWidth:1, borderRadius:2}
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      barPercentage: .7, categoryPercentage: .75,
      plugins: {
        legend: {display:true, position:'top',
          labels:{color:C.tick, font:{size:10}, boxWidth:10, boxHeight:10, padding:12}},
        tooltip: {backgroundColor:'#1c2432', bodyColor:C.tick, padding:8}
      },
      scales: {
        x: {grid:{color:C.grid}, ticks:{color:C.tick, font:{size:9}}},
        y: {grid:{color:C.grid}, ticks:{color:C.tick, font:{size:9},
              callback: v => fmtK(v*1000)}}
      }
    }
  });
}

/* ── TABLA COMPARATIVA ──────────────────────────────────────────────── */
function renderCompTable() {
  const CMP = [
    {anio:'2023 · 1 año',  xr:0.9857, xm:68.8,  xg:32.3, xn:13.8, rr:0.9686, rm:93.8,  rg:37.6, rn:19.0},
    {anio:'2024 · 2 años', xr:0.9619, xm:96.5,  xg:36.0, xn:16.8, rr:0.9833, rm:77.3,  rg:37.8, rn:19.0},
    {anio:'2025 · 3 años', xr:0.9610, xm:100.9, xg:36.0, xn:16.9, rr:0.9824, rm:78.1,  rg:37.2, rn:17.6},
  ];

  const tagFor = v => {
    if (v < 15) return '<span class="tag tag-g">Dentro ±15%</span>';
    if (v < 20) return '<span class="tag tag-a">Cerca</span>';
    return '<span class="tag tag-r">Fuera</span>';
  };

  document.getElementById('cmp-tbody').innerHTML = CMP.map(r => `
    <tr>
      <td rowspan="2" style="font-weight:600;border-right:1px solid var(--b0)">${r.anio}</td>
      <td style="color:var(--blue-l);font-weight:600">XGBoost</td>
      <td>${r.xr}</td><td>${r.xm}</td><td>${r.xg}%</td>
      <td style="color:${r.xn<15?C.green:C.amber};font-weight:700">${r.xn}%</td>
      <td>${tagFor(r.xn)}</td>
    </tr>
    <tr>
      <td style="color:var(--t3)">Random Forest</td>
      <td style="color:var(--t3)">${r.rr}</td>
      <td style="color:var(--t3)">${r.rm}</td>
      <td style="color:var(--t3)">${r.rg}%</td>
      <td style="color:${r.rn<15?C.green:r.rn<20?C.amber:C.red}">${r.rn}%</td>
      <td>${tagFor(r.rn)}</td>
    </tr>`).join('');
}
