// BirdLog — R1 Bird Identification & Life Catalog

// ========== State ==========
let currentView = 'listen';
let catalog = [];
let pendingRequest = null; // track what kind of SerpAPI response we expect
let identifiedBirdName = null;
let isListening = false;
let waveAnimId = null;

// ========== DOM Refs ==========
const $ = (id) => document.getElementById(id);

// ========== Storage ==========
async function saveCatalog() {
  const data = JSON.stringify(catalog);
  if (window.creationStorage) {
    try {
      await window.creationStorage.plain.setItem('birdlog_catalog', btoa(data));
    } catch (e) { console.error('Storage save error:', e); }
  } else {
    localStorage.setItem('birdlog_catalog', data);
  }
}

async function loadCatalog() {
  if (window.creationStorage) {
    try {
      const stored = await window.creationStorage.plain.getItem('birdlog_catalog');
      if (stored) catalog = JSON.parse(atob(stored));
    } catch (e) { console.error('Storage load error:', e); }
  } else {
    const stored = localStorage.getItem('birdlog_catalog');
    if (stored) catalog = JSON.parse(stored);
  }
}

// ========== View Navigation ==========
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const view = $(`view-${name}`);
  if (view) view.classList.add('active');
  currentView = name;

  const btnBack = $('btn-back');
  const btnCatalog = $('btn-catalog');
  const title = $('header-title');

  if (name === 'listen') {
    btnBack.classList.add('hidden');
    btnCatalog.classList.remove('hidden');
    title.textContent = 'BirdLog';
  } else if (name === 'catalog') {
    btnBack.classList.remove('hidden');
    btnCatalog.classList.add('hidden');
    title.textContent = 'Life Catalog';
    renderCatalog();
  } else if (name === 'detail') {
    btnBack.classList.remove('hidden');
    btnCatalog.classList.add('hidden');
    title.textContent = 'Bird Info';
  }
}

