// ============================================================
// Ortak e-posta modülü — Hostinger SMTP ile gönderim + markalı şablonlar
// Gizli env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
//            EMAIL_FROM (ör: "Nota Müzik Market <siparis@notamuzikmarket.com>")
// ============================================================
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

const SMTP_HOST = Deno.env.get('SMTP_HOST') || 'smtp.hostinger.com';
const SMTP_PORT = Number(Deno.env.get('SMTP_PORT') || '465');
const SMTP_USER = Deno.env.get('SMTP_USER') || '';
const SMTP_PASS = Deno.env.get('SMTP_PASS') || '';
const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || SMTP_USER;
const SITE = 'https://www.notamuzikmarket.com';

export function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
export function fmtTL(n: unknown): string {
  return new Intl.NumberFormat('tr-TR').format(Number(n) || 0) + ' TL';
}

// Hostinger SMTP ile e-posta gönder
export async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  if (!SMTP_USER || !SMTP_PASS) return { ok: false, error: 'SMTP ayarlı değil' };
  if (!to) return { ok: false, error: 'alıcı yok' };
  const client = new SMTPClient({
    connection: {
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      tls: true, // 465 → doğrudan TLS
      auth: { username: SMTP_USER, password: SMTP_PASS },
    },
  });
  try {
    await client.send({
      from: EMAIL_FROM,
      to,
      subject,
      content: 'Bu e-postayı görüntülemek için HTML destekleyen bir istemci kullanın.',
      html,
    });
    await client.close();
    return { ok: true };
  } catch (e) {
    try { await client.close(); } catch { /* yut */ }
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// Markalı e-posta iskeleti (kimlik e-postalarıyla aynı dil)
function shell(opts: { preheader: string; heading: string; bodyHtml: string }): string {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="color-scheme" content="light"/></head>
<body style="margin:0;padding:0;background:#f3f3f1;-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f3f1;"><tr>
<td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.06);">
<tr><td style="height:5px;background:#c9a060;line-height:5px;font-size:5px;">&nbsp;</td></tr>
<tr><td align="center" style="padding:34px 40px 6px;">
<img src="${SITE}/images/logo.png" width="150" alt="Nota Müzik Market" style="display:block;height:auto;border:0;"/></td></tr>
<tr><td style="padding:18px 40px 4px;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;">
<h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;font-weight:800;color:#111111;letter-spacing:-0.02em;">${opts.heading}</h1>
</td></tr>
<tr><td style="padding:0 40px 8px;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;">${opts.bodyHtml}</td></tr>
<tr><td style="padding:22px 40px 0;"><div style="border-top:1px solid #eeeeec;height:1px;line-height:1px;font-size:1px;">&nbsp;</div></td></tr>
<tr><td style="padding:18px 40px 30px;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;">
<p style="margin:0;font-size:12px;color:#b0b0b0;line-height:1.6;">
<strong style="color:#777;">NOTA MÜZİK MARKET</strong> · Müziğin dokunuşu<br/>
Sorun mu var? <a href="${SITE}" style="color:#b88b3a;text-decoration:none;">bize ulaş</a> ·
<a href="${SITE}" style="color:#b88b3a;text-decoration:none;">notamuzikmarket.com</a></p>
</td></tr>
</table></td></tr></table></body></html>`;
}

// Sipariş kalemleri tablosu
function itemsTable(items: Array<{ product_name: string; quantity: number; product_price: number; subtotal: number }>, total: number): string {
  const rows = items.map((it) => `
    <tr>
      <td style="padding:10px 0;font-size:14px;color:#333;border-bottom:1px solid #f0f0ee;">${esc(it.product_name)} <span style="color:#999;">× ${esc(it.quantity)}</span></td>
      <td align="right" style="padding:10px 0;font-size:14px;color:#333;border-bottom:1px solid #f0f0ee;white-space:nowrap;">${esc(fmtTL(it.subtotal))}</td>
    </tr>`).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 4px;">
    ${rows}
    <tr><td style="padding:14px 0 0;font-size:16px;font-weight:800;color:#111;">Toplam</td>
    <td align="right" style="padding:14px 0 0;font-size:16px;font-weight:800;color:#111;white-space:nowrap;">${esc(fmtTL(total))}</td></tr>
  </table>`;
}

