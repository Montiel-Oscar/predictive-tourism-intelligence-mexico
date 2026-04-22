/* ── CSV ──────────────────────────────────────────────────────────── */
const CSV_URL = 'https://raw.githubusercontent.com/Montiel-Oscar/predictive-tourism-intelligence-mexico/refs/heads/main/models/xgboost/predicciones_xgb_mejorado.csv';
const MESES   = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

/* ── REGIÓN POR PAÍS ─────────────────────────────────────────────── */
const REGION = {
  'estados unidos':'América del Norte','canada':'América del Norte',
  'alemania':'Europa','francia':'Europa','espana':'Europa','reino unido':'Europa',
  'italia':'Europa','paises bajos (holanda)':'Europa','suiza':'Europa','austria':'Europa',
  'belgica':'Europa','suecia':'Europa','noruega':'Europa','dinamarca':'Europa',
  'portugal':'Europa','rusia':'Europa','polonia':'Europa','irlanda':'Europa',
  'checa, rep.':'Europa','eslovaquia':'Europa','hungria':'Europa','croacia':'Europa',
  'rumania':'Europa','ucrania':'Europa','finlandia':'Europa','grecia':'Europa',
  'turquia':'Europa',
  'argentina':'América del Sur','brasil':'América del Sur','colombia':'América del Sur',
  'chile':'América del Sur','peru':'América del Sur','venezuela':'América del Sur',
  'ecuador':'América del Sur','bolivia':'América del Sur','paraguay':'América del Sur',
  'uruguay':'América del Sur',
  'cuba':'Centroamérica','costa rica':'Centroamérica','guatemala':'Centroamérica',
  'panama':'Centroamérica','honduras':'Centroamérica','el salvador':'Centroamérica',
  'japon':'Asia','china':'Asia','corea del sur':'Asia','india':'Asia',
  'filipinas':'Asia','indonesia':'Asia','tailandia':'Asia','singapur':'Asia',
  'australia':'Oceanía','nueva zelandia':'Oceanía','nueva zelanda':'Oceanía',
  'israel':'Medio Oriente y África','sudafrica':'Medio Oriente y África',
  'egipto':'Medio Oriente y África','nigeria':'Medio Oriente y África',
};
const getRegion = p => REGION[(p||'').toLowerCase()] || 'Otros';

/* ── AEROPUERTO → ESTADO ──────────────────────────────────────────── */
const AERO_ESTADO = {
  'cancun, q. roo':'Quintana Roo',
  'cozumel, q. roo':'Quintana Roo',
  'a.i tulum felipe carrillo puerto, q. roo.':'Quintana Roo',
  'acapulco, gro.':'Guerrero',
  'zihuatanejo, gro.':'Guerrero',
  'ixtapa zihuatanejo, gro.':'Guerrero',
  'merida, yuc.':'Yucatán',
  'los cabos, b.c.s.':'Baja California Sur',
  'la paz, b.c.s.':'Baja California Sur',
  'loreto, b.c.s.':'Baja California Sur',
  'tijuana, b.c.':'Baja California',
  'mexicali, b.c.':'Baja California',
  'puerto vallarta, jal.':'Jalisco',
  'guadalajara, jal.':'Jalisco',
  'ciudad de mexico (aicm)':'CDMX',
  'ciudad de mexico (bia)':'CDMX',
  'mazatlan, sin.':'Sinaloa',
  'culiacan, sin.':'Sinaloa',
  'hermosillo, son.':'Sonora',
  'ciudad obregon, son.':'Sonora',
  'oaxaca, oax.':'Oaxaca',
  'huatulco, oax.':'Oaxaca',
  'puerto escondido, oax.':'Oaxaca',
  'veracruz, ver.':'Veracruz',
  'leon, gto.':'Guanajuato',
  'guanajuato, gto.':'Guanajuato',
  'monterrey, n.l.':'Nuevo León',
  'manzanillo, col.':'Colima',
  'colima, col.':'Colima',
  'tampico, tamps.':'Tamaulipas',
  'matamoros, tamps.':'Tamaulipas',
  'ciudad victoria, tamps.':'Tamaulipas',
  'chihuahua, chih.':'Chihuahua',
  'ciudad juarez, chih.':'Chihuahua',
  'aguascalientes, ags.':'Aguascalientes',
  'san luis potosi, s.l.p.':'San Luis Potosí',
  'durango, dgo.':'Durango',
  'zacatecas, zac.':'Zacatecas',
  'villahermosa, tab.':'Tabasco',
  'tuxtla gutierrez, chis.':'Chiapas',
  'tapachula, chis.':'Chiapas',
  'campeche, camp.':'Campeche',
  'queretaro, qro.':'Querétaro',
  'tepic, nay.':'Nayarit',
  'a.i. tepic amado nervo, nay.':'Nayarit',
  'torreon, coah.':'Coahuila',
  'saltillo, coah.':'Coahuila',
  'morelia, mich.':'Michoacán',
  'lazaro cardenas, mich.':'Michoacán',
  'cuernavaca, mor.':'Morelos',
  'toluca, edo. mex.':'Estado de México',
  'puebla, pue.':'Puebla',
  'xalapa, ver.':'Veracruz',
};
const getEstado = a => AERO_ESTADO[(a||'').toLowerCase()] || 'Otro';

