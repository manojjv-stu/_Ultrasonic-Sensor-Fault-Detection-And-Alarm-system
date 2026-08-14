import {
  initApp,
  showPage,
  injectFault,
  injectFaultAndSwitch,
  startRecording,
  stopRecording,
  downloadCSV,
  clearRecording,
  updateSea,
  updateSpeed
} from './app.js';

function bindEvents() {
  document.querySelectorAll('[data-action="show-page"]').forEach(el => {
    el.addEventListener('click', () => showPage(el.dataset.pageTarget));
  });

  document.querySelectorAll('[data-action="inject-fault"]').forEach(el => {
    el.addEventListener('click', () => injectFault(el.dataset.fault));
  });

  document.querySelectorAll('[data-action="inject-fault-switch"]').forEach(el => {
    el.addEventListener('click', () => injectFaultAndSwitch(el.dataset.fault));
  });

  document.querySelectorAll('[data-action="update-sea"]').forEach(el => {
    el.addEventListener('input', event => updateSea(event.target.value));
  });

  document.querySelectorAll('[data-action="update-speed"]').forEach(el => {
    el.addEventListener('input', event => updateSpeed(event.target.value));
  });

  document.querySelector('[data-action="start-recording"]')?.addEventListener('click', startRecording);
  document.querySelector('[data-action="stop-recording"]')?.addEventListener('click', stopRecording);
  document.querySelector('[data-action="download-csv"]')?.addEventListener('click', downloadCSV);
  document.querySelector('[data-action="clear-recording"]')?.addEventListener('click', clearRecording);
}

function start() {
  bindEvents();
  initApp();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
