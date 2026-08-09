/* =============================================================================
   Bilingual runtime (Arabic / English) for the Wazzifni landing page.

   Loaded as a classic deferred script rather than a module so it runs before
   js/main.js: the job feed and the toasts read window.i18n.t(), and nothing
   should render before the language is settled.

   Markup contract — all attributes are optional and can be combined:
     data-i18n="key"                       -> element.textContent
     data-i18n-html="key"                  -> element.innerHTML (dictionary copy
                                              only; nothing user-supplied ever
                                              reaches this path)
     data-i18n-attr="placeholder:key, aria-label:other.key"
                                           -> named attributes

   A key with no entry in the active dictionary leaves the element untouched, so
   a missed key degrades to the copy already in the markup instead of blanking
   it.
   ============================================================================= */
(function () {
  'use strict';

  var STORAGE_KEY = 'wazzifni-lang';
  var DEFAULT_LANG = 'ar';

  var STRINGS = {
    ar: {
      'meta.title': 'وظّفني | Wazzifni - منصة التوظيف الأولى في العراق',
      'meta.description':
        'منصة التوظيف الرقمية الأولى في العراق - ابحث عن وظيفتك المثالية بضغطة واحدة',

      'a11y.skip': 'تخطَّ إلى المحتوى',
      'a11y.toTop': 'العودة إلى الأعلى',
      'a11y.whatsapp': 'تواصل معنا عبر واتساب',
      'a11y.menuOpen': 'فتح القائمة',
      'a11y.menuClose': 'إغلاق القائمة',
      'a11y.logo': 'وظّفني — الصفحة الرئيسية',
      'a11y.logoAlt': 'وظّفني',
      'a11y.langSwitch': 'Switch to English',
      'a11y.close': 'إغلاق',
      'a11y.facebook': 'فيسبوك',
      'a11y.instagram': 'انستغرام',
      'a11y.linkedin': 'لينكدإن',
      'a11y.whatsappShort': 'واتساب',
      'a11y.phoneShot': 'لقطة من تطبيق وظّفني',
      'a11y.fiveStars': 'خمس نجوم من خمسة',
      'a11y.fourStars': 'أربع نجوم من خمسة',

      'lang.other': 'English',

      // The wordmark is set as styled text rather than an image; the <span> is
      // the half the footer/modal CSS paints gold.
      'brand.wordmark': 'وظّ<span>فني</span>',
      // Decorative initials on the review avatars — they have to match whichever
      // spelling of the reviewer's name is on screen.
      'trust.review1Initial': 'أ',
      'trust.review2Initial': 'س',
      'trust.review3Initial': 'ن',

      'nav.jobs': 'الوظائف',
      'nav.why': 'مميزاتنا',
      'nav.employers': 'أصحاب العمل',
      'nav.latest': 'أحدث الوظائف',
      'nav.cta': '📲 حمّل',
      'nav.ctaWord': 'التطبيق',

      'hero.badge': '🇮🇶 منصة التوظيف الأولى في العراق',
      'hero.title': 'ابحث عن <em>وظيفتك المثالية</em> بضغطة واحدة',
      'hero.subtitle':
        'وظّفني تربط أصحاب العمل بأفضل الكفاءات في العراق — بسرعة، بذكاء، وبدون تعقيدات.',
      'hero.ctaDownload': '📲 حمّل التطبيق',
      'hero.ctaBrowse': '🔍 تصفح الوظائف',
      'hero.ctaEmployers': '🏢 لأصحاب الشركات',
      'hero.card1': 'باحث عن عمل',
      'hero.card2': 'وظيفة منشورة',

      'path.tag': 'اختر مسارك | Choose Your Path',
      'path.title': 'حدد طريقك وابدأ رحلتك',
      'path.subtitle':
        'سواء كنت تبحث عن نظام تقني لشركتك، أو تطوير مهاراتك، أو العمل بشكل حر — نحن هنا لخدمتك',
      'path.techBadge': 'شركتنا التقنية',
      'path.techDesc':
        'نبني أنظمة وتطبيقات عالية الجودة للمؤسسات والشركات — تعرّف على خدماتنا ومعرض أعمالنا.',
      'path.coursesTitle': 'دورات وظفني',
      'path.coursesDesc':
        'طور مهاراتك مع أفضل الخبراء واحصل على شهادات معتمدة تفتح لك أبواب العمل.',
      'path.soon': 'قريباً',
      'path.freelanceTitle': 'فريلانسر',
      'path.freelanceDesc':
        'اعرض خدماتك، ابحث عن مشاريع، وابدأ بجني الأرباح من مهاراتك في أي وقت وأي مكان.',

      'cats.tag': 'استكشف الفرص',
      'cats.title': 'تصفح حسب نوع الوظيفة',
      'cats.subtitle': 'اختر المجال المناسب لك — التقديم الكامل من داخل التطبيق',
      'cats.admin': 'وظائف إدارية',
      'cats.medical': 'وظائف طبية',
      'cats.engineering': 'وظائف هندسية',
      'cats.sales': 'وظائف مبيعات',
      'cats.education': 'وظائف تعليم',
      'cats.food': 'مطاعم وكافيهات',
      'cats.drivers': 'سائقون ونقل',
      'cats.freelance': 'وظائف فريلانسر',
      'cats.tech': 'وظائف تقنية',
      'cats.support': 'خدمة الزبائن',

      'why.tag': 'مميزاتك معنا',
      'why.title': 'ليش تحمّل تطبيق وظّفني؟',
      'why.subtitle': 'كل شيء تحتاجه للحصول على وظيفتك في مكان واحد',
      'why.searchTitle': 'بحث ذكي وسريع',
      'why.searchText': 'ابحث بالمدينة أو التخصص أو الراتب — النتائج فورية وواضحة',
      'why.applyTitle': 'تقديم بضغطة واحدة',
      'why.applyText': 'قدّم مباشرة بدون بريد إلكتروني ولا ورق — كل شيء رقمي',
      'why.alertsTitle': 'إشعارات فورية',
      'why.alertsText': 'استقبل إشعار فوري عند نشر وظيفة تناسب اهتماماتك',
      'why.cvTitle': 'سيرة ذاتية احترافية',
      'why.cvText': 'أنشئ سيرتك من داخل التطبيق بتصميم جاهز في دقائق',
      'why.trackTitle': 'تابع حالة طلبك',
      'why.trackText': 'راقب أين وصل طلبك — هل قُبل؟ هل صار مراجعة؟ كل شيء واضح',
      'why.contactTitle': 'تواصل مباشر',
      'why.contactText': 'تواصل مع أصحاب العمل بشكل مباشر وبدون وسيط',

      'employers.tag': 'لأصحاب العمل',
      'employers.title': 'وظّفني تبحث عنك بدلك',
      'employers.subtitle':
        'لا وقت لمراجعة مئات السير الذاتية؟ نساعدك تلاقي الكفاءة المناسبة بأسرع وقت',
      'employers.postTitle': 'انشر وظيفتك في دقيقة',
      'employers.postText': 'واجهة بسيطة توصل إعلانك لآلاف الباحثين',
      'employers.matchTitle': 'مرشحون مناسبون فقط',
      'employers.matchText': 'فلاتر ذكية تعرض المرشحين اللي ينطبق عليهم شروطك',
      'employers.saveTitle': 'وفّر وقتك ومالك',
      'employers.saveText': 'وصول مباشر للكفاءات بأسعار معقولة',
      'employers.cta': '🏢 ابدأ التوظيف الآن',
      'employers.stat1': 'شركة وصاحب عمل موثوق',
      'employers.stat2Number': '48 ساعة',
      'employers.stat2': 'متوسط وقت العثور على مرشح',
      'employers.stat3': 'رضا أصحاب العمل عن المنصة',

      'jobs.tag': 'فرص حديثة',
      'jobs.title': 'أحدث الوظائف المتاحة',
      'jobs.subtitle': 'آلاف الفرص تُضاف يومياً — وظيفتك المثالية تنتظرك',
      // The six cards sitting in the markup before js/components/jobs.js swaps
      // in the live feed. They are the no-JS fallback, so they are translated
      // like any other static copy.
      'fallback.job1': 'اداري محاسب في شركة عطور',
      'fallback.job2': 'موظفة مبيعات',
      'fallback.job3': 'موظفة في عيادة طبية',
      'fallback.job4': 'مصمم جرافيك ومحتوى',
      'fallback.job5': 'معلم رياضيات ثانوية',
      'fallback.job6': 'موظف استقبال كافيه',
      'fallback.company1': 'شركة بوابة التوظيف',
      'fallback.company4': 'وكالة ديجيتال ماركتينج',
      'fallback.company5': 'مجموعة المدارس الأهلية',
      'fallback.company6': 'كافيه الأندلس - الكرادة',
      'fallback.mosul': 'الموصل',
      'fallback.baghdad': 'بغداد',

      'jobs.moreText': 'لمشاهدة جميع الوظائف والتقديم — حمّل التطبيق',
      'jobs.moreCta': '📲 شاهد كل الوظائف في التطبيق',
      'jobs.loadError': 'تعذر تحميل الوظائف، يرجى المحاولة لاحقاً.',
      'jobs.empty': 'لا توجد وظائف متاحة حالياً.',
      'jobs.untitled': 'وظيفة',
      'jobs.unknownCompany': 'شركة غير معلنة',
      'jobs.salaryOnInterview': 'الراتب يحدد في المقابلة',
      'jobs.currency': 'د.ع',
      'jobs.salaryUpTo': 'حتى {amount} {unit}',

      'jobType.1': 'دوام كامل',
      'jobType.2': 'دوام جزئي',
      'jobType.3': 'حسب الإتفاق',
      'jobType.4': 'أعمال حرة',
      'jobType.5': 'شراكة استراتيجية',
      'jobType.6': 'تدريب',
      'jobType.7': 'عمل تطوعي',

      'workPlace.1': 'في مقر العمل',
      'workPlace.2': 'عن بعد',
      'workPlace.3': 'هجين (مقر العمل + عن بُعد)',

      'level.1': 'مستوى مبتدئ',
      'level.2': 'مستوى متوسط',
      'level.3': 'مستوى خبير',
      'level.unknown': 'مستوى غير محدد',

      'period.1': 'يومياً',
      'period.2': 'أسبوعياً',
      'period.3': 'شهرياً',

      'ago.now': 'الآن',
      'ago.minutes': 'منذ {n} دقيقة',
      'ago.hours': 'منذ {n} ساعة',
      'ago.day': 'منذ يوم',
      'ago.twoDays': 'منذ يومين',
      'ago.days': 'منذ {n} أيام',
      'ago.manyDays': 'منذ {n} يوم',

      'steps.tag': 'بسيط وسريع',
      'steps.title': 'كيف تبدأ؟ 5 خطوات فقط',
      'steps.1Title': 'حمّل التطبيق',
      'steps.1Text': 'مجاني من Google Play أو App Store',
      'steps.2Title': 'أنشئ حسابك',
      'steps.2Text': 'في دقيقة واحدة',
      'steps.3Title': 'تصفح الوظائف',
      'steps.3Text': 'آلاف الفرص',
      'steps.4Title': 'قدّم مباشرة',
      'steps.4Text': 'بضغطة واحدة',
      'steps.5Title': 'تابع حالتك',
      'steps.5Text': 'في الوقت الحقيقي',

      'trust.tag': 'أرقام تتحدث',
      'trust.title': 'الأرقام التي تثبت ثقتكم',
      'trust.stat1': 'مستخدم نشط',
      'trust.stat2': 'وظيفة منشورة',
      'trust.stat3': 'شركة وصاحب عمل',
      'trust.stat4': 'طلب توظيف ناجح',
      'trust.review1':
        '«وظّفني خلّيتني ألاقي وظيفة بأسبوع بس! قدّمت على وظيفة في هندسة البرمجيات وعندي مقابلة الأسبوع الجاي.»',
      'trust.review1Name': 'أحمد الكناني',
      'trust.review1Role': 'مهندس برمجيات · بغداد',
      'trust.review2':
        '«نشرنا إعلان وخلال 24 ساعة وصلنا أكثر من 40 طلب مناسب. وفّر علينا وقت ومال كثير.»',
      'trust.review2Name': 'سارة الموسى',
      'trust.review2Role': 'مدير موارد بشرية',
      'trust.review3':
        '«التطبيق سهل جداً وما يحتاج خبرة. حصلت على وظيفتي كمعلمة بفضل وظّفني.»',
      'trust.review3Name': 'نور الربيعي',
      'trust.review3Role': 'معلمة · الموصل',

      'download.tag': 'متوفر الآن',
      'download.title': 'وظيفتك تنتظرك — حمّل التطبيق الآن',
      'download.subtitle':
        'انضم لآلاف العراقيين اللي وجدوا طريقهم المهني عبر وظّفني — مجاني، سريع، ومتاح 24/7',
      'download.note': 'متوفر على Google Play و App Store',

      'footer.description':
        'منصة التوظيف الرقمية الأولى في العراق. نربط الباحثين عن عمل بأفضل الفرص ونساعد أصحاب العمل في إيجاد الكفاءات.',
      'footer.linksHeading': 'روابط سريعة',
      'footer.categories': 'أنواع الوظائف',
      'footer.features': 'مميزات التطبيق',
      'footer.contactHeading': 'تواصل معنا',
      'footer.whatsapp': '💬 واتساب: 07875005001',
      'footer.facebook': '📘 فيسبوك',
      'footer.instagram': '📸 انستغرام',
      'footer.linkedin': '💼 لينكدإن',
      'footer.address': '📍 شارع الغدير، فرات، النجف',
      'footer.terms': 'شروط الاستخدام',
      'footer.privacy': 'سياسة الخصوصية',
      'footer.bottom':
        '© 2025 وظّفني | Wazzifni — جميع الحقوق محفوظة · صنع بـ ❤️ في العراق 🇮🇶',

      'modal.title': 'حمّل تطبيق وظّفني',
      'modal.subtitle': 'للاطلاع على الوظائف والتقديم عليها، حمّل التطبيق مجاناً',
      'modal.feature1': 'بحث ذكي وسريع',
      'modal.feature2': 'تقديم بضغطة واحدة',
      'modal.feature3': 'إشعارات فورية',
      'modal.feature4': 'سيرة ذاتية احترافية',
      'modal.feature5': 'متابعة حالة الطلب',
      'modal.feature6': 'تواصل مباشر',
      'modal.android': 'تحميل من Google Play',
      'modal.ios': 'تحميل من App Store',
      'modal.skip': 'ربما لاحقاً',

      'legal.back': 'رجوع',
      'legal.company': 'تطبيق وظّفني | شركة بوابة التوظيف لاستقدام وتشغيل الأيدي العاملة م.م',

      'terms.body': [
        '<div class="legal-article"><h3>المادة (1): القبول والالتزام</h3>',
        '<p>يُعد استخدام التطبيق أو تصفحه بمثابة موافقة صريحة على الالتزام بجميع بنود هذه الشروط.</p></div>',
        '<div class="legal-article"><h3>المادة (2): أهلية المستخدم</h3>',
        '<p>يشترط في المستخدم أن يكون متمتعًا بالأهلية القانونية الكاملة، وأي استخدام من قبل قاصر يتم تحت مسؤولية وليّه القانوني.</p></div>',
        '<div class="legal-article"><h3>المادة (3): إنشاء الحساب</h3><p>يلتزم المستخدم بما يلي:</p><ul>',
        '<li>تقديم معلومات دقيقة وصحيحة.</li><li>عدم انتحال شخصية أي جهة أو فرد.</li>',
        '<li>عدم استخدام أكثر من حساب واحد دون سبب قانوني.</li></ul></div>',
        '<div class="legal-article"><h3>المادة (4): استخدام المشروع</h3><p>يحظر على المستخدم:</p><ul>',
        '<li>إرسال أو تحميل محتوى مسيء أو احتيالي أو غير قانوني.</li>',
        '<li>محاولة اختراق أنظمة الحماية أو تعطيل خدمات التطبيق.</li>',
        '<li>استخدام التطبيق لأغراض تجارية غير مصرّح بها.</li></ul></div>',
        '<div class="legal-article"><h3>المادة (5): حقوق الملكية الفكرية</h3>',
        '<p>تعود جميع الحقوق للشركة، ويمنع نسخها أو إعادة استخدامها بدون إذن مكتوب.</p></div>',
        '<div class="legal-article"><h3>المادة (6): إنهاء الخدمة</h3>',
        '<p>يحق للشركة إنهاء وصول أي مستخدم في حال مخالفة الشروط أو إساءة الاستخدام أو التسبب بضرر للشركة أو المستخدمين.</p></div>',
        '<div class="legal-article"><h3>المادة (7): التعديلات على الشروط</h3>',
        '<p>تحتفظ الشركة بحقها في تعديل هذه الشروط دون إشعار مسبق، وتكون النسخة المنشورة هي السارية.</p></div>',
        '<div class="legal-article"><h3>المادة (8): القانون المعمول به</h3>',
        '<p>تخضع هذه الشروط لأحكام القوانين النافذة في جمهورية العراق، وتكون محاكم محافظة النجف هي المختصة حصريًا.</p></div>',
      ].join(''),

      'privacy.body': [
        '<div class="legal-article"><h3>المادة (1): التعريفات</h3><ul>',
        '<li><strong>الشركة:</strong> شركة بوابة التوظيف لاستقدام وتشغيل الأيدي العاملة المحدودة.</li>',
        '<li><strong>التطبيق:</strong> تطبيق وظفني والموقع الإلكتروني المرتبط به.</li>',
        '<li><strong>المستخدم:</strong> كل شخص يستخدم خدمات التطبيق.</li>',
        '<li><strong>البيانات الشخصية:</strong> كل معلومة تُعرّف أو تُمكّن من التعرف على المستخدم.</li></ul></div>',
        '<div class="legal-article"><h3>المادة (2): نطاق جمع البيانات</h3><ul>',
        '<li>الاسم الكامل، البريد الإلكتروني، رقم الهاتف.</li><li>المعلومات المهنية والسيرة الذاتية.</li>',
        '<li>بيانات الموقع الجغرافي بموافقة المستخدم.</li>',
        '<li>بيانات الاستخدام (IP، نوع الجهاز، نظام التشغيل).</li></ul></div>',
        '<div class="legal-article"><h3>المادة (3): أغراض استخدام البيانات</h3><ul>',
        '<li>تمكين المستخدم من استخدام الخدمات.</li><li>تخصيص وتحسين تجربة المستخدم.</li>',
        '<li>إرسال تنبيهات عن فرص العمل.</li><li>الامتثال للالتزامات القانونية.</li></ul></div>',
        '<div class="legal-article"><h3>المادة (4): مشاركة البيانات</h3>',
        '<p>لا تبيع الشركة البيانات، باستثناء أصحاب العمل المختارين من المستخدم والجهات القضائية بموجب طلب قانوني.</p></div>',
        '<div class="legal-article"><h3>المادة (5): حماية البيانات</h3>',
        '<p>تتخذ الشركة جميع التدابير الفنية بما يشمل التشفير والبروتوكولات الآمنة (SSL).</p></div>',
        '<div class="legal-article"><h3>المادة (6): حقوق المستخدم</h3><ul>',
        '<li>الاطلاع على بياناته وتعديلها أو حذفها.</li>',
        '<li>الاعتراض على استخدام بياناته لأغراض تسويقية.</li><li>سحب الموافقة في أي وقت.</li></ul></div>',
        '<div class="legal-article"><h3>المادة (7): ملفات تعريف الارتباط</h3>',
        '<p>قد يستخدم التطبيق Cookies لتحسين الأداء، ويحق للمستخدم تعطيلها.</p></div>',
        '<div class="legal-article"><h3>المادة (8): التعديلات</h3>',
        '<p>تحتفظ الشركة بحق التعديل مع إشعار المستخدم بالتغييرات الجوهرية.</p></div>',
        '<div class="legal-article"><h3>المادة (9): القانون الواجب التطبيق</h3>',
        '<p>تخضع لقوانين العراق وتختص محاكم النجف بالنظر في أي نزاع.</p></div>',
      ].join(''),

      // Used by js/components/forms.js, which is only fetched if a form is ever
      // added to this page.
      'form.required': 'هذا الحقل مطلوب',
      'form.emailInvalid': 'البريد الإلكتروني غير صحيح',
      'form.phoneInvalid': 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 077، 078، 079، 075)',
      'form.passwordShort': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
      'form.sending': 'جاري الإرسال...',
      'form.sentOk': 'تم الإرسال بنجاح!',
      'form.sendError': 'حدث خطأ. الرجاء المحاولة مرة أخرى.',

      'net.online': 'تم استعادة الاتصال بالإنترنت',
      'net.offline': 'لا يوجد اتصال بالإنترنت',
    },

    en: {
      'meta.title': 'Wazzifni | وظّفني — Iraq’s leading job platform',
      'meta.description':
        'Iraq’s first digital recruitment platform — find your ideal job in a single tap.',

      'a11y.skip': 'Skip to content',
      'a11y.toTop': 'Back to top',
      'a11y.whatsapp': 'Contact us on WhatsApp',
      'a11y.menuOpen': 'Open menu',
      'a11y.menuClose': 'Close menu',
      'a11y.logo': 'Wazzifni — home',
      'a11y.logoAlt': 'Wazzifni',
      'a11y.langSwitch': 'التبديل إلى العربية',
      'a11y.close': 'Close',
      'a11y.facebook': 'Facebook',
      'a11y.instagram': 'Instagram',
      'a11y.linkedin': 'LinkedIn',
      'a11y.whatsappShort': 'WhatsApp',
      'a11y.phoneShot': 'A screenshot of the Wazzifni app',
      'a11y.fiveStars': 'Five stars out of five',
      'a11y.fourStars': 'Four stars out of five',

      'lang.other': 'العربية',

      'brand.wordmark': 'Wazz<span>ifni</span>',
      'trust.review1Initial': 'A',
      'trust.review2Initial': 'S',
      'trust.review3Initial': 'N',

      'nav.jobs': 'Jobs',
      'nav.why': 'Why us',
      'nav.employers': 'Employers',
      'nav.latest': 'Latest jobs',
      'nav.cta': '📲 Get the',
      'nav.ctaWord': 'app',

      'hero.badge': '🇮🇶 Iraq’s leading job platform',
      'hero.title': 'Find <em>your ideal job</em> in a single tap',
      'hero.subtitle':
        'Wazzifni connects employers with the best talent in Iraq — fast, smart, and without the paperwork.',
      'hero.ctaDownload': '📲 Get the app',
      'hero.ctaBrowse': '🔍 Browse jobs',
      'hero.ctaEmployers': '🏢 For employers',
      'hero.card1': 'job seekers',
      'hero.card2': 'jobs posted',

      'path.tag': 'Choose Your Path | اختر مسارك',
      'path.title': 'Pick your direction and start the journey',
      'path.subtitle':
        'Whether you need a software system for your company, want to grow your skills, or plan to work freelance — we are here for it.',
      'path.techBadge': 'Our technology company',
      'path.techDesc':
        'We build high-quality systems and apps for enterprises and companies — see our services and our portfolio.',
      'path.coursesTitle': 'Wazzifni Courses',
      'path.coursesDesc':
        'Develop your skills with leading experts and earn accredited certificates that open doors.',
      'path.soon': 'Coming soon',
      'path.freelanceTitle': 'Freelancer',
      'path.freelanceDesc':
        'List your services, find projects, and start earning from your skills anytime, anywhere.',

      'cats.tag': 'Explore opportunities',
      'cats.title': 'Browse by job type',
      'cats.subtitle': 'Pick the field that fits you — the full application happens in the app.',
      'cats.admin': 'Administration',
      'cats.medical': 'Medical',
      'cats.engineering': 'Engineering',
      'cats.sales': 'Sales',
      'cats.education': 'Education',
      'cats.food': 'Restaurants & cafés',
      'cats.drivers': 'Drivers & transport',
      'cats.freelance': 'Freelance',
      'cats.tech': 'Technology',
      'cats.support': 'Customer service',

      'why.tag': 'What you get',
      'why.title': 'Why download the Wazzifni app?',
      'why.subtitle': 'Everything you need to land your job, in one place.',
      'why.searchTitle': 'Smart, fast search',
      'why.searchText': 'Search by city, specialisation or salary — results are instant and clear.',
      'why.applyTitle': 'Apply in one tap',
      'why.applyText': 'Apply directly — no email, no paperwork, everything digital.',
      'why.alertsTitle': 'Instant notifications',
      'why.alertsText': 'Get notified the moment a job matching your interests is posted.',
      'why.cvTitle': 'A professional CV',
      'why.cvText': 'Build your CV inside the app from a ready-made design in minutes.',
      'why.trackTitle': 'Track your application',
      'why.trackText': 'See exactly where your application stands — accepted, in review, all of it.',
      'why.contactTitle': 'Direct contact',
      'why.contactText': 'Talk to employers directly, with no middleman.',

      'employers.tag': 'For employers',
      'employers.title': 'Wazzifni does the searching for you',
      'employers.subtitle':
        'No time to read hundreds of CVs? We help you find the right person fast.',
      'employers.postTitle': 'Post a job in a minute',
      'employers.postText': 'A simple form puts your listing in front of thousands of job seekers.',
      'employers.matchTitle': 'Only suitable candidates',
      'employers.matchText': 'Smart filters surface the candidates who actually meet your criteria.',
      'employers.saveTitle': 'Save time and money',
      'employers.saveText': 'Direct access to talent at a reasonable price.',
      'employers.cta': '🏢 Start hiring now',
      'employers.stat1': 'trusted companies and employers',
      'employers.stat2Number': '48 hours',
      'employers.stat2': 'average time to find a candidate',
      'employers.stat3': 'employer satisfaction with the platform',

      'jobs.tag': 'Fresh openings',
      'jobs.title': 'The latest jobs available',
      'jobs.subtitle': 'Thousands of openings added daily — your ideal job is waiting.',
      'fallback.job1': 'Accounting administrator at a perfume company',
      'fallback.job2': 'Sales assistant',
      'fallback.job3': 'Medical clinic receptionist',
      'fallback.job4': 'Graphic and content designer',
      'fallback.job5': 'Secondary school maths teacher',
      'fallback.job6': 'Café front-of-house assistant',
      'fallback.company1': 'Employment Gateway Company',
      'fallback.company4': 'Digital marketing agency',
      'fallback.company5': 'Private schools group',
      'fallback.company6': 'Al-Andalus Café — Karrada',
      'fallback.mosul': 'Mosul',
      'fallback.baghdad': 'Baghdad',

      'jobs.moreText': 'To see every job and apply — download the app.',
      'jobs.moreCta': '📲 See all jobs in the app',
      'jobs.loadError': 'Could not load the jobs, please try again later.',
      'jobs.empty': 'No jobs available right now.',
      'jobs.untitled': 'Job',
      'jobs.unknownCompany': 'Undisclosed company',
      'jobs.salaryOnInterview': 'Salary discussed at interview',
      'jobs.currency': 'IQD',
      'jobs.salaryUpTo': 'up to {amount} {unit}',

      'jobType.1': 'Full time',
      'jobType.2': 'Part time',
      'jobType.3': 'By agreement',
      'jobType.4': 'Freelance',
      'jobType.5': 'Strategic partnership',
      'jobType.6': 'Internship',
      'jobType.7': 'Volunteer',

      'workPlace.1': 'On site',
      'workPlace.2': 'Remote',
      'workPlace.3': 'Hybrid (on site + remote)',

      'level.1': 'Entry level',
      'level.2': 'Mid level',
      'level.3': 'Senior level',
      'level.unknown': 'Level unspecified',

      'period.1': 'per day',
      'period.2': 'per week',
      'period.3': 'per month',

      'ago.now': 'Just now',
      'ago.minutes': '{n} minutes ago',
      'ago.hours': '{n} hours ago',
      'ago.day': 'A day ago',
      'ago.twoDays': 'Two days ago',
      'ago.days': '{n} days ago',
      'ago.manyDays': '{n} days ago',

      'steps.tag': 'Simple and quick',
      'steps.title': 'How do you start? Just 5 steps',
      'steps.1Title': 'Download the app',
      'steps.1Text': 'Free on Google Play or the App Store',
      'steps.2Title': 'Create your account',
      'steps.2Text': 'In under a minute',
      'steps.3Title': 'Browse the jobs',
      'steps.3Text': 'Thousands of openings',
      'steps.4Title': 'Apply directly',
      'steps.4Text': 'In a single tap',
      'steps.5Title': 'Track your status',
      'steps.5Text': 'In real time',

      'trust.tag': 'The numbers',
      'trust.title': 'The numbers behind your trust',
      'trust.stat1': 'active users',
      'trust.stat2': 'jobs posted',
      'trust.stat3': 'companies and employers',
      'trust.stat4': 'successful placements',
      'trust.review1':
        '“Wazzifni got me a job in a single week! I applied for a software engineering role and I have an interview next week.”',
      'trust.review1Name': 'Ahmed Al-Kanani',
      'trust.review1Role': 'Software engineer · Baghdad',
      'trust.review2':
        '“We posted an ad and within 24 hours we had more than 40 suitable applications. It saved us a lot of time and money.”',
      'trust.review2Name': 'Sara Al-Mousa',
      'trust.review2Role': 'HR manager',
      'trust.review3':
        '“The app is very easy and needs no experience. I got my job as a teacher thanks to Wazzifni.”',
      'trust.review3Name': 'Noor Al-Rubaie',
      'trust.review3Role': 'Teacher · Mosul',

      'download.tag': 'Available now',
      'download.title': 'Your job is waiting — download the app',
      'download.subtitle':
        'Join the thousands of Iraqis who found their career path through Wazzifni — free, fast, available 24/7.',
      'download.note': 'Available on Google Play and the App Store',

      'footer.description':
        'Iraq’s first digital recruitment platform. We connect job seekers with the best opportunities and help employers find the right talent.',
      'footer.linksHeading': 'Quick links',
      'footer.categories': 'Job categories',
      'footer.features': 'App features',
      'footer.contactHeading': 'Contact us',
      'footer.whatsapp': '💬 WhatsApp: 07875005001',
      'footer.facebook': '📘 Facebook',
      'footer.instagram': '📸 Instagram',
      'footer.linkedin': '💼 LinkedIn',
      'footer.address': '📍 Al-Ghadeer Street, Furat, Najaf',
      'footer.terms': 'Terms of use',
      'footer.privacy': 'Privacy policy',
      'footer.bottom':
        '© 2025 Wazzifni | وظّفني — All rights reserved · Made with ❤️ in Iraq 🇮🇶',

      'modal.title': 'Download the Wazzifni app',
      'modal.subtitle': 'To browse jobs and apply for them, download the app for free.',
      'modal.feature1': 'Smart, fast search',
      'modal.feature2': 'Apply in one tap',
      'modal.feature3': 'Instant notifications',
      'modal.feature4': 'A professional CV',
      'modal.feature5': 'Application tracking',
      'modal.feature6': 'Direct contact',
      'modal.android': 'Get it on Google Play',
      'modal.ios': 'Download on the App Store',
      'modal.skip': 'Maybe later',

      'legal.back': 'Back',
      'legal.company':
        'Wazzifni app | Employment Gateway Company for Recruitment and Labour Services Ltd.',

      'terms.body': [
        '<div class="legal-article"><h3>Article (1): Acceptance and commitment</h3>',
        '<p>Using or browsing the app constitutes explicit agreement to be bound by all of these terms.</p></div>',
        '<div class="legal-article"><h3>Article (2): User eligibility</h3>',
        '<p>The user must have full legal capacity. Any use by a minor takes place under the responsibility of their legal guardian.</p></div>',
        '<div class="legal-article"><h3>Article (3): Creating an account</h3><p>The user undertakes to:</p><ul>',
        '<li>Provide accurate and truthful information.</li><li>Not impersonate any entity or individual.</li>',
        '<li>Not hold more than one account without a lawful reason.</li></ul></div>',
        '<div class="legal-article"><h3>Article (4): Use of the service</h3><p>The user is prohibited from:</p><ul>',
        '<li>Sending or uploading abusive, fraudulent or unlawful content.</li>',
        '<li>Attempting to breach security systems or disrupt the app’s services.</li>',
        '<li>Using the app for unauthorised commercial purposes.</li></ul></div>',
        '<div class="legal-article"><h3>Article (5): Intellectual property rights</h3>',
        '<p>All rights belong to the company; copying or reusing them without written permission is prohibited.</p></div>',
        '<div class="legal-article"><h3>Article (6): Termination of service</h3>',
        '<p>The company may terminate any user’s access in the event of a breach of these terms, misuse, or harm caused to the company or to other users.</p></div>',
        '<div class="legal-article"><h3>Article (7): Amendments to the terms</h3>',
        '<p>The company reserves the right to amend these terms without prior notice; the published version is the one in force.</p></div>',
        '<div class="legal-article"><h3>Article (8): Governing law</h3>',
        '<p>These terms are governed by the laws in force in the Republic of Iraq, and the courts of Najaf Governorate have exclusive jurisdiction.</p></div>',
      ].join(''),

      'privacy.body': [
        '<div class="legal-article"><h3>Article (1): Definitions</h3><ul>',
        '<li><strong>The company:</strong> Employment Gateway Company for Recruitment and Labour Services Ltd.</li>',
        '<li><strong>The app:</strong> the Wazzifni app and its associated website.</li>',
        '<li><strong>The user:</strong> any person who uses the app’s services.</li>',
        '<li><strong>Personal data:</strong> any information that identifies, or makes it possible to identify, the user.</li></ul></div>',
        '<div class="legal-article"><h3>Article (2): Scope of data collection</h3><ul>',
        '<li>Full name, email address, phone number.</li><li>Professional information and CV.</li>',
        '<li>Location data, with the user’s consent.</li>',
        '<li>Usage data (IP address, device type, operating system).</li></ul></div>',
        '<div class="legal-article"><h3>Article (3): Purposes of data use</h3><ul>',
        '<li>Enabling the user to use the services.</li><li>Personalising and improving the user experience.</li>',
        '<li>Sending alerts about job opportunities.</li><li>Complying with legal obligations.</li></ul></div>',
        '<div class="legal-article"><h3>Article (4): Data sharing</h3>',
        '<p>The company does not sell data, except to employers chosen by the user and to judicial authorities under a lawful request.</p></div>',
        '<div class="legal-article"><h3>Article (5): Data protection</h3>',
        '<p>The company takes all technical measures, including encryption and secure protocols (SSL).</p></div>',
        '<div class="legal-article"><h3>Article (6): User rights</h3><ul>',
        '<li>Access, correct or delete their data.</li>',
        '<li>Object to their data being used for marketing purposes.</li><li>Withdraw consent at any time.</li></ul></div>',
        '<div class="legal-article"><h3>Article (7): Cookies</h3>',
        '<p>The app may use cookies to improve performance; the user has the right to disable them.</p></div>',
        '<div class="legal-article"><h3>Article (8): Amendments</h3>',
        '<p>The company reserves the right to amend this policy, notifying users of material changes.</p></div>',
        '<div class="legal-article"><h3>Article (9): Applicable law</h3>',
        '<p>This policy is governed by the laws of Iraq, and the courts of Najaf have jurisdiction over any dispute.</p></div>',
      ].join(''),

      'form.required': 'This field is required',
      'form.emailInvalid': 'That email address is not valid',
      'form.phoneInvalid': 'That phone number is not valid (it must start with 077, 078, 079 or 075)',
      'form.passwordShort': 'The password must be at least 6 characters',
      'form.sending': 'Sending…',
      'form.sentOk': 'Sent successfully!',
      'form.sendError': 'Something went wrong. Please try again.',

      'net.online': 'Back online',
      'net.offline': 'No internet connection',
    },
  };

  /** Reads the stored choice, falling back to the document's own language. */
  function readLang() {
    var stored;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      // Private mode / disabled storage: the language simply does not persist.
      stored = null;
    }
    if (STRINGS[stored]) return stored;
    return STRINGS[document.documentElement.lang] ? document.documentElement.lang : DEFAULT_LANG;
  }

  var lang = readLang();
  var listeners = [];

  function t(key, vars) {
    var table = STRINGS[lang] || STRINGS[DEFAULT_LANG];
    var value = table[key];
    if (value == null) value = STRINGS[DEFAULT_LANG][key];
    if (value == null) return key;
    if (!vars) return value;

    return value.replace(/\{(\w+)\}/g, function (match, name) {
      return Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match;
    });
  }

  function has(key) {
    var table = STRINGS[lang] || {};
    return Object.prototype.hasOwnProperty.call(table, key);
  }

  /** Translates one element in place. Exported so freshly rendered DOM can be
      passed through the same path as the static markup. */
  function translateElement(el) {
    var key = el.getAttribute('data-i18n');
    if (key && has(key)) el.textContent = t(key);

    var htmlKey = el.getAttribute('data-i18n-html');
    if (htmlKey && has(htmlKey)) el.innerHTML = t(htmlKey);

    var attrs = el.getAttribute('data-i18n-attr');
    if (attrs) {
      attrs.split(',').forEach(function (pair) {
        var parts = pair.split(':');
        if (parts.length !== 2) return;
        var name = parts[0].trim();
        var attrKey = parts[1].trim();
        if (name && has(attrKey)) el.setAttribute(name, t(attrKey));
      });
    }
  }

  function apply(root) {
    var scope = root || document;
    if (scope.nodeType === 1) translateElement(scope);
    scope
      .querySelectorAll('[data-i18n], [data-i18n-html], [data-i18n-attr]')
      .forEach(translateElement);
  }

  function applyDocumentLanguage() {
    var html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }

  function setLang(next) {
    if (!STRINGS[next] || next === lang) return;
    lang = next;

    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      /* not persisting is survivable; the page itself still switches */
    }

    applyDocumentLanguage();
    apply(document);
    listeners.forEach(function (fn) {
      fn(lang);
    });
  }

  function toggle() {
    setLang(lang === 'ar' ? 'en' : 'ar');
  }

  /** Wires every [data-lang-toggle] control. */
  function initToggles() {
    document.querySelectorAll('[data-lang-toggle]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        toggle();
      });
    });
  }

  window.i18n = {
    get lang() {
      return lang;
    },
    get dir() {
      return lang === 'ar' ? 'rtl' : 'ltr';
    },
    t: t,
    has: has,
    apply: apply,
    setLang: setLang,
    toggle: toggle,
    /** Registers a callback run after every language change. */
    onChange: function (fn) {
      if (typeof fn === 'function') listeners.push(fn);
    },
  };

  applyDocumentLanguage();

  // The script is deferred, so the document is parsed but DOMContentLoaded has
  // not fired yet — the markup can be translated before any component renders.
  apply(document);
  initToggles();
})();
