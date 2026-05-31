/**
 * Đồng bộ giá & sản phẩm từ yadeavietthanh.vn
 * - Quét danh mục động (slug → id)
 * - Cập nhật giá sản phẩm hiện có (giữ danh mục local)
 * - Thêm sản phẩm mới từ nguồn
 */
const path = require('path');
const https = require('https');
const { readData, writeData, readDataSync, writeDataSync } = require('../lib/site-store');
const SOURCE = 'https://yadeavietthanh.vn';

const LOCAL_CAT_SLUGS = {
  'xe-may-dien': 'xe-may-dien',
  'xe-dap-dien': 'xe-dap-dien',
  'xe-cho-hoc-sinh': 'xe-hoc-sinh',
  'xe-cho-nguoi-di-lam': 'xe-di-lam',
  'ac-quy': 'ac-quy',
};

const CAT_PRIORITY = ['xe-may-dien', 'xe-dap-dien', 'xe-hoc-sinh', 'xe-di-lam', 'ac-quy'];

const PRICE_FALLBACKS = {
  'xe-dap-dien-yadea-i8-gau-dau-lotso': { price: 13990000, salePrice: 12990000 },
  'xe-may-dien-yadea-ocean-gau-dau-lotso': { price: 16990000, salePrice: null },
  'xe-may-dien-yadea-orla-gau-dau-lotso': { price: 19990000, salePrice: null },
  'xe-dap-dien-tro-luc-gap-gon-yadea-flit': { price: 22990000, salePrice: null },
};

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${url}`));
          return;
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON lỗi: ${url}`)); }
      });
    }).on('error', reject);
  });
}

function decodeHtml(str) {
  return (str || '').replace(/&amp;/g, '&').replace(/&#038;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '–').replace(/&nbsp;/g, ' ');
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

async function fetchCategoryMap() {
  const map = {};
  for (const [wpSlug, localSlug] of Object.entries(LOCAL_CAT_SLUGS)) {
    try {
      const cats = await fetchJSON(`${SOURCE}/wp-json/wp/v2/product_cat?slug=${wpSlug}`);
      if (cats[0]?.id) map[cats[0].id] = localSlug;
    } catch { /* skip */ }
  }
  // Fallback IDs
  Object.assign(map, { 14: 'xe-may-dien', 15: 'xe-dap-dien', 181: 'ac-quy', 192: 'xe-hoc-sinh', 193: 'xe-di-lam' });
  return map;
}

function pickCategory(catIds, catMap) {
  const slugs = (catIds || []).map(id => catMap[id]).filter(Boolean);
  for (const p of CAT_PRIORITY) {
    if (slugs.includes(p)) return p;
  }
  return slugs[0] || 'xe-may-dien';
}

function extractSpecs(specsArr) {
  const specs = {};
  if (!specsArr) return specs;
  for (const item of specsArr) {
    const name = (item.spec_item?.spec_name || '').toLowerCase();
    const detail = (item.spec_item?.spec_detail || '').replace(/^:/, '').trim();
    if (name.includes('vận tốc') || name.includes('tốc độ')) specs.tocDo = detail;
    else if (name.includes('quãng đường')) specs.quangDuong = detail;
    else if (name.includes('động cơ') || name.includes('công suất')) specs.congSuat = detail;
    else if (name.includes('acquy') || name.includes('ắc quy') || name.includes('pin')) specs.pin = detail;
  }
  return specs;
}

function extractSpecTable(specsArr) {
  if (!specsArr?.length) return [];
  return specsArr.map(item => ({
    name: (item.spec_item?.spec_name || '').replace(/:$/, '').trim(),
    value: (item.spec_item?.spec_detail || '').trim(),
  })).filter(s => s.name && s.value);
}

const mediaCache = new Map();
async function resolveMediaUrl(id) {
  if (!id) return null;
  if (mediaCache.has(id)) return mediaCache.get(id);
  try {
    const m = await fetchJSON(`${SOURCE}/wp-json/wp/v2/media/${id}`);
    const url = m.source_url || null;
    mediaCache.set(id, url);
    return url;
  } catch {
    mediaCache.set(id, null);
    return null;
  }
}

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'YadeaSync/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = res.headers.location.startsWith('http') ? res.headers.location : `${SOURCE}${res.headers.location}`;
        fetchHTML(next).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 400) reject(new Error(`HTTP ${res.statusCode}`));
        else resolve(data);
      });
    }).on('error', reject);
  });
}

