import "server-only";
import { createClient } from "@supabase/supabase-js";

function legacyKeyRole(value:string){
  const parts=value.split(".");
  if(parts.length!==3) return "";

  try{
    const payload=JSON.parse(Buffer.from(parts[1],"base64url").toString("utf8")) as {role?:unknown};
    return typeof payload.role==="string" ? payload.role : "";
  }catch{
    return "";
  }
}

function isElevatedSupabaseKey(value:string){
  if(value.startsWith("sb_secret_")) return true;
  if(value.startsWith("sb_publishable_")) return false;
  return legacyKeyRole(value)==="service_role";
}

export function createAdminClient(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const candidates=[
    process.env.SUPABASE_SECRET_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ].map(value=>value?.trim()).filter((value):value is string=>Boolean(value));

  if(!url || candidates.length===0){
    throw new Error("SUPABASE_ADMIN_NOT_CONFIGURED");
  }

  const secret=candidates.find(isElevatedSupabaseKey);
  if(!secret){
    throw new Error("SUPABASE_ADMIN_KEY_NOT_ELEVATED");
  }

  return createClient(url,secret,{
    auth:{
      persistSession:false,
      autoRefreshToken:false,
      detectSessionInUrl:false
    }
  });
}
