// ============================================================
// send-order-email — admin tetikler (ör. kargo bildirimi).
// SADECE admin: JWT doğrulanır, profiles.role='admin' kontrol edilir.
// type: 'shipped' | 'confirmation'
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeadersFor } from '../_shared/cors.ts';
import { loadOrderForEmail, orderConfirmationEmail, shippingEmail, sendEmail } from '../_shared/email.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  const cors = corsHeadersFor(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // admin doğrula
    const jwt = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    const { data: userData } = await admin.auth.getUser(jwt);
    if (!userData?.user) return json({ ok: false, error: 'Oturum gerekli.' }, 401);
    const { data: profile } = await admin.from('profiles').select('role').eq('id', userData.user.id).single();
    if (!profile || profile.role !== 'admin') return json({ ok: false, error: 'Yetkisiz.' }, 403);

    const body = await req.json();
    const merchantOid = String(body.merchant_oid || '');
    const type = String(body.type || 'shipped');
    if (!merchantOid) return json({ ok: false, error: 'merchant_oid gerekli.' }, 400);

    const loaded = await loadOrderForEmail(admin, merchantOid);
    if (!loaded) return json({ ok: false, error: 'Sipariş bulunamadı.' }, 404);
    if (!loaded.email) return json({ ok: false, error: 'Bu siparişte e-posta adresi yok.' }, 400);

    const tpl = type === 'confirmation'
      ? orderConfirmationEmail(loaded.order, loaded.items)
      : shippingEmail(loaded.order, loaded.items);

    const res = await sendEmail(loaded.email, tpl.subject, tpl.html);
    if (!res.ok) return json({ ok: false, error: res.error }, 400);
    // Onay e-postası elle yeniden gönderildiyse durumu 'sent' yap (admin "yeniden gönder")
    if (type === 'confirmation') {
      try { await admin.from('orders').update({ email_status: 'sent' }).eq('paytr_merchant_oid', merchantOid); } catch (_) {}
    }
    return json({ ok: true, sent_to: loaded.email });
  } catch (e) {
    return json({ ok: false, error: 'Sunucu hatası: ' + (e instanceof Error ? e.message : String(e)) }, 500);
  }
});
