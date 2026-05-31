const FEATURE_IMGS = {
  shield: 'https://yadeavietthanh.vn/wp-content/themes/yadeavietthanh-theme-11062025/assets/img/ico/ribbon.png',
  truck: 'https://yadeavietthanh.vn/wp-content/themes/yadeavietthanh-theme-11062025/assets/img/ico/deliver.png',
  'credit-card': 'https://yadeavietthanh.vn/wp-content/themes/yadeavietthanh-theme-11062025/assets/img/ico/card.png',
  wrench: 'https://yadeavietthanh.vn/wp-content/themes/yadeavietthanh-theme-11062025/assets/img/ico/fix.png',
};

const ICONS = {
  shield: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  truck: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  'credit-card': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
  wrench: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  phone: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  map: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  menu: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  close: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  clock: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  mail: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
};

let siteData = null;
let heroInterval = null;
let supabaseConfigPromise = null;

async function ensureSupabaseConfig() {
  if (window.SUPABASE_CONFIG?.url && !window.SUPABASE_CONFIG.url.includes('YOUR_')) {
    return window.SUPABASE_CONFIG;
  }
  if (!supabaseConfigPromise) {
    supabaseConfigPromise = fetch('/api/public-config')
      .then(async (res) => (res.ok ? res.json() : null))
      .then((cfg) => {
        if (cfg?.url && cfg?.anonKey) window.SUPABASE_CONFIG = cfg;
        return window.SUPABASE_CONFIG || null;
      })
      .catch(() => null);
  }
  return supabaseConfigPromise;
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
}

function calcDiscount(price, salePrice) {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round((1 - salePrice / price) * 100);
}

async function fetchData() {
  if (siteData) return siteData;
  const res = await fetch('/api/data');
  siteData = await res.json();
  return siteData;
}

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

async function notifyTelegramLead(lead) {
  const res = await fetch('/api/notify-telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: lead.name,
      phone: lead.phone,
      product_name: lead.product_name,
      product_price: lead.product_price,
      product_price_label: lead.product_price_label,
      note: lead.note,
    }),
  });
  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch { /* ignore */ }
    throw new Error(detail || `HTTP ${res.status}`);
  }
}

async function submitLeadToSupabase(lead) {
  const cfg = await ensureSupabaseConfig();
  if (!cfg?.url || !cfg?.anonKey) {
    throw new Error('Chưa cấu hình Supabase');
  }

  const baseUrl = cfg.url.replace(/\/$/, '');
  const table = cfg.table || 'leads';
  const res = await fetch(`${baseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: cfg.anonKey,
      Authorization: `Bearer ${cfg.anonKey}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(lead),
  });

  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch { /* ignore */ }
    throw new Error(detail || `HTTP ${res.status}`);
  }
}

function renderHeader(data) {
  const header = document.getElementById('header');
  if (!header) return;

  header.innerHTML = `
    <div class="header-top">
      <div class="container header-inner">
        <button class="menu-toggle" aria-label="Menu">${ICONS.menu}</button>
        <a href="/" class="logo">
          <img src="${data.site.logo}" alt="${data.site.name}" height="40" loading="eager">
        </a>
        <div class="search-box">
          ${ICONS.search}
          <input type="text" id="search-input" placeholder="Bạn tìm gì ..." aria-label="Tìm kiếm">
          <button type="button" aria-label="Tìm" onclick="document.getElementById('search-input').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}))">${ICONS.search}</button>
        </div>
        <div class="header-actions">
          <a href="tel:${data.site.hotline.replace(/\s/g,'')}" class="header-action">
            ${ICONS.phone}
            <span>${data.site.hotline}</span>
          </a>
          <a href="/lien-he.html" class="header-action">
            ${ICONS.map}
            <span>Tìm cửa hàng</span>
          </a>
        </div>
      </div>
    </div>
    <div class="mobile-search mb-show">
      <div class="container"><div class="search-box" style="max-width:100%">
        ${ICONS.search}
        <input type="text" id="search-input-mobile" placeholder="Bạn tìm gì ...">
      </div></div>
    </div>
    <nav class="nav">
      <div class="container nav-inner">
        <div class="nav-category">${ICONS.menu} Danh mục</div>
        <a href="/san-pham.html?category=xe-may-dien" class="nav-link" data-cat="xe-may-dien">Xe Máy Điện</a>
        <a href="/san-pham.html?category=xe-hoc-sinh" class="nav-link" data-cat="xe-hoc-sinh">Xe Máy Điện Học Sinh</a>
        <a href="/san-pham.html?category=xe-dap-dien" class="nav-link" data-cat="xe-dap-dien">Xe Đạp Điện - Trợ Lực</a>
        <a href="/san-pham.html?category=xe-di-lam" class="nav-link" data-cat="xe-di-lam">Xe Cho Người Đi Làm</a>
        <a href="/san-pham.html?category=ac-quy" class="nav-link" data-cat="ac-quy">Ắc Quy</a>
        <a href="/#news" class="nav-link">Tin tức</a>
      </div>
    </nav>
  `;

  document.title = data.site.name + ' - ' + data.site.tagline;

  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) favicon.href = data.site.favicon;

  initMobileNav();
  initSearch(data);
  const mobileSearch = document.getElementById('search-input-mobile');
  if (mobileSearch) {
    mobileSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && mobileSearch.value.trim()) {
        window.location.href = `/san-pham.html?q=${encodeURIComponent(mobileSearch.value.trim())}`;
      }
    });
  }
  highlightNav();
}

