/**
 * Đồng bộ toàn bộ sản phẩm từ yadeavietthanh.vn vào data/site.json
 * Chạy: node scripts/sync-products.js
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_FILE = path.join(__dirname, '..', 'data', 'site.json');
const API_URL = 'https://yadeavietthanh.vn/wp-json/wp/v2/product?per_page=100&_embed=wp:featuredmedia';

const CAT_MAP = { 14: 'xe-may-dien', 15: 'xe-dap-dien', 181: 'ac-quy', 192: 'xe-hoc-sinh', 193: 'xe-di-lam' };
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
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function decodeHtml(str) {
  return str.replace(/&amp;/g, '&').replace(/&#038;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '–').replace(/&nbsp;/g, ' ');
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function pickCategory(catIds) {
  const slugs = catIds.map(id => CAT_MAP[id]).filter(Boolean);
  for (const p of CAT_PRIORITY) {
    if (slugs.includes(p)) return p;
  }
  return slugs[0] || 'xe-may-dien';
}

function extractSpecs(specsArr) {
  const specs = {};
  if (!specsArr) return specs;
  for (const item of specsArr) {
    const name = item.spec_item?.spec_name?.toLowerCase() || '';
    const detail = item.spec_item?.spec_detail || '';
    if (name.includes('vận tốc') || name.includes('tốc độ')) specs.tocDo = detail.replace(':', '').trim();
    else if (name.includes('quãng đường')) specs.quangDuong = detail.replace(':', '').trim();
    else if (name.includes('động cơ') || name.includes('công suất')) specs.congSuat = detail.replace(':', '').trim();
    else if (name.includes('acquy') || name.includes('ắc quy') || name.includes('pin')) specs.pin = detail.replace(':', '').trim();
  }
  return specs;
}

async function syncProducts() {
  const raw = await fetchJSON(API_URL);

  const converted = raw.map(p => {
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

    const categories = (p.product_cat || []).map(id => CAT_MAP[id]).filter(Boolean);

    return {
      id: String(p.id),
      name: decodeHtml(p.title.rendered),
      slug: p.slug,
      price,
      salePrice,
      image,
      category: pickCategory(p.product_cat || []),
      categories: [...new Set(categories)],
      featured: false,
      description: content || `${decodeHtml(p.title.rendered)} - Xe điện Yadea chính hãng tại Yadea Tân Bình.`,
      specs: extractSpecs(acf.product_specs),
      priority: acf.product_priority || 999,
    };
  });

  converted.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name, 'vi'));
  converted.forEach((p, i) => { p.featured = i < 12; delete p.priority; });

  const site = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  site.products = converted;
  fs.writeFileSync(DATA_FILE, JSON.stringify(site, null, 2));
  return converted.length;
}

module.exports = { syncProducts };

if (require.main === module) {
  syncProducts()
    .then(n => console.log(`Đã cập nhật ${n} sản phẩm`))
    .catch(err => { console.error(err); process.exit(1); });
}
