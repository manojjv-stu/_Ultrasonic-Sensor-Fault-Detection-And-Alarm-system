// ════════════════════════════════════════════════════════════
// BACKEND — UNCHANGED SIMULATION LOGIC
// ════════════════════════════════════════════════════════════
var fault = 'none';
var seaState = 1;
var shipSpeed = 12;
var tick = 0;
var alarmCount = 0;
var faultOnset = null;

var seaLabels    = ['Calm','Light','Moderate','Rough','Storm'];
var seaBaseNoise  = [2, 8, 18, 32, 50];
var seaSigPenalty = [0, 4, 10, 20, 35];

var waveData  = Array(80).fill(0).map(function(){ return Math.sin(Math.random()*Math.PI)*0.1; });
var scoreData = Array(40).fill(0);
var sigData   = Array(40).fill(98);
var noiseData = Array(40).fill(2);

// CSV recording state
var csvRows      = [];
var isRecording  = false;
var recStartTime = null;
var recStartTick = 0;

var CSV_HEADER = [
  'timestamp_ist','elapsed_s','tick','signal_strength_pct',
  'echo_return_time_ms','measured_distance_m','noise_level_dB',
  'wave_amplitude','fault_score','system_status',
  'injected_fault','sea_state','sea_state_label','ship_speed_kn'
].join(',');

function startRecording() {
  csvRows = []; isRecording = true;
  recStartTime = new Date(); recStartTick = tick;
  document.getElementById('btn-rec').disabled  = true;
  document.getElementById('btn-stop').disabled = false;
  document.getElementById('btn-dl').disabled   = true;
  document.getElementById('btn-clr').disabled  = true;
  document.getElementById('rec-dot').classList.add('active');
  document.getElementById('rec-status').textContent = 'Recording…';
  document.getElementById('row-count').textContent   = '0';
  document.getElementById('rec-duration').textContent = '0 s';
  addAlarm('ok', 'CSV recording started');
}
function stopRecording() {
  isRecording = false;
  document.getElementById('btn-rec').disabled  = false;
  document.getElementById('btn-stop').disabled = true;
  document.getElementById('btn-dl').disabled   = csvRows.length === 0;
  document.getElementById('btn-clr').disabled  = csvRows.length === 0;
  document.getElementById('rec-dot').classList.remove('active');
  document.getElementById('rec-status').textContent = 'Stopped — ' + csvRows.length + ' rows ready';
  addAlarm('ok', 'Recording stopped — ' + csvRows.length + ' rows captured');
}
function clearRecording() {
  csvRows = [];
  document.getElementById('btn-dl').disabled   = true;
  document.getElementById('btn-clr').disabled  = true;
  document.getElementById('rec-status').textContent = 'Not recording';
  document.getElementById('row-count').textContent  = '0';
  document.getElementById('rec-duration').textContent = '0 s';
}
function toIST(date) {
  var pad2 = function(n){ return String(n).padStart(2,'0'); };
  var ist  = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.getUTCFullYear()
    + '-' + pad2(ist.getUTCMonth()+1)
    + '-' + pad2(ist.getUTCDate())
    + ' ' + pad2(ist.getUTCHours())
    + ':' + pad2(ist.getUTCMinutes())
    + ':' + pad2(ist.getUTCSeconds())
    + ' IST';
}
function downloadCSV() {
  if (csvRows.length === 0) return;
  var now = new Date();
  var meta = [
    '# Ultrasonic Sensor Fault Detection — Exported Data',
    '# Export timestamp: ' + toIST(now),
    '# Recording start:  ' + toIST(recStartTime),
    '# Total rows: ' + csvRows.length,
    '# Sample interval: 400 ms (2.5 Hz)',
    '# Columns: ' + CSV_HEADER.split(',').length,
    '#'
  ].join('\n');
  var lines = csvRows.map(function(r) {
    return [r.timestamp_ist,r.elapsed_s,r.tick,r.signal_strength_pct,
      r.echo_return_time_ms,r.measured_distance_m,r.noise_level_dB,
      r.wave_amplitude,r.fault_score,r.system_status,
      r.injected_fault,r.sea_state,r.sea_state_label,r.ship_speed_kn].join(',');
  });
  var csvContent = meta + '\n' + CSV_HEADER + '\n' + lines.join('\n');
  var pad2 = function(n){ return String(n).padStart(2,'0'); };
  var istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  var fn = 'Ultrasonic_sensor_' + istNow.getUTCFullYear()
    + pad2(istNow.getUTCMonth()+1) + pad2(istNow.getUTCDate())
    + '_' + pad2(istNow.getUTCHours()) + pad2(istNow.getUTCMinutes())
    + pad2(istNow.getUTCSeconds()) + '_IST.csv';
  var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href = url; a.download = fn;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  addAlarm('ok', 'CSV downloaded — ' + fn);
}