// ========== Listening Animation ==========
function startWaveAnimation() {
  const canvas = $('wave-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = '#b8bb26';
    ctx.lineWidth = 1.5;

    for (let wave = 0; wave < 3; wave++) {
      ctx.beginPath();
      const amp = isListening ? (8 + Math.random() * 6) : 2;
      const freq = 0.03 + wave * 0.015;
      const phase = t * (0.06 + wave * 0.02);
      ctx.globalAlpha = 0.4 + wave * 0.2;
      for (let x = 0; x < W; x++) {
        const y = H / 2 + Math.sin(x * freq + phase) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    t++;
    waveAnimId = requestAnimationFrame(draw);
  }
  draw();
}

function stopWaveAnimation() {
  if (waveAnimId) {
    cancelAnimationFrame(waveAnimId);
    waveAnimId = null;
  }
}

// ========== Bird Identification ==========
function startListening() {
  if (isListening) return;
  isListening = true;
  $('listen-circle').classList.add('listening');
  $('listen-status').textContent = 'Listening…';
  $('listen-hint').textContent = 'Analyzing nearby bird sounds';
}

function stopListeningAndIdentify() {
  if (!isListening) return;
  isListening = false;
  $('listen-circle').classList.remove('listening');
  $('listen-status').textContent = 'Identifying bird…';
  $('listen-hint').textContent = '';
  showLoading('Identifying bird…');

  if (typeof PluginMessageHandler !== 'undefined') {
    pendingRequest = 'llm_identify';
    PluginMessageHandler.postMessage(JSON.stringify({
      message: 'You are a bird identification expert. Simulate identifying a bird from its sound. Pick a REAL, common bird species that might be heard right now based on the current season and general location. Respond ONLY with valid JSON in this exact format: {"bird_name":"Common Name","scientific_name":"Scientific name"}. Pick a different species each time. Only respond with the JSON, nothing else.',
      useLLM: true
    }));
  } else {
    // Dev fallback: simulate identification
    setTimeout(() => {
      const devBirds = [
        { bird_name: 'American Robin', scientific_name: 'Turdus migratorius' },
        { bird_name: 'Northern Cardinal', scientific_name: 'Cardinalis cardinalis' },
        { bird_name: 'Blue Jay', scientific_name: 'Cyanocitta cristata' },
        { bird_name: 'House Sparrow', scientific_name: 'Passer domesticus' },
        { bird_name: 'European Starling', scientific_name: 'Sturnus vulgaris' },
        { bird_name: 'Red-tailed Hawk', scientific_name: 'Buteo jamaicensis' },
        { bird_name: 'Great Blue Heron', scientific_name: 'Ardea herodias' },
        { bird_name: 'Barn Owl', scientific_name: 'Tyto alba' }
      ];
      const pick = devBirds[Math.floor(Math.random() * devBirds.length)];
      handleBirdIdentified(pick.bird_name, pick.scientific_name);
    }, 1500);
  }
}

function handleBirdIdentified(birdName, sciName) {
  identifiedBirdName = birdName;
  $('loading-text').textContent = `Found: ${birdName}`;

  // Check if already in catalog
  const existing = catalog.find(b => b.name.toLowerCase() === birdName.toLowerCase());
  if (existing) {
    existing.sightings = (existing.sightings || 1) + 1;
    existing.lastSeen = new Date().toISOString();
    saveCatalog();
    hideLoading();
    $('listen-status').textContent = `${birdName} — already logged!`;
    $('listen-hint').textContent = 'Press side button to listen again';
    setTimeout(() => {
      showBirdDetail(existing);
    }, 800);
    return;
  }

  // Fetch bird info from SerpAPI
  fetchBirdInfo(birdName, sciName);
}

function fetchBirdInfo(birdName, sciName) {
  $('loading-text').textContent = `Looking up ${birdName}…`;

  if (typeof PluginMessageHandler !== 'undefined') {
    pendingRequest = 'serp_info';
    window._pendingBirdSci = sciName;
    PluginMessageHandler.postMessage(JSON.stringify({
      message: JSON.stringify({
        query_params: {
          engine: 'google',
          q: `${birdName} bird`,
          num: 1
        },
        useLocation: false
      }),
      useSerpAPI: true
    }));
  } else {
    // Dev fallback
    setTimeout(() => {
      const newBird = {
        name: birdName,
        scientificName: sciName || '',
        description: `The ${birdName} is a well-known bird species found across many habitats. Known for its distinctive appearance and vocalizations.`,
        conservation: 'Least Concern',
        lifespan: '2–5 years',
        mass: '50–100 g',
        image: '',
        date: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        sightings: 1
      };
      catalog.unshift(newBird);
      saveCatalog();
      hideLoading();
      $('listen-status').textContent = `${birdName} added!`;
      $('listen-hint').textContent = 'Press side button to listen again';
      fetchBirdImage(birdName, catalog.length - 1);
      setTimeout(() => showBirdDetail(newBird), 600);
    }, 1000);
  }
}

function fetchBirdImage(birdName, catalogIndex) {
  if (typeof PluginMessageHandler !== 'undefined') {
    pendingRequest = 'serp_image';
    window._pendingImageBird = birdName;
    PluginMessageHandler.postMessage(JSON.stringify({
      message: JSON.stringify({
        query_params: {
          engine: 'google_images',
          q: `${birdName} bird photo wildlife`,
          ijn: 0
        },
        useLocation: false
      }),
      useSerpAPI: true
    }));
  }
}

// ========== Message Handler ==========
window.onPluginMessage = function(data) {
  console.log('Plugin message:', pendingRequest, data);

  let parsed = null;
  if (data.data) {
    try {
      parsed = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
    } catch (e) {
      // Try to extract JSON from text
      const text = data.data || data.message || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch (e2) {}
      }
    }
  }
  if (!parsed && data.message) {
    const jsonMatch = data.message.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { parsed = JSON.parse(jsonMatch[0]); } catch (e) {}
    }
  }

  if (pendingRequest === 'llm_identify') {
    pendingRequest = null;
    if (parsed && parsed.bird_name) {
      handleBirdIdentified(parsed.bird_name, parsed.scientific_name || '');
    } else {
      hideLoading();
      $('listen-status').textContent = 'Could not identify — try again';
      $('listen-hint').textContent = 'Press side button to listen';
    }
    return;
  }

  if (pendingRequest === 'serp_info') {
    pendingRequest = null;
    const kg = parsed && parsed.knowledge_graph ? parsed.knowledge_graph : null;
    const birdName = identifiedBirdName || 'Unknown Bird';
    const sciName = window._pendingBirdSci || '';

    const newBird = {
      name: kg && kg.title ? kg.title : birdName,
      scientificName: kg && kg.scientific_name ? kg.scientific_name : sciName,
      description: kg && kg.description ? kg.description : `A bird species identified as ${birdName}.`,
      conservation: kg && kg.conservation_status ? kg.conservation_status : '—',
      lifespan: kg && kg.lifespan ? kg.lifespan : '—',
      mass: kg && kg.mass ? kg.mass : '—',
      image: (kg && kg.header_images && kg.header_images.length > 0) ? kg.header_images[0].image : '',
      date: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      sightings: 1
    };

    catalog.unshift(newBird);
    saveCatalog();
    hideLoading();
    $('listen-status').textContent = `${newBird.name} added!`;
    $('listen-hint').textContent = 'Press side button to listen again';

    // Also fetch an image if we don't have one
    if (!newBird.image) {
      fetchBirdImage(newBird.name, 0);
    }

    setTimeout(() => showBirdDetail(newBird), 600);
    return;
  }

  if (pendingRequest === 'serp_image') {
    pendingRequest = null;
    const birdName = window._pendingImageBird;
    if (parsed && parsed.images_results && parsed.images_results.length > 0) {
      const imgUrl = parsed.images_results[0].thumbnail || parsed.images_results[0].original;
      const bird = catalog.find(b => b.name.toLowerCase() === (birdName || '').toLowerCase());
      if (bird && imgUrl) {
        bird.image = imgUrl;
        saveCatalog();
        // Update detail view if showing this bird
        const detailImg = $('detail-img');
        if (detailImg && currentView === 'detail') {
          detailImg.src = imgUrl;
        }
        // Update catalog card if visible
        renderCatalog();
      }
    }
    return;
  }
};

