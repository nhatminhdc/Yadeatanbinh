const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'site.json');

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function readPublicData() {
  const { admin, ...publicData } = readData();
  return publicData;
}

function stripProductForList(p) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    salePrice: p.salePrice,
    image: p.image,
    category: p.category,
    categories: p.categories,
    featured: p.featured,
    colors: (p.colors || []).map(c => ({ name: c.name, hex: c.hex })),
  };
}

function readSiteMeta() {
  const data = readPublicData();
  const { products, ...meta } = data;
  return meta;
}

function readProductList() {
  return readData().products.map(stripProductForList);
}

function readProductBySlug(slug) {
  return readData().products.find(p => p.slug === slug) || null;
}

module.exports = {
  readData,
  readPublicData,
  readSiteMeta,
  readProductList,
  readProductBySlug,
  DATA_FILE,
};