// ─── Controls ─────────────────────────────────────────────────────────────────
function injectFault(f) {
  fault = f;
  faultOnset = f === 'none' ? null : tick;
  if (f !== 'none') addAlarm('warn', 'Fault scenario injected: ' + f);
  else addAlarm('ok', 'Returned to normal operation');
  updateFaultButtons(f);
  updateBanner(f);
}
function injectFaultAndSwitch(f) {
  injectFault(f);
  showPage(f === 'none' ? 'main' : f);
}
function updateFaultButtons(f) {
  var btns = ['none','noise','drift','weak','dropout','spike'];
  btns.forEach(function(b){
    var el = document.getElementById('fbtn-' + b);
    if (el) el.classList.toggle('active', b === f);
  });
}
function updateBanner(f) {
  var banner = document.getElementById('active-fault-banner');
  if (f === 'none') { banner.classList.remove('show'); return; }
  banner.classList.add('show');
  var names = {noise:'Signal Noise',drift:'Echo Drift',weak:'Weak Signal',dropout:'Signal Dropout',spike:'Spike Fault'};
  document.getElementById('banner-text').textContent = 'ACTIVE FAULT — ' + (names[f]||f).toUpperCase();
  document.getElementById('banner-view-btn').onclick = function(){ showPage(f); };
}
function updateSea(v) {
  seaState = parseInt(v);
  document.getElementById('sea-lbl').textContent = seaLabels[seaState];
}
function updateSpeed(v) {
  shipSpeed = parseInt(v);
  document.getElementById('spd-lbl').textContent = v + ' kn';
}

