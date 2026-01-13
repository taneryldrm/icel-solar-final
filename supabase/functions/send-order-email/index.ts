import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface EmailRequest {
  orderId: string;
  orderNo: string;
  customerName: string;
  totalAmount: number;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderNo, customerName, totalAmount }: EmailRequest = await req.json();

    if (!RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing Supabase credentials");

    // Initialize Supabase Client with Service Role Key to bypass RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all admin emails
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('email')
      .eq('role', 'admin');

    if (adminError || !admins || admins.length === 0) {
      console.error("No admins found or error:", adminError);
      return new Response(JSON.stringify({ message: "No admins found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // RESEND TEST MODE FIX:
    // Test modunda sadece Resend'e kayıtlı e-postaya mail atılabilir.
    // Diğer adminleri şimdilik filtreliyoruz ki hata vermesin.
    const VERIFIED_EMAIL = 'koyuncukerem3@gmail.com';

    // Sadece verified email listesindeyse gönder
    const adminEmails = admins
      .map(a => a.email)
      .filter(email => email === VERIFIED_EMAIL);

    if (adminEmails.length === 0) {
      console.log("Verified admin not found, sending to fallback.");
      // Fallback to avoid silent failure if DB lookup fails
      adminEmails.push(VERIFIED_EMAIL);
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background-color: #FFD700; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; color: #000000; font-size: 24px; font-weight: 800; letter-spacing: 1px; }
            .content { padding: 30px 20px; }
            .order-info { background: #f5f5f5; padding: 15px; border-radius: 4px; border-left: 4px solid #FFD700; margin-bottom: 20px; }
            .footer { background: #333; color: #ddd; text-align: center; padding: 15px; font-size: 12px; }
            .btn { display: inline-block; background-color: #000; color: #FFD700; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>YENİ SİPARİŞ VAR! 🚀</h1>
            </div>
            <div class="content">
              <p>Yönetim paneline yeni bir sipariş düştü.</p>
              
              <div class="order-info">
                <p><strong>Sipariş No:</strong> #${orderNo}</p>
                <p><strong>Müşteri:</strong> ${customerName}</p>
                <p><strong>Tutar:</strong> ${totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</p>
              </div>

              <p>Siparişi incelemek ve onaylamak için panele gidebilirsiniz:</p>
              <center>
                <a href="https://icelsolar.com/admin/orders" class="btn">Yönetim Paneline Git</a>
              </center>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} İçel Solar Market Yönetim Sistemi</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    // Resend allows sending to multiple recipients in the 'to' array
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "İçel Solar Market <onboarding@resend.dev>",
        to: adminEmails,
        subject: `Yeni Sipariş: #${orderNo} - ${customerName}`,
        html: html,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