const HCM_PROVINCE_ID = 27;

function pickProvincePrice(locationStatuses) {
  if (!locationStatuses?.length) return null;
  const hcm = locationStatuses.find(s => s.province === HCM_PROVINCE_ID);
  const pick = hcm || locationStatuses[0];
  const price = parseInt(pick.unit_price, 10) || null;
  let salePrice = pick.is_on_sale && pick.sale_price ? parseInt(pick.sale_price, 10) : null;
  if (salePrice && price && salePrice >= price) salePrice = null;
  return { price, salePrice };
}

function parseVariationData(html) {
  const match = html.match(/var product_variation_data\s*=\s*(\{[\s\S]*?\});/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[1]);
    const defaultPrice = parseInt(parsed.default_price?.unit_price, 10) || null;
    return (parsed.data || []).map(v => {
      const pricing = pickProvincePrice(v.variation_location_in_stock_status);
      let price = pricing?.price || defaultPrice;
      let salePrice = pricing?.salePrice || null;
      if (!price && v.variation_unit_price) price = parseInt(v.variation_unit_price, 10);
      if (salePrice && price && salePrice >= price) salePrice = null;
      return {
        name: v.variation_color_name,
        hex: v.variation_color_hex || '#cccccc',
        image: v.variation_image?.url || '',
        price: price || undefined,
        salePrice: salePrice || undefined,
      };
    }).filter(c => c.name);
  } catch {
    return [];
  }
}

async function fetchProductColors(productLink) {
  if (!productLink) return [];
  try {
    const html = await fetchHTML(productLink);
    return parseVariationData(html);
  } catch {
    return [];
  }
}

async function mapPool(items, fn, concurrency = 5) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

async function resolveGallery(ids) {
  if (!ids?.length) return [];
  const urls = await Promise.all(ids.slice(0, 8).map(resolveMediaUrl));
  return urls.filter(Boolean);
}

async function convertProduct(p, catMap) {
  const acf = p.acf || {};
  const image = p._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
  const content = stripHtml(p.content?.rendered);
  let salePrice = acf.product_is_on_sale && acf.product_sale_price ? acf.product_sale_price : null;
  let price = acf.product_price || 0;

  if (!price && PRICE_FALLBACKS[p.slug]) {
    price = PRICE_FALLBACKS[p.slug].price;
    salePrice = PRICE_FALLBACKS[p.slug].salePrice;
  }
  if (salePrice && salePrice >= price) salePrice = null;

  const wpCats = (p.product_cat || []).map(id => catMap[id]).filter(Boolean);
  const gallery = await resolveGallery(acf.product_gallery);

  return {
    id: String(p.id),
    name: decodeHtml(p.title.rendered),
    slug: p.slug,
    price,
    salePrice,
    image,
    gallery: gallery.length ? gallery : (image ? [image] : []),
    colors: [],
    category: pickCategory(p.product_cat || [], catMap),
    categories: [...new Set(wpCats)],
    featured: false,
    description: content || `${decodeHtml(p.title.rendered)} - Xe điện Yadea chính hãng.`,
    specs: extractSpecs(acf.product_specs),
    specTable: extractSpecTable(acf.product_specs),
    promotion: stripHtml(acf.product_include_gift_detail) || '',
    sourceModified: p.modified,
    sourceLink: p.link || `${SOURCE}/${p.slug}/`,
  };
}
async function fetchAllProducts() {
  const all = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const url = `${SOURCE}/wp-json/wp/v2/product?per_page=100&page=${page}&_embed=wp:featuredmedia`;
    const batch = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        totalPages = parseInt(res.headers['x-wp-totalpages'] || '1', 10);
        let data = '';
        res.on('data', c => { data += c; });
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(e); }
        });
      }).on('error', reject);
    });
    if (!Array.isArray(batch) || !batch.length) break;
    all.push(...batch);
    page++;
  }
  return all;
}