// ─── Main simulation loop ─────────────────────────────────────────────────────
function simulate() {
  tick++;
  var baseNoise      = seaBaseNoise[seaState] + shipSpeed * 0.15;
  var noiseFluctuation = (seaState + 1) * 1.2;
  var noise = baseNoise + (Math.random() - 0.5) * noiseFluctuation;
  noise = Math.max(0, noise);
  var baseSig       = 100 - seaSigPenalty[seaState] - shipSpeed * 0.25;
  var sigFluctuation = (seaState + 1) * 1.5;
  var sig = baseSig + (Math.random() - 0.5) * sigFluctuation;
  sig = Math.max(0, Math.min(100, sig));
  var echoBase   = 1.84;
  var faultScore = 0;
  var waveAmp    = 0.35 + seaState * 0.12;
  var noiseMult  = 1;
  var age  = faultOnset !== null ? tick - faultOnset : 0;
  var ramp = Math.min(age / 30, 1);
  if (fault === 'noise') {
    noiseMult  = 1 + ramp * 5;
    faultScore = ramp * 0.72 + Math.random() * 0.1;
    sig   -= ramp * 18;
    noise += ramp * 14;
  } else if (fault === 'drift') {
    echoBase  += ramp * 0.8;
    faultScore = ramp * 0.55 + Math.random() * 0.08;
    sig -= ramp * 8;
  } else if (fault === 'weak') {
    sig       -= ramp * 45;
    faultScore = ramp * 0.65 + Math.random() * 0.1;
    waveAmp   *= (1 - ramp * 0.7);
  } else if (fault === 'dropout') {
    if (Math.random() < ramp * 0.4) { sig = 0; faultScore = 0.9; }
    else faultScore = ramp * 0.4;
  } else if (fault === 'spike') {
    waveAmp   += ramp * (Math.random() < 0.15 ? 4 : 0);
    faultScore = ramp * 0.6 + (Math.random() < 0.1 ? 0.35 : 0);
  }
  sig        = Math.max(0, Math.min(100, sig));
  noise      = Math.max(0, noise);
  faultScore = Math.min(faultScore + Math.random() * 0.04, 1);
  var echo       = echoBase + (Math.random() - 0.5) * 0.04;
  var speedOfSound = 343;
  var dist       = (echo / 1000) * speedOfSound / 2;
  var distJitter = seaState * 0.08;
  dist += (Math.random() - 0.5) * distJitter;
  dist = Math.max(0, dist);
  var wave = Math.sin(tick * 0.6) * waveAmp + (Math.random()-0.5)*0.2*noiseMult;
  if (fault === 'spike'   && Math.random() < 0.08)     wave += (Math.random()-0.5) * 5;
  if (fault === 'dropout' && Math.random() < ramp*0.3) wave = 0;

  // ── Status label ──
  var statusLabel;
  var statusEl = document.getElementById('sys-status');
  if (faultScore < 0.25) {
    statusLabel = 'normal';
    statusEl.className   = 'badge badge-ok';
    statusEl.textContent = 'System Normal';
  } else if (faultScore < 0.55) {
    statusLabel = 'pre-fault';
    if (!statusEl.classList.contains('badge-warn')) {
      statusEl.className   = 'badge badge-warn';
      statusEl.textContent = 'Pre-Fault Warning';
      addAlarm('warn', 'Pre-failure pattern detected — score ' + faultScore.toFixed(2));
    }
  } else {
    statusLabel = 'fault';
    if (!statusEl.classList.contains('badge-fault')) {
      statusEl.className   = 'badge badge-fault blinking';
      statusEl.textContent = 'FAULT ALARM';
      addAlarm('fault', 'ALARM: Sensor fault confirmed — ' + fault.toUpperCase() + '. Notify bridge officer.');
    }
  }

  // ── Chart buffers ──
  waveData.shift();  waveData.push(parseFloat(wave.toFixed(3)));
  scoreData.shift(); scoreData.push(parseFloat(faultScore.toFixed(3)));
  sigData.shift();   sigData.push(parseFloat(sig.toFixed(1)));
  noiseData.shift(); noiseData.push(parseFloat(noise.toFixed(1)));

  waveChart.data.datasets[0].data = waveData;
  waveChart.data.datasets[1].data = Array(40).fill(null).concat(scoreData.map(function(s){ return parseFloat((s*1.5).toFixed(3)); }));
  waveChart.update('none');
  trendChart.data.datasets[0].data = sigData;
  trendChart.data.datasets[1].data = noiseData;
  trendChart.update('none');

  // ── Metric cards ──
  document.getElementById('sig-str').textContent  = Math.round(sig) + '%';
  document.getElementById('echo-t').textContent   = echo.toFixed(2) + ' ms';
  document.getElementById('noise-lv').textContent = noise.toFixed(1) + ' dB';
  document.getElementById('ai-score').textContent = faultScore.toFixed(2);
  document.getElementById('bar-sig').style.width   = Math.round(sig) + '%';
  document.getElementById('bar-noise').style.width = Math.min(noise / 55 * 100, 100).toFixed(1) + '%';
  document.getElementById('bar-score').style.width = (faultScore * 100).toFixed(1) + '%';

  var distEl = document.getElementById('meas-dist');
  var distValue;
  if (fault === 'dropout' && sig === 0) {
    distEl.textContent = 'ERR';
    distEl.style.color = 'var(--accent-red)';
    distValue = '';
  } else {
    distEl.textContent = dist.toFixed(2) + ' m';
    distEl.style.color = fault === 'drift' ? 'var(--accent-amber)' : 'var(--accent-cyan)';
    distValue = dist.toFixed(4);
  }

  // ── Update fault page live indicators ──
  updateFaultPageIndicators(sig, echo, noise, faultScore, dist, wave, distValue, fault);

  // ── CSV ──
  if (isRecording) {
    var now     = new Date();
    var elapsed = ((now - recStartTime) / 1000).toFixed(2);
    csvRows.push({
      timestamp_ist: toIST(now), elapsed_s: elapsed, tick: tick,
      signal_strength_pct: sig.toFixed(2), echo_return_time_ms: echo.toFixed(4),
      measured_distance_m: distValue, noise_level_dB: noise.toFixed(3),
      wave_amplitude: wave.toFixed(4), fault_score: faultScore.toFixed(4),
      system_status: statusLabel, injected_fault: fault,
      sea_state: seaState, sea_state_label: seaLabels[seaState], ship_speed_kn: shipSpeed
    });
    document.getElementById('row-count').textContent    = csvRows.length;
    document.getElementById('rec-duration').textContent = elapsed + ' s';
  }

  // ── Update secondary charts on fault pages ──
  updateFaultCharts(wave, sig, noise, faultScore, echo);
}



