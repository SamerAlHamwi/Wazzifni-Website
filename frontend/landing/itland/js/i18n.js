/* =============================================================================
   Bilingual runtime (Arabic / English) for the IT Land Iraq page.

   Loaded as a classic deferred script rather than a module so it runs before
   js/main.js and its dynamic imports: every component that renders text reads
   window.i18n.t(), and a component must never render before the language is
   settled.

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
      'meta.title': 'IT Land Iraq | بناء أنظمة عالية الجودة',
      'meta.description':
        'IT Land Iraq — شركة تقنية عراقية متخصصة في بناء أنظمة برمجية وتطبيقات موبايل عالية الجودة للمؤسسات والشركات. اطّلع على معرض أعمالنا وتواصل معنا.',

      'a11y.skip': 'تخطَّ إلى المحتوى',
      'a11y.toTop': 'العودة إلى الأعلى',
      'a11y.whatsapp': 'تواصل معنا عبر واتساب',
      'a11y.menuOpen': 'فتح القائمة',
      'a11y.menuClose': 'إغلاق القائمة',
      'a11y.logo': 'IT Land Iraq — أعلى الصفحة',
      'a11y.langSwitch': 'Switch to English',

      'lang.other': 'English',

      'nav.about': 'من نحن',
      'nav.services': 'خدماتنا',
      'nav.projects': 'أعمالنا',
      'nav.design': 'التصميم',
      'nav.contact': 'تواصل معنا',
      'nav.home': '← وظّفني',
      'nav.cta': '💬 اطلب',
      'nav.ctaWord': 'عرض سعر',
      'nav.logoSub': 'أنظمة عالية الجودة',

      'hero.badge': '🇮🇶 شركة تقنية عراقية',
      'hero.tagline': 'Building High-Quality Systems',
      'hero.subtitle':
        'نبني أنظمة برمجية وتطبيقات موبايل تُصمَّم لتدوم: معمارية نظيفة، أداء سريع، وأمان يليق بالمؤسسات. من الفكرة الأولى حتى النشر على المتاجر والدعم بعده.',
      'hero.ctaProjects': '🚀 شاهد أعمالنا',
      'hero.ctaServices': '🧩 خدماتنا',
      'hero.metric1': 'مشروعاً منجزاً',
      'hero.metric2': 'تطبيقاً على المتاجر',
      'hero.metric3': 'أسواق إقليمية',
      'hero.panelNote': 'كود مملوك بالكامل لعميلنا، موثّق، وجاهز لفريقه الداخلي.',
      'hero.float1Label': 'قاعدة كود واحدة',
      'hero.float2Label': 'أنظمة حكومية ومؤسسية',

      'about.tag': 'من نحن',
      'about.title': 'نهندس البرمجيات، لا نكتفي بكتابتها',
      'about.subtitle':
        'فريق متخصص في تحويل متطلبات العمل إلى أنظمة قابلة للتوسّع والصيانة — من التطبيقات الاستهلاكية إلى الأنظمة المؤسسية والحكومية.',
      'about.missionTitle': 'رسالتنا',
      'about.missionText':
        'أن نمنح كل جهة نعمل معها نظاماً يعمل بصمت وثبات: سريع للمستخدم، واضح لفريقها التقني، وقابل للتطوير بعد سنوات من إطلاقه — لا مجرد تسليم يُغلق ملفه بعد أول إصدار.',
      'about.visionTitle': 'رؤيتنا',
      'about.visionText':
        'أن نكون بيت الخبرة الأول في العراق لبناء الأنظمة الرقمية، وأن نثبت أن البرمجيات المصنوعة محلياً تنافس نظيرتها الإقليمية في الجودة والاعتمادية.',
      'about.pointsHeading': 'ما الذي يميّزنا',
      'about.point1Title': 'جودة هندسية',
      'about.point1Text':
        'معمارية واضحة، فصل للطبقات، ومراجعة كود قبل كل دمج — لأن كلفة الصيانة تُحسم في أول شهر من المشروع.',
      'about.point2Title': 'تسليم على دفعات',
      'about.point2Text':
        'نُصدر نسخة قابلة للتجربة كل أسبوعين، فترى تقدّم مشروعك بعينك بدل انتظار موعد تسليم واحد بعيد.',
      'about.point3Title': 'أمان بمعايير المؤسسات',
      'about.point3Text':
        'تشفير للبيانات، صلاحيات دقيقة، وتوقيع إلكتروني — خبرة مثبتة في أنظمة المراسلات الحكومية وإدارة الوثائق.',
      'about.point4Title': 'شراكة بعد الإطلاق',
      'about.point4Text':
        'متابعة الأداء، تحديثات المتاجر، وتدريب فريقك على الكود — الإطلاق بداية العمل وليس نهايته.',
      'about.valuesHeading': 'قيمنا',
      'about.value1': 'الإتقان قبل السرعة',
      'about.value2': 'شفافية في التقدّم والتكلفة',
      'about.value3': 'ملكية كاملة للكود',
      'about.value4': 'توثيق يفهمه فريقك',
      'about.value5': 'تحسين مستمر',

      'services.tag': 'خدماتنا',
      'services.title': 'ما الذي نبنيه لك؟',
      'services.subtitle':
        'خدمات متكاملة تغطي دورة حياة المنتج الرقمي من التحليل حتى التشغيل والدعم.',
      'services.mobileTitle': 'تطبيقات الموبايل',
      'services.mobileText':
        'تطبيقات أصلية الأداء لنظامي iOS وAndroid من قاعدة كود واحدة، مع النشر على المتاجر ومتابعة التحديثات.',
      'services.enterpriseTitle': 'الأنظمة المؤسسية',
      'services.enterpriseText':
        'أنظمة إدارة المراسلات والوثائق وسير العمل للجهات الحكومية والشركات الكبيرة، بصلاحيات وأرشفة وتوقيع إلكتروني.',
      'services.apiTitle': 'تكامل الأنظمة وواجهات API',
      'services.apiText':
        'ربط تطبيقك بأنظمتك القائمة وببوابات الدفع والخرائط والمراسلة، مع توثيق كامل لكل واجهة.',
      'services.cloudTitle': 'الخدمات السحابية والتشغيل',
      'services.cloudText':
        'بنية تحتية سحابية، إشعارات فورية، نسخ احتياطي، وخطوط نشر آلية تختصر زمن الإصدار إلى دقائق.',
      'services.uxTitle': 'تصميم تجربة المستخدم',
      'services.uxText':
        'واجهات عربية أولاً، تدعم الاتجاه من اليمين لليسار بشكل صحيح، ومختبرة على أجهزة حقيقية قبل الإطلاق.',
      'services.supportTitle': 'الدعم والصيانة',
      'services.supportText':
        'عقود دعم بمستويات استجابة واضحة، إصلاح الأعطال، ومواكبة تحديثات المنصات وسياسات المتاجر.',

      'projects.tag': 'معرض الأعمال',
      'projects.title': 'مشاريع أطلقناها فعلاً',
      'projects.subtitle':
        'أنظمة وتطبيقات تعمل اليوم بين أيدي المستخدمين في العراق والكويت والإمارات وسوريا ومصر — اضغط أي مشروع لزيارته على المتجر.',
      'projects.filtersLabel': 'تصفية المشاريع حسب المجال',
      'projects.sortLabel': 'ترتيب حسب',
      'projects.noscriptTitle': 'معرض الأعمال يحتاج تفعيل JavaScript',
      'projects.noscriptText':
        'فعّل JavaScript في متصفحك لعرض المشاريع، أو تواصل معنا عبر واتساب وسنرسل لك ملف أعمالنا كاملاً.',
      'projects.noscriptCta': '💬 اطلب ملف الأعمال',
      'projects.loading': 'جارٍ تحميل المشاريع…',
      'projects.errorTitle': 'تعذّر تحميل المشاريع',
      'projects.errorText': 'حدث خطأ أثناء جلب قائمة الأعمال. تحقق من اتصالك ثم أعد المحاولة.',
      'projects.retry': 'إعادة المحاولة',
      'projects.errorAnnounce': 'تعذّر تحميل المشاريع.',
      'projects.emptyTitle': 'لم يتم إضافة أي مشروع بعد.',
      'projects.emptyText':
        'نعمل حالياً على تجهيز معرض أعمالنا — تواصل معنا للاطلاع على مشاريعنا الأخيرة.',
      'projects.noMatchTitle': 'لا توجد مشاريع في هذا التصنيف',
      'projects.noMatchText': 'جرّب تصنيفاً آخر، أو اعرض كل الأعمال من زر «الكل».',
      'projects.noMatchAnnounce': 'لا توجد مشاريع مطابقة.',
      'projects.shownAnnounce': 'تم عرض {visible} من {total} مشروعاً.',
      'projects.filterAria': '{label} — {count} مشروعاً',
      'projects.view': 'عرض المشروع',
      'projects.soon': 'قيد النشر',
      'projects.logoAlt': 'شعار {name}',
      'projects.techAria': 'تقنيات {name}',
      'projects.storeAria': '{name} على {store}',
      'projects.fallbackDesc': 'مشروع من أعمال IT Land Iraq.',
      'projects.fallbackType': 'مشروع',
      'projects.repo': 'المستودع',

      'filter.all': 'الكل',
      'filter.enterprise': 'أنظمة مؤسسية',
      'filter.education': 'تعليم',
      'filter.health': 'صحة وإتاحة',
      'filter.platforms': 'منصات وخدمات',
      'filter.ai': 'ذكاء اصطناعي',

      'sort.featured': 'الترتيب المميز',
      'sort.name': 'الاسم (أ-ي)',
      'sort.published': 'المنشورة أولاً',

      'type.mobile': 'تطبيق موبايل',

      'design.tag': 'التصميم',
      'design.title': 'نصمّم التجربة قبل أن نكتب سطر كود',
      'design.subtitle':
        'فريق تصميم متكامل يغطي واجهات الأنظمة والهوية البصرية والمواد التسويقية — بنفس معايير الجودة التي نبني بها البرمجيات.',
      'design.skillsHeading': 'مجالات التصميم',
      'design.uiTitle': 'تصميم واجهات الأنظمة',
      'design.uiText': 'نماذج أولية تفاعلية ومكتبات مكوّنات تُسلَّم جاهزة لفريق التطوير.',
      'design.brandTitle': 'الهوية البصرية',
      'design.brandText':
        'شعارات وأنظمة ألوان وقواعد استخدام تحفظ شكل علامتك في كل مكان تظهر فيه.',
      'design.marketingTitle': 'التصاميم التسويقية',
      'design.marketingText': 'منشورات السوشيال ميديا وإعلانات المتاجر والمواد المطبوعة.',
      'design.systemTitle': 'أنظمة التصميم',
      'design.systemText': 'مكوّنات موثّقة تضمن أن تكون كل شاشة جديدة متسقة مع ما قبلها.',
      'design.toolsHeading': 'أدواتنا',
      'design.worksHeading': 'من أعمالنا في التصميم',
      'design.viewFull': 'عرض بالحجم الكامل',
      'design.work1Title': 'حملة إطلاق تطبيق وظّفني',
      'design.work1Type': 'تصميم تسويقي',
      'design.work1Desc':
        'مادة ترويجية لإطلاق تطبيق وظّفني: صياغة الرسالة، والشخصية الكرتونية، ومحاكاة لواجهة التطبيق — مجمّعة في تصميم واحد جاهز للنشر على منصات التواصل ومتاجر التطبيقات.',
      'design.work1TagsLabel': 'أدوات وتقنيات هذا العمل',
      'design.work1Alt':
        'تصميم إعلاني لتطبيق وظّفني: شعار وظّفني، وعنوان «مستقبلك المهني يبدأ هنا»، وشخصية تشير إلى هاتف يعرض أقسام الوظائف، مع زر التحميل ورمز QR.',

      'contact.tag': 'لنبدأ',
      'contact.title': 'عندك فكرة أو نظام تريد بناءه؟',
      'contact.subtitle':
        'أرسل لنا وصفاً مختصراً لمشروعك وسنعود إليك بخطة تنفيذ مبدئية وتقدير للمدة والتكلفة.',
      'contact.whatsappLabel': 'واتساب — الأسرع للرد',
      'contact.emailLabel': 'البريد الإلكتروني',
      'contact.addressLabel': 'المقر',
      'contact.addressValue': 'النجف / شارع الحزام / مجاور مطعم بهار',
      'contact.hoursLabel': 'أوقات العمل',
      'contact.hoursValue': 'الأحد - الخميس، 9:00 صباحاً - 5:00 مساءً',
      'contact.followHeading': 'تابعنا',
      'contact.facebook': 'فيسبوك',
      'contact.instagram': 'انستغرام',
      'contact.linkedin': 'لينكدإن',

      'form.title': 'أخبرنا عن مشروعك',
      'form.note':
        'الحقول المعلّمة بـ <span aria-hidden="true">*</span> مطلوبة. عند الإرسال تُفتح المحادثة على واتساب (أو بريدك) وبها رسالتك جاهزة.',
      'form.name': 'الاسم',
      'form.namePlaceholder': 'اسمك الكامل',
      'form.contact': 'هاتف أو بريد',
      'form.contactPlaceholder': '07XXXXXXXXX أو name@mail.com',
      'form.company': 'الجهة',
      'form.optional': '(اختياري)',
      'form.companyPlaceholder': 'اسم الشركة أو المؤسسة',
      'form.service': 'نوع الخدمة',
      'form.serviceMobile': 'تطبيق موبايل',
      'form.serviceEnterprise': 'نظام مؤسسي',
      'form.serviceApi': 'تكامل أنظمة وواجهات API',
      'form.serviceCloud': 'خدمات سحابية وتشغيل',
      'form.serviceUx': 'تصميم تجربة مستخدم',
      'form.serviceSupport': 'دعم وصيانة',
      'form.serviceOther': 'غير ذلك',
      'form.message': 'تفاصيل المشروع',
      'form.messagePlaceholder': 'ما الذي تريد بناءه؟ من هم مستخدموه؟ وما الموعد المستهدف؟',
      'form.channel': 'أرسل عبر',
      'form.channelWhatsapp': 'واتساب',
      'form.channelEmail': 'البريد الإلكتروني',
      'form.submit': '📨 إرسال الطلب',
      'form.noscript':
        'إرسال النموذج يحتاج تفعيل JavaScript — يمكنك مراسلتنا مباشرة على <a href="https://wa.me/9647875005001" target="_blank" rel="noopener">واتساب</a>.',

      'form.errName': 'الرجاء إدخال الاسم الكامل (3 أحرف على الأقل).',
      'form.errContactEmpty': 'الرجاء إدخال رقم هاتف أو بريد إلكتروني.',
      'form.errContactInvalid': 'أدخل بريداً إلكترونياً صحيحاً أو رقم هاتف صحيحاً.',
      'form.errMessage': 'اكتب وصفاً مختصراً لمشروعك (10 أحرف على الأقل).',
      'form.errToast': 'الرجاء تصحيح الحقول المعلّمة قبل الإرسال',
      'form.sentToast': 'تم تجهيز رسالتك — أكمل الإرسال من النافذة الجديدة',
      'form.mailSubject': 'طلب تواصل — {name}',
      'form.bodyHeading': 'طلب تواصل جديد — {company}',
      'form.bodyName': 'الاسم',
      'form.bodyContact': 'وسيلة التواصل',
      'form.bodyCompany': 'الجهة',
      'form.bodyService': 'نوع الخدمة',
      'form.bodyDetails': 'التفاصيل:',

      'footer.navHeading': 'روابط سريعة',
      'footer.projects': 'معرض الأعمال',
      'footer.platform': '🏠 منصة وظّفني',
      'footer.courses': '🎓 دورات وظّفني',
      'footer.contactHeading': 'تواصل معنا',
      'footer.whatsapp': '💬 واتساب: 07875005001',
      'footer.linkedin': '💼 لينكدإن',
      'footer.location': '📍 النجف، العراق',
      'footer.description':
        'شركة تقنية تبني أنظمة برمجية وتطبيقات موبايل عالية الجودة للمؤسسات والشركات في العراق والمنطقة.',
      'footer.bottom':
        '© 2025 IT Land Iraq — جميع الحقوق محفوظة · جزء من منظومة <a href="/">وظّفني</a> 🇮🇶',

      'net.online': 'تم استعادة الاتصال بالإنترنت',
      'net.offline': 'لا يوجد اتصال بالإنترنت',
    },

    en: {
      'meta.title': 'IT Land Iraq | Building High-Quality Systems',
      'meta.description':
        'IT Land Iraq — an Iraqi technology company building high-quality software systems and mobile apps for enterprises and government bodies. See our portfolio and get in touch.',

      'a11y.skip': 'Skip to content',
      'a11y.toTop': 'Back to top',
      'a11y.whatsapp': 'Contact us on WhatsApp',
      'a11y.menuOpen': 'Open menu',
      'a11y.menuClose': 'Close menu',
      'a11y.logo': 'IT Land Iraq — top of page',
      'a11y.langSwitch': 'التبديل إلى العربية',

      'lang.other': 'العربية',

      'nav.about': 'About',
      'nav.services': 'Services',
      'nav.projects': 'Work',
      'nav.design': 'Design',
      'nav.contact': 'Contact',
      'nav.home': 'Wazzifni →',
      'nav.cta': '💬 Request a',
      'nav.ctaWord': 'quote',
      'nav.logoSub': 'High-quality systems',

      'hero.badge': '🇮🇶 An Iraqi technology company',
      'hero.tagline': 'Building High-Quality Systems',
      'hero.subtitle':
        'We build software systems and mobile apps designed to last: clean architecture, fast performance, and enterprise-grade security — from the first idea to store release and the support that follows.',
      'hero.ctaProjects': '🚀 See our work',
      'hero.ctaServices': '🧩 Our services',
      'hero.metric1': 'Projects delivered',
      'hero.metric2': 'Apps on the stores',
      'hero.metric3': 'Regional markets',
      'hero.panelNote': 'Code fully owned by the client, documented, and ready for their own team.',
      'hero.float1Label': 'One codebase',
      'hero.float2Label': 'Government & enterprise systems',

      'about.tag': 'About us',
      'about.title': 'We engineer software, we do not just write it',
      'about.subtitle':
        'A team that turns business requirements into systems built to scale and to maintain — from consumer apps to enterprise and government platforms.',
      'about.missionTitle': 'Our mission',
      'about.missionText':
        'To give every organisation we work with a system that runs quietly and reliably: fast for its users, clear to its technical team, and still extensible years after launch — not a handover that closes the file after the first release.',
      'about.visionTitle': 'Our vision',
      'about.visionText':
        'To be the first place in Iraq for building digital systems, and to prove that locally made software matches its regional peers in quality and reliability.',
      'about.pointsHeading': 'What sets us apart',
      'about.point1Title': 'Engineering quality',
      'about.point1Text':
        'Clear architecture, separated layers, and a code review before every merge — because the cost of maintenance is decided in the project’s first month.',
      'about.point2Title': 'Incremental delivery',
      'about.point2Text':
        'We ship a testable build every two weeks, so you watch your project progress instead of waiting on one distant delivery date.',
      'about.point3Title': 'Enterprise-grade security',
      'about.point3Text':
        'Data encryption, fine-grained permissions, and electronic signatures — proven in government correspondence and document management systems.',
      'about.point4Title': 'A partnership after launch',
      'about.point4Text':
        'Performance monitoring, store updates, and training your team on the code — launch is where the work starts, not where it ends.',
      'about.valuesHeading': 'Our values',
      'about.value1': 'Craft before speed',
      'about.value2': 'Transparency on progress and cost',
      'about.value3': 'Full code ownership',
      'about.value4': 'Documentation your team can read',
      'about.value5': 'Continuous improvement',

      'services.tag': 'Services',
      'services.title': 'What can we build for you?',
      'services.subtitle':
        'End-to-end services covering the whole life cycle of a digital product, from analysis through operation and support.',
      'services.mobileTitle': 'Mobile applications',
      'services.mobileText':
        'Apps with native-grade performance on both iOS and Android from a single codebase, published to the stores and kept updated.',
      'services.enterpriseTitle': 'Enterprise systems',
      'services.enterpriseText':
        'Correspondence, document and workflow management for government bodies and large companies, with permissions, archiving and electronic signatures.',
      'services.apiTitle': 'System integration & APIs',
      'services.apiText':
        'Connecting your app to the systems you already run and to payment, mapping and messaging gateways, with every interface fully documented.',
      'services.cloudTitle': 'Cloud services & operations',
      'services.cloudText':
        'Cloud infrastructure, push notifications, backups, and automated release pipelines that cut deployment time to minutes.',
      'services.uxTitle': 'User experience design',
      'services.uxText':
        'Arabic-first interfaces with correct right-to-left support, tested on real devices before launch.',
      'services.supportTitle': 'Support & maintenance',
      'services.supportText':
        'Support contracts with clear response levels, fault fixing, and keeping pace with platform updates and store policies.',

      'projects.tag': 'Portfolio',
      'projects.title': 'Projects we have actually shipped',
      'projects.subtitle':
        'Systems and apps in the hands of users today across Iraq, Kuwait, the UAE, Syria and Egypt — tap any project to open it on its store.',
      'projects.filtersLabel': 'Filter projects by field',
      'projects.sortLabel': 'Sort by',
      'projects.noscriptTitle': 'The portfolio needs JavaScript enabled',
      'projects.noscriptText':
        'Enable JavaScript in your browser to view the projects, or message us on WhatsApp and we will send you the full portfolio.',
      'projects.noscriptCta': '💬 Request the portfolio',
      'projects.loading': 'Loading projects…',
      'projects.errorTitle': 'Could not load the projects',
      'projects.errorText':
        'Something went wrong while fetching the portfolio. Check your connection and try again.',
      'projects.retry': 'Try again',
      'projects.errorAnnounce': 'Could not load the projects.',
      'projects.emptyTitle': 'No projects have been added yet.',
      'projects.emptyText':
        'We are still putting our portfolio together — get in touch to see our latest work.',
      'projects.noMatchTitle': 'No projects in this category',
      'projects.noMatchText': 'Try another category, or show everything with the “All” button.',
      'projects.noMatchAnnounce': 'No matching projects.',
      'projects.shownAnnounce': 'Showing {visible} of {total} projects.',
      'projects.filterAria': '{label} — {count} projects',
      'projects.view': 'View project',
      'projects.soon': 'Coming soon',
      'projects.logoAlt': '{name} logo',
      'projects.techAria': '{name} technologies',
      'projects.storeAria': '{name} on {store}',
      'projects.fallbackDesc': 'A project from the IT Land Iraq portfolio.',
      'projects.fallbackType': 'Project',
      'projects.repo': 'Repository',

      'filter.all': 'All',
      'filter.enterprise': 'Enterprise systems',
      'filter.education': 'Education',
      'filter.health': 'Health & accessibility',
      'filter.platforms': 'Platforms & services',
      'filter.ai': 'Artificial intelligence',

      'sort.featured': 'Featured order',
      'sort.name': 'Name (A–Z)',
      'sort.published': 'Published first',

      'type.mobile': 'Mobile app',

      'design.tag': 'Design',
      'design.title': 'We design the experience before we write a line of code',
      'design.subtitle':
        'A full design team covering system interfaces, visual identity and marketing material — held to the same quality bar as the software we build.',
      'design.skillsHeading': 'Design disciplines',
      'design.uiTitle': 'System & UI design',
      'design.uiText':
        'Interactive prototypes and component libraries, handed over ready for the development team.',
      'design.brandTitle': 'Visual identity',
      'design.brandText':
        'Logos, colour systems and usage rules that keep your brand looking the same everywhere it appears.',
      'design.marketingTitle': 'Marketing creative',
      'design.marketingText': 'Social media posts, store listings and print material.',
      'design.systemTitle': 'Design systems',
      'design.systemText':
        'Documented components that keep every new screen consistent with the last.',
      'design.toolsHeading': 'Our tools',
      'design.worksHeading': 'Selected design work',
      'design.viewFull': 'View full size',
      'design.work1Title': 'Wazzifni app launch campaign',
      'design.work1Type': 'Marketing design',
      'design.work1Desc':
        'Launch creative for the Wazzifni app: the message, the illustrated character, and a mock-up of the app interface — composed into one asset ready for social platforms and the app stores.',
      'design.work1TagsLabel': 'Tools and techniques used on this piece',
      'design.work1Alt':
        'Advertising design for the Wazzifni app: the Wazzifni logo, the headline “Your career starts here”, and a character pointing at a phone showing the job categories, with a download button and a QR code.',

      'contact.tag': 'Let’s start',
      'contact.title': 'Have an idea or a system you want built?',
      'contact.subtitle':
        'Send us a short description of your project and we will come back with an initial delivery plan and an estimate of time and cost.',
      'contact.whatsappLabel': 'WhatsApp — fastest reply',
      'contact.emailLabel': 'Email',
      'contact.addressLabel': 'Office',
      'contact.addressValue': 'Najaf / Belt Street / Next to Bahar Restaurant — Iraq',
      'contact.hoursLabel': 'Working hours',
      'contact.hoursValue': 'Sunday – Thursday, 9:00 AM – 5:00 PM',
      'contact.followHeading': 'Follow us',
      'contact.facebook': 'Facebook',
      'contact.instagram': 'Instagram',
      'contact.linkedin': 'LinkedIn',

      'form.title': 'Tell us about your project',
      'form.note':
        'Fields marked <span aria-hidden="true">*</span> are required. On submit, WhatsApp (or your mail client) opens with your message ready to send.',
      'form.name': 'Name',
      'form.namePlaceholder': 'Your full name',
      'form.contact': 'Phone or email',
      'form.contactPlaceholder': '07XXXXXXXXX or name@mail.com',
      'form.company': 'Organisation',
      'form.optional': '(optional)',
      'form.companyPlaceholder': 'Company or organisation name',
      'form.service': 'Type of service',
      'form.serviceMobile': 'Mobile app',
      'form.serviceEnterprise': 'Enterprise system',
      'form.serviceApi': 'System integration & APIs',
      'form.serviceCloud': 'Cloud services & operations',
      'form.serviceUx': 'User experience design',
      'form.serviceSupport': 'Support & maintenance',
      'form.serviceOther': 'Something else',
      'form.message': 'Project details',
      'form.messagePlaceholder':
        'What do you want built? Who will use it? And what is the target date?',
      'form.channel': 'Send via',
      'form.channelWhatsapp': 'WhatsApp',
      'form.channelEmail': 'Email',
      'form.submit': '📨 Send request',
      'form.noscript':
        'Submitting the form needs JavaScript — you can message us directly on <a href="https://wa.me/9647875005001" target="_blank" rel="noopener">WhatsApp</a>.',

      'form.errName': 'Please enter your full name (at least 3 characters).',
      'form.errContactEmpty': 'Please enter a phone number or an email address.',
      'form.errContactInvalid': 'Enter a valid email address or a valid phone number.',
      'form.errMessage': 'Write a short description of your project (at least 10 characters).',
      'form.errToast': 'Please fix the marked fields before sending',
      'form.sentToast': 'Your message is ready — finish sending it in the new window',
      'form.mailSubject': 'New enquiry — {name}',
      'form.bodyHeading': 'New enquiry — {company}',
      'form.bodyName': 'Name',
      'form.bodyContact': 'Contact',
      'form.bodyCompany': 'Organisation',
      'form.bodyService': 'Type of service',
      'form.bodyDetails': 'Details:',

      'footer.navHeading': 'Quick links',
      'footer.projects': 'Portfolio',
      'footer.platform': '🏠 Wazzifni platform',
      'footer.courses': '🎓 Wazzifni courses',
      'footer.contactHeading': 'Contact us',
      'footer.whatsapp': '💬 WhatsApp: 07875005001',
      'footer.linkedin': '💼 LinkedIn',
      'footer.location': '📍 Najaf, Iraq',
      'footer.description':
        'A technology company building high-quality software systems and mobile apps for enterprises and companies in Iraq and the wider region.',
      'footer.bottom':
        '© 2025 IT Land Iraq — All rights reserved · Part of the <a href="/">Wazzifni</a> group 🇮🇶',

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

  /** Wires every [data-lang-toggle] control and keeps their labels current. */
  function initToggles() {
    var buttons = document.querySelectorAll('[data-lang-toggle]');
    buttons.forEach(function (button) {
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
  // not fired yet — the markup can be translated right now, before first paint
  // of anything below the fold and before any component renders.
  apply(document);
  initToggles();
})();
