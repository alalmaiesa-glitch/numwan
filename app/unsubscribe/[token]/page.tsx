import "../../store/store.module.css";
import PublicHeader from "@/components/public-header";
import PublicHeaderEn from "@/components/public-header-en";
import PublicFooter from "@/components/public-footer";
import PublicFooterEn from "@/components/public-footer-en";
import { createAdminClient } from "@/lib/supabase/admin";
import { unsubscribeStoreLead } from "@/app/actions/unsubscribe-lead";

export const dynamic="force-dynamic";

function validToken(value:string){
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default async function UnsubscribePage({
  params,
  searchParams
}:{
  params:Promise<{token:string}>;
  searchParams:Promise<{done?:string;error?:string}>;
}){
  const {token}=await params;
  const query=await searchParams;

  let language:"ar"|"en"="ar";
  let exists=false;
  let alreadyUnsubscribed=false;

  if(validToken(token)){
    const admin=createAdminClient();
    const {data:lead}=await admin
      .from("store_leads")
      .select("language,status")
      .eq("unsubscribe_token",token)
      .maybeSingle();

    if(lead){
      exists=true;
      language=lead.language==="en"?"en":"ar";
      alreadyUnsubscribed=lead.status==="UNSUBSCRIBED";
    }
  }

  const en=language==="en";
  const done=query.done==="1" || alreadyUnsubscribed;

  const Header=en?PublicHeaderEn:PublicHeader;
  const Footer=en?PublicFooterEn:PublicFooter;

  return <main className={"publicSite storePage "+(en?"englishSite":"")} lang={en?"en":"ar"} dir={en?"ltr":"rtl"}>
    <Header signedIn={false} light/>
    <section className="storeHero shellWide">
      <span className="sectionKicker">{en?"EMAIL PREFERENCES":"تفضيلات البريد"}</span>
      <h1>{done
        ? (en?"You are unsubscribed.":"تم إلغاء الاشتراك.")
        : (en?"Stop launch updates":"إيقاف تحديثات الإطلاق")}</h1>
      <p>{done
        ? (en
          ?"This address will no longer receive launch or related product-update emails from this signup."
          :"لن يتلقى هذا العنوان رسائل إطلاق هذا الأصل أو تحديثاته المرتبطة من هذا الاشتراك.")
        : exists
          ? (en
            ?"Confirm below to stop launch and related product-update emails for this signup."
            :"أكد أدناه لإيقاف رسائل إطلاق هذا الأصل وتحديثاته المرتبطة بهذا الاشتراك.")
          : (en
            ?"This unsubscribe link is invalid or no longer available."
            :"رابط إلغاء الاشتراك غير صالح أو لم يعد متاحًا.")}</p>

      {!done && exists
        ? <form action={unsubscribeStoreLead.bind(null,token)} style={{marginTop:32}}>
            <button className="purchaseButton" type="submit">
              {en?"Confirm unsubscribe":"تأكيد إلغاء الاشتراك"}
            </button>
          </form>
        : null}
    </section>
    <Footer signedIn={false}/>
  </main>;
}