function addressBlock(a: Record<string, unknown>): string {
  if (!a || !a.full_name) return '';
  return `<p style="margin:0;font-size:13px;line-height:1.6;color:#555;">
    <strong style="color:#333;">${esc(a.full_name)}</strong>${a.phone ? ' · ' + esc(a.phone) : ''}<br/>
    ${esc(a.address_line || '')}${a.district ? ', ' + esc(a.district) : ''}${a.city ? ' / ' + esc(a.city) : ''}${a.zip_code ? ' ' + esc(a.zip_code) : ''}</p>`;
}

type Order = {
  order_number: string; total_amount: number; shipping_address: Record<string, unknown>;
  tracking_code?: string | null; cargo_company?: string | null;
};
type Item = { product_name: string; quantity: number; product_price: number; subtotal: number };

// Sipariş + kalemler + alıcı e-postasını DB'den çek (service_role client ile)
// deno-lint-ignore no-explicit-any
export async function loadOrderForEmail(admin: any, merchantOid: string) {
  const { data: order } = await admin.from('orders')
    .select('id, order_number, total_amount, shipping_address, tracking_code, cargo_company, guest_email, user_id')
    .eq('paytr_merchant_oid', merchantOid).single();
  if (!order) return null;
  const { data: items } = await admin.from('order_items')
    .select('product_name, quantity, product_price, subtotal').eq('order_id', order.id);
  let email = order.guest_email as string | null;
  if (order.user_id) {
    const { data } = await admin.auth.admin.getUserById(order.user_id);
    email = data?.user?.email || email;
  }
  return { order, items: (items || []), email };
}

// --- Sipariş onayı ---
export function orderConfirmationEmail(order: Order, items: Item[]) {
  const body = `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#444;">
      Siparişini aldık, teşekkürler! Ödemen başarıyla alındı ve siparişin hazırlanmaya başlandı.
    </p>
    <p style="margin:0 0 18px;font-size:13px;color:#888;">Sipariş No: <strong style="color:#333;">${esc(order.order_number)}</strong></p>
    <h2 style="margin:18px 0 4px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#999;">Ürünler</h2>
    ${itemsTable(items, order.total_amount)}
    <h2 style="margin:22px 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#999;">Teslimat adresi</h2>
    ${addressBlock(order.shipping_address)}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px;"><tr>
      <td align="center" bgcolor="#111111" style="border-radius:999px;">
        <a href="${SITE}/account.html?tab=orders" target="_blank" style="display:inline-block;padding:13px 32px;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;font-weight:700;color:#fff;text-decoration:none;border-radius:999px;">Siparişimi Görüntüle</a>
      </td></tr></table>`;
  return {
    subject: `Siparişin alındı — ${order.order_number}`,
    html: shell({ preheader: `Ödemen alındı, siparişin (${order.order_number}) hazırlanıyor.`, heading: 'Siparişin alındı! 🎵', bodyHtml: body }),
  };
}

// --- Kargo bildirimi ---
export function shippingEmail(order: Order, items: Item[]) {
  const track = order.tracking_code
    ? `<div style="margin:16px 0;padding:16px 18px;background:#faf7f0;border:1px solid #eadfc6;border-radius:12px;">
        <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:#a07d3a;">Kargo Takip</p>
        <p style="margin:0;font-size:17px;font-weight:800;color:#111;letter-spacing:0.02em;">${esc(order.tracking_code)}</p>
        ${order.cargo_company ? `<p style="margin:4px 0 0;font-size:13px;color:#888;">${esc(order.cargo_company)}</p>` : ''}
      </div>` : '';
  const body = `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#444;">
      Güzel haber — siparişin kargoya verildi! 📦 Aşağıdaki takip numarasıyla kargonu izleyebilirsin.
    </p>
    <p style="margin:0 0 4px;font-size:13px;color:#888;">Sipariş No: <strong style="color:#333;">${esc(order.order_number)}</strong></p>
    ${track}
    <h2 style="margin:20px 0 4px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#999;">Ürünler</h2>
    ${itemsTable(items, order.total_amount)}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px;"><tr>
      <td align="center" bgcolor="#111111" style="border-radius:999px;">
        <a href="${SITE}/account.html?tab=orders" target="_blank" style="display:inline-block;padding:13px 32px;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;font-weight:700;color:#fff;text-decoration:none;border-radius:999px;">Siparişimi Takip Et</a>
      </td></tr></table>`;
  return {
    subject: `Siparişin kargoda — ${order.order_number}`,
    html: shell({ preheader: `Siparişin (${order.order_number}) yola çıktı.`, heading: 'Siparişin kargoya verildi 📦', bodyHtml: body }),
  };
}
