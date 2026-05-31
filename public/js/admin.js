/* Yadea Admin Panel */
const ICONS = {
  dashboard: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
  products: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  banners: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  news: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  settings: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  website: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  logout: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
  search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  external: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
};

let adminData = null;
let editingProduct = null;
let editingBanner = null;
let editingNews = null;
let productFilter = { q: '', category: '' };

/** Kích thước ảnh khuyến nghị — khớp layout website */
const IMAGE_SPECS = {
  logo: '1000 × 250 px · PNG/JPG · Hiển thị header (tối đa 5MB)',
  favicon: '512 × 512 px · PNG · Icon tab trình duyệt',
  bannerDesktop: '1920 × 640 px · Tỷ lệ 3:1 · Banner trang chủ (desktop)',
  bannerMobile: '750 × 422 px · Tỷ lệ 16:9 · Banner trang chủ (mobile)',
  product: '800 × 800 px · Vuông 1:1 · Ảnh sản phẩm trên lưới 3 cột',
  news: '600 × 375 px · Tỷ lệ 16:10 · Thumbnail tin tức có overlay',
};

async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi');
  return data;
}

function formatPrice(price) {
  if (!price) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function showToast(msg, isError = false) {
  let toast = document.querySelector('.adm-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'adm-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

async function checkAuth() {
  try {
    const { authenticated } = await api('/api/auth/check');
    return authenticated;
  } catch {
    return false;
  }
}

async function logout() {
  await api('/api/auth/logout', { method: 'POST' });
  window.location.href = '/admin/';
}

function renderShell(active, title, showSearch = false) {
  const productCount = adminData?.products?.length || 0;
  const websitePages = ['customize', 'banners', 'news', 'settings'];
  const websiteOpen = websitePages.includes(active);

  document.getElementById('admin-sidebar').innerHTML = `
    <div class="adm-sidebar-brand">
      <div class="logo-icon">🛵</div>
      <span>Yadea Admin</span>
    </div>
    <nav class="adm-sidebar-nav">
      <div class="adm-nav-group">Tổng quan</div>
      <a href="/admin/dashboard.html" class="adm-nav-item ${active === 'dashboard' ? 'active' : ''}">
        ${ICONS.dashboard} Tổng quan
      </a>

      <div class="adm-nav-group">Quản lý bán hàng</div>
      <a href="/admin/products.html" class="adm-nav-item ${active === 'products' ? 'active' : ''}">
        ${ICONS.products} Sản phẩm
        <span class="badge">${productCount}</span>
      </a>

      <div class="adm-nav-group">Kênh bán hàng</div>
      <div class="adm-nav-subgroup ${websiteOpen ? 'open' : ''}">
        <button type="button" class="adm-nav-item adm-nav-toggle ${websiteOpen ? 'active' : ''}" id="website-toggle">
          ${ICONS.website} Website
          <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="adm-nav-sub">
          <a href="/admin/customize.html" class="adm-nav-sub-item ${active === 'customize' ? 'active' : ''}">Tùy chỉnh website</a>
          <a href="/admin/banners.html" class="adm-nav-sub-item ${active === 'banners' ? 'active' : ''}">Banner</a>
          <a href="/admin/news.html" class="adm-nav-sub-item ${active === 'news' ? 'active' : ''}">Tin tức</a>
          <a href="/admin/settings.html" class="adm-nav-sub-item ${active === 'settings' ? 'active' : ''}">Bảo mật</a>
        </div>
      </div>
      <a href="/" class="adm-nav-item" target="_blank">
        ${ICONS.external} Xem trang web
      </a>
    </nav>
    <div class="adm-sidebar-footer">
      <button class="adm-nav-item" id="sidebar-logout" style="width:100%;text-align:left">
        ${ICONS.logout} Đăng xuất
      </button>
    </div>
  `;

  document.getElementById('website-toggle')?.addEventListener('click', () => {
    document.querySelector('.adm-nav-subgroup')?.classList.toggle('open');
  });

  document.getElementById('admin-topbar').innerHTML = `
    <button class="adm-menu-toggle" id="menu-toggle" aria-label="Menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
    <div class="adm-topbar-title">${title}</div>
    ${showSearch ? `
      <div class="adm-topbar-search">
        ${ICONS.search}
        <input type="text" id="global-search" placeholder="Tìm sản phẩm..." value="${esc(productFilter.q)}">
      </div>
    ` : ''}
    <div class="adm-topbar-actions">
      <a href="/" target="_blank" class="adm-btn adm-btn-outline adm-btn-sm">${ICONS.external} Xem website</a>
      <div class="adm-user">
        <div class="adm-user-avatar">A</div>
        <span class="adm-user-name">Admin</span>
      </div>
    </div>
  `;

  document.getElementById('sidebar-logout').onclick = logout;

  const toggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('admin-sidebar');
  let overlay = document.querySelector('.adm-sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'adm-sidebar-overlay';
    document.body.appendChild(overlay);
  }
  toggle?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay.onclick = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  };

  const search = document.getElementById('global-search');
  if (search) {
    search.oninput = () => {
      productFilter.q = search.value;
      renderProductsTable();
    };
  }
}

async function saveData() {
  await api('/api/admin/data', { method: 'PUT', body: JSON.stringify(adminData) });
  showToast('Đã lưu thành công!');
}

async function uploadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const { url } = await api('/api/admin/upload', {
          method: 'POST',
          body: JSON.stringify({ data: reader.result, filename: file.name }),
        });
        resolve(url);
      } catch (e) { reject(e); }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function imageUploadField(id, label, value, specKey = '') {
  const spec = specKey ? IMAGE_SPECS[specKey] : '';
  return `
    <div class="adm-form-group">
      <label>${label}</label>
      <div class="adm-upload-row">
        <input class="adm-input" type="text" id="${id}" value="${esc(value)}" placeholder="URL hoặc tải ảnh lên">
        <label class="adm-btn adm-btn-outline adm-btn-sm adm-upload-btn">
          📁 Tải ảnh
          <input type="file" accept="image/*" hidden data-target="${id}">
        </label>
      </div>
      ${spec ? `<div class="adm-img-spec">Khuyến nghị: ${spec}</div>` : ''}
      <div class="adm-img-preview" id="${id}-preview" ${value ? '' : 'style="display:none"'}>
        <img src="${esc(value)}" alt="Preview">
      </div>
    </div>
  `;
}

function bindImageUploads(container) {
  container.querySelectorAll('.adm-upload-btn input[type=file]').forEach(input => {
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const targetId = input.dataset.target;
      const urlInput = document.getElementById(targetId);
      const preview = document.getElementById(`${targetId}-preview`);
      try {
        showToast('Đang tải ảnh...');
        const url = await uploadImage(file);
        urlInput.value = url;
        if (preview) {
          preview.style.display = '';
          preview.querySelector('img').src = url.startsWith('/') ? url : `${location.origin}${url}`;
        }
        showToast('Tải ảnh thành công!');
      } catch (err) {
        showToast(err.message, true);
      }
      input.value = '';
    };
  });
  container.querySelectorAll('.adm-upload-row input[type=text]').forEach(input => {
    input.oninput = () => {
      const preview = document.getElementById(`${input.id}-preview`);
      if (preview && input.value) {
        preview.style.display = '';
        preview.querySelector('img').src = input.value;
      }
    };
  });
}

/* ─── Login ─── */
async function initLogin() {
  if (await checkAuth()) {
    window.location.href = '/admin/dashboard.html';
    return;
  }
  document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('login-error');
    try {
      await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: e.target.username.value, password: e.target.password.value }),
      });
      window.location.href = '/admin/dashboard.html';
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    }
  };
}