// ════════════════════════════════════════════════════════════
// FRONT-END ENHANCEMENTS
// ════════════════════════════════════════════════════════════

// ─── IST Clock ───
function updateClock() {
  var now = new Date();
  var ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  var pad = function(n){ return String(n).padStart(2,'0'); };
  document.getElementById('ist-clock').textContent =
    pad(ist.getUTCHours()) + ':' + pad(ist.getUTCMinutes()) + ':' + pad(ist.getUTCSeconds()) + ' IST';
}


// ─── Page Navigation ─────────────────────────────────────────
function showPage(name) {
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  document.querySelectorAll('.nav-tab').forEach(function(t){ t.classList.remove('active'); });
  var pg = document.getElementById('page-' + name);
  if (pg) pg.classList.add('active');
  var tab = document.querySelector('[data-page="' + name + '"]');
  if (tab) tab.classList.add('active');
}

// ─── Main Charts ──────────────────────────────────────────────
var chartDefaults = {
  responsive: true, maintainAspectRatio: false, animation: false,
  plugins: { legend: { display: false } }
};
var gridColor = 'rgba(30,100,200,0.1)';

var waveChart = new Chart(document.getElementById('waveChart').getContext('2d'), {
  type: 'line',
  data: {
    labels: Array(80).fill(''),
    datasets: [
      { label: 'Sensor signal', data: waveData, borderColor: '#1e7fff', borderWidth: 1.5, pointRadius: 0, tension: 0.3, fill: false },
      { label: 'Anomaly score ×1.5', data: Array(40).fill(null).concat(scoreData), borderColor: '#ff3b3b', borderWidth: 1.5, borderDash: [4,3], pointRadius: 0, tension: 0.4, fill: false }
    ]
  },
  options: Object.assign({}, chartDefaults, {
    scales: {
      x: { display: false },
      y: { min: -2, max: 2, grid: { color: gridColor }, ticks: { font: { size: 10, family: 'Space Mono' }, color: '#5c8aaf', callback: function(v){ return v.toFixed(1); } } }
    }
  })
});

var trendChart = new Chart(document.getElementById('trendChart').getContext('2d'), {
  type: 'line',
  data: {
    labels: Array(40).fill(''),
    datasets: [
      { label: 'Signal %', data: sigData,   borderColor: '#00e5a0', borderWidth: 1.5, pointRadius: 0, tension: 0.3, fill: false, yAxisID: 'y'  },
      { label: 'Noise dB', data: noiseData, borderColor: '#ffb830', borderWidth: 1.5, pointRadius: 0, tension: 0.3, fill: false, yAxisID: 'y2' }
    ]
  },
  options: Object.assign({}, chartDefaults, {
    scales: {
      x:  { display: false },
      y:  { min: 0, max: 110, grid: { color: gridColor }, ticks: { font: { size: 9, family: 'Space Mono' }, color: '#00e5a0', callback: function(v){ return v+'%'; } }, position: 'left' },
      y2: { min: 0, max: 55, grid: { display: false }, ticks: { font: { size: 9, family: 'Space Mono' }, color: '#ffb830', callback: function(v){ return v+'dB'; } }, position: 'right' }
    }
  })
});

// ─── Fault Page Mini Charts ───────────────────────────────────
var faultWaveBuffers = {};
var faultSigBuffers = {};
var faultCharts = {};
var FBUF = 60;

var faultPageDefs = [
  { key: 'noise',   waveColor: '#ff8c42', sigColor: '#ff8c42',       sig2Color: '#ffb830', sigLabel: 'Signal %', sig2Label: 'Noise dB', sigMin: 0, sigMax: 110, sig2Min: 0, sig2Max: 55 },
  { key: 'drift',   waveColor: '#ffb830', sigColor: '#ffb830',       sig2Color: '#00d4ff', sigLabel: 'Echo ms', sig2Label: 'Signal %',  sigMin: 1.7, sigMax: 2.8, sig2Min: 0, sig2Max: 110 },
  { key: 'weak',    waveColor: '#b08fff', sigColor: '#b08fff',       sig2Color: '#00e5a0', sigLabel: 'Signal %', sig2Label: 'Score',    sigMin: 0, sigMax: 110, sig2Min: 0, sig2Max: 1 },
  { key: 'dropout', waveColor: '#ff3b3b', sigColor: '#ff3b3b',       sig2Color: '#ffb830', sigLabel: 'Signal %', sig2Label: 'Score',    sigMin: 0, sigMax: 110, sig2Min: 0, sig2Max: 1 },
  { key: 'spike',   waveColor: '#00d4ff', sigColor: '#00d4ff',       sig2Color: '#ff3b3b', sigLabel: 'Score',    sig2Label: null,       sigMin: 0, sigMax: 1,   sig2Min: null, sig2Max: null }
];