function renderFooter(data) {
  const footer = document.getElementById('footer');
  if (!footer) return;

  const f = data.footer || {};
  const aboutLinks = (f.aboutLinks || []).map(l =>
    `<a href="${l.url}" class="footer-link">${l.label}</a>`
  ).join('');
  const supportLinks = (f.supportLinks || []).map(l => {
    let url = l.url;
    if (!url || url === 'tel:') url = `tel:${data.site.phone.replace(/\s/g, '')}`;
    const isExternal = url.startsWith('http');
    return `<a href="${url}" class="footer-link"${isExternal ? ' target="_blank" rel="noopener"' : ''}>${l.label}</a>`;
  }).join('');
  const categoriesCol = f.showCategories !== false ? `
    <div>
      <h4>${f.categoriesTitle || 'Danh mục'}</h4>
      ${data.categories.map(c => `<a href="/san-pham.html?category=${c.slug}" class="footer-link">${c.name}</a>`).join('')}
    </div>
  ` : '';

  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="${data.site.logo}" alt="${data.site.name}" loading="lazy">
          <p>${data.site.tagline}</p>
          <a href="tel:${data.site.hotline.replace(/\s/g,'')}" class="footer-hotline">${data.site.hotline}</a>
          <p>${data.site.address}</p>
        </div>
        <div>
          <h4>${f.aboutTitle || 'Về ' + data.site.name}</h4>
          ${aboutLinks}
        </div>
        ${categoriesCol}
        <div>
          <h4>${f.supportTitle || 'Hỗ trợ khách hàng'}</h4>
          ${supportLinks}
        </div>
      </div>
      <div class="footer-bottom">
        <span>${f.copyright || `© ${new Date().getFullYear()} ${data.site.name}. Xe điện Yadea chính hãng.`}</span>
        <span>${data.site.workingHours}</span>
      </div>
      ${f.showCompanyInfo && f.companyInfo ? `<div class="footer-company">${f.companyInfo}</div>` : ''}
    </div>
  `;
}

function renderFloatCTA(data) {
  const cta = document.getElementById('float-cta');
  if (!cta) return;

  cta.innerHTML = `
    <a href="tel:${data.site.phone.replace(/\s/g,'')}" class="float-btn phone" aria-label="Gọi điện">${ICONS.phone}</a>
    <a href="https://zalo.me/${data.site.zalo.replace(/\s/g,'')}" class="float-btn zalo" target="_blank" rel="noopener" aria-label="Zalo">Z</a>
    <a href="${data.site.facebook}" class="float-btn messenger" target="_blank" rel="noopener" aria-label="Messenger">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.08 2 11.08c0 2.85 1.39 5.38 3.57 7.02L4 22l4.2-1.65C9.42 20.78 10.68 21 12 21c5.52 0 10-4.08 10-9.08S17.52 2 12 2z"/></svg>
    </a>
  `;
}

function initMobileNav() {
  const toggle = document.querySelector('.menu-toggle');
  if (!toggle) return;

  let overlay = document.querySelector('.mobile-nav');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'mobile-nav';
    overlay.innerHTML = `
      <div class="mobile-nav-panel">
        <button class="mobile-nav-close">${ICONS.close}</button>
        <nav id="mobile-nav-links"></nav>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const links = document.querySelectorAll('.nav-link');
  const mobileLinks = document.getElementById('mobile-nav-links');
  mobileLinks.innerHTML = Array.from(links).map(l =>
    `<a href="${l.href}" class="mobile-nav-link">${l.textContent}</a>`
  ).join('');

  toggle.onclick = () => overlay.classList.add('open');
  overlay.querySelector('.mobile-nav-close').onclick = () => overlay.classList.remove('open');
  overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.remove('open'); };
  mobileLinks.querySelectorAll('a').forEach(a => {
    a.onclick = () => overlay.classList.remove('open');
  });
}

