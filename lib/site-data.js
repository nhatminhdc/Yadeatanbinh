const { readData, writeData, readDataSync } = require('./site-store');

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

async function readPublicData() {
  const { admin, ...publicData } = await readData();
  return publicData;
}

async function readSiteMeta() {
  const data = await readPublicData();
  const { products, ...meta } = data;
  return meta;
}

async function readProductList() {
  return (await readData()).products.map(stripProductForList);
}

async function readProductBySlug(slug) {
  return (await readData()).products.find(p => p.slug === slug) || null;
}

function readSiteMetaSync() {
  const { admin, ...publicData } = readDataSync();
  const { products, ...meta } = publicData;
  return meta;
}

function readProductListSync() {
  return readDataSync().products.map(stripProductForList);
}

function readProductBySlugSync(slug) {
  return readDataSync().products.find(p => p.slug === slug) || null;
}

module.exports = {
  readData,
  writeData,
  readDataSync,
  readPublicData,
  readSiteMeta,
  readProductList,
  readProductBySlug,
  readSiteMetaSync,
  readProductListSync,
  readProductBySlugSync,
  DATA_FILE: require('./site-store').DATA_FILE,
};
