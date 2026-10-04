export type Product1UseCase={
  slug:string;
  ar:{
    eyebrow:string;
    title:string;
    summary:string;
    questions:string[];
    outcomes:string[];
    limits:string;
  };
  en:{
    eyebrow:string;
    title:string;
    summary:string;
    questions:string[];
    outcomes:string[];
    limits:string;
  };
};

export const PRODUCT1_USE_CASES:Product1UseCase[]=[
  {
    slug:"saudi-market-entry",
    ar:{
      eyebrow:"دخول السوق السعودي",
      title:"قبل دخول السوق: افهم خريطة الصناعات الثقيلة السعودية.",
      summary:"نقطة بداية منظمة لفرق التوسع والمصنعين الدوليين والمستشارين الذين يحتاجون فهم المشهد الصناعي قبل الانتقال إلى البحث الميداني أو قرارات الاستثمار.",
      questions:[
        "ما القطاعات الثقيلة الممثلة في البيانات، وما حجم التغطية في كل قطاع؟",
        "ما المنشآت والملاك المتاحون كنقاط بداية للبحث والتواصل المؤسسي؟",
        "أين تحتاج البيانات المفتوحة إلى تحقق أعمق قبل قرار الدخول؟"
      ],
      outcomes:[
        "تقليل وقت جمع المشهد الأولي من مصادر متفرقة.",
        "بناء قائمة بحث أولية للمنشآت والقطاعات ذات الصلة.",
        "الانتقال إلى بحث أعمق مع سجل مصدر وترخيص ودرجة ثقة واضحة."
      ],
      limits:"هذا الأصل ليس دراسة جدوى، ولا توصية استثمارية، ولا سجلًا حكوميًا شاملًا للمصانع. هو طبقة ذكاء أولية قابلة للتحليل."
    },
    en:{
      eyebrow:"SAUDI MARKET ENTRY",
      title:"Map Saudi heavy industry before you enter the market.",
      summary:"A structured starting point for expansion teams, international manufacturers and advisors who need an industrial landscape before primary research or investment decisions.",
      questions:[
        "Which heavy-industry subsectors are represented, and how much source coverage exists in each?",
        "Which facilities and available owners can seed deeper market and partnership research?",
        "Where does open data need deeper validation before an entry decision?"
      ],
      outcomes:[
        "Reduce time spent assembling an initial landscape from scattered sources.",
        "Build a first-pass research list of relevant facilities and subsectors.",
        "Move into deeper diligence with explicit source, license and confidence metadata."
      ],
      limits:"This asset is not a feasibility study, investment recommendation or complete government factory registry. It is an analysis-ready starting layer."
    }
  },
  {
    slug:"industrial-research",
    ar:{
      eyebrow:"البحث والاستراتيجية الصناعية",
      title:"ابدأ التحليل الصناعي من بيانات منظمة، لا من صفحات متفرقة.",
      summary:"مصمم لفرق الاستشارات والبحوث والسياسات الصناعية التي تحتاج طبقة بيانات قابلة للفرز قبل بناء الفرضيات والدراسات والعروض.",
      questions:[
        "كيف تتوزع التغطية بين الأسمنت والبتروكيماويات والصلب وبقية القطاعات؟",
        "ما المنشآت الأعلى في مؤشرات الانبعاثات داخل البيانات المتاحة؟",
        "أين توجد بيانات ملكية أو سعة أو نشاط يمكن استخدامها كنقطة تحقق؟"
      ],
      outcomes:[
        "تسريع مرحلة الاستكشاف قبل الدراسة التفصيلية.",
        "توحيد الحقول والمصادر داخل ملف واحد قابل للتحليل.",
        "إبقاء عدم اليقين ظاهرًا عبر درجات الثقة بدل إخفائه."
      ],
      limits:"لا تستخدم أعداد السجلات كحصة سوقية، ولا تجمع السعات ذات الوحدات المختلفة في رقم واحد، ولا تعامل تقديرات الانبعاثات كإفصاحات مدققة."
    },
    en:{
      eyebrow:"INDUSTRIAL RESEARCH & STRATEGY",
      title:"Start industrial analysis with structured data, not scattered pages.",
      summary:"Built for consulting, research and industrial-policy teams that need an analysis-ready data layer before developing hypotheses, studies and client materials.",
      questions:[
        "How is source coverage distributed across cement, petrochemicals, steel and other subsectors?",
        "Which represented facilities rank highest on available emissions indicators?",
        "Where are ownership, capacity or activity fields available as validation starting points?"
      ],
      outcomes:[
        "Accelerate the exploration stage before detailed research.",
        "Normalize key fields and source references into one analytical dataset.",
        "Keep uncertainty visible through confidence metadata rather than hiding it."
      ],
      limits:"Do not interpret record counts as market share, aggregate unlike capacity units, or treat estimated emissions as audited corporate disclosures."
    }
  },
  {
    slug:"esg-industrial-intelligence",
    ar:{
      eyebrow:"الاستدامة وESG",
      title:"بيانات منشآت وانبعاثات مع درجات الثقة — لا أرقام بلا سياق.",
      summary:"طبقة أولية لمستشاري الاستدامة والمناخ وفرق ESG الذين يحتاجون تحديد منشآت وقطاعات للبحث الأعمق مع رؤية واضحة لثقة التقديرات.",
      questions:[
        "ما المنشآت الصناعية الممثلة في المصدر، وما انبعاثاتها المقدرة لعام 2025؟",
        "ما درجة الثقة المرتبطة بتقدير الانبعاثات والنشاط والسعة؟",
        "ما القطاعات والمنشآت التي تستحق أولوية التحقق أو الدراسة الإضافية؟"
      ],
      outcomes:[
        "فرز أولي للمنشآت والقطاعات قبل أعمال التحقق التفصيلية.",
        "ربط كل سجل بالمصدر والترخيص وبيانات الثقة المتاحة.",
        "فصل الإشارة التحليلية عن الادعاء المدقق بوضوح."
      ],
      limits:"البيانات لا تحل محل تحقق GHG أو تدقيق الاستدامة أو إفصاحات الشركات. قيم المصدر تقديرية وتختلف درجات الثقة بينها."
    },
    en:{
      eyebrow:"SUSTAINABILITY & ESG",
      title:"Facility and emissions data with confidence attached — not numbers without context.",
      summary:"An initial intelligence layer for sustainability, climate and ESG teams that need to identify facilities and subsectors for deeper research while keeping estimate confidence visible.",
      questions:[
        "Which industrial facilities are represented and what are their estimated 2025 emissions?",
        "What confidence labels accompany emissions, activity and capacity estimates?",
        "Which subsectors and facilities merit deeper verification or study?"
      ],
      outcomes:[
        "Prioritize facilities and subsectors before detailed verification work.",
        "Keep each record tied to source, license and available confidence metadata.",
        "Separate analytical signals from audited claims."
      ],
      limits:"The data does not replace GHG verification, sustainability assurance or company disclosures. Source values are estimates with varying confidence."
    }
  }
];

export function getProduct1UseCase(slug:string){
  return PRODUCT1_USE_CASES.find(item=>item.slug===slug)??null;
}