/* ─── Dashboard ─── */
async function initDashboard() {
  if (!(await checkAuth())) {
    document.getElementById('adm-loading').innerHTML = '<div class="adm-loading-box"><p>Chuyển đến trang đăng nhập...</p></div>';
    window.location.href = '/admin/';
    return;
  }
  adminData = await api('/api/admin/data');
  renderShell('dashboard', 'Tổng quan');

  const products = adminData.products || [];
  const featuredIds = adminData.homepage?.featuredProductIds || products.filter(p => p.featured).map(p => p.id);
  const featured = featuredIds.map(id => products.find(p => p.id === id)).filter(Boolean);
  const onSale = products.filter(p => p.salePrice && p.salePrice < p.price);
  const sync = adminData.syncStatus || { status: 'idle', message: 'Chưa cập nhật giá' };

  document.getElementById('dashboard-content').innerHTML = `
    <div class="adm-stats">
      <div class="adm-stat-card">
        <div class="label">Tổng sản phẩm</div>
        <div class="value">${products.length}</div>
        <div class="sub">${adminData.categories.length} danh mục</div>
      </div>
      <div class="adm-stat-card">
        <div class="label">Sản phẩm nổi bật</div>
        <div class="value">${featured.length}</div>
        <div class="sub">Hiển thị trang chủ</div>
      </div>
      <div class="adm-stat-card">
        <div class="label">Đang khuyến mãi</div>
        <div class="value">${onSale.length}</div>
        <div class="sub">Có giá sale</div>
      </div>
      <div class="adm-stat-card">
        <div class="label">Banner & Tin tức</div>
        <div class="value">${adminData.banners.length} / ${adminData.news.length}</div>
        <div class="sub">Nội dung trang chủ</div>
      </div>
    </div>

    <div class="adm-card adm-sync-card">
      <div class="adm-card-header">
        <h3>Cập nhật giá từ Yadea Việt Thanh</h3>
        ${renderSyncBadge(sync.status)}
      </div>
      <div class="adm-card-body">
        <p class="adm-panel-hint">Quét và lấy giá bán mới, sản phẩm mới từ <a href="https://yadeavietthanh.vn/" target="_blank" rel="noopener">yadeavietthanh.vn</a>. Danh mục sản phẩm bạn đã chỉnh trong admin vẫn được giữ nguyên.</p>
        <div class="adm-sync-info" id="sync-status-text">
          <span class="adm-sync-msg">${esc(sync.message || '')}</span>
          ${sync.updatedAt ? `<span class="adm-sync-time">Lần cuối: ${formatSyncTime(sync.updatedAt)}</span>` : ''}
        </div>
        <div class="adm-sync-actions">
          <button type="button" class="adm-btn adm-btn-primary" id="sync-price-btn" ${sync.status === 'updating' ? 'disabled' : ''}>
            ${sync.status === 'updating' ? '⏳ Đang cập nhật...' : '↻ Cập nhật giá'}
          </button>
          <a href="/admin/products.html" class="adm-btn adm-btn-outline">Xem sản phẩm</a>
        </div>
      </div>
    </div>

    <div class="adm-grid-3-1">
      <div>
        <div class="adm-card">
          <div class="adm-card-header">
            <h3>Giao diện website</h3>
            <a href="/admin/settings.html" class="adm-btn adm-btn-primary adm-btn-sm">Tùy chỉnh</a>
          </div>
          <div class="adm-card-body">
            <div class="adm-theme-preview">
              <div class="adm-theme-info">
                <h4>${esc(adminData.site.name)}</h4>
                <p>${esc(adminData.site.tagline)}</p>
                <div class="adm-theme-actions">
                  <a href="/admin/settings.html" class="adm-btn adm-btn-primary">Thiết lập website</a>
                  <a href="/" target="_blank" class="adm-btn adm-btn-outline">Xem website</a>
                </div>
              </div>
              <div class="adm-preview-frame adm-preview-desktop">
                <img src="${adminData.banners[0]?.image || adminData.site.logo}" alt="Preview">
                <div class="adm-preview-frame adm-preview-mobile">
                  <img src="${adminData.banners[0]?.imageMobile || adminData.banners[0]?.image || adminData.site.logo}" alt="Mobile">
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="adm-card">
          <div class="adm-card-header"><h3>Thao tác nhanh</h3></div>
          <div class="adm-card-body">
            <div class="adm-quick-links">
              <a href="/admin/products.html" class="adm-quick-link">
                <div class="icon blue">📦</div><span>Thêm / Sửa sản phẩm</span>
              </a>
              <a href="/admin/settings.html" class="adm-quick-link">
                <div class="icon orange">📞</div><span>Đổi SĐT & Logo</span>
              </a>
              <a href="/admin/customize.html" class="adm-quick-link">
                <div class="icon blue">🎨</div><span>Tùy chỉnh website</span>
              </a>
              <a href="/admin/banners.html" class="adm-quick-link">
                <div class="icon green">🖼️</div><span>Quản lý Banner</span>
              </a>
              <a href="/admin/news.html" class="adm-quick-link">
                <div class="icon purple">📰</div><span>Quản lý Tin tức</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="adm-card">
          <div class="adm-card-header">
            <h3>Sản phẩm nổi bật</h3>
            <a href="/admin/products.html" class="adm-btn adm-btn-ghost adm-btn-sm">Xem tất cả</a>
          </div>
          <div class="adm-card-body" style="padding:0">
            <div class="adm-table-wrap">
              <table class="adm-table">
                <tbody>
                  ${featured.slice(0, 6).map(p => `
                    <tr>
                      <td>
                        <div class="product-cell">
                          <img src="${esc(p.image)}" alt="">
                          <span class="product-name">${esc(p.name)}</span>
                        </div>
                      </td>
                      <td class="price">${formatPrice(p.salePrice || p.price)}</td>
                    </tr>
                  `).join('') || '<tr><td colspan="2" style="text-align:center;color:var(--adm-text-muted);padding:24px">Chưa có sản phẩm</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="adm-card">
          <div class="adm-card-header"><h3>Thông tin cửa hàng</h3></div>
          <div class="adm-card-body">
            <div class="adm-activity-item"><div class="adm-activity-dot"></div><div class="adm-activity-text"><strong>Hotline:</strong> ${esc(adminData.site.hotline)}</div></div>
            <div class="adm-activity-item"><div class="adm-activity-dot"></div><div class="adm-activity-text"><strong>Tư vấn:</strong> ${esc(adminData.site.phone)}</div></div>
            <div class="adm-activity-item"><div class="adm-activity-dot"></div><div class="adm-activity-text"><strong>Địa chỉ:</strong> ${esc(adminData.site.address)}</div></div>
            <div class="adm-activity-item"><div class="adm-activity-dot"></div><div class="adm-activity-text"><strong>Giờ làm việc:</strong> ${esc(adminData.site.workingHours)}</div></div>
          </div>
        </div>
      </div>
    </div>
  `;
  bindDashboardSync();
}

function renderSyncBadge(status) {
  const map = {
    completed: { cls: 'success', label: 'Hoàn thành' },
    updating: { cls: 'updating', label: 'Đang Cập Nhật' },
    error: { cls: 'error', label: 'Lỗi' },
    idle: { cls: 'idle', label: 'Chưa chạy' },
  };
  const s = map[status] || map.idle;
  return `<span class="adm-sync-badge ${s.cls}">${s.label}</span>`;
}

function formatSyncTime(iso) {
  try {
    return new Date(iso).toLocaleString('vi-VN');
  } catch {
    return iso;
  }
}

function bindDashboardSync() {
  document.getElementById('sync-price-btn')?.addEventListener('click', runPriceSync);
}

async function runPriceSync() {
  const btn = document.getElementById('sync-price-btn');
  const statusEl = document.getElementById('sync-status-text');
  const badge = document.querySelector('.adm-sync-card .adm-sync-badge');

  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Đang cập nhật...';
  }
  if (badge) {
    badge.className = 'adm-sync-badge updating';
    badge.textContent = 'Đang Cập Nhật';
  }
  if (statusEl) {
    statusEl.innerHTML = '<span class="adm-sync-msg">Đang quét sản phẩm từ yadeavietthanh.vn...</span>';
  }

  try {
    const result = await api('/api/admin/sync-products', { method: 'POST' });
    adminData = await api('/api/admin/data');
    showToast(`Cập nhật xong: ${result.updated || 0} giá, ${result.added || 0} SP mới`);
    await initDashboard();
  } catch (err) {
    showToast(err.message || 'Cập nhật giá thất bại', true);
    if (btn) {
      btn.disabled = false;
      btn.textContent = '↻ Cập nhật giá';
    }
    if (badge) {
      badge.className = 'adm-sync-badge error';
      badge.textContent = 'Lỗi';
    }
    if (statusEl) {
      statusEl.innerHTML = `<span class="adm-sync-msg">${esc(err.message || 'Lỗi đồng bộ')}</span>`;
    }
  }
}

/* ─── Settings ─── */
async function initSettings() {
  if (!(await checkAuth())) { window.location.href = '/admin/'; return; }
  adminData = await api('/api/admin/data');
  renderShell('settings', 'Bảo mật');
  renderSiteSettings();
}

