// Tarayıcıdan çağrılan fonksiyonlar için CORS başlıkları.
// P0.2: '*' yerine izinli origin listesi. FRONTEND_ORIGIN env'i virgülle
// ayrılmış origin listesi olabilir (ör: "https://www.notamuzikmarket.com,https://notamuzikmarket.com").
// İstek origin'i listedeyse yansıtılır; değilse ilk izinli origin'e sabitlenir → tarayıcı engeller.
const DEFAULT_ORIGINS = [
  'https://www.notamuzikmarket.com',
  'https://notamuzikmarket.com',
];

const ALLOWED_ORIGINS = (Deno.env.get('FRONTEND_ORIGIN') || DEFAULT_ORIGINS.join(','))
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const BASE_CORS: Record<string, string> = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
};

export function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || '';
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return { 'Access-Control-Allow-Origin': allow, ...BASE_CORS };
}

// HMAC-SHA256 → base64 (PayTR token/callback hash'leri için)
export async function hmacSha256Base64(message: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}
