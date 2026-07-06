// ============================================================
//  blog.js — kart ızgarası + okuma modu (View Transitions morph)
//  Veri: blog-data.js (window.BLOG_POSTS)
// ============================================================
(function () {
  'use strict';

  var POSTS = window.BLOG_POSTS || [];
  if (!POSTS.length) return;

  var shell       = document.getElementById('blogShell');
  var grid        = document.getElementById('blogGrid');
  var reader      = document.getElementById('reader');
  var progressEl  = document.getElementById('readerProgress');
  var eyebrowEl   = document.getElementById('readerEyebrow');
  var titleEl     = document.getElementById('readerTitle');
  var metaEl      = document.getElementById('readerMeta');
  var bodyEl      = document.getElementById('readerBody');
  var nextEl      = document.getElementById('readerNext');
  var backBtn     = document.getElementById('readerBack');

  var bySlug = {};
  POSTS.forEach(function (p, i) { p._i = i; bySlug[p.slug] = p; });

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canVT = typeof document.startViewTransition === 'function' && !prefersReduced;

  // her yazının gerçek (taranabilir) URL'i: blog-<slug>.html
  function postUrl(slug) { return 'blog-' + slug + '.html'; }
  // mevcut konumdan slug çöz (gerçek yol veya eski #hash uyumu)
  function slugFromLocation() {
    var m = location.pathname.match(/blog-(.+)\.html$/);
    if (m && bySlug[m[1]]) return m[1];
    var h = location.hash.replace('#', '');
    return (h && bySlug[h]) ? h : '';
  }

  var dateFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  var origTitle = document.title;
  var descMeta = document.querySelector('meta[name="description"]');
  var origDesc = descMeta ? descMeta.getAttribute('content') : '';
  var savedScroll = 0;

  // ---------- kartları üret ----------
  function readLabel(p) { return p.readMin + ' dk okuma'; }

  function buildCards() {
    var frag = document.createDocumentFragment();
    POSTS.forEach(function (p) {
      var a = document.createElement('a');
      a.className = 'blog-card';
      a.href = postUrl(p.slug);
      a.setAttribute('role', 'listitem');
      a.dataset.slug = p.slug;
      a.setAttribute('aria-label', p.title);

      var h = document.createElement('h2');
      h.className = 'blog-card-title';
      h.textContent = p.title;

      var meta = document.createElement('div');
      meta.className = 'blog-card-meta';
      meta.innerHTML =
        '<span class="blog-card-cat">' + p.category + '</span>' +
        '<span class="blog-card-dot"></span>' +
        '<span>' + readLabel(p) + '</span>' +
        '<span class="blog-card-go">Oku →</span>';

      a.appendChild(h);
      a.appendChild(meta);
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // yeni sekme
        e.preventDefault();
        openReader(p.slug, true);
      });
      frag.appendChild(a);
    });
    grid.appendChild(frag);
  }

  // ---------- okuma modunu doldur ----------
  function fillReader(p) {
    eyebrowEl.textContent = p.category;
    titleEl.textContent = p.title;
    metaEl.textContent = dateFmt.format(new Date(p.date)) + '  ·  ' + readLabel(p);
    bodyEl.innerHTML = p.body;

    // sonraki yazı (dizide bir sonraki, başa sarar)
    var next = POSTS[(p._i + 1) % POSTS.length];
    nextEl.innerHTML =
      '<span class="reader-next-label">Sıradaki yazı</span>' +
      '<a class="reader-next-link" href="' + postUrl(next.slug) + '" data-slug="' + next.slug + '">' + next.title + '</a>';
    var nextLink = nextEl.querySelector('.reader-next-link');
    nextLink.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      openReader(next.slug, true);
    });
  }

  // ---------- meta / SEO güncelle ----------
  var ldEl = null;
  function stripHtml(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
  }
  function setMeta(p) {
    document.title = p.title + ' — Nota Müzik Market';
    if (descMeta) descMeta.setAttribute('content', p.dek);

    var url = 'https://www.notamuzikmarket.com/' + postUrl(p.slug);
    var ld = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': p.title,
      'description': p.dek,
      'articleBody': stripHtml(p.body),
      'keywords': p.keywords,
      'inLanguage': 'tr-TR',
      'datePublished': p.date,
      'dateModified': p.date,
      'mainEntityOfPage': url,
      'url': url,
      'author': { '@type': 'Organization', 'name': 'Nota Müzik Market' },
      'publisher': {
        '@type': 'Organization',
        'name': 'Nota Müzik Market',
        'logo': { '@type': 'ImageObject', 'url': 'https://www.notamuzikmarket.com/images/logo-square.png' }
      }
    };
    if (!ldEl) { ldEl = document.createElement('script'); ldEl.type = 'application/ld+json'; }
    ldEl.textContent = JSON.stringify(ld);
    if (!ldEl.parentNode) document.head.appendChild(ldEl);
  }
  function restoreMeta() {
    document.title = origTitle;
    if (descMeta) descMeta.setAttribute('content', origDesc);
    if (ldEl && ldEl.parentNode) ldEl.parentNode.removeChild(ldEl);
  }

  // ---------- aç / kapat ----------
  function openReader(slug, push) {
    var p = bySlug[slug];
    if (!p) return;
    if (shell.dataset.view !== 'reader') savedScroll = window.scrollY;

    var cardTitle = grid.querySelector('[data-slug="' + slug + '"] .blog-card-title');

    var swap = function () {
      fillReader(p);
      shell.dataset.view = 'reader';
      reader.hidden = false;
      reader.setAttribute('aria-hidden', 'false');
      document.body.dataset.reader = 'open';
      window.scrollTo(0, 0);
    };

    if (canVT) {
      if (cardTitle) cardTitle.style.viewTransitionName = 'post-title';
      titleEl.style.viewTransitionName = 'post-title';
      var vt = document.startViewTransition(swap);
      vt.finished.finally(function () {
        if (cardTitle) cardTitle.style.viewTransitionName = '';
        titleEl.style.viewTransitionName = '';
      });
    } else {
      swap();
    }

    if (push) history.pushState({ slug: slug }, '', postUrl(slug));
    setMeta(p);
    updateProgress();
    backBtn.focus({ preventScroll: true });
  }

  function closeReader(push) {
    var swap = function () {
      shell.dataset.view = 'index';
      reader.hidden = true;
      reader.setAttribute('aria-hidden', 'true');
      delete document.body.dataset.reader;
    };
    if (canVT) { document.startViewTransition(swap); }
    else { swap(); }

    if (push) history.pushState({}, '', 'blog.html');
    restoreMeta();
    window.scrollTo(0, savedScroll);
  }

  // ---------- okuma ilerleme çubuğu ----------
  var ticking = false;
  function updateProgress() {
    if (document.body.dataset.reader !== 'open') { progressEl.style.transform = 'scaleX(0)'; return; }
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progressEl.style.transform = 'scaleX(' + ratio + ')';
  }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { updateProgress(); ticking = false; });
  }, { passive: true });

  // ---------- olaylar ----------
  backBtn.addEventListener('click', function () { closeReader(true); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.dataset.reader === 'open') closeReader(true);
  });

  window.addEventListener('popstate', function () {
    var slug = slugFromLocation();
    if (slug) openReader(slug, false);
    else if (document.body.dataset.reader === 'open') closeReader(false);
  });

  // ---------- ilk yükleme ----------
  buildCards();
  shell.dataset.view = 'index';
  var initial = slugFromLocation();
  if (initial) openReader(initial, false);
})();