/* ── PAÍS CSV NOMBRE → ISO NUMÉRICO (world-atlas IDs) ──────────────── */
const PAIS_ISO = {
  'estados unidos':840,'canada':124,'alemania':276,'reino unido':826,
  'francia':250,'espana':724,'italia':380,'paises bajos (holanda)':528,
  'suiza':756,'austria':40,'belgica':56,'suecia':752,'noruega':578,
  'dinamarca':208,'portugal':620,'rusia':643,'polonia':616,'irlanda':372,
  'checa, rep.':203,'eslovaquia':703,'hungria':348,'croacia':191,
  'rumania':642,'ucrania':804,'finlandia':246,'grecia':300,'turquia':792,
  'argentina':32,'brasil':76,'colombia':170,'chile':152,'peru':604,
  'venezuela':862,'ecuador':218,'bolivia':68,'paraguay':600,'uruguay':858,
  'cuba':192,'costa rica':188,'guatemala':320,'panama':591,'honduras':340,
  'el salvador':222,
  'japon':392,'china':156,'corea del sur':410,'india':356,
  'filipinas':608,'indonesia':360,'tailandia':764,'singapur':702,
  'australia':36,'nueva zelandia':554,'nueva zelanda':554,
  'israel':376,'sudafrica':710,'egipto':818,'nigeria':566,
  'mexico':484,
};

/* ── ESTADO GLOBAL ────────────────────────────────────────────────── */
let ALL = [], segChart = null, errChart = null, topPaisesChart = null;
let currentTab = 'cty';
Chart.defaults.color = '#7b93b0';
const C = {
  real:'#14243a', pred:'#1d58d8', fillR:'rgba(20,36,58,.04)', fillP:'rgba(29,88,216,.07)',
  grid:'rgba(0,0,0,.06)', tick:'#7b93b0',
  green:'#16a34a', amber:'#b45309', teal:'#0d9488', purple:'#6d28d9',
};

/* ── UTILS ──────────────────────────────────────────────────────────── */
const fmtK = v => v>=1e6?`${(v/1e6).toFixed(1)}M`:v>=1000?`${Math.round(v/1000)}k`:`${Math.round(v)}`;
const uniq = a => [...new Set(a)].filter(Boolean).sort();
const errPct = (r,p) => r>0?Math.abs((p-r)/r*100):0;
const median = a => { if(!a.length) return 0; const s=[...a].sort((x,y)=>x-y); const m=Math.floor(s.length/2); return s.length%2?s[m]:(s[m-1]+s[m])/2; };

/* ── NAV ────────────────────────────────────────────────────────────── */
window.navTo = function(btn) {
  document.querySelectorAll('.ntab').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.sec').forEach(s=>s.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(btn.dataset.sec).classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
  // Trigger maps lazy render on first view
  const sec = btn.dataset.sec;
  if(sec==='s-mexico' && !mexicoRendered) renderMexicoMap();
  if(sec==='s-origin' && !originRendered) { renderWorldMap(); renderCountryRank(); }
};

/* ── ORIGIN TAB ─────────────────────────────────────────────────────── */
window.switchOriginTab = function(tab) {
  currentTab = tab;
  document.getElementById('tab-cty').classList.toggle('active', tab==='cty');
  document.getElementById('tab-reg').classList.toggle('active', tab==='reg');
  document.getElementById('s-cty').style.display = tab==='cty'?'':'none';
  document.getElementById('s-reg').style.display = tab==='reg'?'':'none';
  renderSegment();
};

/* ── LOAD STATUS ────────────────────────────────────────────────────── */
function setLoad(msg, state='loading') {
  document.getElementById('load-dot').className = 'ldot ' + state;
  document.getElementById('load-msg').textContent = msg;
}

