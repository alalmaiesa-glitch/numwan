"use client";

import { useEffect } from "react";

const COOKIE_NAME="numwan_sid";
const LOCAL_KEY="numwan_session_id";

function getSessionId(){
  try{
    let value=window.localStorage.getItem(LOCAL_KEY);
    if(!value){
      value=crypto.randomUUID();
      window.localStorage.setItem(LOCAL_KEY,value);
    }
    document.cookie=`${COOKIE_NAME}=${value}; Max-Age=2592000; Path=/; SameSite=Lax`;
    return value;
  }catch{
    return crypto.randomUUID();
  }
}

export default function StoreViewTracker({
  productId,
  eventType="PRODUCT_VIEW"
}:{
  productId:string;
  eventType?:"PRODUCT_VIEW"|"INSIGHT_VIEW";
}){
  useEffect(()=>{
    const onceKey="numwan_view:"+eventType+":"+productId+":"+window.location.pathname;
    if(window.sessionStorage.getItem(onceKey)) return;
    window.sessionStorage.setItem(onceKey,"1");

    const params=new URLSearchParams(window.location.search);
    const payload={
      eventType,
      productId,
      sessionId:getSessionId(),
      path:window.location.pathname,
      referrer:document.referrer||null,
      utmSource:params.get("utm_source"),
      utmMedium:params.get("utm_medium"),
      utmCampaign:params.get("utm_campaign")
    };

    const body=JSON.stringify(payload);
    if(navigator.sendBeacon){
      navigator.sendBeacon("/api/store/events",new Blob([body],{type:"application/json"}));
      return;
    }

    fetch("/api/store/events",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body,
      keepalive:true
    }).catch(()=>{});
  },[productId,eventType]);

  return null;
}