function mergeProducts(existing, incoming) {
  const byId = new Map(existing.map(p => [p.id, p]));
  const bySlug = new Map(existing.map(p => [p.slug, p]));
  let updated = 0;
  let added = 0;

  for (const inc of incoming) {
    const local = byId.get(inc.id) || bySlug.get(inc.slug);
    if (local) {
      local.name = inc.name;
      local.slug = inc.slug;
      local.price = inc.price;
      local.salePrice = inc.salePrice;
      local.image = inc.image;
      local.gallery = inc.gallery;
      local.colors = inc.colors;
      local.description = inc.description;
      local.specs = inc.specs;
      local.specTable = inc.specTable;
      local.promotion = inc.promotion;
      local.sourceModified = inc.sourceModified;
      local.sourceLink = inc.sourceLink;
      // Giữ category/categories/featured do admin đã chỉnh
      updated++;
    } else {
      existing.push(inc);
      byId.set(inc.id, inc);
      bySlug.set(inc.slug, inc);
      added++;
    }
  }

  return { products: existing, updated, added, total: incoming.length };
}

function setSyncStatus(site, status, extra = {}) {
  site.syncStatus = {
    status,
    updatedAt: new Date().toISOString(),
    ...extra,
  };
}

async function persistSite(site) {
  if (process.env.VERCEL === '1' || process.env.SUPABASE_SERVICE_ROLE_KEY) {
    await writeData(site);
  } else {
    writeDataSync(site);
  }
}

async function loadSite() {
  if (process.env.VERCEL === '1' || process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return readData();
  }
  return readDataSync();
}

async function syncProducts(options = {}) {
  const site = await loadSite();
  setSyncStatus(site, 'updating', { message: 'Đang quét sản phẩm từ yadeavietthanh.vn...' });
  await persistSite(site);

  try {
    const catMap = await fetchCategoryMap();
    const raw = await fetchAllProducts();
    if (!raw.length) throw new Error('Không lấy được sản phẩm từ nguồn');

    const incoming = [];
    for (const p of raw) {
      incoming.push(await convertProduct(p, catMap));
    }

    setSyncStatus(site, 'updating', { message: 'Đang đồng bộ màu sắc sản phẩm...' });
    await persistSite(site);

    await mapPool(incoming, async (product) => {
      const colors = await fetchProductColors(product.sourceLink);
      if (colors.length) product.colors = colors;
    }, 4);

    incoming.sort((a, b) => a.name.localeCompare(b.name, 'vi'));

    const existing = site.products || [];
    const { products, updated, added, total } = mergeProducts(existing, incoming);

    site.products = products;
    setSyncStatus(site, 'completed', {
      message: `Hoàn thành: ${updated} cập nhật giá, ${added} sản phẩm mới (tổng nguồn: ${total})`,
      updated,
      added,
      total,
      source: SOURCE,
    });
    await persistSite(site);

    return { count: total, updated, added, products: products.length };
  } catch (err) {
    const siteErr = await loadSite();
    setSyncStatus(siteErr, 'error', {
      message: err.message || 'Đồng bộ thất bại',
    });
    await persistSite(siteErr);
    throw err;
  }
}

module.exports = { syncProducts, fetchCategoryMap, mergeProducts };

if (require.main === module) {
  syncProducts()
    .then(r => console.log(`✅ ${r.updated} cập nhật, ${r.added} mới, ${r.products} tổng`))
    .catch(err => { console.error('❌', err.message); process.exit(1); });
}