/* ── FETCH CSV ──────────────────────────────────────────────────────── */
async function loadCSV() {
  const urls = [CSV_URL, 'models/xgboost/predicciones_xgb_mejorado.csv'];
  for (const url of urls) {
    try {
      const res = await fetch(url, {mode:'cors',cache:'no-cache'});
      if (!res.ok) continue;
      const text = await res.text();
      const {data} = Papa.parse(text.trim(), {header:true,dynamicTyping:true,skipEmptyLines:true});
      const rows = data.filter(d => d.Aeropuerto && d.Valor_Residencia>0 && d.Prediccion_XGB_Mejorado>0);
      if (rows.length > 0) return rows;
    } catch(e) { console.warn(url, e.message); }
  }
  return null;
}

/* ── BOOT ────────────────────────────────────────────────────────────── */
loadCSV().then(rows => {
  if (rows) {
    ALL = rows.map(d => {
      if (!d.Ano && d['Año']) d.Ano = Number(d['Año']);
      d.Ano = Number(d.Ano); d.MesNum = Number(d.MesNum);
      d.Region = getRegion(d.Pais);
      d.Estado = getEstado(d.Aeropuerto);
      return d;
    });
    setLoad(`${ALL.length.toLocaleString()} predicciones cargadas`, 'ok');
    setTimeout(()=>document.getElementById('load-msg').style.opacity='0', 4000);
  } else {
    setLoad('Error al cargar CSV', 'err');
  }
  boot();
});

let mexicoRendered = false, originRendered = false;

function boot() {
  const airports  = uniq(ALL.map(d=>d.Aeropuerto));
  const countries = uniq(ALL.map(d=>d.Pais));
  const regions   = uniq(ALL.map(d=>d.Region));

  const sa = document.getElementById('s-air');
  sa.innerHTML = airports.map(a=>{
    const l = a.split(',')[0].replace(/(^\w|\s\w)/g,c=>c.toUpperCase());
    return `<option value="${a}">${l}</option>`;
  }).join('');
  if (airports.includes('cancun, q. roo')) sa.value='cancun, q. roo';

  document.getElementById('s-cty').innerHTML =
    '<option value="">Todos los países</option>' +
    countries.map(c=>`<option value="${c}">${c}</option>`).join('');
  document.getElementById('s-cty').value = countries.includes('estados unidos')?'estados unidos':'';

  document.getElementById('s-reg').innerHTML =
    '<option value="">Todas las regiones</option>' +
    regions.map(r=>`<option value="${r}">${r}</option>`).join('');

  ['s-air','s-cty','s-reg','s-sex','s-yr'].forEach(id=>
    document.getElementById(id).addEventListener('change',()=>{renderSegment();renderTopPaises();}));

  renderSeasonalChart();
  renderMiniRank();
  renderSegment();
  renderTopPaises();
  renderSeasonRegion();
  renderFullRanking();
}

/* ── CHART BASE OPTIONS ──────────────────────────────────────────────── */
const baseOpts = (ylabel='') => ({
  responsive:true, maintainAspectRatio:false,
  plugins:{
    legend:{display:false},
    tooltip:{backgroundColor:'#ffffff',borderColor:C.grid,borderWidth:1,titleColor:C.real,bodyColor:C.tick,padding:9}
  },
  scales:{
    x:{grid:{color:C.grid},ticks:{color:C.tick,font:{size:9},autoSkip:false,maxRotation:45}},
    y:{grid:{color:C.grid},ticks:{color:C.tick,font:{size:9}},
       title:{display:!!ylabel,text:ylabel,color:C.tick,font:{size:9}}}
  }
});

/* ── SEASONAL CHART (overview) ───────────────────────────────────────── */
function renderSeasonalChart() {
  const byM = {};
  ALL.filter(d=>d.Ano>=2024).forEach(d=>{
    byM[d.MesNum] = (byM[d.MesNum]||0) + d.Prediccion_XGB_Mejorado;
  });
  const vals = Array.from({length:12},(_,i)=>Math.round((byM[i+1]||0)/1000));
  new Chart(document.getElementById('seasonal-chart'),{
    type:'bar',
    data:{labels:MESES,datasets:[{data:vals,
      backgroundColor:vals.map(v=>{
        const mx=Math.max(...vals);
        const p=v/mx;
        return `rgba(29,88,216,${0.25+p*0.6})`;
      }),
      borderColor:'rgba(29,88,216,.5)',borderWidth:1,borderRadius:4}]},
    options:{...baseOpts('Miles de turistas'),
      plugins:{...baseOpts().plugins,
        tooltip:{...baseOpts().plugins.tooltip,
          callbacks:{label:c=>`${fmtK(c.parsed.y*1000)} turistas predichos`}}}}
  });
}