function renderSiteSettings() {
  document.getElementById('settings-content').innerHTML = `
    <div class="adm-card">
      <div class="adm-card-header"><h3>Tùy chỉnh website</h3></div>
      <div class="adm-card-body">
        <p class="adm-panel-hint">Logo, favicon, banner, sản phẩm trang chủ, chân trang và liên hệ được quản lý tại trang Tùy chỉnh website.</p>
        <a href="/admin/customize.html" class="adm-btn adm-btn-primary">→ Mở Tùy chỉnh website</a>
      </div>
    </div>

    <div class="adm-card">
      <div class="adm-card-header"><h3>Bảo mật</h3></div>
      <div class="adm-card-body">
        <form id="password-form">
          <div class="adm-form-row">
            <div class="adm-form-group"><label>Mật khẩu hiện tại</label><input class="adm-input" type="password" name="currentPassword" required></div>
            <div class="adm-form-group"><label>Mật khẩu mới</label><input class="adm-input" type="password" name="newPassword" required minlength="6"></div>
          </div>
          <div class="adm-form-group"><label>Xác nhận mật khẩu mới</label><input class="adm-input" type="password" name="confirmPassword" required></div>
          <button type="submit" class="adm-btn adm-btn-outline">🔒 Đổi mật khẩu</button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('password-form').onsubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = e.target;
    if (newPassword.value !== confirmPassword.value) {
      showToast('Mật khẩu xác nhận không khớp', true);
      return;
    }
    try {
      await api('/api/admin/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: currentPassword.value, newPassword: newPassword.value }),
      });
      showToast('Đổi mật khẩu thành công!');
      e.target.reset();
    } catch (err) {
      showToast(err.message, true);
    }
  };
}

/* ─── Website Customize ─── */
let customizeTab = 'brand';

function ensureCustomizeDefaults() {
  if (!adminData.homepage) {
    adminData.homepage = {
      featuredProductIds: adminData.products.filter(p => p.featured).slice(0, 9).map(p => p.id),
      productsSectionTitle: '',
      productsButtonText: 'XEM THÊM SẢN PHẨM',
      newsSectionTitle: 'Thông tin hữu ích',
      storesSectionTitle: 'Hệ thống cửa hàng',
      storesSectionSubtitle: '',
      showFeatures: true,
      showNews: true,
      showStores: true,
      showProducts: true,
    };
  }
  if (!adminData.footer) {
    adminData.footer = {
      aboutTitle: 'Về ' + adminData.site.name,
      aboutLinks: [
        { label: 'Sản phẩm', url: '/san-pham.html' },
        { label: 'Tìm cửa hàng', url: '/lien-he.html' },
        { label: 'Tin tức', url: '/#news' },
      ],
      supportTitle: 'Hỗ trợ khách hàng',
      supportLinks: [
        { label: 'Liên hệ', url: '/lien-he.html' },
        { label: 'Tư vấn', url: 'tel:' },
        { label: 'Facebook', url: adminData.site.facebook },
      ],
      showCategories: true,
      categoriesTitle: 'Danh mục',
      copyright: `© ${new Date().getFullYear()} ${adminData.site.name}. Xe điện Yadea chính hãng.`,
      companyInfo: '',
      showCompanyInfo: false,
    };
  }
  if (!adminData.contactPage) {
    adminData.contactPage = {
      title: 'Liên hệ với chúng tôi',
      subtitle: 'Hãy để lại thông tin, chúng tôi sẽ tư vấn miễn phí',
      formTitle: 'Gửi yêu cầu tư vấn',
      storeTitle: adminData.site.name,
      storeMapLinkText: 'Xem bản đồ →',
    };
  }
  if (!adminData.branches?.length) {
    adminData.branches = [{
      id: 'main',
      name: 'Chi nhánh chính - Âu Cơ',
      address: adminData.site.address,
      hotline: adminData.site.hotline || adminData.site.phone,
      mapLink: '',
      isMain: true,
    }];
  }
}

async function initCustomize() {
  if (!(await checkAuth())) { window.location.href = '/admin/'; return; }
  adminData = await api('/api/admin/data');
  ensureCustomizeDefaults();
  const params = new URLSearchParams(location.search);
  customizeTab = params.get('tab') || 'brand';
  renderShell('customize', 'Tùy chỉnh website');
  renderCustomize();
}

function renderCustomize() {
  const tabs = [
    { id: 'brand', label: 'Logo & Thương hiệu' },
    { id: 'banner', label: 'Banner' },
    { id: 'homepage', label: 'Trang chủ' },
    { id: 'footer', label: 'Chân trang' },
    { id: 'contact', label: 'Liên hệ' },
  ];

  document.getElementById('customize-content').innerHTML = `
    <div class="adm-customize-intro">
      <p>Chỉnh sửa mọi thành phần website — logo, banner, sản phẩm trang chủ, chân trang và thông tin liên hệ.</p>
      <a href="/" target="_blank" class="adm-btn adm-btn-outline adm-btn-sm">${ICONS.external} Xem website</a>
    </div>
    <div class="adm-customize-tabs">
      ${tabs.map(t => `<button type="button" class="adm-customize-tab ${customizeTab === t.id ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`).join('')}
    </div>
    <div id="customize-panel"></div>
  `;

  document.querySelectorAll('.adm-customize-tab').forEach(btn => {
    btn.onclick = () => {
      customizeTab = btn.dataset.tab;
      history.replaceState(null, '', `?tab=${customizeTab}`);
      renderCustomize();
    };
  });

  const panel = document.getElementById('customize-panel');
  if (customizeTab === 'brand') panel.innerHTML = renderBrandPanel();
  else if (customizeTab === 'banner') panel.innerHTML = renderBannerPanel();
  else if (customizeTab === 'homepage') panel.innerHTML = renderHomepagePanel();
  else if (customizeTab === 'footer') panel.innerHTML = renderFooterPanel();
  else if (customizeTab === 'contact') panel.innerHTML = renderContactPanel();

  bindCustomizeEvents();
}

function renderBrandPanel() {
  const s = adminData.site;
  return `
    <div class="adm-card">
      <div class="adm-card-header"><h3>Logo & Favicon</h3></div>
      <div class="adm-card-body">
        <div class="adm-form-section">
          <div class="adm-form-section-title">🏪 Thông tin cửa hàng</div>
          <div class="adm-form-row">
            <div class="adm-form-group"><label>Tên cửa hàng</label><input class="adm-input" type="text" id="c-name" value="${esc(s.name)}"></div>
            <div class="adm-form-group"><label>Slogan</label><input class="adm-input" type="text" id="c-tagline" value="${esc(s.tagline)}"></div>
          </div>
        </div>
        <div class="adm-form-section">
          <div class="adm-form-section-title">🖼️ Logo</div>
          ${imageUploadField('c-logo', 'Logo header & chân trang', s.logo, 'logo')}
        </div>
        <div class="adm-form-section">
          <div class="adm-form-section-title">⭐ Favicon</div>
          ${imageUploadField('c-favicon', 'Icon tab trình duyệt', s.favicon, 'favicon')}
        </div>
        <button class="adm-btn adm-btn-primary" id="save-brand-btn">💾 Lưu thương hiệu</button>
      </div>
    </div>
  `;
}

function renderBannerPanel() {
  const banners = adminData.banners || [];
  return `
    <div class="adm-card">
      <div class="adm-card-header">
        <h3>Banner trang chủ</h3>
        <a href="/admin/banners.html" class="adm-btn adm-btn-primary adm-btn-sm">+ Quản lý banner</a>
      </div>
      <div class="adm-card-body">
        <p class="adm-panel-hint">Banner hiển thị ở đầu trang chủ. Khuyến nghị: Desktop ${IMAGE_SPECS.bannerDesktop} · Mobile ${IMAGE_SPECS.bannerMobile}</p>
        ${banners.length ? `
          <div class="adm-banner-grid">
            ${banners.map(b => `
              <div class="adm-banner-card">
                <img src="${esc(b.image)}" alt="${esc(b.alt)}">
                <div class="adm-banner-card-body">
                  <h4>${esc(b.alt || 'Banner')}</h4>
                  <div class="adm-banner-card-actions">
                    <a href="/admin/banners.html" class="adm-btn adm-btn-outline adm-btn-sm">Chỉnh sửa</a>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : '<p class="adm-empty">Chưa có banner. <a href="/admin/banners.html">Thêm banner</a></p>'}
      </div>
    </div>
    <div class="adm-card">
      <div class="adm-card-header"><h3>Sản phẩm</h3></div>
      <div class="adm-card-body">
        <p class="adm-panel-hint">Quản lý toàn bộ sản phẩm, giá, ảnh và danh mục.</p>
        <a href="/admin/products.html" class="adm-btn adm-btn-outline">→ Quản lý sản phẩm (${adminData.products.length})</a>
      </div>
    </div>
  `;
}

function renderHomepagePanel() {
  const hp = adminData.homepage;
  const sections = hp.categorySections || [
    { slug: 'xe-may-dien', title: 'Xe máy điện' },
    { slug: 'xe-hoc-sinh', title: 'Xe máy điện học sinh' },
    { slug: 'xe-dap-dien', title: 'Xe Đạp Điện - Trợ Lực' },
  ];
  const selectedIds = hp.featuredProductIds || [];
  const selectedProducts = selectedIds.map(id => adminData.products.find(p => p.id === id)).filter(Boolean);
  const unselected = adminData.products.filter(p => !selectedIds.includes(p.id));

  const sectionStats = sections.map(s => {
    const count = adminData.products.filter(p => (p.categories || [p.category]).includes(s.slug)).length;
    return `<li><strong>${esc(s.title)}</strong> — ${count} sản phẩm · hiển thị 8 (2 hàng × 4)${count > 8 ? ' · có nút Xem thêm' : ''}</li>`;
  }).join('');

  return `
    <div class="adm-card">
      <div class="adm-card-header"><h3>Danh mục sản phẩm trang chủ</h3></div>
      <div class="adm-card-body">
        <p class="adm-panel-hint">Trang chủ hiển thị 3 danh mục, mỗi danh mục 2 hàng × 4 sản phẩm. Nếu nhiều hơn 8 sản phẩm sẽ có nút <strong>Xem thêm</strong>.</p>
        <ul class="adm-category-stats">${sectionStats}</ul>
        <div class="adm-form-group" style="margin-top:16px"><label>Nhãn nút Xem thêm</label><input class="adm-input" id="hp-products-btn" value="${esc(hp.productsButtonText || 'XEM THÊM SẢN PHẨM')}"></div>
      </div>
    </div>

    <div class="adm-card">
      <div class="adm-card-header"><h3>Hiển thị trang chủ</h3></div>
      <div class="adm-card-body">
        <div class="adm-form-row adm-toggle-row">
          <label class="adm-check"><input type="checkbox" id="hp-show-features" ${hp.showFeatures !== false ? 'checked' : ''}> Cam kết (4 icon)</label>
          <label class="adm-check"><input type="checkbox" id="hp-show-products" ${hp.showProducts !== false ? 'checked' : ''}> Sản phẩm</label>
          <label class="adm-check"><input type="checkbox" id="hp-show-news" ${hp.showNews !== false ? 'checked' : ''}> Tin tức</label>
          <label class="adm-check"><input type="checkbox" id="hp-show-stores" ${hp.showStores !== false ? 'checked' : ''}> Cửa hàng</label>
        </div>
        <div class="adm-form-row">
          <div class="adm-form-group"><label>Tiêu đề tin tức</label><input class="adm-input" id="hp-news-title" value="${esc(hp.newsSectionTitle || 'Thông tin hữu ích')}"></div>
          <div class="adm-form-group"><label>Tiêu đề cửa hàng</label><input class="adm-input" id="hp-stores-title" value="${esc(hp.storesSectionTitle || 'Hệ thống cửa hàng')}"></div>
        </div>
        <div class="adm-form-group"><label>Mô tả cửa hàng</label><input class="adm-input" id="hp-stores-sub" value="${esc(hp.storesSectionSubtitle || '')}" placeholder="VD: Cửa hàng xe điện Yadea Tân Bình"></div>
      </div>
    </div>

    <div class="adm-card">
      <div class="adm-card-header">
        <h3>Sản phẩm ưu tiên (trong từng danh mục)</h3>
        <span class="adm-count">${selectedProducts.length} sản phẩm</span>
      </div>
      <div class="adm-card-body">
        <p class="adm-panel-hint">Sản phẩm được chọn sẽ hiển thị trước trong danh mục tương ứng trên trang chủ (tối đa 8 sản phẩm/danh mục).</p>
        <div class="adm-hp-picker">
          <div class="adm-hp-col">
            <div class="adm-hp-col-title">Đã chọn (thứ tự hiển thị)</div>
            <div class="adm-hp-selected" id="hp-selected-list">
              ${selectedProducts.length ? selectedProducts.map((p, i) => hpProductRow(p, i, selectedProducts.length)).join('') : '<p class="adm-empty-sm">Chưa chọn sản phẩm nào</p>'}
            </div>
          </div>
          <div class="adm-hp-col">
            <div class="adm-hp-col-title">Thêm sản phẩm</div>
            <input class="adm-input" type="search" id="hp-search" placeholder="Tìm sản phẩm...">
            <div class="adm-hp-available" id="hp-available-list">
              ${unselected.slice(0, 50).map(p => `
                <div class="adm-hp-item" data-id="${p.id}">
                  <img src="${esc(p.image)}" alt="">
                  <span>${esc(p.name)}</span>
                  <button type="button" class="adm-btn adm-btn-sm adm-btn-primary hp-add-btn" data-id="${p.id}">+ Thêm</button>
                </div>
              `).join('')}
              ${unselected.length > 50 ? `<p class="adm-empty-sm">+ ${unselected.length - 50} sản phẩm khác — dùng tìm kiếm</p>` : ''}
            </div>
          </div>
        </div>
        <button class="adm-btn adm-btn-primary" id="save-homepage-btn" style="margin-top:20px">💾 Lưu trang chủ</button>
      </div>
    </div>
  `;
}

function hpProductRow(p, index, total) {
  return `
    <div class="adm-hp-item adm-hp-selected-item" data-id="${p.id}">
      <span class="adm-hp-order">${index + 1}</span>
      <img src="${esc(p.image)}" alt="">
      <span class="adm-hp-name">${esc(p.name)}</span>
      <div class="adm-hp-actions">
        <button type="button" class="adm-btn-icon hp-move-up" data-id="${p.id}" ${index === 0 ? 'disabled' : ''} title="Lên">↑</button>
        <button type="button" class="adm-btn-icon hp-move-down" data-id="${p.id}" ${index === total - 1 ? 'disabled' : ''} title="Xuống">↓</button>
        <button type="button" class="adm-btn-icon hp-remove" data-id="${p.id}" title="Xóa">×</button>
      </div>
    </div>
  `;
}

function renderLinksEditor(prefix, links) {
  return (links || []).map((link, i) => `
    <div class="adm-link-row" data-index="${i}">
      <input class="adm-input" type="text" placeholder="Nhãn" data-field="label" value="${esc(link.label)}">
      <input class="adm-input" type="text" placeholder="URL (/san-pham.html hoặc https://...)" data-field="url" value="${esc(link.url)}">
      <button type="button" class="adm-btn-icon link-remove" data-prefix="${prefix}" data-index="${i}" title="Xóa">×</button>
    </div>
  `).join('');
}

function renderFooterPanel() {
  const f = adminData.footer;
  return `
    <div class="adm-card">
      <div class="adm-card-header"><h3>Chân trang (Footer)</h3></div>
      <div class="adm-card-body">
        <p class="adm-panel-hint">Cột 1 (logo, slogan, hotline) lấy từ thông tin cửa hàng. Tùy chỉnh các cột link bên dưới.</p>
        <div class="adm-form-section">
          <div class="adm-form-section-title">Cột "Về cửa hàng"</div>
          <div class="adm-form-group"><label>Tiêu đề cột</label><input class="adm-input" id="f-about-title" value="${esc(f.aboutTitle)}"></div>
          <div id="f-about-links">${renderLinksEditor('about', f.aboutLinks)}</div>
          <button type="button" class="adm-btn adm-btn-outline adm-btn-sm link-add-btn" data-prefix="about">+ Thêm link</button>
        </div>
        <div class="adm-form-section">
          <div class="adm-form-section-title">Cột danh mục</div>
          <label class="adm-check"><input type="checkbox" id="f-show-categories" ${f.showCategories !== false ? 'checked' : ''}> Hiển thị cột danh mục sản phẩm</label>
          <div class="adm-form-group"><label>Tiêu đề cột danh mục</label><input class="adm-input" id="f-categories-title" value="${esc(f.categoriesTitle || 'Danh mục')}"></div>
        </div>
        <div class="adm-form-section">
          <div class="adm-form-section-title">Cột hỗ trợ khách hàng</div>
          <div class="adm-form-group"><label>Tiêu đề cột</label><input class="adm-input" id="f-support-title" value="${esc(f.supportTitle)}"></div>
          <div id="f-support-links">${renderLinksEditor('support', f.supportLinks)}</div>
          <button type="button" class="adm-btn adm-btn-outline adm-btn-sm link-add-btn" data-prefix="support">+ Thêm link</button>
        </div>
        <div class="adm-form-section">
          <div class="adm-form-section-title">Dòng cuối trang</div>
          <div class="adm-form-group"><label>Bản quyền / Copyright</label><input class="adm-input" id="f-copyright" value="${esc(f.copyright)}"></div>
          <label class="adm-check"><input type="checkbox" id="f-show-company" ${f.showCompanyInfo ? 'checked' : ''}> Hiển thị thông tin công ty</label>
          <div class="adm-form-group"><label>Thông tin công ty</label><input class="adm-input" id="f-company" value="${esc(f.companyInfo || '')}" placeholder="Tên công ty, GPKD..."></div>
        </div>
        <button class="adm-btn adm-btn-primary" id="save-footer-btn">💾 Lưu chân trang</button>
      </div>
    </div>
  `;
}

function renderBranchEditorRow(b, index, total) {
  const isMain = b.isMain === true;
  return `
    <div class="adm-branch-row ${isMain ? 'adm-branch-main' : ''}" data-id="${esc(b.id)}">
      <div class="adm-branch-row-head">
        <strong>${isMain ? '⭐ Chi nhánh chính' : `Chi nhánh ${index + 1}`}</strong>
        <div class="adm-hp-actions">
          <button type="button" class="adm-btn-icon branch-move-up" ${index === 0 ? 'disabled' : ''} title="Lên">↑</button>
          <button type="button" class="adm-btn-icon branch-move-down" ${index === total - 1 ? 'disabled' : ''} title="Xuống">↓</button>
          ${isMain ? '' : '<button type="button" class="adm-btn adm-btn-outline adm-btn-sm branch-remove" title="Xóa">Xóa</button>'}
        </div>
      </div>
      <label class="adm-check branch-main-check" style="margin-bottom:12px">
        <input type="checkbox" class="branch-is-main" ${isMain ? 'checked' : ''}> Đặt làm chi nhánh chính (hiển thị nổi bật, in to)
      </label>
      <div class="adm-form-row">
        <div class="adm-form-group"><label>Tên chi nhánh</label><input class="adm-input branch-name" value="${esc(b.name)}" placeholder="CN1 - Tân Bình"></div>
        <div class="adm-form-group"><label>Hotline</label><input class="adm-input branch-hotline" value="${esc(b.hotline)}" placeholder="0933 969396"></div>
      </div>
      <div class="adm-form-group"><label>Địa chỉ</label><input class="adm-input branch-address" value="${esc(b.address)}"></div>
      <div class="adm-form-group">
        <label>Link Google Maps (tùy chọn)</label>
        <input class="adm-input branch-map" value="${esc(b.mapLink || '')}" placeholder="https://maps.google.com/...">
      </div>
    </div>
  `;
}

function renderContactPanel() {
  const s = adminData.site;
  const c = adminData.contactPage;
  const branches = adminData.branches || [];
  return `
    <div class="adm-card">
      <div class="adm-card-header"><h3>Thông tin liên hệ chung</h3></div>
      <div class="adm-card-body">
        <div class="adm-form-section">
          <div class="adm-form-section-title">📞 Số điện thoại & mạng xã hội</div>
          <div class="adm-form-row">
            <div class="adm-form-group"><label>Hotline</label><input class="adm-input" id="c-hotline" value="${esc(s.hotline)}"></div>
            <div class="adm-form-group"><label>SĐT tư vấn</label><input class="adm-input" id="c-phone" value="${esc(s.phone)}"></div>
          </div>
          <div class="adm-form-row">
            <div class="adm-form-group"><label>Zalo</label><input class="adm-input" id="c-zalo" value="${esc(s.zalo)}"></div>
            <div class="adm-form-group"><label>Email</label><input class="adm-input" id="c-email" value="${esc(s.email)}"></div>
          </div>
          <div class="adm-form-group"><label>Facebook</label><input class="adm-input" id="c-facebook" value="${esc(s.facebook)}"></div>
        </div>
        <div class="adm-form-section">
          <div class="adm-form-section-title">📍 Địa chỉ chính & bản đồ</div>
          <div class="adm-form-group"><label>Địa chỉ hiển thị header/footer</label><input class="adm-input" id="c-address" value="${esc(s.address)}"></div>
          <div class="adm-form-group"><label>Giờ làm việc</label><input class="adm-input" id="c-hours" value="${esc(s.workingHours)}"></div>
          <div class="adm-form-group">
            <label>Google Maps Embed URL (trang liên hệ)</label>
            <input class="adm-input" id="c-map" value="${esc(s.mapEmbed)}" placeholder="https://www.google.com/maps/embed?pb=...">
            <div class="adm-img-spec">Lấy từ Google Maps → Chia sẻ → Nhúng bản đồ → sao chép src iframe</div>
          </div>
        </div>
        <div class="adm-form-section">
          <div class="adm-form-section-title">📄 Trang liên hệ</div>
          <div class="adm-form-group"><label>Tiêu đề trang</label><input class="adm-input" id="cp-title" value="${esc(c.title)}"></div>
          <div class="adm-form-group"><label>Mô tả</label><input class="adm-input" id="cp-subtitle" value="${esc(c.subtitle)}"></div>
          <div class="adm-form-group"><label>Tiêu đề form</label><input class="adm-input" id="cp-form-title" value="${esc(c.formTitle)}"></div>
        </div>
      </div>
    </div>

    <div class="adm-card">
      <div class="adm-card-header">
        <h3>Hệ thống chi nhánh</h3>
        <span class="adm-count">${branches.length} chi nhánh</span>
      </div>
      <div class="adm-card-body">
        <p class="adm-panel-hint">Danh sách cửa hàng hiển thị ở trang chủ và trang liên hệ. Có thể thêm, sửa, xóa và sắp xếp thứ tự.</p>
        <div class="adm-branches-list" id="branches-list">
          ${branches.map((b, i) => renderBranchEditorRow(b, i, branches.length)).join('')}
        </div>
        <button type="button" class="adm-btn adm-btn-outline adm-btn-sm" id="add-branch-btn" style="margin-top:12px">+ Thêm chi nhánh</button>
        <button class="adm-btn adm-btn-primary" id="save-contact-btn" style="margin-top:20px">💾 Lưu liên hệ & chi nhánh</button>
      </div>
    </div>
  `;
}

function collectLinks(containerId) {
  const rows = document.querySelectorAll(`#${containerId} .adm-link-row`);
  return Array.from(rows).map(row => ({
    label: row.querySelector('[data-field=label]').value.trim(),
    url: row.querySelector('[data-field=url]').value.trim(),
  })).filter(l => l.label || l.url);
}

