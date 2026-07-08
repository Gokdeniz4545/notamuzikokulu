// ============================================================
// paytr-token — checkout.js bunu çağırır.
// 1) PENDING sipariş oluşturur (create_order RPC, service_role)
// 2) Gizli key/salt ile PayTR iframe token'ı üretir
// 3) { token, order_number, merchant_oid } döner
// Gizli env: PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY, PAYTR_MERCHANT_SALT
//            (test için) PAYTR_TEST_MODE = "1"
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeadersFor, hmacSha256Base64 } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const MERCHANT_ID = Deno.env.get('PAYTR_MERCHANT_ID')!;
const MERCHANT_KEY = Deno.env.get('PAYTR_MERCHANT_KEY')!;
const MERCHANT_SALT = Deno.env.get('PAYTR_MERCHANT_SALT')!;
const TEST_MODE = Deno.env.get('PAYTR_TEST_MODE') ?? '1';

Deno.serve(async (req) => {
  const cors = corsHeadersFor(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status, headers: { ...cors, 'Content-Type': 'application/json' },
    });

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const body = await req.json();
    const items = Array.isArray(body.items) ? body.items : [];
    const address = body.address || {};
    const guestEmail = body.guest_email || null;
    const guestPhone = body.guest_phone || null;
    if (!items.length) return json({ error: 'Sepet boş.' }, 400);

    // Giriş yapmış kullanıcıyı (varsa) token'dan güvenle çöz
    let userId: string | null = null;
    let userEmail: string | null = null;
    const authHeader = req.headers.get('Authorization') || '';
    const jwt = authHeader.replace('Bearer ', '').trim();
    // Misafirler bearer olarak anon key gönderir; onda getUser çağırma. Diğer durumda
    // JWT'yi doğrula — geçersiz/expired ise sessizce misafir olarak devam et.
    if (jwt && jwt !== Deno.env.get('SUPABASE_ANON_KEY')) {
      try {
        const { data } = await admin.auth.getUser(jwt);
        if (data?.user) { userId = data.user.id; userEmail = data.user.email ?? null; }
      } catch (_e) { /* geçersiz JWT → misafir akışı */ }
    }

    // Misafir için e-posta/telefon zorunlu
    const email = userId ? (userEmail || guestEmail) : guestEmail;
    if (!email) return json({ error: 'E-posta gerekli.' }, 400);
    if (!userId && !guestPhone) return json({ error: 'Telefon gerekli.' }, 400);

    // Rate-limit: aynı kullanıcı/e-postadan son 10 dk'da çok fazla sipariş → 429
    // (sahte sipariş spam'i / DoS önlemi; service_role RLS'i bypass eder, sayım güvenilir)
    try {
      const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      // Başarısız/süresi dolmuş siparişleri SAYMA (kartı reddedilen müşteri kendini kilitlemesin)
      let rl = admin.from('orders').select('id', { count: 'exact', head: true })
        .gte('created_at', since).neq('payment_status', 'failed').neq('status', 'expired');
      rl = userId ? rl.eq('user_id', userId) : rl.eq('guest_email', email);
      const { count } = await rl;
      if ((count ?? 0) >= 10) {
        return json({ error: 'Çok fazla sipariş denemesi. Lütfen birkaç dakika sonra tekrar dene.' }, 429);
      }
    } catch (_rl) { /* rate-limit sorgusu başarısız olsa da normal akışı durdurma */ }

    // 1) PENDING sipariş oluştur (fiyat/total DB'den, stok düşmez)
    const { data: order, error: orderErr } = await admin.rpc('create_order', {
      p_items: items.map((i: any) => ({ product_id: i.product_id, quantity: i.quantity })),
      p_address: address,
      p_guest_email: userId ? null : guestEmail,
      p_guest_phone: userId ? null : guestPhone,
      p_user_id: userId,
    });
    if (orderErr) return json({ error: orderErr.message || 'Sipariş oluşturulamadı.' }, 400);

    const merchantOid: string = order.merchant_oid;
    const orderNumber: string = order.order_number;
    const paymentAmount = Math.round(Number(order.total_amount) * 100); // kuruş

    // Sepet kalemleri (ürün adı + fiyat DB'den)
    const ids = items.map((i: any) => i.product_id);
    const { data: prods } = await admin
      .from('products').select('id, name, price').in('id', ids);
    const pById = new Map((prods || []).map((p: any) => [p.id, p]));
    const basket = items.map((i: any) => {
      const p = pById.get(i.product_id);
      return [String(p?.name ?? 'Ürün'), String(Number(p?.price ?? 0)), Number(i.quantity)];
    });
    const userBasket = btoa(unescape(encodeURIComponent(JSON.stringify(basket))));

    // 2) PayTR token hash
    // PayTR geçerli bir IPv4 ister; Supabase bazen IPv6 verir → IPv4 süz, yoksa 0.0.0.0
    const xff = req.headers.get('x-forwarded-for') || '';
    const userIp = xff.split(',')
      .map((s) => s.trim())
      .find((ip) => /^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) || '0.0.0.0';
    const noInstallment = '0';
    const maxInstallment = '0';
    const currency = 'TL';
    const origin = req.headers.get('origin') || 'https://www.notamuzikmarket.com';

    const hashStr =
      MERCHANT_ID + userIp + merchantOid + email + paymentAmount +
      userBasket + noInstallment + maxInstallment + currency + TEST_MODE;
    const paytrToken = await hmacSha256Base64(hashStr + MERCHANT_SALT, MERCHANT_KEY);

    const form = new URLSearchParams({
      merchant_id: MERCHANT_ID,
      user_ip: userIp,
      merchant_oid: merchantOid,
      email,
      payment_amount: String(paymentAmount),
      paytr_token: paytrToken,
      user_basket: userBasket,
      debug_on: TEST_MODE === '1' ? '1' : '0',
      no_installment: noInstallment,
      max_installment: maxInstallment,
      user_name: String(address.full_name || 'Müşteri'),
      user_address: String(address.address_line || '-'),
      user_phone: String(address.phone || guestPhone || '-'),
      merchant_ok_url: `${origin}/order-success.html?oid=${merchantOid}`,
      merchant_fail_url: `${origin}/checkout.html?payment=failed`,
      timeout_limit: '30',
      currency,
      test_mode: TEST_MODE,
      lang: 'tr',
    });

    const resp = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    const result = await resp.json();
    if (result.status !== 'success') {
      return json({ error: 'PayTR token alınamadı: ' + (result.reason || '') }, 400);
    }

    return json({ token: result.token, order_number: orderNumber, merchant_oid: merchantOid });
  } catch (e) {
    return json({ error: 'Sunucu hatası: ' + (e instanceof Error ? e.message : String(e)) }, 500);
  }
});