// ========== Catalog Rendering ==========
function renderCatalog() {
  const list = $('catalog-list');
  const empty = $('catalog-empty');
  const count = $('catalog-count');

  if (!list) return;

  count.textContent = `${catalog.length} species`;

  if (catalog.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  list.innerHTML = catalog.map((bird, i) => {
    const dateStr = bird.date ? formatDate(bird.date) : '';
    const imgHtml = bird.image
      ? `<img class="bird-card-img" src="${bird.image}" alt="${bird.name}" loading="lazy">`
      : `<div class="bird-card-img" style="display:flex;align-items:center;justify-content:center;font-size:18px;">🐦</div>`;
    const isNew = bird.date && (Date.now() - new Date(bird.date).getTime() < 60000);
    return `
      <div class="bird-card" data-index="${i}">
        ${imgHtml}
        <div class="bird-card-info">
          <div class="bird-card-name">${bird.name}${isNew ? '<span class="badge-new">NEW</span>' : ''}</div>
          <div class="bird-card-sci">${bird.scientificName || ''}</div>
          <div class="bird-card-date">${dateStr}${bird.sightings > 1 ? ` · ${bird.sightings} sightings` : ''}</div>
        </div>
        <div class="bird-card-arrow">▸</div>
      </div>`;
  }).join('');

  // Attach click handlers
  list.querySelectorAll('.bird-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.index);
      if (catalog[idx]) showBirdDetail(catalog[idx]);
    });
  });
}

// ========== Detail View ==========
function showBirdDetail(bird) {
  const img = $('detail-img');
  const name = $('detail-name');
  const sci = $('detail-sci');
  const desc = $('detail-desc');
  const conservation = $('val-conservation');
  const lifespan = $('val-lifespan');
  const mass = $('val-mass');
  const date = $('val-date');

  if (bird.image) {
    img.src = bird.image;
    img.style.display = 'block';
  } else {
    img.src = '';
    img.style.display = 'none';
  }

  name.textContent = bird.name || 'Unknown';
  sci.textContent = bird.scientificName || '';
  desc.textContent = bird.description || '';
  conservation.textContent = bird.conservation || '—';
  lifespan.textContent = bird.lifespan || '—';
  mass.textContent = bird.mass || '—';
  date.textContent = bird.date ? formatDate(bird.date) : '—';

  // Scroll detail to top
  const scroll = $('detail-scroll');
  if (scroll) scroll.scrollTop = 0;

  showView('detail');
}

// ========== Helpers ==========
function formatDate(isoStr) {
  try {
    const d = new Date(isoStr);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  } catch (e) {
    return '';
  }
}

function showLoading(text) {
  const el = $('loading');
  const txt = $('loading-text');
  if (txt) txt.textContent = text || 'Loading…';
  if (el) el.classList.remove('hidden');
}

function hideLoading() {
  const el = $('loading');
  if (el) el.classList.add('hidden');
}

// ========== Event Handlers ==========

// Side button: listen / identify
window.addEventListener('sideClick', () => {
  if (currentView === 'detail') {
    // Go back to catalog
    showView('catalog');
    return;
  }
  if (currentView === 'catalog') {
    // Go back to listen
    showView('listen');
    return;
  }
  // In listen view: toggle listening
  if (!isListening) {
    startListening();
  } else {
    stopListeningAndIdentify();
  }
});

// Long press: start listening, release to identify
window.addEventListener('longPressStart', () => {
  if (currentView === 'listen') {
    startListening();
  }
});

window.addEventListener('longPressEnd', () => {
  if (currentView === 'listen' && isListening) {
    stopListeningAndIdentify();
  }
});

// Scroll wheel: scroll catalog/detail
window.addEventListener('scrollUp', () => {
  if (currentView === 'catalog') {
    const list = $('catalog-list');
    if (list) list.scrollTop -= 60;
  } else if (currentView === 'detail') {
    const scroll = $('detail-scroll');
    if (scroll) scroll.scrollTop -= 60;
  }
});

window.addEventListener('scrollDown', () => {
  if (currentView === 'catalog') {
    const list = $('catalog-list');
    if (list) list.scrollTop += 60;
  } else if (currentView === 'detail') {
    const scroll = $('detail-scroll');
    if (scroll) scroll.scrollTop += 60;
  }
});

// Header buttons
document.addEventListener('DOMContentLoaded', () => {
  $('btn-catalog').addEventListener('click', () => {
    showView('catalog');
  });

  $('btn-back').addEventListener('click', () => {
    if (currentView === 'detail') {
      showView('catalog');
    } else if (currentView === 'catalog') {
      showView('listen');
    }
  });

  // Dev keyboard shortcuts
  if (typeof PluginMessageHandler === 'undefined') {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('sideClick'));
      }
    });
  }
});

// ========== Init ==========
async function init() {
  await loadCatalog();
  showView('listen');
  startWaveAnimation();
  console.log('BirdLog initialized —', catalog.length, 'species in catalog');
}

init();