function collectBranchesFromDOM() {
  return Array.from(document.querySelectorAll('.adm-branch-row')).map((row, i) => ({
    id: row.dataset.id || `cn${Date.now()}-${i}`,
    name: row.querySelector('.branch-name')?.value.trim() || `CN${i + 1}`,
    address: row.querySelector('.branch-address')?.value.trim() || '',
    hotline: row.querySelector('.branch-hotline')?.value.trim() || '',
    mapLink: row.querySelector('.branch-map')?.value.trim() || '',
    isMain: row.querySelector('.branch-is-main')?.checked === true,
  })).filter(b => b.name || b.address || b.hotline);
}

function normalizeMainBranch(branches) {
  const list = branches.filter(b => b.name || b.address || b.hotline);
  if (!list.length) return list;
  let mainIdx = list.findIndex(b => b.isMain);
  if (mainIdx < 0) mainIdx = 0;
  list.forEach(b => { b.isMain = false; });
  const main = list.splice(mainIdx, 1)[0];
  main.isMain = true;
  list.unshift(main);
  return list;
}

function renderBranchesList(branches) {
  adminData.branches = normalizeMainBranch(branches);
  const list = document.getElementById('branches-list');
  if (!list) return;
  list.innerHTML = adminData.branches.map((b, i) => renderBranchEditorRow(b, i, adminData.branches.length)).join('');
  bindBranchEditorEvents(document.getElementById('customize-panel'));
  const countEl = document.querySelector('.adm-card-header .adm-count');
  if (countEl) countEl.textContent = `${adminData.branches.length} chi nhánh`;
}