/* ── MINI RANK (overview) ────────────────────────────────────────────── */
function renderMiniRank() {
  const agg = {};
  ALL.filter(d=>d.Ano>=2024).forEach(d=>{
    agg[d.Aeropuerto] = (agg[d.Aeropuerto]||0)+d.Prediccion_XGB_Mejorado;
  });
  const top = Object.entries(agg).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const mx = top[0][1];
  document.getElementById('mini-rank').innerHTML = top.map(([a,v],i)=>{
    const l=a.split(',')[0].replace(/(^\w|\s\w)/g,c=>c.toUpperCase());
    return `<div class="ri">
      <span class="rn">${i+1}</span>
      <div class="ri-info"><div class="rnm">${l}</div><div class="rv">${fmtK(v)}</div></div>
      <div class="rbar"><div class="rfill" style="width:${Math.round(v/mx*100)}%"></div></div>
    </div>`;
  }).join('');
}

/* ── FULL RANKING ────────────────────────────────────────────────────── */
function renderFullRanking() {
  const agg = {};
  ALL.filter(d=>d.Ano>=2024).forEach(d=>{
    agg[d.Aeropuerto] = (agg[d.Aeropuerto]||0)+d.Prediccion_XGB_Mejorado;
  });
  const sorted = Object.entries(agg).sort((a,b)=>b[1]-a[1]).slice(0,20);
  const mx = sorted[0][1];
  document.getElementById('rank-body').innerHTML = sorted.map(([a,v],i)=>{
    const l=a.split(',')[0].replace(/(^\w|\s\w)/g,c=>c.toUpperCase());
    return `<div class="ri">
      <span class="rn">${i+1}</span>
      <div class="ri-info"><div class="rnm">${l}</div><div class="rv">${fmtK(v)} predichos</div></div>
      <div class="rbar"><div class="rfill" style="width:${Math.round(v/mx*100)}%"></div></div>
    </div>`;
  }).join('');
}

/* ── SEGMENT EXPLORER ────────────────────────────────────────────────── */
function getFilters() {
  return {
    air: document.getElementById('s-air').value,
    cty: currentTab==='cty'?document.getElementById('s-cty').value:'',
    reg: currentTab==='reg'?document.getElementById('s-reg').value:'',
    sex: document.getElementById('s-sex').value,
    yr:  document.getElementById('s-yr').value,
  };
}

function filterData(d, f) {
  if (d.Aeropuerto !== f.air) return false;
  if (f.cty && d.Pais !== f.cty) return false;
  if (f.reg && d.Region !== f.reg) return false;
  if (f.sex && d.Sexo !== f.sex) return false;
  if (f.yr !== 'all' && d.Ano != f.yr) return false;
  return true;
}

function renderSegment() {
  const f = getFilters();
  const filtered = ALL.filter(d=>filterData(d,f));

  const bm={};
  filtered.forEach(d=>{
    const k=`${d.Ano}-${String(d.MesNum).padStart(2,'0')}`;
    if(!bm[k]) bm[k]={real:0,pred:0,ano:d.Ano,mes:d.MesNum};
    bm[k].real+=d.Valor_Residencia;
    bm[k].pred+=d.Prediccion_XGB_Mejorado;
  });
  const keys=Object.keys(bm).sort();

  if (!keys.length) {
    document.getElementById('seg-stats').innerHTML =
      `<div class="sc"><div class="sl">Resultado</div><div style="font-size:11px;color:var(--t3);padding-top:3px">Sin datos para esta combinación</div></div>`;
    return;
  }

  const lbls  = keys.map(k=>`${MESES[bm[k].mes-1]} ${String(bm[k].ano).slice(-2)}`);
  const reals = keys.map(k=>bm[k].real);
  const preds = keys.map(k=>bm[k].pred);
  const tr=reals.reduce((a,b)=>a+b,0), tp=preds.reduce((a,b)=>a+b,0);
  const neg=keys.filter(k=>bm[k].real>=50);
  const mape=neg.length?neg.reduce((s,k)=>s+errPct(bm[k].real,bm[k].pred),0)/neg.length:0;
  const ec=mape<15?C.green:mape<20?C.amber:'#e85555';
  const al=f.air.split(',')[0].replace(/(^\w|\s\w)/g,c=>c.toUpperCase());
  const ol=f.cty||(f.reg?`Región: ${f.reg}`:'todos los países');
  const gl=f.sex||'ambos géneros';

  document.getElementById('seg-stats').innerHTML=`
    <div class="sc"><div class="sl">Segmento</div><div style="font-size:10px;color:var(--t2);padding-top:2px">${al} · ${ol} · ${gl}</div></div>
    <div class="sc"><div class="sl">Real total</div><div class="sv">${fmtK(tr)}</div></div>
    <div class="sc"><div class="sl">Predicho total</div><div class="sv" style="color:var(--blue-l)">${fmtK(tp)}</div></div>
    <div class="sc"><div class="sl">MAPE segmento</div><div class="sv" style="color:${ec}">${mape.toFixed(1)}%</div></div>
  `;

  const unidad=Math.max(...reals)>5000?1000:1;
  const ylabel=unidad===1000?'Miles':'Turistas';
  const annot={};
  if(f.yr==='all') ['2024','2025'].forEach(y=>{
    const i=keys.findIndex(k=>k.startsWith(y));
    if(i>0) annot[`y${y}`]={type:'line',xMin:i-.5,xMax:i-.5,borderColor:'rgba(0,0,0,.1)',borderWidth:1,borderDash:[4,3]};
  });
  const ds=[
    {label:'Real',data:reals.map(v=>+(v/unidad).toFixed(1)),borderColor:C.real,backgroundColor:C.fillR,borderWidth:2,pointRadius:3,fill:true,tension:.3},
    {label:'Predicción',data:preds.map(v=>+(v/unidad).toFixed(1)),borderColor:C.pred,backgroundColor:C.fillP,borderWidth:2,pointRadius:3,borderDash:[5,3],fill:true,tension:.3},
  ];
  const opts={...baseOpts(ylabel),plugins:{
    legend:{display:true,position:'top',labels:{color:C.tick,font:{size:10},boxWidth:10,boxHeight:10,padding:12}},
    tooltip:{...baseOpts().plugins.tooltip},
    annotation:{annotations:annot}
  }};

  if(segChart){ segChart.data={labels:lbls,datasets:ds}; segChart.options.plugins.annotation={annotations:annot}; segChart.options.scales.y.title.text=ylabel; segChart.update('active'); }
  else { segChart=new Chart(document.getElementById('seg-chart'),{type:'line',data:{labels:lbls,datasets:ds},options:opts}); }

  // Sync error chart with same filters
  renderErrorMes(f);
}

