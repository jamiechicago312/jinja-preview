const storageKeys = {
  template: 'jinja-preview.template',
  context: 'jinja-preview.context',
  autoRender: 'jinja-preview.autoRender'
};

const refs = {
  autoRender: document.querySelector('#auto-render'),
  loadSample: document.querySelector('#load-sample'),
  renderButton: document.querySelector('#render-button'),
  copyOutput: document.querySelector('#copy-output'),
  templateInput: document.querySelector('#template-input'),
  contextInput: document.querySelector('#context-input'),
  previewFrame: document.querySelector('#preview-frame'),
  renderedOutput: document.querySelector('#rendered-output'),
  errorPanel: document.querySelector('#error-panel'),
  errorMessage: document.querySelector('#error-message'),
  statusPill: document.querySelector('#status-pill')
};

let renderTimer;

function setStatus(label, tone = 'neutral') {
  refs.statusPill.textContent = label;
  refs.statusPill.className = 'status-pill';
  if (tone !== 'neutral') {
    refs.statusPill.classList.add(tone);
  }
}

function saveState() {
  localStorage.setItem(storageKeys.template, refs.templateInput.value);
  localStorage.setItem(storageKeys.context, refs.contextInput.value);
  localStorage.setItem(storageKeys.autoRender, String(refs.autoRender.checked));
}

function showError(message) {
  refs.errorPanel.classList.remove('hidden');
  refs.errorMessage.textContent = message;
}

function clearError() {
  refs.errorPanel.classList.add('hidden');
  refs.errorMessage.textContent = '';
}

function parseContext(rawValue) {
  const value = rawValue.trim();
  if (!value) {
    return {};
  }

  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch (error) {
    throw new Error(`Context JSON is invalid: ${error.message}`);
  }

  if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('Context JSON must be a single object, for example {"name": "Jamie"}.');
  }

  return parsed;
}

function ensurePreviewDocument(renderedHtml) {
  const baseTag = '<base target="_blank">';

  if (/<head(\s|>)/i.test(renderedHtml)) {
    return renderedHtml.replace(/<head(\s|>)/i, (match) => `${match}${baseTag}`);
  }

  if (/<html(\s|>)/i.test(renderedHtml)) {
    return renderedHtml.replace(/<html(\s|>)/i, (match) => `${match}<head>${baseTag}</head>`);
  }

  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    `<head>${baseTag}<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>`,
    '<body>',
    renderedHtml,
    '</body>',
    '</html>'
  ].join('');
}

function writePreview(renderedHtml) {
  refs.previewFrame.srcdoc = ensurePreviewDocument(renderedHtml);
  refs.renderedOutput.textContent = renderedHtml;
}

function renderTemplate() {
  if (!window.nunjucks) {
    showError('Nunjucks failed to load. Check your internet connection or self-host the library for offline use.');
    setStatus('Dependency error', 'error');
    return;
  }

  const template = refs.templateInput.value;
  if (!template.trim()) {
    writePreview('<p style="font-family: sans-serif; padding: 2rem; color: #4a5b77;">Paste a Jinja template to preview it here.</p>');
    clearError();
    setStatus('Waiting');
    saveState();
    return;
  }

  try {
    clearError();
    setStatus('Rendering');

    const context = parseContext(refs.contextInput.value);
    const env = new nunjucks.Environment(undefined, {
      autoescape: false,
      throwOnUndefined: false,
      trimBlocks: false,
      lstripBlocks: false
    });

    const renderedHtml = env.renderString(template, context);
    writePreview(renderedHtml);
    setStatus('Rendered', 'success');
    saveState();
  } catch (error) {
    setStatus('Render failed', 'error');
    showError(error.message);
  }
}

function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = window.setTimeout(() => {
    renderTemplate();
  }, 250);
}

async function loadSample() {
  try {
    const response = await fetch('./samples/body.jinja2', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Sample request failed with ${response.status}`);
    }

    refs.templateInput.value = await response.text();
    refs.contextInput.value = '{}';
    clearError();
    saveState();
    renderTemplate();
  } catch (error) {
    setStatus('Sample failed', 'error');
    showError(`Unable to load sample template: ${error.message}`);
  }
}

async function copyRenderedHtml() {
  const output = refs.renderedOutput.textContent;
  if (!output || output === 'Render a template to see the output here.') {
    setStatus('Nothing to copy', 'error');
    return;
  }

  try {
    await navigator.clipboard.writeText(output);
    setStatus('Copied', 'success');
  } catch (error) {
    setStatus('Copy failed', 'error');
    showError(`Unable to copy rendered HTML: ${error.message}`);
  }
}

function loadStoredState() {
  const storedTemplate = localStorage.getItem(storageKeys.template);
  const storedContext = localStorage.getItem(storageKeys.context);
  const storedAutoRender = localStorage.getItem(storageKeys.autoRender);

  if (storedTemplate !== null) {
    refs.templateInput.value = storedTemplate;
  }

  if (storedContext !== null) {
    refs.contextInput.value = storedContext;
  }

  if (storedAutoRender !== null) {
    refs.autoRender.checked = storedAutoRender === 'true';
  }
}

function handleTabKey(event) {
  if (event.key !== 'Tab') {
    return;
  }

  event.preventDefault();
  const field = event.target;
  const start = field.selectionStart;
  const end = field.selectionEnd;
  field.setRangeText('  ', start, end, 'end');

  if (refs.autoRender.checked) {
    scheduleRender();
  }
}

function handleEditorInput() {
  saveState();
  if (refs.autoRender.checked) {
    scheduleRender();
  }
}

function handleKeydown(event) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault();
    renderTemplate();
  }
}

function init() {
  loadStoredState();

  refs.renderButton.addEventListener('click', renderTemplate);
  refs.loadSample.addEventListener('click', loadSample);
  refs.copyOutput.addEventListener('click', copyRenderedHtml);
  refs.autoRender.addEventListener('change', () => {
    saveState();
    if (refs.autoRender.checked) {
      renderTemplate();
    }
  });

  refs.templateInput.addEventListener('input', handleEditorInput);
  refs.contextInput.addEventListener('input', handleEditorInput);
  refs.templateInput.addEventListener('keydown', handleTabKey);
  refs.contextInput.addEventListener('keydown', handleTabKey);
  document.addEventListener('keydown', handleKeydown);

  if (refs.templateInput.value.trim()) {
    renderTemplate();
  } else {
    loadSample();
  }
}

window.addEventListener('DOMContentLoaded', init);
