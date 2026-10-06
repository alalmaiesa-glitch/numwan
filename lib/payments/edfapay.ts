import "server-only";
import type {
  CreateCheckoutInput,
  CreateCheckoutResult,
  NumwanPaymentProvider,
  VerifiedPaymentEvent
} from "./types";

type JsonRecord=Record<string,unknown>;

function requireEnv(name:string){
  const value=process.env[name]?.trim();
  if(!value) throw new Error(name+"_NOT_CONFIGURED");
  return value;
}

function baseUrl(){
  const configured=process.env.EDFAPAY_API_BASE_URL?.trim();
  if(configured) return configured.replace(/\/$/,"");

  const environment=(process.env.EDFAPAY_ENV||"sandbox").trim().toLowerCase();
  return environment==="production"
    ? "https://app-api.edfapay.com"
    : "https://demo-api.edfapay.com";
}

function normalizePhone(value:string){
  let phone=value.trim().replace(/[\s()-]/g,"");
  if(phone.startsWith("00966")) phone="+"+phone.slice(2);
  if(phone.startsWith("05")) phone="+966"+phone.slice(1);
  if(phone.startsWith("5") && /^5\d{8}$/.test(phone)) phone="+966"+phone;
  if(!/^\+\d{8,15}$/.test(phone)) throw new Error("INVALID_BUYER_PHONE");
  return phone;
}

function asObject(value:unknown):JsonRecord{
  if(!value || typeof value!=="object" || Array.isArray(value)) return {};
  return value as JsonRecord;
}

function asString(value:unknown){
  return typeof value==="string" ? value.trim() : "";
}

function asNumber(value:unknown){
  if(typeof value==="number" && Number.isFinite(value)) return value;
  if(typeof value==="string" && value.trim()!==""){
    const parsed=Number(value);
    if(Number.isFinite(parsed)) return parsed;
  }
  return NaN;
}

function sameAmount(left:number,right:number){
  return Number.isFinite(left) && Number.isFinite(right) && Math.abs(left-right)<0.005;
}

async function requestJson(path:string,init:RequestInit){
  const response=await fetch(baseUrl()+path,{
    ...init,
    cache:"no-store",
    headers:{
      accept:"*/*",
      "Content-Type":"application/json",
      ...(init.headers||{})
    }
  });

  const text=await response.text();
  let body:unknown={};
  if(text){
    try{body=JSON.parse(text);}catch{body={raw:text};}
  }

  if(!response.ok){
    const error=new Error("EDFAPAY_HTTP_"+response.status);
    (error as Error & {details?:unknown}).details=body;
    throw error;
  }

  return asObject(body);
}

async function inquireTransaction(transactionId:string){
  const apiKey=requireEnv("EDFAPAY_API_KEY");
  const response=await requestJson(
    "/api/v1/transactions/filterTransaction?id="+encodeURIComponent(transactionId),
    {method:"GET",headers:{"X-API-KEY":apiKey}}
  );

  const data=asObject(response.data);
  const content=Array.isArray(data.content) ? data.content : [];
  const match=content
    .map(asObject)
    .find(item=>asString(item.transactionId)===transactionId);

  if(!match) throw new Error("EDFAPAY_TRANSACTION_NOT_FOUND");
  return match;
}

function queryState(transaction:JsonRecord){
  const values=[
    asString(transaction.transactionStatus),
    asString(transaction.paymentStatus)
  ].map(value=>value.toUpperCase()).filter(Boolean);

  const failed=values.some(value=>
    ["FAILED","DECLINED","CANCELED","CANCELLED","REJECTED"].includes(value)
  );
  const paid=values.some(value=>
    ["SUCCESS","APPROVED","PAID","CAPTURED","SETTLED","COMPLETED"].includes(value)
  );

  return {failed,paid};
}