function refreshBranchesEditor() {
  renderBranchesList(collectBranchesFromDOM());
}

function bindBranchEditorEvents(panel) {
  panel?.querySelectorAll('.branch-remove').forEach(btn => {
    btn.onclick = () => {
      const row = btn.closest('.adm-branch-row');
      if (row?.querySelector('.branch-is-main')?.checked) {
        showToast('Không thể xóa chi nhánh chính. Hãy chọn chi nhánh khác làm chính trước.', true);
        return;
      }
      row?.remove();
      refreshBranchesEditor();
    };
  });
  panel?.querySelectorAll('.branch-is-main').forEach(cb => {
    cb.onchange = () => {
      if (cb.checked) {
        panel.querySelectorAll('.branch-is-main').forEach(other => {
          if (other !== cb) other.checked = false;
        });
      } else {
        const any = [...panel.querySelectorAll('.branch-is-main')].some(c => c.checked);
        if (!any) cb.checked = true;
      }
      renderBranchesList(collectBranchesFromDOM());
    };
  });
  panel?.querySelectorAll('.branch-move-up').forEach(btn => {
    btn.onclick = () => {
      const rows = collectBranchesFromDOM();
      const row = btn.closest('.adm-branch-row');
      const i = Array.from(document.querySelectorAll('.adm-branch-row')).indexOf(row);
      if (i <= 0) return;
      [rows[i - 1], rows[i]] = [rows[i], rows[i - 1]];
      renderBranchesList(rows);
    };
  });
  panel?.querySelectorAll('.branch-move-down').forEach(btn => {
    btn.onclick = () => {
      const rows = collectBranchesFromDOM();
      const row = btn.closest('.adm-branch-row');
      const i = Array.from(document.querySelectorAll('.adm-branch-row')).indexOf(row);
      if (i < 0 || i >= rows.length - 1) return;
      [rows[i], rows[i + 1]] = [rows[i + 1], rows[i]];
      renderBranchesList(rows);
    };
  });
  const addBtn = document.getElementById('add-branch-btn');
  if (addBtn) {
    addBtn.onclick = () => {
      const rows = collectBranchesFromDOM();
      const n = rows.length + 1;
      rows.push({
        id: `cn${Date.now()}`,
        name: `CN${n}`,
        address: '',
        hotline: '',
        mapLink: '',
        isMain: false,
      });
      renderBranchesList(rows);
    };
  }
}

