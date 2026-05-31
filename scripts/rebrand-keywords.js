#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE_FILE = path.join(ROOT, 'data', 'site.json');
const HOTLINE = '0933 96 93 96';

function rebrandText(text) {
  if (typeof text !== 'string') return text;
  if (/^https?:\/\//i.test(text)) return text;

  let t = text;

  t = t.replace(/Liên hệ tổng đài\s*1900[\s.]*2082/gi, `Liên hệ tổng đài ${HOTLINE}`);
  t = t.replace(/Liên hệ Tổng đài[^.]{0,80}1900[\s.]*2082/gi, `Liên hệ tổng đài ${HOTLINE}`);
  t = t.replace(/Tổng [Đđ]ài(?:\s+hỗ trợ|\s+của[^.]{0,40})?\s*1900[\s.]*2082/gi, `Liên hệ tổng đài ${HOTLINE}`);
  t = t.replace(/hotline\s*1900[\s.]*2082/gi, `hotline ${HOTLINE}`);
  t = t.replace(/1900[\s.]*2082/g, HOTLINE);
  t = t.replace(/0933\s*969396/g, HOTLINE);

  t = t.replace(/Xe [Đđ]iện Việt Thanh/g, 'Yadea Tân Bình');
  t = t.replace(/YADEA Việt Thanh/g, 'YADEA Tân Bình');
  t = t.replace(/Yadea Việt Thanh/g, 'Yadea Tân Bình');
  t = t.replace(/Việt Thanh/g, 'Yadea Tân Bình');

  return t;
}

function walk(value) {
  if (Array.isArray(value)) return value.map(walk);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, val] of Object.entries(value)) out[key] = walk(val);
    return out;
  }
  return rebrandText(value);
}

const data = JSON.parse(fs.readFileSync(SITE_FILE, 'utf8'));
if (data.site) {
  data.site.hotline = HOTLINE;
  data.site.phone = HOTLINE;
  data.site.zalo = HOTLINE;
}
if (Array.isArray(data.branches)) {
  for (const b of data.branches) {
    if (b.isMain || String(b.hotline || '').replace(/\D/g, '') === '0933969396') {
      b.hotline = HOTLINE;
    }
  }
}

const updated = walk(data);
fs.writeFileSync(SITE_FILE, JSON.stringify(updated, null, 2) + '\n');
console.log('Updated', SITE_FILE);
