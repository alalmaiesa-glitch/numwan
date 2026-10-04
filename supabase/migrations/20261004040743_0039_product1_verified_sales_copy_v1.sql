update public.store_products
set
  summary_ar='خريطة بيانات موثقة لـ46 منشأة ومصدرًا في الصناعات الثقيلة السعودية عبر 7 قطاعات فرعية، مبنية على بيانات 2025 الكاملة من Climate TRACE، مع الملكية والسعة والنشاط والانبعاثات ودرجات الثقة حيث تتوفر.',
  summary_en='A source-traceable map of 46 Saudi heavy-industry facilities/sources across 7 subsectors, built on full-year 2025 Climate TRACE data with ownership, capacity, activity, emissions and confidence metadata where available.',
  preview_ar='تغطية V1: 46 سجلًا عبر الأسمنت (20)، البتروكيماويات (13)، الحديد والصلب (6)، الألمنيوم (2)، الزجاج (2)، الورق واللب (2)، والكيماويات (1). 38 سجلًا تتضمن بيانات ملكية، وجميع السجلات تتضمن درجة ثقة للانبعاثات. المنتج ليس سجلًا حكوميًا شاملًا للمصانع، ولا يتضمن أي بيانات معاد نشرها من أدلة خاصة مقيدة.',
  preview_en='V1 coverage: 46 records across Cement (20), Petrochemicals (13), Iron & Steel (6), Aluminum (2), Glass (2), Pulp & Paper (2), and Chemicals (1). Ownership data is available for 38 records and emissions-confidence metadata for all 46. This is not a complete government factory registry and excludes restricted private-directory data.',
  updated_at=now()
where slug='saudi-industrial-intelligence-v1';