function bindCustomizeEvents() {
  const panel = document.getElementById('customize-panel');
  bindImageUploads(panel);

  document.getElementById('save-brand-btn')?.addEventListener('click', async () => {
    adminData.site.name = document.getElementById('c-name').value.trim();
    adminData.site.tagline = document.getElementById('c-tagline').value.trim();
    adminData.site.logo = document.getElementById('c-logo').value.trim();
    adminData.site.favicon = document.getElementById('c-favicon').value.trim();
    await saveData();
  });

  document.getElementById('save-footer-btn')?.addEventListener('click', async () => {
    adminData.footer = {
      aboutTitle: document.getElementById('f-about-title').value.trim(),
      aboutLinks: collectLinks('f-about-links'),
      showCategories: document.getElementById('f-show-categories').checked,
      categoriesTitle: document.getElementById('f-categories-title').value.trim(),
      supportTitle: document.getElementById('f-support-title').value.trim(),
      supportLinks: collectLinks('f-support-links'),
      copyright: document.getElementById('f-copyright').value.trim(),
      companyInfo: document.getElementById('f-company').value.trim(),
      showCompanyInfo: document.getElementById('f-show-company').checked,
    };
    await saveData();
  });

  document.getElementById('save-contact-btn')?.addEventListener('click', async () => {
    adminData.site.hotline = document.getElementById('c-hotline').value.trim();
    adminData.site.phone = document.getElementById('c-phone').value.trim();
    adminData.site.zalo = document.getElementById('c-zalo').value.trim();
    adminData.site.email = document.getElementById('c-email').value.trim();
    adminData.site.facebook = document.getElementById('c-facebook').value.trim();
    adminData.site.address = document.getElementById('c-address').value.trim();
    adminData.site.workingHours = document.getElementById('c-hours').value.trim();
    adminData.site.mapEmbed = document.getElementById('c-map').value.trim();
    adminData.contactPage = {
      ...adminData.contactPage,
      title: document.getElementById('cp-title').value.trim(),
      subtitle: document.getElementById('cp-subtitle').value.trim(),
      formTitle: document.getElementById('cp-form-title').value.trim(),
    };
    adminData.branches = normalizeMainBranch(collectBranchesFromDOM());
    if (adminData.branches[0]?.isMain) {
      const main = adminData.branches[0];
      adminData.site.address = main.address || adminData.site.address;
      adminData.site.hotline = main.hotline || adminData.site.hotline;
      adminData.site.phone = main.hotline || adminData.site.phone;
    }
    await saveData();
  });

  bindBranchEditorEvents(panel);

  document.getElementById('save-homepage-btn')?.addEventListener('click', async () => {
    adminData.homepage = {
      ...adminData.homepage,
      showFeatures: document.getElementById('hp-show-features').checked,
      showProducts: document.getElementById('hp-show-products').checked,
      showNews: document.getElementById('hp-show-news').checked,
      showStores: document.getElementById('hp-show-stores').checked,
      productsButtonText: document.getElementById('hp-products-btn').value.trim(),
      newsSectionTitle: document.getElementById('hp-news-title').value.trim(),
      storesSectionTitle: document.getElementById('hp-stores-title').value.trim(),
      storesSectionSubtitle: document.getElementById('hp-stores-sub').value.trim(),
    };
    syncFeaturedFlags();
    await saveData();
  });

  panel.querySelectorAll('.link-add-btn').forEach(btn => {
    btn.onclick = () => {
      const prefix = btn.dataset.prefix;
      const container = document.getElementById(`f-${prefix}-links`);
      const div = document.createElement('div');
      div.className = 'adm-link-row';
      div.innerHTML = `
        <input class="adm-input" type="text" placeholder="Nhãn" data-field="label" value="">
        <input class="adm-input" type="text" placeholder="URL" data-field="url" value="">
        <button type="button" class="adm-btn-icon link-remove" title="Xóa">×</button>
      `;
      div.querySelector('.link-remove').onclick = () => div.remove();
      container.appendChild(div);
    };
  });

  panel.querySelectorAll('.link-remove').forEach(btn => {
    btn.onclick = () => btn.closest('.adm-link-row')?.remove();
  });

  panel.querySelectorAll('.hp-add-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      if (!adminData.homepage.featuredProductIds.includes(id)) {
        adminData.homepage.featuredProductIds.push(id);
        refreshHomepagePicker();
      }
    };
  });

  panel.querySelectorAll('.hp-remove').forEach(btn => {
    btn.onclick = () => {
      adminData.homepage.featuredProductIds = adminData.homepage.featuredProductIds.filter(x => x !== btn.dataset.id);
      refreshHomepagePicker();
    };
  });

  panel.querySelectorAll('.hp-move-up').forEach(btn => {
    btn.onclick = () => moveHomepageProduct(btn.dataset.id, -1);
  });

  panel.querySelectorAll('.hp-move-down').forEach(btn => {
    btn.onclick = () => moveHomepageProduct(btn.dataset.id, 1);
  });

  document.getElementById('hp-search')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    const selected = new Set(adminData.homepage.featuredProductIds);
    const list = document.getElementById('hp-available-list');
    const filtered = adminData.products.filter(p => !selected.has(p.id) && (!q || p.name.toLowerCase().includes(q))).slice(0, 30);
    list.innerHTML = filtered.length
      ? filtered.map(p => `
          <div class="adm-hp-item" data-id="${p.id}">
            <img src="${esc(p.image)}" alt="">
            <span>${esc(p.name)}</span>
            <button type="button" class="adm-btn adm-btn-sm adm-btn-primary hp-add-btn" data-id="${p.id}">+ Thêm</button>
          </div>
        `).join('')
      : '<p class="adm-empty-sm">Không tìm thấy sản phẩm</p>';
    list.querySelectorAll('.hp-add-btn').forEach(b => {
      b.onclick = () => {
        if (!adminData.homepage.featuredProductIds.includes(b.dataset.id)) {
          adminData.homepage.featuredProductIds.push(b.dataset.id);
          refreshHomepagePicker();
        }
      };
    });
  });
}