faultPageDefs.forEach(function(def) {
  faultWaveBuffers[def.key] = Array(FBUF).fill(0);
  faultSigBuffers[def.key]  = { a: Array(FBUF).fill(0), b: Array(FBUF).fill(0) };

  var wCtx = document.getElementById(def.key + 'WaveChart');
  var sCtx = document.getElementById(def.key === 'spike' ? 'spikeSigChart' : (def.key + (def.key === 'noise' ? 'Trend' : def.key === 'drift' ? 'Echo' : 'Sig') + 'Chart'));
  if (!wCtx || !sCtx) return;

  var wChart = new Chart(wCtx.getContext('2d'), {
    type: 'line',
    data: { labels: Array(FBUF).fill(''), datasets: [{ label: 'Wave', data: faultWaveBuffers[def.key], borderColor: def.waveColor, borderWidth: 1.5, pointRadius: 0, tension: 0.3, fill: false }] },
    options: Object.assign({}, chartDefaults, {
      scales: { x: { display: false }, y: { min: -5, max: 5, grid: { color: gridColor }, ticks: { font: { size: 9, family: 'Space Mono' }, color: '#5c8aaf', callback: function(v){ return v.toFixed(1); } } } }
    })
  });

  var sDatasets = [{ label: def.sigLabel, data: faultSigBuffers[def.key].a, borderColor: def.sigColor, borderWidth: 1.5, pointRadius: 0, tension: 0.3, fill: false, yAxisID: 'y' }];
  var sScales = { x: { display: false }, y: { min: def.sigMin, max: def.sigMax, grid: { color: gridColor }, ticks: { font: { size: 9, family: 'Space Mono' }, color: def.sigColor, callback: function(v){ return v.toFixed(1); } }, position: 'left' } };
  if (def.sig2Label) {
    sDatasets.push({ label: def.sig2Label, data: faultSigBuffers[def.key].b, borderColor: def.sig2Color, borderWidth: 1.5, pointRadius: 0, tension: 0.3, fill: false, yAxisID: 'y2' });
    sScales.y2 = { min: def.sig2Min, max: def.sig2Max, grid: { display: false }, ticks: { font: { size: 9, family: 'Space Mono' }, color: def.sig2Color, callback: function(v){ return v.toFixed(1); } }, position: 'right' };
  }
  var sChart = new Chart(sCtx.getContext('2d'), {
    type: 'line',
    data: { labels: Array(FBUF).fill(''), datasets: sDatasets },
    options: Object.assign({}, chartDefaults, { scales: sScales })
  });

  faultCharts[def.key] = { w: wChart, s: sChart, def: def };
});

function updateFaultCharts(wave, sig, noise, faultScore, echo) {
  faultPageDefs.forEach(function(def) {
    var buf = faultWaveBuffers[def.key];
    var sbuf = faultSigBuffers[def.key];
    buf.shift(); buf.push(parseFloat(wave.toFixed(3)));
    if (def.key === 'noise')   { sbuf.a.shift(); sbuf.a.push(sig);       sbuf.b.shift(); sbuf.b.push(noise); }
    if (def.key === 'drift')   { sbuf.a.shift(); sbuf.a.push(echo);      sbuf.b.shift(); sbuf.b.push(sig); }
    if (def.key === 'weak')    { sbuf.a.shift(); sbuf.a.push(sig);       sbuf.b.shift(); sbuf.b.push(faultScore); }
    if (def.key === 'dropout') { sbuf.a.shift(); sbuf.a.push(sig);       sbuf.b.shift(); sbuf.b.push(faultScore); }
    if (def.key === 'spike')   { sbuf.a.shift(); sbuf.a.push(faultScore); }

    var fc = faultCharts[def.key];
    if (!fc) return;
    fc.w.data.datasets[0].data = buf;
    fc.w.update('none');
    fc.s.data.datasets[0].data = sbuf.a;
    if (fc.s.data.datasets[1]) fc.s.data.datasets[1].data = sbuf.b;
    fc.s.update('none');
  });
}

