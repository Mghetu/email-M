/* global grapesjs, mjml */
(function () {
  const qs = (sel, el = document) => el.querySelector(sel);
  const params = new URLSearchParams(location.search);
  const projectId = params.get('project') || 'demo-gh-pages-plus';
  const LS_KEY = `mjml-editor-project-${projectId}`;

  // --- Allowed-children map (based on MJML docs and common usage) ---
  // Notes:
  // - We focus on body/layout components for editing. Head elements are out of scope in this UI.
  // - Special nested components have dedicated children (eg. navbar-link, social-element, carousel-image).
  const ALLOWED = {
    'mj-body': ['mj-section', 'mj-wrapper', 'mj-hero'],
    'mj-wrapper': ['mj-section'], // Wrappers wrap sections
    'mj-section': ['mj-column', 'mj-group', 'mj-raw'],
    'mj-group': ['mj-column'],
    // Column-level content
    'mj-column': [
      'mj-text','mj-image','mj-button','mj-divider','mj-spacer',
      'mj-social','mj-navbar','mj-table','mj-accordion','mj-carousel','mj-raw'
    ],
    // Hero behaves like a section with a single column; treat as column-like for children
    'mj-hero': [
      'mj-text','mj-image','mj-button','mj-divider','mj-spacer',
      'mj-social','mj-navbar','mj-table','mj-accordion','mj-raw'
    ],
    // Composite components (special children)
    'mj-navbar': ['mj-navbar-link'],
    'mj-social': ['mj-social-element'],
    'mj-accordion': ['mj-accordion-element'],
    'mj-accordion-element': ['mj-accordion-title','mj-accordion-text'],
    'mj-carousel': ['mj-carousel-image']
  };

  // Provide friendly names/descriptions in the menu
  const LABELS = {
    'mj-section': ['Section', 'Row container'],
    'mj-wrapper': ['Wrapper', 'Wrap multiple sections'],
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

  // Helpers
  const getTag = (model) => model.get('tagName') || model.get('type') || '';
  const canHaveChildren = (model) => {
    const tag = getTag(model);
    return Array.isArray(ALLOWED[tag]) && ALLOWED[tag].length > 0;
  };

  const editor = grapesjs.init({
    container: '#editor',
    height: '100%',
    fromElement: false,
    plugins: ['grapesjs-mjml'],
    pluginsOpts: {
      'grapesjs-mjml': {
        resetDevices: true,
        resetStyleManager: true,
        overwriteExport: true,
        columnsPadding: '10px 0',
        importPlaceholder:
          '<mjml><mj-body><mj-section><mj-column><mj-text>Start here</mj-text></mj-column></mj-section></mj-body></mjml>'
      }
    },
    deviceManager: {
      devices: [
        { id: 'desktop', name: 'Desktop', width: '' },
        { id: 'tablet', name: 'Tablet', width: '768px' },
        { id: 'mobile', name: 'Mobile', width: '320px' },
      ]
    },
    storageManager: {
      type: 'local',
      autosave: true,
      autoload: true,
      stepsBeforeSave: 3,
      options: { local: { key: LS_KEY } }
    },
    assetManager: { upload: 0 }, // GitHub Pages: only URLs
  });

  // ---------- Insert menu UI ----------
  const openInsertMenu = (targetModel) => {
    // Decide allowed items: if the selected can't have children,
    // propose siblings based on parent; else propose children
    let baseModel = targetModel;
    let forParent = false;
    const tag = getTag(targetModel);
    let items = ALLOWED[tag] || [];
    if (!items.length) {
      const parent = targetModel.parent();
      if (parent) {
        baseModel = parent;
        items = ALLOWED[getTag(parent)] || [];
        forParent = true;
      }
    }
    if (!items.length) {
      editor.toast && editor.toast('No valid insertions here.');
      return;
    }

    const modal = editor.Modal;
    const tpl = qs('#tpl-insert-menu');
    const node = tpl.content.cloneNode(true);
    const title = node.querySelector('#insert-title');
    const list = node.querySelector('#insert-list');
    const closeBtn = node.querySelector('#insert-close');

    title.textContent = `Insert into ${getTag(baseModel)}`;
    list.innerHTML = '';

    items.forEach((type) => {
      const el = document.createElement('button');
      el.className = 'insert-item';
      const [name, desc] = LABELS[type] || [type, ''];
      el.innerHTML = `<span><div class="name">${name}</div><div class="desc">${desc}</div></span><span class="badge">${type}</span>`;
      el.onclick = () => {
        insertComponent(baseModel, type, targetModel, forParent);
        modal.close();
      };
      list.appendChild(el);
    });

    modal.setTitle('Insert');
    modal.setContent(node);
    modal.open();
    closeBtn.onclick = () => modal.close();
  };

  // Insert logic with smart defaults
  const insertComponent = (baseModel, type, originalTarget, insertingInParent) => {
    const addChild = (parent, childDef) => parent.append(childDef);

    const create = (t) => ({ type: t }); // minimal by default
    let comp;

    switch (type) {
      case 'mj-section':
        comp = baseModel.append({ type, components: [{ type: 'mj-column' }] });
        break;
      case 'mj-wrapper':
        comp = baseModel.append({ type, components: [{ type: 'mj-section', components: [{ type: 'mj-column' }] }] });
        break;
      case 'mj-hero':
        comp = baseModel.append({
          type,
          attributes: {
            'background-url': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200',
            'background-width': '600px',
            'background-height': '200px',
          },
          components: [{ type: 'mj-text', content: 'Your hero text' }]
        });
        break;
      case 'mj-group':
        comp = baseModel.append({ type, components: [{ type: 'mj-column' }, { type: 'mj-column' }] });
        break;
      case 'mj-navbar':
        comp = baseModel.append({
          type,
          components: [{ type: 'mj-navbar-link', content: 'Home', attributes: { href: '#' } }]
        });
        break;
      case 'mj-social':
        comp = baseModel.append({
          type,
          components: [
            { type: 'mj-social-element', attributes: { name: 'facebook', href: '#' } },
            { type: 'mj-social-element', attributes: { name: 'twitter', href: '#' } },
          ]
        });
        break;
      case 'mj-accordion':
        comp = baseModel.append({
          type,
          components: [{
            type: 'mj-accordion-element',
            components: [
              { type: 'mj-accordion-title', content: 'Title' },
              { type: 'mj-accordion-text', content: '<p>Accordion content</p>' },
            ]
          }]
        });
        break;
      case 'mj-carousel':
        comp = baseModel.append({
          type,
          components: [
            { type: 'mj-carousel-image', attributes: { src: 'https://via.placeholder.com/600x300?text=Slide+1' } },
            { type: 'mj-carousel-image', attributes: { src: 'https://via.placeholder.com/600x300?text=Slide+2' } },
          ]
        });
        break;
      case 'mj-text':
        comp = baseModel.append({ type, content: 'New text' });
        break;
      case 'mj-button':
        comp = baseModel.append({ type, content: 'Click me', attributes: { href: '#' } });
        break;
      case 'mj-image':
        comp = baseModel.append({ type, attributes: { src: 'https://via.placeholder.com/600x200' } });
        break;
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
        comp = baseModel.append(create(type));
        break;
      case 'mj-column':
        comp = baseModel.append({ type, components: [{ type: 'mj-text', content: 'Column' }] });
        break;
      default:
        comp = baseModel.append(create(type));
        break;
    }

    // If we originally selected a leaf and we're inserting into parent, try to place after the original
    if (insertingInParent && comp && originalTarget) {
      try {
        const parent = originalTarget.parent();
        const index = parent.components().indexOf(originalTarget);
        const coll = parent.components();
        coll.remove(comp, { silent: true });
        coll.add(comp, { at: index + 1 });
      } catch (e) {
        // fall back to appended at end
      }
    }

    // Focus the new component
    if (comp && comp.select) editor.select(comp);
  };

  // Add "+" toolbar button to all MJML components
  editor.on('component:selected', (model) => {
    const tb = model.get('toolbar') || [];
    const hasInsert = tb.some((t) => t.command === 'mjml:open-insert');
    if (!hasInsert) {
      tb.push({
        attributes: {
          class: 'gjs-toolbar-item',
          title: 'Insert (+)',
          style: 'padding:4px 6px;border-radius:6px;border:1px solid #e5e7eb;background:#fff;'
        },
        label: '+',
        command: 'mjml:open-insert',
      });
      model.set('toolbar', tb);
    }
  });

  editor.Commands.add('mjml:open-insert', {
    run(ed, sender, opts) {
      const model = ed.getSelected();
      if (!model) return;
      openInsertMenu(model);
    }
  });

  // ---------- Topbar actions ----------
  qs('#btn-new').addEventListener('click', () => {
    if (confirm('Clear the canvas?')) {
      editor.runCommand('core:canvas-clear');
      editor.Modal.close();
    }
  });

  qs('#btn-export-mjml').addEventListener('click', () => editor.runCommand('core:open-export'));

  qs('#btn-export-html').addEventListener('click', async () => {
    const html = editor.getHtml();
    const css = editor.getCss();
    const full = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>${css}</style>
</head>
<body>${html}</body>
</html>`;
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

  // ------- Import MJML (client-side compile) -------
  const openImportModal = () => {
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
        const out = mjml(mjmlStr, { minify: true });
        if (!out.html) throw new Error('Compile failed');
        editor.DomComponents.clear();
        editor.setComponents(out.html);
        modal.close();
      } catch (err) {
        alert(err.message || String(err));
      }
    });
  };
  document.getElementById('btn-import-mjml').addEventListener('click', openImportModal);
})();