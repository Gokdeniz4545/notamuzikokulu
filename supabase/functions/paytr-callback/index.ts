// ============================================================
// paytr-callback — PayTR ödeme sonrası buraya POST eder (webhook).
// Hash doğrulanır; başarılıysa siparişi 'paid' yapar + stok düşer.
// PayTR'ın tekrar denememesi için MUTLAKA düz metin "OK" döner.
// JWT doğrulaması KAPALI deploy edilmeli (--no-verify-jwt) — PayTR Supabase JWT göndermez.
// PayTR panelinde "Bildirim URL" bu fonksiyonun URL'i olmalı.
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { hmacSha256Base64 } from '../_shared/cors.ts';

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
      await admin.rpc('confirm_order_payment', { p_merchant_oid: merchantOid });
    } else {
      const reason = String(form.get('failed_reason_msg') || form.get('failed_reason_code') || '');
      await admin.rpc('fail_order_payment', { p_merchant_oid: merchantOid, p_reason: reason });
    }

    // PayTR bu yanıtı bekler — aksi halde tekrar tekrar dener
    return new Response('OK');
  } catch (_e) {
    // Hata olsa bile PayTR'ı döngüye sokmamak için OK dönmüyoruz → PayTR tekrar dener
    return new Response('error', { status: 500 });
  }
});