function updateFaultPageIndicators(sig, echo, noise, faultScore, dist, wave, distValue, activeFault) {
  // Noise page
  var fn_sig = document.getElementById('fn-sig');   if(fn_sig)   fn_sig.textContent   = Math.round(sig)+'%';
  var fn_no  = document.getElementById('fn-noise'); if(fn_no)    fn_no.textContent    = noise.toFixed(1)+' dB';
  var fn_sc  = document.getElementById('fn-score'); if(fn_sc)    fn_sc.textContent    = faultScore.toFixed(2);
  var fn_ec  = document.getElementById('fn-echo');  if(fn_ec)    fn_ec.textContent    = echo.toFixed(2)+' ms';
  // Drift page
  var fd_ec  = document.getElementById('fd-echo');  if(fd_ec)    fd_ec.textContent    = echo.toFixed(2)+' ms';
  var fd_di  = document.getElementById('fd-dist');  if(fd_di)    fd_di.textContent    = distValue ? parseFloat(distValue).toFixed(2)+' m' : 'ERR';
  var fd_sc  = document.getElementById('fd-score'); if(fd_sc)    fd_sc.textContent    = faultScore.toFixed(2);
  var fd_si  = document.getElementById('fd-sig');   if(fd_si)    fd_si.textContent    = Math.round(sig)+'%';
  // Weak page
  var fw_si  = document.getElementById('fw-sig');   if(fw_si)    fw_si.textContent    = Math.round(sig)+'%';
  var fw_am  = document.getElementById('fw-amp');   if(fw_am)    fw_am.textContent    = Math.abs(wave).toFixed(2);
  var fw_sc  = document.getElementById('fw-score'); if(fw_sc)    fw_sc.textContent    = faultScore.toFixed(2);
  var fw_ec  = document.getElementById('fw-echo');  if(fw_ec)    fw_ec.textContent    = echo.toFixed(2)+' ms';
  // Dropout page
  var fdr_si = document.getElementById('fdr-sig');  if(fdr_si)   fdr_si.textContent   = Math.round(sig)+'%';
  var fdr_di = document.getElementById('fdr-dist'); if(fdr_di)   fdr_di.textContent   = distValue ? parseFloat(distValue).toFixed(2)+' m' : 'ERR';
  var fdr_sc = document.getElementById('fdr-score');if(fdr_sc)   fdr_sc.textContent   = faultScore.toFixed(2);
  // Spike page
  var fsp_am = document.getElementById('fsp-amp');  if(fsp_am)   fsp_am.textContent   = Math.abs(wave).toFixed(2);
  var fsp_sc = document.getElementById('fsp-score');if(fsp_sc)   fsp_sc.textContent   = faultScore.toFixed(2);
  var fsp_si = document.getElementById('fsp-sig');  if(fsp_si)   fsp_si.textContent   = Math.round(sig)+'%';
}

// ─── Alarm log ────────────────────────────────────────────────
function addAlarm(level, msg) {
  var log = document.getElementById('alarm-log');
  var row = document.createElement('div');
  row.className = 'alarm-row';
  var pad = function(n){ return String(n).padStart(2,'0'); };
  var t = new Date();
  var ts = pad(t.getHours())+':'+pad(t.getMinutes())+':'+pad(t.getSeconds());
  var dotClass = level === 'ok' ? 'dot-ok' : level === 'warn' ? 'dot-warn' : 'dot-fault';
  var color = level === 'fault' ? 'var(--accent-red)' : level === 'warn' ? 'var(--accent-amber)' : 'var(--text-primary)';
  row.innerHTML = '<span class="dot '+dotClass+'"></span><span class="alarm-ts">'+ts+'</span><span style="color:'+color+'">'+msg+'</span>';
  log.insertBefore(row, log.firstChild);
  while (log.children.length > 10) log.removeChild(log.lastChild);
  alarmCount++;
}



export function initApp() {
  updateFaultButtons('none');
  updateClock();
  setInterval(updateClock, 1000);
  setInterval(simulate, 400);
}

// Public API used by the HTML/UI layer and useful for future integrations.
window.showPage = showPage;
window.injectFault = injectFault;
window.injectFaultAndSwitch = injectFaultAndSwitch;
window.startRecording = startRecording;
window.stopRecording = stopRecording;
window.downloadCSV = downloadCSV;
window.clearRecording = clearRecording;
window.updateSea = updateSea;
window.updateSpeed = updateSpeed;