/* ── ERROR MES — synced with explorer ───────────────────────────────── */
function renderErrorMes(f) {
  if (!f) f=getFilters();
  const filtered = ALL.filter(d=>filterData(d,f) && d.Valor_Residencia>=50);
  const byM={};
  filtered.forEach(d=>{
    if(!byM[d.MesNum]) byM[d.MesNum]=[];
    byM[d.MesNum].push(errPct(d.Valor_Residencia,d.Prediccion_XGB_Mejorado));
  });
  const errs=Array.from({length:12},(_,i)=>byM[i+1]?+median(byM[i+1]).toFixed(1):null);

  // Update label
  const al=f.air.split(',')[0].replace(/(^\w|\s\w)/g,c=>c.toUpperCase());
  const ol=f.cty||(f.reg?`región ${f.reg}`:'todos los países');
  document.getElementById('error-seg-label').textContent = `${al} · ${ol} · registros ≥50 turistas`;

  const hasData = errs.some(v=>v!==null);
  const data = hasData ? errs.map(v=>v??0) : Array(12).fill(0);

  // Color: teal under 15%, amber over 15%
  const bgColors = data.map(v=>v>15?`rgba(125, 23, 185, 0.45)`:`rgba(13,148,136,.45)`);
  const bdColors = data.map(v=>v>15?'#8d1ec0':'#0d9488');

  if(errChart) {
    errChart.data.datasets[0].data=data;
    errChart.data.datasets[0].backgroundColor=bgColors;
    errChart.data.datasets[0].borderColor=bdColors;
    errChart.update('active');
  } else {
    errChart=new Chart(document.getElementById('error-mes-chart'),{
      type:'bar',
      data:{labels:MESES,datasets:[{data,backgroundColor:bgColors,borderColor:bdColors,borderWidth:1,borderRadius:3}]},
      options:{...baseOpts('%'),
        plugins:{...baseOpts().plugins,
          annotation:{annotations:{l15:{type:'line',yMin:15,yMax:15,borderColor:'rgba(0,0,0,.25)',borderWidth:1.5,borderDash:[4,4]}}}
        },
        scales:{x:{grid:{color:C.grid},ticks:{color:C.tick,font:{size:9}}},
                y:{grid:{color:C.grid},ticks:{color:C.tick,font:{size:9},callback:v=>`${v}%`},suggestedMin:0}}}
    });
  }
}

