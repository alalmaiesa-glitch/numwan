import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments/provider";

export const runtime="nodejs";

export async function POST(request:Request){
  try{
    const provider=getPaymentProvider();
    const event=await provider.verifyWebhook(request);
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

    return new NextResponse(null,{status:204});
  }catch(error){
    console.error("Numwan payment webhook failed",error);
    return NextResponse.json({ok:false},{status:400});
  }
}
