/* global grapesjs, mjml */
(function () {
  const qs = (sel, el = document) => el.querySelector(sel);
  const params = new URLSearchParams(location.search);
  const projectId = params.get('project') || 'demo-gh-pages-plus-v5';
  const LS_KEY = `mjml-editor-project-${projectId}`;

  // Allowed children map
  const ALLOWED = {
    'mj-body': ['mj-section', 'mj-wrapper', 'mj-hero'],
    'mj-wrapper': ['mj-section'],
    'mj-section': ['mj-column', 'mj-group', 'mj-raw'],
    'mj-group': ['mj-column'],
    'mj-column': [
      'mj-text','mj-image','mj-button','mj-divider','mj-spacer',
      'mj-social','mj-navbar','mj-table','mj-accordion','mj-carousel','mj-raw'
    ],
    'mj-hero': [
      'mj-text','mj-image','mj-button','mj-divider','mj-spacer',
      'mj-social','mj-navbar','mj-table','mj-accordion','mj-raw'
    ],
    'mj-navbar': ['mj-navbar-link'],
    'mj-social': ['mj-social-element'],
    'mj-accordion': ['mj-accordion-element'],
    'mj-accordion-element': ['mj-accordion-title','mj-accordion-text'],
    'mj-carousel': ['mj-carousel-image']
  };
  const LABELS = {
    'mj-section': ['Section', 'Row container'],
    'mj-wrapper': ['Wrapper', 'Wrap sections'],
    'mj-hero': ['Hero', 'Full-width hero'],
    'mj-group': ['Group', 'Row that prevents stacking'],
    'mj-column': ['Column', 'Place content inside'],
    'mj-text': ['Text', 'Paragraph or headings'],
    'mj-image': ['Image', 'Responsive image'],
    'mj-button': ['Button', 'Call to action'],
    'mj-divider': ['Divider', 'Horizontal rule'],
    'mj-spacer': ['Spacer', 'Vertical space'],
    'mj-table': ['Table', 'Tabular content'],
    'mj-social': ['Social', 'Social icon row'],
    'mj-social-element': ['Social item', 'Icon + link'],
    'mj-navbar': ['Navbar', 'Menu bar'],
    'mj-navbar-link': ['Navbar link', 'Menu item'],
    'mj-accordion': ['Accordion', 'Toggle content'],
    'mj-accordion-element': ['Accordion item', 'One toggle'],
    'mj-accordion-title': ['Accordion title', 'Clickable header'],
    'mj-accordion-text': ['Accordion text', 'HTML content'],
    'mj-carousel': ['Carousel', 'Image slider'],
    'mj-carousel-image': ['Carousel image', 'Slide image'],
    'mj-raw': ['Raw HTML', 'Unprocessed area'],
  };
  const getTag = (model) => model.get('tagName') || model.get('type') || '';

  const editor = grapesjs.init({
    // KEY CHANGE: fromElement true + container '#gjs' with initial MJML
    fromElement: true,
    container: '#gjs',
    height: '100%',
    plugins: ['grapesjs-mjml'],
    pluginsOpts: {
      'grapesjs-mjml': {
        resetDevices: true,
        resetStyleManager: true,
        overwriteExport: true,
        columnsPadding: '10px 0',
        // leave importPlaceholder for modal only
      }
    },
    deviceManager: {
      devices: [
        { id: 'Desktop', name: 'Desktop', width: '' },
        { id: 'Tablet',  name: 'Tablet',  width: '768px' },
        { id: 'Mobile',  name: 'Mobile',  width: '320px' },
      ]
    },
    storageManager: {
      type: 'local',
      autosave: true,
      autoload: true,
      stepsBeforeSave: 3,
      options: { local: { key: LS_KEY } }
    },
    assetManager: { upload: 0 }
  });

  // Open blocks on load
  editor.on('load', () => {
    const openBlocks = editor.Panels.getButton('views', 'open-blocks');
    if (openBlocks) openBlocks.set('active', 1);

    // Disable Import button if mjml-browser missing
    if (typeof window.mjml !== 'function') {
      const btn = qs('#btn-import-mjml');
      btn.disabled = true;
      btn.title = 'Import disabled (mjml-browser failed to load)';
      console.warn('[init] mjml-browser not available; Import MJML disabled');
    }
  });

  // Device buttons
  const updateDeviceBtns = () => {
    ['dev-desktop','dev-tablet','dev-mobile'].forEach(id => qs('#'+id).classList.remove('active'));
    const curr = editor.getDevice();
    if (curr === 'Desktop') qs('#dev-desktop').classList.add('active');
    if (curr === 'Tablet') qs('#dev-tablet').classList.add('active');
    if (curr === 'Mobile') qs('#dev-mobile').classList.add('active');
  };
  qs('#dev-desktop').addEventListener('click', () => { editor.setDevice('Desktop'); updateDeviceBtns(); });
  qs('#dev-tablet').addEventListener('click',  () => { editor.setDevice('Tablet');  updateDeviceBtns(); });
  qs('#dev-mobile').addEventListener('click',  () => { editor.setDevice('Mobile');  updateDeviceBtns(); });
  editor.on('device:update', updateDeviceBtns);
  updateDeviceBtns();

  // Insert menu logic (filtered by ALLOWED)
  const openInsertMenu = (targetModel) => {
    if (!targetModel) return alert('Select a component first.');
    let baseModel = targetModel;
    let insertingInParent = false;
    let items = ALLOWED[getTag(targetModel)] || [];
    if (!items.length) {
      const parent = targetModel.parent();
      if (parent) {
        baseModel = parent;
        items = ALLOWED[getTag(parent)] || [];
        insertingInParent = true;
      }
    }
    if (!items.length) return alert('No valid insertions here.');

    const modal = editor.Modal;
    const tpl = qs('#tpl-insert-menu');
    const node = tpl.content.cloneNode(true);
    const title = node.querySelector('#insert-title');
    const list  = node.querySelector('#insert-list');
    const close = node.querySelector('#insert-close');
    title.textContent = `Insert into ${getTag(baseModel)}`;

    const LABEL = (t) => LABELS[t] || [t, ''];
    list.innerHTML = '';
    items.forEach((type) => {
      const [name, desc] = LABEL(type);
      const el = document.createElement('button');
      el.className = 'insert-item';
      el.innerHTML = `<span><div class="name">${name}</div><div class="desc">${desc}</div></span><span class="badge">${type}</span>`;
      el.onclick = () => { insertComponent(baseModel, type, targetModel, insertingInParent); modal.close(); };
      list.appendChild(el);
    });

    modal.setTitle('Insert');
    modal.setContent(node);
    modal.open();
    close.onclick = () => modal.close();
  };

  const insertComponent = (baseModel, type, originalTarget, insertingInParent) => {
    let comp;
    const append = (parent, child) => parent.append(child);

    switch (type) {
      case 'mj-section':
        comp = append(baseModel, { type, components: [{ type: 'mj-column' }] }); break;
      case 'mj-wrapper':
        comp = append(baseModel, { type, components: [{ type: 'mj-section', components: [{ type: 'mj-column' }] }] }); break;
      case 'mj-hero':
        comp = append(baseModel, {
          type,
          attributes: {
            'background-url': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200',
            'background-width': '600px',
            'background-height': '200px',
          },
          components: [{ type: 'mj-text', content: 'Your hero text' }]
        }); break;
      case 'mj-group':
        comp = append(baseModel, { type, components: [{ type: 'mj-column' }, { type: 'mj-column' }] }); break;
      case 'mj-navbar':
        comp = append(baseModel, { type, components: [{ type: 'mj-navbar-link', content: 'Home', attributes: { href: '#' } }] }); break;
      case 'mj-social':
        comp = append(baseModel, {
          type,
          components: [
            { type: 'mj-social-element', attributes: { name: 'facebook', href: '#' } },
            { type: 'mj-social-element', attributes: { name: 'twitter', href: '#' } },
          ]
        }); break;
      case 'mj-accordion':
        comp = append(baseModel, {
          type,
          components: [{
            type: 'mj-accordion-element',
            components: [
              { type: 'mj-accordion-title', content: 'Title' },
              { type: 'mj-accordion-text', content: '<p>Accordion content</p>' },
            ]
          }]
        }); break;
      case 'mj-carousel':
        comp = append(baseModel, {
          type,
          components: [
            { type: 'mj-carousel-image', attributes: { src: 'https://via.placeholder.com/600x300?text=Slide+1' } },
            { type: 'mj-carousel-image', attributes: { src: 'https://via.placeholder.com/600x300?text=Slide+2' } },
          ]
        }); break;
      case 'mj-text': comp = append(baseModel, { type, content: 'New text' }); break;
      case 'mj-button': comp = append(baseModel, { type, content: 'Click me', attributes: { href: '#' } }); break;
      case 'mj-image': comp = append(baseModel, { type, attributes: { src: 'https://via.placeholder.com/600x200' } }); break;
      case 'mj-divider':
      case 'mj-spacer':
      case 'mj-table':
      case 'mj-navbar-link':
      case 'mj-social-element':
      case 'mj-accordion-element':
      case 'mj-accordion-title':
      case 'mj-accordion-text':
      case 'mj-carousel-image':
      case 'mj-raw':
        comp = append(baseModel, { type }); break;
      case 'mj-column':
        comp = append(baseModel, { type, components: [{ type: 'mj-text', content: 'Column' }] }); break;
      default:
        comp = append(baseModel, { type });
    }

    if (insertingInParent && comp && originalTarget) {
      try {
        const parent = originalTarget.parent();
        const coll = parent.components();
        const idx  = coll.indexOf(originalTarget);
        coll.remove(comp, { silent: true });
        coll.add(comp, { at: idx + 1 });
      } catch (e) {}
    }
    if (comp && comp.select) editor.select(comp);
  };

  // Add inline "+" toolbar and topbar fallback
  editor.on('component:selected', (model) => {
    const tb = model.get('toolbar') || [];
    const exists = tb.some(t => t.command === 'mjml:open-insert');
    if (!exists) {
      tb.push({ attributes: { class: 'gjs-toolbar-item', title: 'Insert (+)' }, label: '+', command: 'mjml:open-insert' });
      model.set('toolbar', tb);
    }
  });
  editor.Commands.add('mjml:open-insert', { run(ed) { openInsertMenu(ed.getSelected()); } });
  qs('#btn-insert').addEventListener('click', () => {
    const sel = editor.getSelected();
    if (!sel) return alert('Select a component first.');
    openInsertMenu(sel);
  });

  // Topbar actions
  qs('#btn-new').addEventListener('click', () => {
    if (confirm('Clear the canvas?')) {
      editor.runCommand('core:canvas-clear');
      // Re-seed to valid structure
      editor.setComponents('<mjml><mj-body><mj-section><mj-column><mj-text>Start here</mj-text></mj-column></mj-section></mj-body></mjml>');
      editor.Modal.close();
    }
  });
  qs('#btn-export-mjml').addEventListener('click', () => editor.runCommand('core:open-export'));
  qs('#btn-export-html').addEventListener('click', async () => {
    const html = editor.getHtml();
    const css  = editor.getCss();
    const full = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body>${html}</body></html>`;
    const blob = new Blob([full], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `email-${projectId}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  });
  qs('#btn-save').addEventListener('click', () => editor.store());
  qs('#btn-load').addEventListener('click', () => editor.load());

  // Import MJML (requires window.mjml loaded)
  const openImportModal = () => {
    if (typeof window.mjml !== 'function') return alert('Import disabled (mjml-browser failed to load).');
    const modal = editor.Modal;
    const tpl = qs('#tpl-import-modal');
    const node = tpl.content.cloneNode(true);
    modal.setTitle('Import MJML');
    modal.setContent(node);
    modal.open();

    const root = modal.getContentEl();
    const ta = root.querySelector('#import-mjml-textarea');
    root.querySelector('#import-cancel').addEventListener('click', () => modal.close());
    root.querySelector('#import-apply').addEventListener('click', () => {
      try {
        const mjmlStr = ta.value.trim();
        if (!mjmlStr) return;
        // Use mjml-browser to compile then feed HTML or set raw MJML directly
        const out = mjml(mjmlStr, { minify: true });
        if (!out.html) throw new Error('Compile failed');
        // Better: use raw MJML so the plugin keeps components proper
        editor.setComponents(mjmlStr);
        modal.close();
      } catch (err) {
        alert(err.message || String(err));
      }
    });
  };
  document.getElementById('btn-import-mjml').addEventListener('click', openImportModal);
})();