function initSearch(data) {
  const input = document.getElementById('search-input');
  if (!input) return;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      window.location.href = `/san-pham.html?q=${encodeURIComponent(input.value.trim())}`;
    }
  });
}

function highlightNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (path === '/' && link.dataset.page === 'home') link.classList.add('active');
    if (path.includes('lien-he') && link.dataset.page === 'contact') link.classList.add('active');
    if (path.includes('san-pham') && link.dataset.cat === new URLSearchParams(location.search).get('category')) link.classList.add('active');
  });
}

function productCardHTML(p) {
  const discount = calcDiscount(p.price, p.salePrice);
  const displayPrice = p.salePrice || p.price;
  return `
    <article class="product-card">
      <a href="/san-pham.html?slug=${p.slug}" class="product-image">
        ${discount ? `<span class="product-badge">-${discount}%</span>` : ''}
        <img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" width="400" height="300">
      </a>
      <div class="product-body">
        <h3 class="product-name"><a href="/san-pham.html?slug=${p.slug}">${p.name}</a></h3>
        <div class="product-price">
          <span class="price-current">${formatPrice(displayPrice)}</span>
          ${p.salePrice ? `<span class="price-old">${formatPrice(p.price)}</span>` : ''}
        </div>
        <div class="product-actions">
          <button class="btn btn-primary" onclick="openOrderModal('${p.id}')">MUA NGAY</button>
          <a href="tel:${siteData.site.phone.replace(/\s/g,'')}" class="btn btn-dark">MUA TRẢ GÓP</a>
        </div>
      </div>
    </article>
  `;
}