function webhookStatus(payload:JsonRecord,transaction:JsonRecord):VerifiedPaymentEvent["status"]{
  const status=asString(payload.status).toUpperCase();
  const type=asString(payload.type).toUpperCase();
  const state=queryState(transaction);

  if(["PENDING","REDIRECT"].includes(status)) return "PENDING";

  if(type==="REFUND" && status==="APPROVED"){
    const originalAmount=asNumber(transaction.amount);
    const refundedAmount=asNumber(transaction.totalRefundAmount);
    const refundStatus=asString(transaction.refundStatus).toUpperCase();

    if(
      refundStatus.includes("FULL") ||
      (Number.isFinite(originalAmount) && Number.isFinite(refundedAmount) && refundedAmount>=originalAmount)
    ) return "REFUNDED";

    return "PENDING";
  }

  if(status==="APPROVED"){
    return state.paid && !state.failed ? "PAID" : "PENDING";
  }

  if(status==="DECLINED"){
    return state.failed ? "FAILED" : "PENDING";
  }

  return "PENDING";
}

export const edfaPayProvider:NumwanPaymentProvider={
  async createCheckout(input:CreateCheckoutInput):Promise<CreateCheckoutResult>{
    const apiKey=requireEnv("EDFAPAY_API_KEY");
    const buyerName=input.buyerName.trim();
    if(buyerName.length<2) throw new Error("INVALID_BUYER_NAME");

    const response=await requestJson("/api/v1/payment-gateway/initiate",{
      method:"POST",
      headers:{"X-API-KEY":apiKey},
      body:JSON.stringify({
        orderId:input.orderCode,
        currency:"SAR",
        amount:Number(input.amountSar.toFixed(2)),
        customerDetails:{
          name:buyerName,
          email:input.buyerEmail,
          phone:normalizePhone(input.buyerPhone)
        },
        recurringInit:"N",
        auth:"N",
        successUrl:input.successUrl,
        failureUrl:input.cancelUrl
      })
    });

    const data=asObject(response.data);
    const checkoutUrl=asString(data.redirectUrl);
    if(!checkoutUrl.startsWith("https://")){
      throw new Error("EDFAPAY_CHECKOUT_URL_MISSING");
    }

    let providerCheckoutId=input.orderCode;
    try{
      providerCheckoutId=new URL(checkoutUrl).searchParams.get("sessionId")||input.orderCode;
    }catch{
      throw new Error("EDFAPAY_CHECKOUT_URL_INVALID");
    }

    return {
      provider:"edfapay",
      providerCheckoutId,
      checkoutUrl
    };
  },

  async verifyWebhook(request:Request):Promise<VerifiedPaymentEvent>{
    const raw=await request.text();
    let parsed:unknown;
    try{parsed=JSON.parse(raw);}catch{throw new Error("EDFAPAY_WEBHOOK_INVALID_JSON");}

    const payload=asObject(parsed);
    const transactionId=asString(payload.transactionId);
    const payloadOrderId=asString(payload.orderId);
    const payloadAmount=asNumber(payload.amount);

    if(!transactionId) throw new Error("EDFAPAY_WEBHOOK_TRANSACTION_ID_MISSING");

    // Fail closed: independently verify the transaction with EdfaPay's
    // authenticated status API before changing Numwan order state.
    const transaction=await inquireTransaction(transactionId);
    const orderCode=asString(transaction.orderId)||payloadOrderId;
    const amountSar=asNumber(transaction.amount);

    if(!orderCode) throw new Error("EDFAPAY_ORDER_ID_MISSING");
    if(payloadOrderId && orderCode!==payloadOrderId){
      throw new Error("EDFAPAY_ORDER_ID_MISMATCH");
    }
    if(Number.isFinite(payloadAmount) && !sameAmount(payloadAmount,amountSar)){
      throw new Error("EDFAPAY_AMOUNT_MISMATCH");
    }

    return {
      provider:"edfapay",
      providerPaymentId:transactionId,
      providerReference:asString(transaction.rrn)||undefined,
      orderCode,
      status:webhookStatus(payload,transaction),
      amountSar,
      occurredAt:
        asString(payload.finishedAt) ||
        asString(transaction.finishedAt) ||
        asString(payload.createdAt) ||
        new Date().toISOString()
    };
  }
};