function moveHomepageProduct(id, dir) {
  const ids = adminData.homepage.featuredProductIds;
  const i = ids.indexOf(id);
  if (i < 0) return;
  const j = i + dir;
  if (j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  refreshHomepagePicker();
}

function syncFeaturedFlags() {
  const ids = new Set(adminData.homepage?.featuredProductIds || []);
  adminData.products.forEach(p => { p.featured = ids.has(p.id); });
}

function refreshHomepagePicker() {
  const selectedIds = adminData.homepage.featuredProductIds;
  const selectedProducts = selectedIds.map(id => adminData.products.find(p => p.id === id)).filter(Boolean);
  const unselected = adminData.products.filter(p => !selectedIds.includes(p.id));
  const search = document.getElementById('hp-search')?.value.toLowerCase().trim() || '';

  const selectedList = document.getElementById('hp-selected-list');
  if (selectedList) {
    selectedList.innerHTML = selectedProducts.length
      ? selectedProducts.map((p, i) => hpProductRow(p, i, selectedProducts.length)).join('')
      : '<p class="adm-empty-sm">Chưa chọn sản phẩm nào</p>';
    selectedList.querySelectorAll('.hp-remove').forEach(btn => {
      btn.onclick = () => {
        adminData.homepage.featuredProductIds = adminData.homepage.featuredProductIds.filter(x => x !== btn.dataset.id);
        refreshHomepagePicker();
      };
    });
    selectedList.querySelectorAll('.hp-move-up').forEach(btn => {
      btn.onclick = () => moveHomepageProduct(btn.dataset.id, -1);
    });
    selectedList.querySelectorAll('.hp-move-down').forEach(btn => {
      btn.onclick = () => moveHomepageProduct(btn.dataset.id, 1);
    });
  }

  const availableList = document.getElementById('hp-available-list');
  if (availableList && !search) {
    availableList.innerHTML = unselected.slice(0, 50).map(p => `
      <div class="adm-hp-item" data-id="${p.id}">
        <img src="${esc(p.image)}" alt="">
        <span>${esc(p.name)}</span>
        <button type="button" class="adm-btn adm-btn-sm adm-btn-primary hp-add-btn" data-id="${p.id}">+ Thêm</button>
      </div>
    `).join('') + (unselected.length > 50 ? `<p class="adm-empty-sm">+ ${unselected.length - 50} sản phẩm khác — dùng tìm kiếm</p>` : '');
    availableList.querySelectorAll('.hp-add-btn').forEach(b => {
      b.onclick = () => {
        if (!adminData.homepage.featuredProductIds.includes(b.dataset.id)) {
          adminData.homepage.featuredProductIds.push(b.dataset.id);
          refreshHomepagePicker();
        }
      };
    });
  }
}

/* ─── Products ─── */
function rebuildProductsToolbar() {
  document.getElementById('products-toolbar').innerHTML = `
    <div class="adm-toolbar-left">
      <div class="adm-tabs"><button class="adm-tab active">Tất cả</button></div>
      <select class="adm-filter-select" id="category-filter">
        <option value="">Tất cả danh mục</option>
        ${adminData.categories.map(c => `<option value="${c.slug}" ${productFilter.category === c.slug ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
      </select>
      <span class="adm-count" id="product-count"></span>
    </div>
    <div class="adm-toolbar-right">
      <button class="adm-btn adm-btn-outline" id="sync-products-btn">↻ Cập nhật giá</button>
      <button class="adm-btn adm-btn-primary" id="add-product-btn">+ Thêm sản phẩm</button>
    </div>
  `;
  initProductsToolbar();
}

async function initProducts() {
  if (!(await checkAuth())) { window.location.href = '/admin/'; return; }
  adminData = await api('/api/admin/data');
  renderShell('products', 'Sản phẩm', true);
  rebuildProductsToolbar();
  renderProductsTable();
}

function initProductsToolbar() {
  document.getElementById('category-filter').onchange = (e) => {
    productFilter.category = e.target.value;
    renderProductsTable();
  };
  document.getElementById('add-product-btn').onclick = () => openProductForm();
  document.getElementById('sync-products-btn').onclick = async () => {
    if (!confirm('Cập nhật giá và sản phẩm mới từ yadeavietthanh.vn?\nDanh mục bạn đã chỉnh sẽ được giữ nguyên.')) return;
    const btn = document.getElementById('sync-products-btn');
    btn.disabled = true;
    btn.textContent = 'Đang cập nhật...';
    try {
      const { updated, added, count } = await api('/api/admin/sync-products', { method: 'POST' });
      adminData = await api('/api/admin/data');
      showToast(`Cập nhật ${updated || 0} giá, ${added || 0} SP mới (nguồn: ${count})`);
      renderShell('products', 'Sản phẩm', true);
      rebuildProductsToolbar();
      renderProductsTable();
    } catch (err) { showToast(err.message, true); }
    finally { btn.disabled = false; btn.textContent = '↻ Cập nhật giá'; }
  };
}

function getFilteredProducts() {
  let list = adminData.products || [];
  if (productFilter.q) {
    const q = productFilter.q.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q));
  }
  if (productFilter.category) {
    list = list.filter(p => (p.categories || [p.category]).includes(productFilter.category));
  }
  return list;
}

function renderProductsTable() {
  const products = getFilteredProducts();
  const countEl = document.getElementById('product-count');
  if (countEl) countEl.textContent = `${products.length} sản phẩm`;

  document.getElementById('products-tbody').innerHTML = products.map(p => {
    const catName = adminData.categories.find(c => c.slug === p.category)?.name || p.category;
    const hasSale = p.salePrice && p.salePrice < p.price;
    return `
      <tr>
        <td>
          <div class="product-cell">
            <img src="${esc(p.image)}" alt="">
            <div>
              <div class="product-name">${esc(p.name)}</div>
              <div style="font-size:12px;color:var(--adm-text-muted)">${esc(p.slug)}</div>
            </div>
          </div>
        </td>
        <td class="price">
          ${formatPrice(hasSale ? p.salePrice : p.price)}
          ${hasSale ? `<div style="font-size:11px;color:var(--adm-text-muted);text-decoration:line-through">${formatPrice(p.price)}</div>` : ''}
        </td>
        <td><span class="tag">${esc(catName)}</span></td>
        <td>${p.featured ? '<span class="tag featured">Nổi bật</span>' : '—'}</td>
        <td>${hasSale ? '<span class="tag sale">Sale</span>' : '—'}</td>
        <td>
          <div class="adm-table-actions">
            <button class="adm-btn adm-btn-outline adm-btn-sm" onclick="editProduct('${p.id}')">Sửa</button>
            <button class="adm-btn adm-btn-danger adm-btn-sm" onclick="deleteProduct('${p.id}')">Xóa</button>
          </div>
        </td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--adm-text-muted)">Không tìm thấy sản phẩm</td></tr>';
}

function openProductForm(product = null) {
  editingProduct = product;
  const p = product || { name: '', slug: '', price: 0, salePrice: null, image: '', category: 'xe-may-dien', featured: false, description: '', specs: {} };

  document.getElementById('modal-title').textContent = product ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới';
  document.getElementById('modal-body').innerHTML = `
    <div class="adm-form-group"><label>Tên sản phẩm *</label><input class="adm-input" type="text" id="p-name" value="${esc(p.name)}"></div>
    <div class="adm-form-row">
      <div class="adm-form-group"><label>Slug (URL)</label><input class="adm-input" type="text" id="p-slug" value="${esc(p.slug)}" placeholder="tu-dong-tao-neu-trong"></div>
      <div class="adm-form-group"><label>Danh mục</label>
        <select class="adm-input" id="p-category">
          ${adminData.categories.map(c => `<option value="${c.slug}" ${p.category === c.slug ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="adm-form-row">
      <div class="adm-form-group"><label>Giá bán (VNĐ)</label><input class="adm-input" type="number" id="p-price" value="${p.price || ''}"></div>
      <div class="adm-form-group"><label>Giá khuyến mãi</label><input class="adm-input" type="number" id="p-sale" value="${p.salePrice || ''}" placeholder="Để trống nếu không"></div>
    </div>
    ${imageUploadField('p-image', 'Hình ảnh sản phẩm', p.image, 'product')}
    <div class="adm-form-group"><label>Mô tả</label><textarea class="adm-input" id="p-desc">${esc(p.description || '')}</textarea></div>
    <div class="adm-form-group">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" id="p-featured" ${p.featured ? 'checked' : ''}> Hiển thị ở trang chủ
        <span class="adm-img-spec" style="margin-left:8px">Hoặc chọn chi tiết tại <a href="/admin/customize.html?tab=homepage">Tùy chỉnh → Trang chủ</a></span>
      </label>
    </div>
  `;

  document.getElementById('p-name').oninput = (e) => {
    const slugEl = document.getElementById('p-slug');
    if (!product && !slugEl.dataset.manual) {
      slugEl.value = e.target.value.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
  };
  document.getElementById('p-slug').oninput = () => {
    document.getElementById('p-slug').dataset.manual = '1';
  };

  document.getElementById('form-modal').classList.add('open');
  bindImageUploads(document.getElementById('modal-body'));
}

async function saveProduct() {
  const name = document.getElementById('p-name').value.trim();
  if (!name) { showToast('Vui lòng nhập tên sản phẩm', true); return; }

  let slug = document.getElementById('p-slug').value.trim();
  if (!slug) slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const category = document.getElementById('p-category').value;
  const product = {
    id: editingProduct?.id || String(Date.now()),
    name, slug,
    price: +document.getElementById('p-price').value || 0,
    salePrice: document.getElementById('p-sale').value ? +document.getElementById('p-sale').value : null,
    image: document.getElementById('p-image').value,
    category,
    categories: editingProduct?.categories || [category],
    featured: document.getElementById('p-featured').checked,
    description: document.getElementById('p-desc').value,
    specs: editingProduct?.specs || {},
  };

  if (editingProduct) {
    adminData.products[adminData.products.findIndex(p => p.id === editingProduct.id)] = product;
  } else {
    adminData.products.push(product);
  }

  ensureCustomizeDefaults();
  const ids = adminData.homepage.featuredProductIds;
  if (product.featured && !ids.includes(product.id)) ids.push(product.id);
  if (!product.featured) adminData.homepage.featuredProductIds = ids.filter(id => id !== product.id);

  await saveData();
  closeModal();
  renderProductsTable();
  renderShell('products', 'Sản phẩm', true);
  rebuildProductsToolbar();
  renderProductsTable();
}

window.editProduct = (id) => openProductForm(adminData.products.find(p => p.id === id));
window.deleteProduct = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
  adminData.products = adminData.products.filter(p => p.id !== id);
  await saveData();
  renderProductsTable();
  renderShell('products', 'Sản phẩm', true);
  rebuildProductsToolbar();
  renderProductsTable();
};

/* ─── Banners ─── */
async function initBanners() {
  if (!(await checkAuth())) { window.location.href = '/admin/'; return; }
  adminData = await api('/api/admin/data');
  renderShell('banners', 'Quản lý Banner');
  document.getElementById('add-banner-btn').onclick = () => openBannerForm();
  renderBannersGrid();
}

function renderBannersGrid() {
  document.getElementById('banners-grid').innerHTML = adminData.banners.map(b => `
    <div class="adm-banner-card">
      <img src="${esc(b.image)}" alt="${esc(b.alt)}" loading="lazy">
      <div class="adm-banner-card-body">
        <h4>${esc(b.alt || 'Banner')}</h4>
        <p style="font-size:12px;color:var(--adm-text-muted);margin-bottom:8px">${esc(b.link || 'Không có link')}</p>
        <div class="adm-banner-card-actions">
          <button class="adm-btn adm-btn-outline adm-btn-sm" onclick="editBanner('${b.id}')">Sửa</button>
          <button class="adm-btn adm-btn-danger adm-btn-sm" onclick="deleteBanner('${b.id}')">Xóa</button>
        </div>
      </div>
    </div>
  `).join('') || '<p style="color:var(--adm-text-muted);padding:24px">Chưa có banner. Bấm "Thêm banner" để tạo mới.</p>';
}

function openBannerForm(banner = null) {
  editingBanner = banner;
  const b = banner || { image: '', imageMobile: '', alt: '', link: '' };
  document.getElementById('modal-title').textContent = banner ? 'Sửa banner' : 'Thêm banner mới';
  document.getElementById('modal-body').innerHTML = `
    ${imageUploadField('b-image', 'Hình Desktop *', b.image, 'bannerDesktop')}
    ${imageUploadField('b-image-mobile', 'Hình Mobile', b.imageMobile || '', 'bannerMobile')}
    <div class="adm-form-group"><label>Mô tả</label><input class="adm-input" type="text" id="b-alt" value="${esc(b.alt)}"></div>
    <div class="adm-form-group"><label>Link khi click</label><input class="adm-input" type="text" id="b-link" value="${esc(b.link || '')}" placeholder="#san-pham hoặc URL"></div>
  `;
  document.getElementById('form-modal').classList.add('open');
  bindImageUploads(document.getElementById('modal-body'));
}

async function saveBanner() {
  const banner = {
    id: editingBanner?.id || String(Date.now()),
    image: document.getElementById('b-image').value,
    imageMobile: document.getElementById('b-image-mobile').value,
    alt: document.getElementById('b-alt').value,
    link: document.getElementById('b-link').value,
  };
  if (!banner.image) { showToast('Vui lòng nhập URL hình banner', true); return; }

  if (editingBanner) {
    adminData.banners[adminData.banners.findIndex(b => b.id === editingBanner.id)] = banner;
  } else {
    adminData.banners.push(banner);
  }
  await saveData();
  closeModal();
  renderBannersGrid();
}

window.editBanner = (id) => openBannerForm(adminData.banners.find(b => b.id === id));
window.deleteBanner = async (id) => {
  if (!confirm('Xóa banner này?')) return;
  adminData.banners = adminData.banners.filter(b => b.id !== id);
  await saveData();
  renderBannersGrid();
};

/* ─── News ─── */
async function initNews() {
  if (!(await checkAuth())) { window.location.href = '/admin/'; return; }
  adminData = await api('/api/admin/data');
  renderShell('news', 'Quản lý Tin tức');
  document.getElementById('add-news-btn').onclick = () => openNewsForm();
  renderNewsTable();
}

function renderNewsTable() {
  document.getElementById('news-tbody').innerHTML = adminData.news.map(n => `
    <tr>
      <td><strong>${esc(n.title)}</strong><div style="font-size:12px;color:var(--adm-text-muted);margin-top:4px">${esc(n.excerpt?.substring(0, 80) || '')}...</div></td>
      <td>${new Date(n.date).toLocaleDateString('vi-VN')}</td>
      <td>
        <div class="adm-table-actions">
          <button class="adm-btn adm-btn-outline adm-btn-sm" onclick="editNews('${n.id}')">Sửa</button>
          <button class="adm-btn adm-btn-danger adm-btn-sm" onclick="deleteNews('${n.id}')">Xóa</button>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="3" style="text-align:center;padding:32px;color:var(--adm-text-muted)">Chưa có tin tức</td></tr>';
}

function openNewsForm(item = null) {
  editingNews = item;
  const n = item || { title: '', date: new Date().toISOString().split('T')[0], image: '', excerpt: '' };
  document.getElementById('modal-title').textContent = item ? 'Sửa tin tức' : 'Thêm tin tức mới';
  document.getElementById('modal-body').innerHTML = `
    <div class="adm-form-group"><label>Tiêu đề *</label><input class="adm-input" type="text" id="n-title" value="${esc(n.title)}"></div>
    <div class="adm-form-row">
      <div class="adm-form-group"><label>Ngày đăng</label><input class="adm-input" type="date" id="n-date" value="${n.date}"></div>
    </div>
    ${imageUploadField('n-image', 'Hình ảnh', n.image, 'news')}
    <div class="adm-form-group"><label>Tóm tắt</label><textarea class="adm-input" id="n-excerpt">${esc(n.excerpt)}</textarea></div>
  `;
  document.getElementById('form-modal').classList.add('open');
  bindImageUploads(document.getElementById('modal-body'));
}

async function saveNews() {
  const title = document.getElementById('n-title').value.trim();
  if (!title) { showToast('Vui lòng nhập tiêu đề', true); return; }

  const item = {
    id: editingNews?.id || String(Date.now()),
    title,
    date: document.getElementById('n-date').value,
    image: document.getElementById('n-image').value,
    excerpt: document.getElementById('n-excerpt').value,
  };

  if (editingNews) {
    adminData.news[adminData.news.findIndex(n => n.id === editingNews.id)] = item;
  } else {
    adminData.news.push(item);
  }
  await saveData();
  closeModal();
  renderNewsTable();
}

window.editNews = (id) => openNewsForm(adminData.news.find(n => n.id === id));
window.deleteNews = async (id) => {
  if (!confirm('Xóa tin này?')) return;
  adminData.news = adminData.news.filter(n => n.id !== id);
  await saveData();
  renderNewsTable();
};

/* ─── Modal ─── */
function closeModal() {
  document.getElementById('form-modal')?.classList.remove('open');
  editingProduct = editingBanner = editingNews = null;
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.adminPage;

  if (page !== 'login') {
    document.getElementById('modal-save')?.addEventListener('click', () => {
      if (editingProduct !== null || document.getElementById('p-name')) saveProduct();
      else if (editingBanner !== null || document.getElementById('b-image')) saveBanner();
      else if (editingNews !== null || document.getElementById('n-title')) saveNews();
    });
    document.getElementById('modal-close')?.addEventListener('click', closeModal);
    document.getElementById('modal-cancel')?.addEventListener('click', closeModal);
    document.getElementById('form-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'form-modal') closeModal();
    });
  }

  const pages = { login: initLogin, dashboard: initDashboard, settings: initSettings, customize: initCustomize, products: initProducts, banners: initBanners, news: initNews };

  async function boot() {
    try {
      if (pages[page]) await pages[page]();
      document.getElementById('adm-loading')?.remove();
    } catch (err) {
      const loading = document.getElementById('adm-loading');
      if (loading) {
        loading.innerHTML = `
          <div class="adm-loading-box adm-error-box">
            <h3>⚠️ Không tải được trang admin</h3>
            <p>${esc(err.message || 'Lỗi không xác định')}</p>
            <p class="adm-loading-hint">Hãy mở Terminal, vào thư mục <strong>Yadea</strong> và chạy file <strong>start.command</strong><br>Hoặc cài Node.js tại <a href="https://nodejs.org" target="_blank">nodejs.org</a></p>
            <a href="/admin/" class="adm-btn adm-btn-primary" style="margin-top:16px">Về trang đăng nhập</a>
          </div>`;
      }
    }
  }

  boot();
});