function renderHero(banners) {
  const hero = document.getElementById('hero');
  if (!hero || !banners.length) return;

  const isMobile = window.innerWidth < 768;
  hero.innerHTML = `
    <div class="hero-slider" id="hero-slider">
      ${banners.map((b, i) => `
        <a href="${b.link || '#'}" class="hero-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
          <picture>
            <source media="(max-width: 767px)" srcset="${b.imageMobile || b.image}">
            <img src="${b.image}" alt="${b.alt}" ${i === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async">
          </picture>
        </a>
      `).join('')}
      <div class="hero-dots">
        ${banners.map((_, i) => `<button class="hero-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Slide ${i + 1}"></button>`).join('')}
      </div>
    </div>
  `;

  let current = 0;
  const slides = hero.querySelectorAll('.hero-slide');
  const dots = hero.querySelectorAll('.hero-dot');

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = idx;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  dots.forEach(d => d.onclick = () => goTo(+d.dataset.index));

  clearInterval(heroInterval);
  heroInterval = setInterval(() => goTo((current + 1) % slides.length), 5000);
}

function renderFeatures(features) {
  const el = document.getElementById('features');
  if (!el) return;

  el.innerHTML = `
    <div class="container">
      <div class="features-grid">
        ${features.map(f => `
          <div class="feature-card">
            <img class="feature-icon" src="${FEATURE_IMGS[f.icon] || FEATURE_IMGS.shield}" alt="" width="44" height="44" loading="lazy">
            <div class="feature-text">
              <h3>${f.title}</h3>
              <p>${f.subtitle}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function getProductsByCategory(products, slug) {
  return products.filter(p => (p.categories || [p.category]).includes(slug));
}

const DEFAULT_HOME_CATEGORIES = [
  { slug: 'xe-may-dien', title: 'Xe máy điện', perRow: 4, rows: 2 },
  { slug: 'xe-hoc-sinh', title: 'Xe máy điện học sinh', perRow: 4, rows: 2 },
  { slug: 'xe-dap-dien', title: 'Xe Đạp Điện - Trợ Lực', perRow: 4, rows: 2 },
];

function renderHomepageCategories(data, hp) {
  const el = document.getElementById('products');
  if (!el) return;

  const sections = hp.categorySections?.length ? hp.categorySections : DEFAULT_HOME_CATEGORIES;
  const moreLabel = hp.productsButtonText || 'XEM THÊM';

  el.innerHTML = sections.map(section => {
    const limit = (section.perRow || 4) * (section.rows || 2);
    const all = getProductsByCategory(data.products, section.slug);
    const featuredIds = new Set(hp.featuredProductIds || []);
    const sorted = [...all].sort((a, b) => {
      const af = featuredIds.has(a.id) ? 0 : 1;
      const bf = featuredIds.has(b.id) ? 0 : 1;
      return af - bf || a.name.localeCompare(b.name, 'vi');
    });
    const items = sorted.slice(0, limit);
    const hasMore = all.length > limit;
    const title = section.title || data.categories.find(c => c.slug === section.slug)?.name || section.slug;

    if (!items.length) return '';

    return `
      <section class="home-category-section" id="category-${section.slug}">
        <div class="home-category-header">
          <h2>${title}</h2>
          <a href="/san-pham.html?category=${section.slug}" class="home-category-link">Xem tất cả →</a>
        </div>
        <div class="products-grid-4">
          ${items.map(productCardHTML).join('')}
        </div>
        ${hasMore ? `
          <div class="home-category-more">
            <a href="/san-pham.html?category=${section.slug}" class="btn btn-primary btn-lg">${moreLabel}</a>
          </div>
        ` : ''}
      </section>
    `;
  }).join('');
}

function renderProducts(products, containerId, limit) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const items = limit ? products.slice(0, limit) : products;
  el.innerHTML = items.length
    ? `<div class="products-grid">${items.map(productCardHTML).join('')}</div>`
    : '<p style="text-align:center;color:var(--gray-500)">Không có sản phẩm nào.</p>';
}

function renderNews(news, title) {
  const el = document.getElementById('news');
  if (!el) return;

  el.innerHTML = `
    <div class="container">
      <div class="section-header">
        <h2>${title || 'Thông tin hữu ích'}</h2>
      </div>
      <div class="news-grid">
        ${news.map(n => `
          <article class="news-card">
            <img src="${n.image}" alt="${n.title}" loading="lazy" decoding="async">
            <div class="news-overlay">
              <div class="news-date">${new Date(n.date).toLocaleDateString('vi-VN')}</div>
              <h3 class="news-title">${n.title}</h3>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

function renderStores(data, hp) {
  const el = document.getElementById('stores');
  if (!el) return;
  const title = hp?.storesSectionTitle || 'Hệ thống cửa hàng';
  const subtitle = hp?.storesSectionSubtitle || `Cửa hàng xe điện ${data.site.name}`;
  const raw = data.branches?.length ? data.branches : [{
    name: data.site.name,
    address: data.site.address,
    hotline: data.site.phone || data.site.hotline,
    mapLink: '/lien-he.html',
    isMain: true,
  }];
  const main = raw.find(b => b.isMain) || raw[0];
  const others = raw.filter(b => b !== main);

  el.innerHTML = `
    <div class="container">
      <div class="stores-header">
        <h2>${title}</h2>
        <p>${subtitle || `Hệ thống ${raw.length} chi nhánh tại TP.HCM`}</p>
      </div>
      ${main ? `<div class="store-main-wrap">${branchCardHTML(main, true)}</div>` : ''}
      ${others.length ? `<div class="stores-grid">${others.map(b => branchCardHTML(b, false)).join('')}</div>` : ''}
    </div>
  `;
}

function branchCardHTML(b, isMainCard) {
  const isMain = isMainCard || b.isMain === true;
  const tel = (b.hotline || '').replace(/\s/g, '');
  const mapHref = b.mapLink || '/lien-he.html';
  const isExternal = mapHref.startsWith('http');
  return `
    <article class="store-card ${isMain ? 'store-card-main' : ''}">
      <div class="store-card-icon">${ICONS.map}</div>
      <div>
        ${isMain ? '<span class="store-badge-main">CHI NHÁNH CHÍNH</span>' : ''}
        <h3>${b.name}</h3>
        <p>${b.address}</p>
        <p class="store-hotline">Hotline: <a href="tel:${tel}">${b.hotline}</a></p>
        <a href="${mapHref}"${isExternal ? ' target="_blank" rel="noopener"' : ''}>Xem bản đồ →</a>
      </div>
    </article>
  `;
}

function getHomepageProducts(data) {
  const hp = data.homepage;
  if (hp?.featuredProductIds?.length) {
    const map = Object.fromEntries(data.products.map(p => [p.id, p]));
    return hp.featuredProductIds.map(id => map[id]).filter(Boolean);
  }
  return data.products.filter(p => p.featured);
}

function openOrderModal(productId) {
  const product = siteData.products.find(p => p.id === productId);
  if (!product) return;

  let modal = document.getElementById('order-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'order-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const sortedProducts = [...siteData.products].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  const defaultPrice = product.salePrice || product.price;

  modal.innerHTML = `
    <div class="modal">
      <button class="modal-close" onclick="closeOrderModal()">${ICONS.close}</button>
      <h3>Đặt hàng nhanh</h3>
      <p class="order-product-summary" id="order-product-summary">
        ${product.name} - <strong style="color:var(--primary)">${formatPrice(defaultPrice)}</strong>
      </p>
      <form id="order-form">
        <div class="form-group">
          <label>Họ tên *</label>
          <input type="text" name="name" required placeholder="Nguyễn Văn A">
        </div>
        <div class="form-group">
          <label>Số điện thoại *</label>
          <input type="tel" name="phone" required placeholder="0901234567">
        </div>
        <div class="form-group">
          <label>DÒNG XE MUỐN MUA *</label>
          <select name="product" id="order-product-select" required>
            ${sortedProducts.map(p => {
              const pPrice = p.salePrice || p.price;
              const label = `${p.name} - ${formatPrice(pPrice)}`;
              return `<option value="${p.id}" ${p.id === productId ? 'selected' : ''}>${label}</option>`;
            }).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Ghi chú</label>
          <textarea name="note" placeholder="Yêu cầu thêm..."></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-lg" style="width:100%" id="order-submit-btn">GỬI</button>
      </form>
    </div>
  `;

  modal.classList.add('open');
  modal.onclick = (e) => { if (e.target === modal) closeOrderModal(); };

  document.getElementById('order-product-select').onchange = (e) => {
    const selected = siteData.products.find(p => p.id === e.target.value);
    if (!selected) return;
    const price = selected.salePrice || selected.price;
    document.getElementById('order-product-summary').innerHTML =
      `${selected.name} - <strong style="color:var(--primary)">${formatPrice(price)}</strong>`;
  };

  document.getElementById('order-form').onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const productId = String(fd.get('product') || '');
    const selected = siteData.products.find(p => String(p.id) === productId);
    const price = selected ? (selected.salePrice || selected.price || 0) : 0;
    const productPriceLabel = price > 0 ? formatPrice(price) : 'Liên hệ';
    const submitBtn = document.getElementById('order-submit-btn');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang gửi...';

    try {
      const lead = {
        name: String(fd.get('name') || '').trim(),
        phone: String(fd.get('phone') || '').trim(),
        product_id: productId,
        product_name: selected?.name || '',
        product_price: price,
        product_price_label: productPriceLabel,
        note: String(fd.get('note') || '').trim(),
        source: 'quick_order',
      };

      const [supabaseResult, telegramResult] = await Promise.allSettled([
        submitLeadToSupabase(lead),
        notifyTelegramLead(lead),
      ]);

      if (supabaseResult.status === 'rejected') {
        console.error('Supabase error:', supabaseResult.reason);
      }
      if (telegramResult.status === 'rejected') {
        console.error('Telegram error:', telegramResult.reason);
      }

      if (supabaseResult.status === 'fulfilled' || telegramResult.status === 'fulfilled') {
        form.reset();
        closeOrderModal();
        showToast('Cảm ơn bạn! Chúng tôi sẽ liên hệ lại sớm nhất.');
      } else {
        showToast('Không gửi được. Vui lòng gọi hotline hoặc thử lại sau.');
      }
    } catch (err) {
      console.error('Lead submit error:', err);
      showToast('Không gửi được. Vui lòng gọi hotline hoặc thử lại sau.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'GỬI';
    }
  };
}

function closeOrderModal() {
  const modal = document.getElementById('order-modal');
  if (modal) modal.classList.remove('open');
}

async function initHome() {
  const data = await fetchData();
  const hp = data.homepage || {};
  renderHeader(data);
  renderFooter(data);
  renderFloatCTA(data);
  renderHero(data.banners);

  const featuresEl = document.getElementById('features');
  if (hp.showFeatures === false) featuresEl && (featuresEl.style.display = 'none');
  else renderFeatures(data.features);

  const productsSection = document.getElementById('san-pham');
  if (hp.showProducts === false) {
    productsSection && (productsSection.style.display = 'none');
  } else {
    renderHomepageCategories(data, hp);
  }

  const newsEl = document.getElementById('news');
  if (hp.showNews === false) newsEl && (newsEl.style.display = 'none');
  else renderNews(data.news, hp.newsSectionTitle);

  const storesEl = document.getElementById('stores');
  if (hp.showStores === false) storesEl && (storesEl.style.display = 'none');
  else renderStores(data, hp);
}

async function initProductsPage() {
  const data = await fetchData();
  renderHeader(data);
  renderFooter(data);
  renderFloatCTA(data);

  const params = new URLSearchParams(location.search);
  const category = params.get('category');
  const slug = params.get('slug');
  const query = params.get('q');

  if (slug) {
    const product = data.products.find(p => p.slug === slug);
    if (!product) { window.location.href = '/san-pham.html'; return; }
    const mainSection = document.querySelector('main.section');
    if (mainSection) mainSection.classList.add('hidden');
    renderProductDetail(product, data);
    return;
  }

  let products = data.products;
  if (category) products = products.filter(p => (p.categories || [p.category]).includes(category));
  if (query) products = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  const filterEl = document.getElementById('category-filter');
  if (filterEl) {
    filterEl.innerHTML = `
      <button class="filter-btn ${!category ? 'active' : ''}" onclick="location.href='/san-pham.html'">Tất cả</button>
      ${data.categories.map(c => `
        <button class="filter-btn ${category === c.slug ? 'active' : ''}" onclick="location.href='/san-pham.html?category=${c.slug}'">${c.name}</button>
      `).join('')}
    `;
  }

  const title = document.getElementById('page-title');
  if (title) {
    if (query) title.textContent = `Kết quả tìm kiếm: "${query}"`;
    else if (category) title.textContent = data.categories.find(c => c.slug === category)?.name || 'Sản phẩm';
    else title.textContent = 'Sản phẩm';
  }

  renderProducts(products, 'products-list');
}

function renderProductDetail(product, data) {
  const el = document.getElementById('product-detail');
  if (!el) return;

  const price = product.salePrice || product.price;
  const discount = calcDiscount(product.price, product.salePrice);
  const cat = data.categories.find(c => c.slug === product.category);
  const catName = cat?.name || '';
  const catLink = product.category ? `/san-pham.html?category=${product.category}` : '/san-pham.html';
  const images = product.gallery?.length ? product.gallery : [product.image];
  const specTable = product.specTable?.length ? product.specTable : Object.entries(product.specs || {}).map(([k, v]) => ({
    name: k === 'tocDo' ? 'Tốc độ' : k === 'quangDuong' ? 'Quãng đường' : k === 'congSuat' ? 'Công suất' : 'Pin',
    value: v,
  }));
  const phone = data.site.phone.replace(/\s/g, '');

  el.innerHTML = `
    <div class="container product-detail">
      <div class="breadcrumb">
        <a href="/">Trang chủ</a><span>/</span>
        <a href="/san-pham.html">Sản phẩm</a><span>/</span>
        <a href="${catLink}">${catName}</a><span>/</span>
        <span>${product.name}</span>
      </div>

      <div class="product-detail-grid">
        <div class="product-detail-gallery">
          <div class="product-detail-main">
            ${discount ? `<span class="product-badge" id="detail-discount-badge">-${discount}%</span>` : '<span class="product-badge" id="detail-discount-badge" style="display:none"></span>'}
            <img id="detail-main-img" src="${images[0]}" alt="${product.name}" loading="eager">
          </div>
          ${images.length > 1 ? `
            <div class="product-detail-thumbs">
              ${images.map((img, i) => `
                <button type="button" class="detail-thumb ${i === 0 ? 'active' : ''}" data-src="${img}" aria-label="Ảnh ${i + 1}">
                  <img src="${img}" alt="" loading="lazy">
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div class="product-detail-info">
          <h1>${product.name}</h1>
          <div class="product-detail-price-row">
            <span class="product-detail-price" id="detail-price">${formatPrice(price)}</span>
            ${product.salePrice ? `<span class="price-old" id="detail-price-old">${formatPrice(product.price)}</span>` : '<span class="price-old" id="detail-price-old" style="display:none"></span>'}
          </div>

          ${product.colors?.length ? `
            <div class="product-color-section">
              <span class="product-color-label">Màu sắc:</span>
              <div class="product-color-swatches" id="product-color-swatches">
                ${product.colors.map((c, i) => `
                  <button type="button"
                    class="color-swatch ${i === 0 ? 'active' : ''}${c.hex?.toLowerCase() === '#ffffff' || c.hex?.toLowerCase() === '#fff' ? ' is-light' : ''}"
                    data-index="${i}"
                    style="--swatch-color: ${c.hex || '#ccc'}"
                    title="${c.name}"
                    aria-label="${c.name}">
                  </button>
                `).join('')}
              </div>
              <span class="product-color-name" id="detail-color-name">${product.colors[0].name}</span>
            </div>
          ` : ''}

          ${product.promotion ? `
            <div class="product-promo-box">
              <div class="product-promo-label">KHUYẾN MÃI</div>
              <p>${product.promotion}</p>
            </div>
          ` : ''}

          <div class="product-detail-cta">
            <button class="pd-btn pd-btn-buy" onclick="openOrderModal('${product.id}')">
              <strong>MUA NGAY</strong>
              <small>Giao hàng miễn phí</small>
            </button>
            <a href="tel:${phone}" class="pd-btn pd-btn-installment">
              <strong>MUA TRẢ GÓP 0%</strong>
              <small>Visa, Master, JCB</small>
            </a>
          </div>

          <button class="pd-btn pd-btn-order" onclick="openOrderModal('${product.id}')">ĐẶT HÀNG</button>

          <div class="product-trust-grid">
            <div class="product-trust-item"><span>🛡️</span><div><strong>Bảo hành 3 năm</strong><small>Chính hãng Yadea</small></div></div>
            <div class="product-trust-item"><span>🚚</span><div><strong>Vận chuyển phí 30Km</strong><small>Nội thành TP.HCM</small></div></div>
            <div class="product-trust-item"><span>✅</span><div><strong>Chính hãng 100%</strong><small>Đền tiền gấp 5 lần</small></div></div>
            <div class="product-trust-item"><span>🔄</span><div><strong>Đổi hàng miễn phí</strong><small>Trong 72 giờ</small></div></div>
          </div>
        </div>
      </div>

      <div class="product-detail-tabs">
        <button type="button" class="pd-tab active" data-tab="specs">Thông số kỹ thuật</button>
        <button type="button" class="pd-tab" data-tab="desc">Mô tả chi tiết</button>
      </div>
      <div class="product-detail-panel active" id="panel-specs">
        ${specTable.length ? `
          <table class="product-spec-table">
            <tbody>
              ${specTable.map(s => `<tr><th>${s.name}</th><td>${s.value}</td></tr>`).join('')}
            </tbody>
          </table>
        ` : '<p class="product-no-spec">Chưa có thông số kỹ thuật.</p>'}
      </div>
      <div class="product-detail-panel" id="panel-desc">
        <div class="product-desc-content">${product.description}</div>
      </div>
    </div>
  `;

  el.querySelectorAll('.detail-thumb').forEach(btn => {
    btn.onclick = () => {
      document.getElementById('detail-main-img').src = btn.dataset.src;
      el.querySelectorAll('.detail-thumb').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };
  });

  const colors = product.colors || [];
  if (colors.length) {
    const mainImg = document.getElementById('detail-main-img');
    const priceEl = document.getElementById('detail-price');
    const priceOldEl = document.getElementById('detail-price-old');
    const colorNameEl = document.getElementById('detail-color-name');
    const badgeEl = document.getElementById('detail-discount-badge');

    function applyColor(idx) {
      const c = colors[idx];
      if (!c) return;
      if (c.image && mainImg) mainImg.src = c.image;
      const p = c.price ?? product.price;
      const sp = c.salePrice ?? product.salePrice;
      const display = sp || p;
      if (priceEl) priceEl.textContent = formatPrice(display);
      if (priceOldEl) {
        if (sp && p && sp < p) {
          priceOldEl.textContent = formatPrice(p);
          priceOldEl.style.display = '';
        } else {
          priceOldEl.style.display = 'none';
        }
      }
      const d = calcDiscount(p, sp);
      if (badgeEl) {
        if (d) {
          badgeEl.textContent = `-${d}%`;
          badgeEl.style.display = '';
        } else {
          badgeEl.style.display = 'none';
        }
      }
      if (colorNameEl) colorNameEl.textContent = c.name;
      el.querySelectorAll('.color-swatch').forEach((s, i) => s.classList.toggle('active', i === idx));
    }

    el.querySelectorAll('.color-swatch').forEach(btn => {
      btn.onclick = () => applyColor(parseInt(btn.dataset.index, 10));
    });
  }

  el.querySelectorAll('.pd-tab').forEach(tab => {
    tab.onclick = () => {
      el.querySelectorAll('.pd-tab').forEach(t => t.classList.remove('active'));
      el.querySelectorAll('.product-detail-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`panel-${tab.dataset.tab}`)?.classList.add('active');
    };
  });

  document.title = product.name + ' - ' + data.site.name;
}

async function initContactPage() {
  const data = await fetchData();
  renderHeader(data);
  renderFooter(data);
  renderFloatCTA(data);

  const el = document.getElementById('contact-content');
  if (!el) return;

  const cp = data.contactPage || {};
  const branches = data.branches?.length ? data.branches : [];

  el.innerHTML = `
    <div class="container">
      <div class="section-header">
        <h2>${cp.title || 'Liên hệ với chúng tôi'}</h2>
        <p>${cp.subtitle || 'Hãy để lại thông tin, chúng tôi sẽ tư vấn miễn phí'}</p>
      </div>
      <div class="contact-grid">
        <div class="contact-info-card">
          <div class="contact-item">
            <div class="contact-icon">${ICONS.clock}</div>
            <div><h4>Giờ làm việc</h4><p>${data.site.workingHours}</p></div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">${ICONS.mail}</div>
            <div><h4>Email</h4><p>${data.site.email}</p></div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">${ICONS.phone}</div>
            <div><h4>Facebook</h4><p><a href="${data.site.facebook}" target="_blank" rel="noopener">Fanpage</a></p></div>
          </div>
        </div>
        <div class="contact-form">
          <h3 style="margin-bottom:20px">${cp.formTitle || 'Gửi yêu cầu tư vấn'}</h3>
          <form id="contact-form">
            <div class="form-group">
              <label>Họ tên *</label>
              <input type="text" name="name" required>
            </div>
            <div class="form-group">
              <label>Số điện thoại *</label>
              <input type="tel" name="phone" required>
            </div>
            <div class="form-group">
              <label>Sản phẩm quan tâm</label>
              <select name="product">
                <option value="">-- Chọn sản phẩm --</option>
                ${data.products.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Nội dung</label>
              <textarea name="message" placeholder="Nội dung cần tư vấn..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%">GỬI YÊU CẦU</button>
          </form>
        </div>
      </div>
      ${branches.length ? (() => {
        const main = branches.find(b => b.isMain) || branches[0];
        const others = branches.filter(b => b !== main);
        return `
        <div class="branches-section">
          <div class="section-header">
            <h2>Hệ thống chi nhánh</h2>
            <p>${branches.length} cửa hàng Yadea tại TP.HCM</p>
          </div>
          ${main ? `<div class="store-main-wrap">${branchCardHTML(main, true)}</div>` : ''}
          ${others.length ? `<div class="stores-grid">${others.map(b => branchCardHTML(b, false)).join('')}</div>` : ''}
        </div>`;
      })() : ''}
      <div class="map-container">
        <iframe src="${data.site.mapEmbed}" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Bản đồ cửa hàng"></iframe>
      </div>
    </div>
  `;

  document.getElementById('contact-form').onsubmit = (e) => {
    e.preventDefault();
    showToast('Cảm ơn bạn! Chúng tôi sẽ liên hệ lại sớm nhất.');
    e.target.reset();
  };
}

window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  else if (page === 'products') initProductsPage();
  else if (page === 'contact') initContactPage();
});
