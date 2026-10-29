import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments/provider";

export const runtime="nodejs";

function webhookOrderId(rawBody:string){
  try{
    const parsed=JSON.parse(rawBody) as Record<string,unknown>;
    const value=parsed.orderId ?? parsed.order_id;
    return typeof value==="string" ? value.trim() : "";
  }catch{
    const params=new URLSearchParams(rawBody);
    return (params.get("orderId") ?? params.get("order_id") ?? "").trim();
  }
}

export async function POST(request:Request){
  try{
    const rawBody=await request.text();
    if(!rawBody) throw new Error("PAYMENT_WEBHOOK_EMPTY");

    const orderId=webhookOrderId(rawBody);

    // EdfaPay allows the final transaction event only once per merchant account.
    // Keep Numwan's existing webhook URL as the single receiver and route
    // OHMFORGE orders by their explicit OHM- payment prefix.
    if(orderId.startsWith("OHM-")){
      const forwarded=await fetch(
        "https://ohmforge.alalmaiesa.site/api/payments/edfapay/webhook",
        {
          method:"POST",
          headers:{
            "content-type":request.headers.get("content-type") || "text/plain"
          },
          body:rawBody,
          cache:"no-store"
        }
      );

      if(!forwarded.ok){
        console.error("OHMFORGE payment webhook forwarding failed",forwarded.status);
        return NextResponse.json({ok:false},{status:502});
      }

      return NextResponse.json({ok:true,routed:"ohmforge"},{status:200});
    }

    const provider=getPaymentProvider();
    const replayableRequest=new Request(request.url,{
      method:"POST",
      headers:request.headers,
      body:rawBody
    });
    const event=await provider.verifyWebhook(replayableRequest);
    const admin=createAdminClient();

    if(event.status==="PAID"){
      const {error}=await admin.rpc("finalize_store_payment_v1",{
        p_order_code:event.orderCode,
        p_provider:event.provider,
        p_provider_payment_id:event.providerPaymentId,
        p_provider_reference:event.providerReference??null,
        p_amount_sar:event.amountSar,
        p_paid_at:event.occurredAt
      });
      if(error) throw error;
    }else if(event.status==="FAILED"){
      const {error}=await admin.rpc("fail_store_payment_v1",{
        p_order_code:event.orderCode,
        p_provider:event.provider,
        p_provider_reference:event.providerReference??null
      });
      if(error) throw error;
    }else if(event.status==="REFUNDED"){
      const {error}=await admin.rpc("refund_store_payment_v1",{
        p_order_code:event.orderCode,
        p_provider:event.provider,
        p_provider_payment_id:event.providerPaymentId,
        p_provider_reference:event.providerReference??null,
        p_refunded_at:event.occurredAt
      });
      if(error) throw error;
    }

    return NextResponse.json({ok:true,status:event.status},{status:200});
  }catch(error){
    console.error("Numwan payment webhook failed",error);
    return NextResponse.json({ok:false},{status:400});
  }
}