/* ── TOP PAÍSES — sincroniado con aeropuerto seleccionado ─────────────── */
function renderTopPaises() {
  const air = document.getElementById('s-air').value;
  const yr  = document.getElementById('s-yr').value;
  const f2  = ALL.filter(d=>d.Aeropuerto===air && (yr==='all'||d.Ano==yr) && d.Ano>=2024);
  const agg={};
  f2.forEach(d=>{ agg[d.Pais]=(agg[d.Pais]||0)+d.Prediccion_XGB_Mejorado; });
  const top=Object.entries(agg).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const lbls=top.map(([p])=>p.replace(/(^\w|\s\w)/g,c=>c.toUpperCase()));
  const vals=top.map(([,v])=>Math.round(v));
  const mx=Math.max(...vals);
  const bgc=vals.map(v=>`rgba(29,88,216,${0.3+0.55*(v/mx)})`);

  if(topPaisesChart){ topPaisesChart.data.labels=lbls; topPaisesChart.data.datasets[0].data=vals; topPaisesChart.data.datasets[0].backgroundColor=bgc; topPaisesChart.update('active'); }
  else {
    topPaisesChart=new Chart(document.getElementById('top-paises-chart'),{
      type:'bar',
      data:{labels:lbls,datasets:[{data:vals,backgroundColor:bgc,borderColor:'rgba(29,88,216,.5)',borderWidth:1,borderRadius:3}]},
      options:{...baseOpts(),indexAxis:'y',
        plugins:{...baseOpts().plugins,tooltip:{...baseOpts().plugins.tooltip,callbacks:{label:c=>`${fmtK(c.parsed.x)} predichos`}}},
        scales:{
          x:{grid:{color:C.grid},ticks:{color:C.tick,font:{size:9},callback:v=>fmtK(v)}},
          y:{grid:{color:'transparent'},ticks:{color:C.tick,font:{size:9}}}
        }}
    });
  }
}

/* ── ESTACIONALIDAD POR REGIÓN ───────────────────────────────────────── */
function renderSeasonRegion() {
  const regs=['América del Norte','Europa','América del Sur','Asia','Centroamérica'];
  const regColors={'América del Norte':'#1d58d8','Europa':'#6d28d9','América del Sur':'#0d9488','Asia':'#b45309','Centroamérica':'#c2410c'};
  const byRM={};
  ALL.filter(d=>d.Ano>=2024).forEach(d=>{
    if(!regs.includes(d.Region)) return;
    if(!byRM[d.Region]) byRM[d.Region]={};
    byRM[d.Region][d.MesNum]=(byRM[d.Region][d.MesNum]||0)+d.Prediccion_XGB_Mejorado;
  });
  const datasets=regs.map(r=>({
    label:r,
    data:Array.from({length:12},(_,i)=>Math.round((byRM[r]?.[i+1]||0)/1000)),
    borderColor:regColors[r]||C.tick,
    backgroundColor:'transparent',
    borderWidth:2,pointRadius:3,tension:.4
  }));
  new Chart(document.getElementById('season-region-chart'),{
    type:'line',data:{labels:MESES,datasets},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{display:true,position:'top',labels:{color:C.tick,font:{size:10},boxWidth:10,boxHeight:10,padding:14}},
        tooltip:{backgroundColor:'#ffffff',borderColor:C.grid,borderWidth:1,bodyColor:C.tick,padding:9}
      },
      scales:{
        x:{grid:{color:C.grid},ticks:{color:C.tick,font:{size:9}}},
        y:{grid:{color:C.grid},ticks:{color:C.tick,font:{size:9},callback:v=>`${fmtK(v*1000)}`}}
      }}
  });
}

