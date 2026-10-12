const screens={"status": {"label": "Status", "title": "Your Mac at a glance.", "description": "Check CPU, memory, battery, and storage. See what needs your attention.", "src": "assets/status.png"}, "system": {"label": "System", "title": "Look closer at your Mac.", "description": "See CPU activity, available memory, uptime, and network usage in one view.", "src": "assets/system.png"}, "statistics": {"label": "Statistics", "title": "See how things change.", "description": "Explore CPU, memory, network, and disk activity over time. Switch metrics and time ranges to compare.", "src": "assets/statistics.png"}, "processes": {"label": "Processes", "title": "Find what’s using resources.", "description": "Search running processes and sort by CPU, memory, or name.", "src": "assets/processes.png"}, "files": {"label": "Files", "title": "Your Mac’s files, on your phone.", "description": "Browse folders, preview files, and upload or download through SFTP.", "src": "assets/files.png"}, "ai": {"label": "AI Commands", "title": "Describe the task. Get a command.", "description": "Ask in plain language, review the suggested command, and choose whether to run it.", "src": "assets/ai.png"}, "control": {"label": "Control Center", "title": "Adjust the everyday things.", "description": "Manage Wi-Fi, Bluetooth, volume, audio output, and display brightness.", "src": "assets/control.png"}, "settings": {"label": "Settings", "title": "Set up MARC your way.", "description": "Manage saved servers and terminal options. Choose your appearance, accent color, and refresh interval.", "src": "assets/settings.png"}};
const tabs=[...document.querySelectorAll('[data-screen]')];
const picture=document.getElementById('screen-image');let selection=0;
let screenRequest=0;
async function selectScreen(index,focus=false){
 const request=++screenRequest;selection=index;const tab=tabs[index],screen=screens[tab.dataset.screen];
 tabs.forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1});
 const panel=document.getElementById('showcase-panel');panel.setAttribute('aria-labelledby',tab.id);panel.setAttribute('aria-busy','true');
 if(focus)tab.focus();
 const next=new Image();next.src=screen.src;
 try{await next.decode()}catch(error){if(request===screenRequest)panel.setAttribute('aria-busy','false');return}
 if(request!==screenRequest)return;
 document.getElementById('screen-label').textContent=screen.label;
 document.getElementById('screen-title').textContent=screen.title;
 document.getElementById('screen-description').textContent=screen.description;
 picture.classList.remove('switching');picture.src=screen.src;picture.alt='MARC '+screen.label+' app screenshot';
 requestAnimationFrame(()=>{if(request===screenRequest)picture.classList.add('switching')});panel.setAttribute('aria-busy','false');
}

tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectScreen(index));tab.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();selectScreen(next,true)})});

document.querySelectorAll('[data-jump]').forEach(link=>link.addEventListener('click',()=>{const index=tabs.findIndex(tab=>tab.dataset.screen===link.dataset.jump);if(index>=0)selectScreen(index)}));


// MARC screenshot enlargement
(() => {
  const image = document.getElementById('screen-image');
  if (!image || document.querySelector('.marc-lightbox')) return;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'screen-zoom-button';
  trigger.setAttribute('aria-label', 'Enlarge the selected app screenshot');
  trigger.setAttribute('aria-haspopup', 'dialog');
  image.before(trigger);
  trigger.append(image);

  const dialog = document.createElement('dialog');
  dialog.className = 'marc-lightbox';
  dialog.setAttribute('aria-label', 'Enlarged MARC screenshot');
  dialog.innerHTML = `
    <div class="lightbox-toolbar">
      <span>App screenshot</span>
      <button type="button" class="lightbox-close"
              aria-label="Close enlarged screenshot">×</button>
    </div>
    <img alt="">
  `;
  document.body.append(dialog);

  trigger.addEventListener('click', () => {
    const enlarged = dialog.querySelector('img');
    enlarged.src = image.currentSrc || image.src;
    enlarged.alt = image.alt;
    dialog.querySelector('.lightbox-toolbar span').textContent =
      document.getElementById('screen-label')?.textContent || 'App screenshot';
    dialog.showModal();
  });

  dialog.querySelector('.lightbox-close').addEventListener(
    'click', () => dialog.close()
  );

  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (
      event.clientX < box.left || event.clientX > box.right ||
      event.clientY < box.top || event.clientY > box.bottom
    ) dialog.close();
  });

  dialog.addEventListener('close', () => trigger.focus());
})();
// END MARC screenshot enlargement


// MARC keep selected mobile tab visible
(() => {
  const row = document.querySelector('.showtabs');
  if (!row) return;

  function revealSelected() {
    if (!window.matchMedia('(max-width: 800px)').matches) return;
    const selected = row.querySelector('[aria-selected="true"]');
    if (!selected) return;

    const left = selected.offsetLeft - row.offsetLeft;
    const target = left - (row.clientWidth - selected.offsetWidth) / 2;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    row.scrollTo({
      left: Math.max(0, target),
      behavior: reduced ? 'instant' : 'smooth'
    });
  }

  new MutationObserver(revealSelected).observe(row, {
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-selected']
  });

  window.addEventListener('resize', revealSelected);
})();
// END MARC keep selected mobile tab visible





// MARC signature entrance
(() => {
  const panel = document.getElementById('download');
  if (!panel ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    panel.classList.add('signature-enter');
    observer.disconnect();
  }, { threshold: 0.15 });

  observer.observe(panel);
})();
// END MARC signature entrance


// MARC subtle scroll motion
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll(
    '.hero > div:first-child, ' +
    'section[aria-label="App screen explorer"] .sectionhead, ' +
    '.story-heading, .story-copy, .story-phone, .story-features article'
  );

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('marc-reveal');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });

  targets.forEach(target => observer.observe(target));
})();
// END MARC subtle scroll motion


// MARC responsive navigation
(() => {
  const header = document.querySelector('.marc-header');
  const toggle = header?.querySelector('.marc-menu-toggle');
  const links = document.getElementById('marc-nav-links');
  if (!header || !toggle || !links) return;

  const mobile = window.matchMedia('(max-width: 700px)');

  function setOpen(open) {
    open = mobile.matches && open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute(
      'aria-label', open ? 'Close navigation menu' : 'Open navigation menu'
    );
    links.hidden = mobile.matches && !open;
  }

  function syncLayout() {
    const restoreFocus = mobile.matches && links.contains(document.activeElement);
    toggle.hidden = !mobile.matches;
    setOpen(false);
    if (restoreFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  header.addEventListener('click', event => {
    if (event.target.closest('a') && mobile.matches) setOpen(false);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' &&
        toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', event => {
    if (mobile.matches && !header.contains(event.target)) setOpen(false);
  });

  header.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (mobile.matches && !header.contains(document.activeElement)) {
        setOpen(false);
      }
    });
  });

  mobile.addEventListener('change', syncLayout);
  syncLayout();
})();
// END MARC responsive navigation

// MARC navbar scroll appearance
(() => {
  const header = document.querySelector('.marc-header');
  if (!header) return;

  let scheduled = false;
  let previous = null;

  function update() {
    const scrolled = window.scrollY > 8;
    if (scrolled !== previous) {
      header.classList.toggle('is-scrolled', scrolled);
      previous = scrolled;
    }
    scheduled = false;
  }

  window.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }, { passive: true });

  window.addEventListener('pageshow', update);
  update();
})();
// END MARC navbar scroll appearance
