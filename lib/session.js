const crypto = require('crypto');
const { getSessionSecret } = require('./env');

const SESSION_TTL = 24 * 60 * 60 * 1000;
const COOKIE_NAME = 'session';

function isProduction() {
  return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
}

function signSession(payload) {
  const secret = getSessionSecret();
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifySessionToken(token) {
  if (!token) return null;
  const secret = getSessionSecret();
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function getCookie(req, name = COOKIE_NAME) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function buildCookie(name, value, maxAgeSec) {
  const secure = isProduction() ? '; Secure' : '';
  return `${name}=${encodeURIComponent(value)}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${maxAgeSec}${secure}`;
}

function setSessionCookie(res, user) {
  const token = signSession({
    userId: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    exp: Date.now() + SESSION_TTL,
  });
  res.setHeader('Set-Cookie', buildCookie(COOKIE_NAME, token, SESSION_TTL / 1000));
}

function clearSessionCookie(res) {
  const secure = isProduction() ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secure}`);
}

function getSession(req) {
  const token = getCookie(req);
  const payload = verifySessionToken(token);
  if (!payload) return null;
  return {
    userId: payload.userId,
    username: payload.username,
    role: payload.role,
    name: payload.name,
  };
}

module.exports = {
  COOKIE_NAME,
  SESSION_TTL,
  getSession,
  setSessionCookie,
  clearSessionCookie,
  verifySessionToken,
};
