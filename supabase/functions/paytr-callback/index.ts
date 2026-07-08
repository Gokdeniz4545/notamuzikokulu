// ============================================================
// paytr-callback — PayTR ödeme sonrası buraya POST eder (webhook).
// Hash doğrulanır; başarılıysa siparişi 'paid' yapar + stok düşer.
// PayTR'ın tekrar denememesi için MUTLAKA düz metin "OK" döner.
// JWT doğrulaması KAPALI deploy edilmeli (--no-verify-jwt) — PayTR Supabase JWT göndermez.
// PayTR panelinde "Bildirim URL" bu fonksiyonun URL'i olmalı.
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { hmacSha256Base64 } from '../_shared/cors.ts';
import { loadOrderForEmail, orderConfirmationEmail, sendEmail } from '../_shared/email.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const MERCHANT_KEY = Deno.env.get('PAYTR_MERCHANT_KEY')!;
const MERCHANT_SALT = Deno.env.get('PAYTR_MERCHANT_SALT')!;

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('OK');

  try {
    const form = await req.formData();
    const merchantOid = String(form.get('merchant_oid') || '');
    const status = String(form.get('status') || '');
    const totalAmount = String(form.get('total_amount') || '');
    const hash = String(form.get('hash') || '');

    // Hash doğrula: base64(HMAC-SHA256(merchant_oid + salt + status + total_amount, key))
    const expected = await hmacSha256Base64(merchantOid + MERCHANT_SALT + status + totalAmount, MERCHANT_KEY);
    if (hash !== expected) {
      // Sahte istek — PayTR'a OK dönme (ama işlem yapma)
      return new Response('PAYTR notification failed: bad hash', { status: 400 });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    if (status === 'success') {
      // confirm_order_payment: JSONB döner { ok, already_paid, send_email, stock_shortage }.
      // Tek-atımlık e-posta bayrağı + stok kilidi + oversell tespiti DB tarafında.
      const { data, error } = await admin.rpc('confirm_order_payment', { p_merchant_oid: merchantOid });
      if (error) {
        // Geçici DB hatası → 500 dön ki PayTR tekrar denesin (RPC idempotent → güvenli)
        console.error('[paytr-callback] confirm_order_payment hatası:', error.message);
        return new Response('error', { status: 500 });
      }
      if (!data || data.ok !== true) {
        // Kalıcı durum (not_found / invalid_state) — retry çözmez. Logla, PayTR'ı döngüye sokma.
        console.error('[paytr-callback] confirm ok=false:', JSON.stringify(data));
        return new Response('OK');
      }
      // Onay e-postası yalnız İLK onayda (send_email=true). Sonucu email_status'a yaz.
      if (data.send_email === true) {
        let sent = false;
        try {
          const loaded = await loadOrderForEmail(admin, merchantOid);
          if (loaded?.email) {
            const tpl = orderConfirmationEmail(loaded.order, loaded.items);
            const res = await sendEmail(loaded.email, tpl.subject, tpl.html);
            sent = !!(res && res.ok);
          }
        } catch (mailErr) {
          console.error('[paytr-callback] onay e-postası gönderilemedi:', mailErr instanceof Error ? mailErr.message : String(mailErr));
        }
        try {
          await admin.from('orders').update({ email_status: sent ? 'sent' : 'failed' })
            .eq('paytr_merchant_oid', merchantOid);
        } catch (_) { /* email_status yazımı kritik değil */ }
      }
    } else {
      const reason = String(form.get('failed_reason_msg') || form.get('failed_reason_code') || '');
      const { error } = await admin.rpc('fail_order_payment', { p_merchant_oid: merchantOid, p_reason: reason });
      if (error) {
        console.error('[paytr-callback] fail_order_payment hatası:', error.message);
        return new Response('error', { status: 500 });
      }
    }

    // PayTR bu yanıtı bekler — aksi halde tekrar tekrar dener
    return new Response('OK');
  } catch (e) {
    // Beklenmedik hata (ör. geçici DB hatası). 500 → PayTR sınırlı sayıda tekrar dener;
    // confirm_order_payment idempotent olduğu için tekrar güvenli. Ödeme kaydını
    // kaybetmemek adına burada OK DÖNMÜYORUZ. Hata loglanır (görünürlük için).
    console.error('[paytr-callback] işlenemedi:', e instanceof Error ? e.message : String(e));
    return new Response('error', { status: 500 });
  }
});
