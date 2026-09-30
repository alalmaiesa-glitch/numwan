export const assetStatusAr: Record<string,string> = {
  IDEA:"فكرة", RESEARCH:"بحث", LAB:"مختبر", DEVELOPMENT:"تطوير", READY:"جاهز",
  LISTED:"معروض", INTEREST:"اهتمام", NEGOTIATION:"تفاوض", RESERVED:"محجوز",
  SOLD:"مباع", LICENSED:"مرخّص", ARCHIVED:"مؤرشف"
};
export const dealStatusAr: Record<string,string> = {
  NEW:"جديدة", QUALIFIED:"مؤهلة", DATA_ROOM:"غرفة البيانات", INTEREST:"اهتمام",
  OFFER:"عرض", NEGOTIATION:"تفاوض", RESERVED:"محجوزة", AGREEMENT:"اتفاق",
  SOLD:"مباعة", LICENSED:"مرخّصة", CLOSED:"مغلقة"
};
export const hypothesisImportanceAr: Record<string,string> = {
  CRITICAL:"حرجة", MAJOR:"رئيسية", SECONDARY:"ثانوية"
};
export const verificationStatusAr: Record<string,string> = {
  UNTESTED:"غير مختبرة", TESTING:"قيد الاختبار", SUPPORTED:"مدعومة", REJECTED:"مرفوضة"
};
export function labelOf(map:Record<string,string>, value:string|null|undefined){
  if(!value) return "—";
  return map[value] ?? value;
}
