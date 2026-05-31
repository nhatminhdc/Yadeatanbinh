const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function readJsonFile(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (url && anonKey) {
    return {
      url,
      anonKey,
      table: process.env.SUPABASE_TABLE || 'leads',
    };
  }

  const file = readJsonFile('data/supabase.json');
  if (file?.url && file?.anonKey && !String(file.url).includes('YOUR_')) {
    return {
      url: file.url,
      anonKey: file.anonKey,
      table: file.table || 'leads',
    };
  }

  return null;
}

function getSupabaseServiceConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && serviceRoleKey) {
    return {
      url,
      serviceRoleKey,
      storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'uploads',
    };
  }

  const file = readJsonFile('data/supabase.json');
  if (file?.url && file?.serviceRoleKey && !String(file.serviceRoleKey).includes('YOUR_')) {
    return {
      url: file.url,
      serviceRoleKey: file.serviceRoleKey,
      storageBucket: file.storageBucket || 'uploads',
    };
  }

  return null;
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;

  if (process.env.VERCEL !== '1') {
    return 'dev-only-session-secret-change-in-production-32chars';
  }

  throw new Error('SESSION_SECRET chưa được cấu hình trên Vercel (tối thiểu 32 ký tự).');
}

function getTelegramConfig() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (botToken && chatId) {
    return { botToken, chatId };
  }

  const file = readJsonFile('data/telegram.json');
  if (file?.botToken && file?.chatId && !String(file.botToken).includes('YOUR_')) {
    return file;
  }

  return null;
}

module.exports = { getSupabaseConfig, getSupabaseServiceConfig, getSessionSecret, getTelegramConfig };
