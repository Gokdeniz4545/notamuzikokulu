// ============================================================
// paytr-refund — admin sipariş detayından "İade Et" çağırır.
// SADECE admin: çağıranın JWT'si doğrulanır, profiles.role='admin' kontrol edilir.
// PayTR İade API'sine istek atar, başarılıysa refund_order RPC ile DB günceller.
// Gizli env: PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY, PAYTR_MERCHANT_SALT
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, hmacSha256Base64 } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const MERCHANT_ID = Deno.env.get('PAYTR_MERCHANT_ID')!;
const MERCHANT_KEY = Deno.env.get('PAYTR_MERCHANT_KEY')!;
const MERCHANT_SALT = Deno.env.get('PAYTR_MERCHANT_SALT')!;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // 1) Çağıran admin mi?
    const jwt = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    const { data: userData } = await admin.auth.getUser(jwt);
    const user = userData?.user;
    if (!user) return json({ ok: false, error: 'Oturum gerekli.' }, 401);
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') return json({ ok: false, error: 'Yetkisiz.' }, 403);

    // 2) Sipariş + iade tutarı doğrula
    const body = await req.json();
    const merchantOid = String(body.merchant_oid || '');
    if (!merchantOid) return json({ ok: false, error: 'merchant_oid gerekli.' }, 400);

    const { data: order } = await admin
      .from('orders')
      .select('total_amount, refunded_amount, payment_status')
      .eq('paytr_merchant_oid', merchantOid).single();
    if (!order) return json({ ok: false, error: 'Sipariş bulunamadı.' }, 404);
    if (!['paid', 'partial_refund'].includes(order.payment_status)) {
      return json({ ok: false, error: 'Bu sipariş iade edilebilir durumda değil.' }, 400);
    }

    const remaining = Number(order.total_amount) - Number(order.refunded_amount || 0);
    const refundAmt = body.amount != null && body.amount !== ''
      ? Number(body.amount) : remaining;
    if (!(refundAmt > 0) || refundAmt > remaining + 0.001) {
      return json({ ok: false, error: `Geçersiz tutar. Kalan iade edilebilir: ${remaining.toFixed(2)} TL` }, 400);
    }
    const returnAmount = refundAmt.toFixed(2); // PayTR: TL, 2 ondalık

    // 3) PayTR İade API
    const paytrToken = await hmacSha256Base64(
      MERCHANT_ID + merchantOid + returnAmount + MERCHANT_SALT, MERCHANT_KEY);
    const form = new URLSearchParams({
      merchant_id: MERCHANT_ID, merchant_oid: merchantOid,
      return_amount: returnAmount, paytr_token: paytrToken,
    });
    const resp = await fetch('https://www.paytr.com/odeme/iade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    const result = await resp.json();
    if (result.status !== 'success') {
      return json({ ok: false, error: 'PayTR iade reddetti: ' + (result.err_msg || result.reason || '') }, 400);
    }

    // 4) DB güncelle (tam iade → stok geri + refunded)
    const fullRefund = (Number(order.refunded_amount || 0) + refundAmt) >= Number(order.total_amount);
    await admin.rpc('refund_order', {
      p_merchant_oid: merchantOid, p_amount: refundAmt, p_restore_stock: fullRefund,
    });

    return json({ ok: true, refunded: returnAmount, full: fullRefund });
  } catch (e) {
    return json({ ok: false, error: 'Sunucu hatası: ' + (e instanceof Error ? e.message : String(e)) }, 500);
  }
});