/* ── MAPA MÉXICO (D3) ────────────────────────────────────────────────── */
function renderMexicoMap() {
  mexicoRendered = true;
  const stateVol={};
  ALL.filter(d=>d.Ano>=2024).forEach(d=>{
    const e=d.Estado;
    stateVol[e]=(stateVol[e]||0)+d.Prediccion_XGB_Mejorado;
  });

  const stateRank=Object.entries(stateVol).sort((a,b)=>b[1]-a[1]);
  const mx=stateRank[0]?.[1]||1;
  // Light theme: light blue-gray → strong blue
  const color=d3.scaleSequential([0,mx],d3.interpolate('#c8daf5','#0d3fa6'));

  document.getElementById('state-rank').innerHTML=stateRank.map(([s,v],i)=>`
    <div class="ri">
      <span class="rn">${i+1}</span>
      <div class="ri-info"><div class="rnm">${s}</div><div class="rv">${fmtK(v)} predichos</div></div>
      <div class="rbar"><div class="rfill" style="width:${Math.round(v/mx*100)}%"></div></div>
    </div>`).join('');

  // Normalize function: remove accents, lowercase, trim
  const norm = s => (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();

  // Aliases: topology name (normalized) → our state key
  const ALIAS = {
    'distrito federal':'CDMX',
    'ciudad de mexico':'CDMX',
    'ciudad de méxico':'CDMX',
    'veracruz de ignacio de la llave':'Veracruz',
    'michoacan de ocampo':'Michoacán',
    'coahuila de zaragoza':'Coahuila',
    'mexico':'Estado de México',  // Estado de México in topology
    'nuevo leon':'Nuevo León',
    'queretaro de arteaga':'Querétaro',
    'queretaro':'Querétaro',
    'san luis potosi':'San Luis Potosí',
    'yucatan':'Yucatán',
    'baja california sur':'Baja California Sur',
  };

  // Build normalized lookup from our stateVol keys
  const normVol={};
  Object.entries(stateVol).forEach(([s,v])=>{ normVol[norm(s)]=v; });

  function matchStateVol(topoName) {
    const n = norm(topoName);
    if (ALIAS[n] && normVol[norm(ALIAS[n])]) return normVol[norm(ALIAS[n])];
    if (normVol[n]) return normVol[n];
    return null;
  }
  function matchStateName(topoName) {
    const n = norm(topoName);
    if (ALIAS[n]) return ALIAS[n];
    const entry = Object.keys(stateVol).find(s=>norm(s)===n);
    return entry || topoName;
  }

  const TOPO_URL='https://cdn.jsdelivr.net/npm/datamaps@0.5.10/src/js/data/mex.topo.json';
  const wrap=document.getElementById('mexico-map');
  wrap.style.position='relative';

  const tip=document.createElement('div');
  tip.className='map-tip'; wrap.appendChild(tip);

  const W=wrap.clientWidth||800, H=wrap.clientHeight||450;
  const svg=d3.select(wrap).append('svg').attr('width',W).attr('height',H)
    .style('background','transparent');

  d3.json(TOPO_URL).then(topo=>{
    const key=Object.keys(topo.objects)[0];
    const features=topojson.feature(topo,topo.objects[key]).features;
    const proj=d3.geoMercator().fitSize([W-20,H-40],topojson.feature(topo,topo.objects[key]));
    const path=d3.geoPath(proj);

    svg.selectAll('path').data(features).join('path')
      .attr('d',path)
      .attr('fill',d=>{
        const nm=d.properties?.name||d.properties?.NAME||String(d.id||'');
        const v=matchStateVol(nm);
        return v?color(v):'#eef2f8';
      })
      .attr('stroke','rgba(0,0,0,.25)')
      .attr('stroke-width','1.0')
      .on('mousemove',(event,d)=>{
        const nm=d.properties?.name||d.properties?.NAME||String(d.id||'');
        const v=matchStateVol(nm);
        const label=matchStateName(nm);
        tip.style.display='block';
        tip.style.left=Math.min(event.offsetX+12,W-160)+'px';
        tip.style.top=Math.max(event.offsetY-8,8)+'px';
        tip.innerHTML=`<strong>${label}</strong><br>${v?fmtK(v)+' turistas predichos':'Sin vuelos directos internacionales'}`;
      })
      .on('mouseleave',()=>{ tip.style.display='none'; });

    // Legend
    const defs=svg.append('defs');
    const lg=defs.append('linearGradient').attr('id','mex-grad').attr('x1','0%').attr('x2','100%');
    lg.append('stop').attr('offset','0%').attr('stop-color','#dce8f8');
    lg.append('stop').attr('offset','100%').attr('stop-color','#1d58d8');
    const LW=160,LH=8,LX=W-190,LY=H-22;
    svg.append('rect').attr('x',LX).attr('y',LY).attr('width',LW).attr('height',LH).attr('rx',3).attr('fill','url(#mex-grad)').attr('stroke','rgba(0,0,0,.1)').attr('stroke-width','0.5');
    svg.append('text').attr('x',LX).attr('y',LY-5).attr('font-size',9).attr('fill',C.tick).text('Menor flujo');
    svg.append('text').attr('x',LX+LW).attr('y',LY-5).attr('font-size',9).attr('fill',C.tick).attr('text-anchor','end').text('Mayor flujo');
  }).catch(()=>{
    wrap.innerHTML='<div style="height:100%;display:flex;align-items:center;justify-content:center;color:var(--t3);font-size:11px">Mapa no disponible</div>';
  });
}

/* ── MAPA MUNDIAL (D3) ───────────────────────────────────────────────── */
function renderWorldMap() {
  originRendered = true;
  const paisVol={};
  ALL.filter(d=>d.Ano>=2024).forEach(d=>{
    const p=(d.Pais||'').toLowerCase();
    paisVol[p]=(paisVol[p]||0)+d.Prediccion_XGB_Mejorado;
  });

  const isoVol={};
  Object.entries(paisVol).forEach(([p,v])=>{
    const id=PAIS_ISO[p];
    if(id) isoVol[id]=v;
  });

  const mx=Math.max(...Object.values(isoVol),1);
  const color=d3.scaleSequential([0,mx],d3.interpolate('#e8e4f8','#6d28d9'));

  const wrap=document.getElementById('world-map');
  wrap.style.position='relative';
  const tip=document.createElement('div');
  tip.className='map-tip'; wrap.appendChild(tip);

  const W=wrap.clientWidth||1100,H=wrap.clientHeight||460;
  const svg=d3.select(wrap).append('svg').attr('width',W).attr('height',H).style('background','transparent');

  const proj=d3.geoNaturalEarth1().scale(W/6.4).translate([W/2,H/2]);
  const path=d3.geoPath(proj);

  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(world=>{
    const countries=topojson.feature(world,world.objects.countries);

    // graticule
    svg.append('path').datum(d3.geoGraticule()()).attr('d',path).attr('fill','none').attr('stroke','rgba(0,0,0,.04)').attr('stroke-width','0.5');

    svg.selectAll('path.country').data(countries.features).join('path')
      .attr('class','country').attr('d',path)
      .attr('fill',d=>{
        const id=+d.id;
        // Mexico gets a special neutral color
        if(id===484) return '#d4e4f5';
        return isoVol[id]?color(isoVol[id]):'#dde4ee';
      })
      .attr('stroke','rgba(0,0,0,.3)').attr('stroke-width','0.5')
      .on('mousemove',(event,d)=>{
        const id=+d.id;
        const v=isoVol[id];
        const nm=Object.entries(PAIS_ISO).find(([,n])=>n===id);
        if(!v&&id!==484) return;
        tip.style.display='block';
        tip.style.left=Math.min(event.offsetX+12,W-160)+'px';
        tip.style.top=Math.max(event.offsetY-8,8)+'px';
        tip.innerHTML=id===484?'<strong>México</strong><br>Destino'
          :`<strong>${nm?nm[0].replace(/(^\w|\s\w)/g,c=>c.toUpperCase()):'País'}</strong><br>${fmtK(v)} turistas predichos`;
      })
      .on('mouseleave',()=>{ tip.style.display='none'; });

    // Legend
    const defs=svg.append('defs');
    const lg=defs.append('linearGradient').attr('id','world-grad').attr('x1','0%').attr('x2','100%');
    lg.append('stop').attr('offset','0%').attr('stop-color','#e8e4f8');
    lg.append('stop').attr('offset','100%').attr('stop-color','#6d28d9');
    const LW=160,LH=8,LX=W-180,LY=H-30;
    svg.append('rect').attr('x',LX).attr('y',LY).attr('width',LW).attr('height',LH).attr('rx',3).attr('fill','url(#world-grad)');
    svg.append('text').attr('x',LX).attr('y',LY-4).attr('font-size',9).attr('fill',C.tick).text('Menor');
    svg.append('text').attr('x',LX+LW).attr('y',LY-4).attr('font-size',9).attr('fill',C.tick).attr('text-anchor','end').text('Mayor emisión');
  }).catch(()=>{
    wrap.innerHTML='<div style="height:100%;display:flex;align-items:center;justify-content:center;color:var(--t3);font-size:11px">Mapa no disponible</div>';
  });
}

/* ── COUNTRY RANK ────────────────────────────────────────────────────── */
function renderCountryRank() {
  const agg={};
  ALL.filter(d=>d.Ano>=2024).forEach(d=>{ agg[d.Pais]=(agg[d.Pais]||0)+d.Prediccion_XGB_Mejorado; });
  const top=Object.entries(agg).sort((a,b)=>b[1]-a[1]).slice(0,20);
  const lbls=top.map(([p])=>p.replace(/(^\w|\s\w)/g,c=>c.toUpperCase()));
  const vals=top.map(([,v])=>Math.round(v));
  const mx=Math.max(...vals);
  new Chart(document.getElementById('country-rank-chart'),{
    type:'bar',
    data:{labels:lbls,datasets:[{data:vals,
      backgroundColor:vals.map(v=>`rgba(109,40,217,${0.25+0.65*(v/mx)})`),
      borderColor:'rgba(109,40,217,.4)',borderWidth:1,borderRadius:3}]},
    options:{...baseOpts(),indexAxis:'y',
      plugins:{...baseOpts().plugins,
        tooltip:{...baseOpts().plugins.tooltip,callbacks:{label:c=>`${fmtK(c.parsed.x)} turistas predichos`}}},
      scales:{
        x:{grid:{color:C.grid},ticks:{color:C.tick,font:{size:9},callback:v=>fmtK(v)}},
        y:{grid:{color:'transparent'},ticks:{color:C.tick,font:{size:9}}}
      }}
  });
}
