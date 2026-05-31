const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getSupabaseServiceConfig } = require('./env');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');

function parseImagePayload(data, filename) {
  const match = data.match(/^data:(image\/\w+);base64,(.+)$/);
  const ext = match
    ? (match[1].includes('png') ? '.png' : match[1].includes('webp') ? '.webp' : '.jpg')
    : path.extname(filename) || '.jpg';
  const buffer = Buffer.from(match ? match[2] : data, 'base64');
  return { buffer, ext };
}

async function uploadToSupabase(buffer, ext) {
  const cfg = getSupabaseServiceConfig();
  if (!cfg?.url || !cfg?.serviceRoleKey) {
    throw new Error('Chưa cấu hình Supabase Storage. Thêm SUPABASE_SERVICE_ROLE_KEY trên Vercel.');
  }

  const safeName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  const baseUrl = cfg.url.replace(/\/$/, '');
  const bucket = cfg.storageBucket || 'uploads';

  const res = await fetch(`${baseUrl}/storage/v1/object/${bucket}/${safeName}`, {
    method: 'POST',
    headers: {
      apikey: cfg.serviceRoleKey,
      Authorization: `Bearer ${cfg.serviceRoleKey}`,
      'Content-Type': ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg',
      'x-upsert': 'false',
    },
    body: buffer,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload Supabase thất bại (${res.status}): ${err.slice(0, 200)}`);
  }

  return `${baseUrl}/storage/v1/object/public/${bucket}/${safeName}`;
}

function uploadToLocal(buffer, ext) {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const safeName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, safeName), buffer);
  return `/uploads/${safeName}`;
}

async function saveUploadedImage(data, filename) {
  if (!data || !filename) throw new Error('Thiếu dữ liệu ảnh');

  const { buffer, ext } = parseImagePayload(data, filename);
  if (buffer.length > 5 * 1024 * 1024) throw new Error('Ảnh tối đa 5MB');

  const cfg = getSupabaseServiceConfig();
  if (process.env.VERCEL === '1' || (cfg?.url && cfg?.serviceRoleKey)) {
    return uploadToSupabase(buffer, ext);
  }
  return uploadToLocal(buffer, ext);
}

module.exports = { saveUploadedImage, UPLOAD_DIR };
