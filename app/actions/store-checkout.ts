"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments/provider";
import { getSiteUrl } from "@/lib/site-url";

function safeProductPath(slug:string){
  return "/store/"+encodeURIComponent(slug);
}

function textField(formData:FormData,key:string){
  const value=formData.get(key);
  return typeof value==="string" ? value.trim() : "";
}

function validPhone(value:string){
  const normalized=value.replace(/[\s()-]/g,"");
  return /^(?:\+9665\d{8}|009665\d{8}|05\d{8}|5\d{8})$/.test(normalized);
}

export async function startStoreCheckout(slug:string,formData:FormData){
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  const userId=typeof claims?.claims?.sub==="string" ? claims.claims.sub : "";
  const email=typeof claims?.claims?.email==="string" ? claims.claims.email.trim() : "";

  if(!userId || !email){
    const next=safeProductPath(slug);
    redirect("/login?next="+encodeURIComponent(next));
  }

  const buyerName=textField(formData,"buyer_name");
  const buyerPhone=textField(formData,"buyer_phone");

  if(buyerName.length<2) throw new Error("BUYER_NAME_REQUIRED");
  if(!validPhone(buyerPhone)) throw new Error("BUYER_PHONE_INVALID");

  const {data:product,error:productError}=await supabase
    .from("store_products")
    .select("id,slug,checkout_status")
    .eq("slug",slug)
    .eq("status","PUBLISHED")
    .maybeSingle();

  if(productError || !product || product.checkout_status!=="READY"){
    throw new Error("PRODUCT_NOT_AVAILABLE_FOR_CHECKOUT");
  }

  const admin=createAdminClient();
  const {data:orderId,error:orderError}=await admin.rpc("create_store_order_v1",{
    p_product_id:product.id,
    p_buyer_user_id:userId,
    p_buyer_email:email
  });

  if(orderError || !orderId) throw new Error("ORDER_CREATION_FAILED");

  const {data:order,error:orderReadError}=await admin
    .from("store_orders")
    .select("order_code,total_sar")
    .eq("id",orderId)
    .single();

  if(orderReadError || !order) throw new Error("ORDER_READ_FAILED");

  const siteUrl=getSiteUrl();
  const payment=getPaymentProvider();
  const checkout=await payment.createCheckout({
    orderId,
    orderCode:order.order_code,
    amountSar:Number(order.total_sar),
    buyerEmail:email,
    buyerName,
    buyerPhone,
    successUrl:siteUrl+"/account/purchases?payment=success",
    cancelUrl:siteUrl+safeProductPath(slug)+"?payment=cancelled"
  });

  const {error:markError}=await admin.rpc("mark_store_order_awaiting_payment_v1",{
    p_order_id:orderId,
    p_provider:checkout.provider,
    p_provider_checkout_id:checkout.providerCheckoutId
  });

  if(markError) throw new Error("ORDER_PAYMENT_STATE_FAILED");

  redirect(checkout.checkoutUrl);
}
