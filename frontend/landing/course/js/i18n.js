/* =============================================================================
   Bilingual runtime (Arabic / English) for the Wazzifni course portal.

   Same contract as the runtimes on the other two landing sites
   (landing/web/js/i18n.js and landing/itland/js/i18n.js): each site keeps its
   own copy because nginx serves the three from different roots, so there is no
   shared path all of them can reach.

   This one is a plain script (the portal predates modules) and must be the
   first <script> on the page — every view reads window.i18n.t().

   Markup contract:
     data-i18n="key"                       -> element.textContent
     data-i18n-html="key"                  -> element.innerHTML
     data-i18n-attr="placeholder:key, aria-label:other.key"
                                           -> named attributes
   ============================================================================= */
(function () {
    'use strict';

    var STORAGE_KEY = 'wazzifni-lang';
    var DEFAULT_LANG = 'ar';

    var STRINGS = {
        ar: {
            'meta.title': 'دورات وظّفني | Wazzifni',
            'meta.applyTitle': 'التسجيل في الدورة - Wazzifni',

            'lang.other': 'English',
            'a11y.langSwitch': 'Switch to English',
            'a11y.close': 'إغلاق',

            'nav.courses': '🎓 الدورات',
            'nav.home': '🏠 وظّفني',

            'page.title': 'الدورات التدريبية المتاحة',
            'page.subtitle': 'اكتشف أفضل الدورات واحجز مقعدك الآن',

            'search.placeholder': '🔍 ابحث عن دورة...',
            'filter.all': 'الكل',
            'filter.free': 'مجانية',
            'filter.paid': 'مدفوعة',
            'filter.open': 'متاحة',

            'stats.total': 'إجمالي الدورات',
            'stats.open': 'دورات متاحة',
            'stats.completed': 'دورات مكتملة',
            'stats.free': 'دورات مجانية',

            'list.emptyTitle': 'لا توجد دورات مطابقة',
            'list.emptyText': 'جرب تغيير معايير البحث أو الفلتر',
            'card.finished': '🏁 منتهية',
            'card.open': '🟢 متاحة',
            'card.register': '📝 سجّل الآن',
            'card.details': '👁️ تفاصيل',
            'card.share': 'مشاركة الرابط',
            'card.noDescription': 'لا يوجد وصف لهذه الدورة.',
            'card.badgeFree': 'مجانية',
            'card.badgePaid': 'مدفوعة',
            'card.free': '🆓 مجاني',
            'card.seats': '{n} مقعد إجمالي',

            'page.prev': 'السابق',
            'page.next': 'التالي',

            'detail.descriptionTitle': '📄 وصف الدورة',
            'detail.registrantsTitle': '👥 المتقدمون',
            'detail.totalSeats': 'إجمالي المقاعد',
            'detail.freeBadge': '🆓 مجانية',
            'detail.finishedNote': 'هذه الدورة منتهية حالياً',
            'detail.seatsBooked': 'تم حجز {pct}% من المقاعد',
            'detail.noRegistrants': '👤 لا يوجد متقدمون لهذه الدورة بعد',
            'detail.finished': '🏁 هذه الدورة منتهية',
            'detail.registerCta': '📝 سجّل الآن في هذه الدورة',
            'detail.unspecified': 'غير محدد',

            'apply.title': '📝 التسجيل في الدورة',
            'apply.subtitle': 'يرجى ملء كافة البيانات المطلوبة لإتمام عملية التسجيل',
            'apply.name': 'الاسم الكامل',
            'apply.namePlaceholder': 'أدخل اسمك الكامل',
            'apply.phone': 'رقم الهاتف',
            'apply.phoneNote': 'الأرقام تكتب بالإنكليزية',
            'apply.gender': 'الجنس',
            'apply.genderPlaceholder': 'اختر الجنس',
            'apply.male': 'ذكر',
            'apply.female': 'أنثى',
            'apply.email': 'البريد الإلكتروني (اختياري)',
            'apply.governorate': 'المحافظة',
            'apply.governoratePlaceholder': 'اختر المحافظة',
            'apply.education': 'التحصيل الدراسي',
            'apply.educationPlaceholder': 'اختر التحصيل',
            'apply.study': 'التخصص الدراسي',
            'apply.studyPlaceholder': 'أدخل تخصصك الدراسي',
            'apply.job': 'الوظيفة الحالية',
            'apply.jobPlaceholder': 'اختر الوظيفة',
            'apply.confirm': '✅ تأكيد التسجيل',
            'apply.cancel': 'إلغاء',

            'toast.loadCoursesFailed': '❌ فشل تحميل الدورات: {error}',
            'toast.linkCopied': '✅ تم نسخ رابط الدورة إلى الحافظة',
            'toast.linkCopyFailed': '❌ فشل نسخ الرابط',
            'toast.noCourseSelected': '❌ عذراً، لم يتم تحديد الدورة المطلوبة',
            'toast.loadCourseFailed': '❌ فشل تحميل بيانات الدورة: {error}',
            'toast.missingFields': '⚠️ يرجى ملء جميع الحقول المطلوبة',
            'toast.registered': '✅ تم التسجيل بنجاح سيتم التواصل معك قريباً',
            'toast.registerFailed': '❌ فشل التسجيل: {error}',

            'gov.Najaf': 'النجف',
            'gov.Baghdad': 'بغداد',
            'gov.Basra': 'البصرة',
            'gov.Nineveh': 'نينوى',
            'gov.Erbil': 'أربيل',
            'gov.Sulaymaniyah': 'السليمانية',
            'gov.Duhok': 'دهوك',
            'gov.Kirkuk': 'كركوك',
            'gov.Anbar': 'الأنبار',
            'gov.Babil': 'بابل',
            'gov.Karbala': 'كربلاء',
            'gov.Qadisiyah': 'القادسية',
            'gov.Wasit': 'واسط',
            'gov.SalahAlDin': 'صلاح الدين',
            'gov.Diyala': 'ديالى',
            'gov.Maysan': 'ميسان',
            'gov.Muthanna': 'المثنى',
            'gov.DhiQar': 'ذي قار',

            'edu.NoFormalEducation': 'بدون شهادة',
            'edu.PrimarySchool': 'ابتدائي',
            'edu.MiddleSchool': 'متوسط',
            'edu.HighSchool': 'إعدادي',
            'edu.Diploma': 'دبلوم',
            'edu.Bachelor': 'بكالوريوس',
            'edu.Master': 'ماجستير',
            'edu.PhD': 'دكتوراه',

            'job.Student': 'طالب',
            'job.Employee': 'موظف',
            'job.Unemployed': 'عاطل',

            'currency.iqd': 'د.ع',
        },

        en: {
            'meta.title': 'Wazzifni Courses',
            'meta.applyTitle': 'Course registration — Wazzifni',

            'lang.other': 'العربية',
            'a11y.langSwitch': 'التبديل إلى العربية',
            'a11y.close': 'Close',

            'nav.courses': '🎓 Courses',
            'nav.home': '🏠 Wazzifni',

            'page.title': 'Available training courses',
            'page.subtitle': 'Discover the best courses and reserve your seat now',

            'search.placeholder': '🔍 Search for a course…',
            'filter.all': 'All',
            'filter.free': 'Free',
            'filter.paid': 'Paid',
            'filter.open': 'Open',

            'stats.total': 'Courses in total',
            'stats.open': 'Open courses',
            'stats.completed': 'Completed courses',
            'stats.free': 'Free courses',

            'list.emptyTitle': 'No matching courses',
            'list.emptyText': 'Try changing your search terms or the filter',
            'card.finished': '🏁 Finished',
            'card.open': '🟢 Open',
            'card.register': '📝 Register now',
            'card.details': '👁️ Details',
            'card.share': 'Share the link',
            'card.noDescription': 'This course has no description.',
            'card.badgeFree': 'Free',
            'card.badgePaid': 'Paid',
            'card.free': '🆓 Free',
            'card.seats': '{n} seats in total',

            'page.prev': 'Previous',
            'page.next': 'Next',

            'detail.descriptionTitle': '📄 Course description',
            'detail.registrantsTitle': '👥 Applicants',
            'detail.totalSeats': 'Seats in total',
            'detail.freeBadge': '🆓 Free',
            'detail.finishedNote': 'This course has finished',
            'detail.seatsBooked': '{pct}% of the seats are taken',
            'detail.noRegistrants': '👤 No one has applied to this course yet',
            'detail.finished': '🏁 This course has finished',
            'detail.registerCta': '📝 Register for this course now',
            'detail.unspecified': 'Unspecified',

            'apply.title': '📝 Course registration',
            'apply.subtitle': 'Please fill in all the required details to complete your registration',
            'apply.name': 'Full name',
            'apply.namePlaceholder': 'Enter your full name',
            'apply.phone': 'Phone number',
            'apply.phoneNote': 'Please use English digits',
            'apply.gender': 'Gender',
            'apply.genderPlaceholder': 'Choose a gender',
            'apply.male': 'Male',
            'apply.female': 'Female',
            'apply.email': 'Email address (optional)',
            'apply.governorate': 'Governorate',
            'apply.governoratePlaceholder': 'Choose a governorate',
            'apply.education': 'Level of education',
            'apply.educationPlaceholder': 'Choose a level',
            'apply.study': 'Field of study',
            'apply.studyPlaceholder': 'Enter your field of study',
            'apply.job': 'Current occupation',
            'apply.jobPlaceholder': 'Choose an occupation',
            'apply.confirm': '✅ Confirm registration',
            'apply.cancel': 'Cancel',

            'toast.loadCoursesFailed': '❌ Could not load the courses: {error}',
            'toast.linkCopied': '✅ Course link copied to the clipboard',
            'toast.linkCopyFailed': '❌ Could not copy the link',
            'toast.noCourseSelected': '❌ Sorry, no course was selected',
            'toast.loadCourseFailed': '❌ Could not load the course details: {error}',
            'toast.missingFields': '⚠️ Please fill in every required field',
            'toast.registered': '✅ Registered successfully — we will be in touch shortly',
            'toast.registerFailed': '❌ Registration failed: {error}',

            'gov.Najaf': 'Najaf',
            'gov.Baghdad': 'Baghdad',
            'gov.Basra': 'Basra',
            'gov.Nineveh': 'Nineveh',
            'gov.Erbil': 'Erbil',
            'gov.Sulaymaniyah': 'Sulaymaniyah',
            'gov.Duhok': 'Duhok',
            'gov.Kirkuk': 'Kirkuk',
            'gov.Anbar': 'Anbar',
            'gov.Babil': 'Babil',
            'gov.Karbala': 'Karbala',
            'gov.Qadisiyah': 'Qadisiyah',
            'gov.Wasit': 'Wasit',
            'gov.SalahAlDin': 'Salah Al-Din',
            'gov.Diyala': 'Diyala',
            'gov.Maysan': 'Maysan',
            'gov.Muthanna': 'Muthanna',
            'gov.DhiQar': 'Dhi Qar',

            'edu.NoFormalEducation': 'No formal education',
            'edu.PrimarySchool': 'Primary school',
            'edu.MiddleSchool': 'Middle school',
            'edu.HighSchool': 'High school',
            'edu.Diploma': 'Diploma',
            'edu.Bachelor': 'Bachelor’s degree',
            'edu.Master': 'Master’s degree',
            'edu.PhD': 'PhD',

            'job.Student': 'Student',
            'job.Employee': 'Employee',
            'job.Unemployed': 'Unemployed',

            'currency.iqd': 'IQD',
        },
    };

    /* The API stores these fields as English strings, so the value sent to the
       backend never changes with the language — only the key used to look up its
       label does. */
    var VALUE_KEYS = {
        Najaf: 'gov.Najaf',
        Baghdad: 'gov.Baghdad',
        Basra: 'gov.Basra',
        Nineveh: 'gov.Nineveh',
        Erbil: 'gov.Erbil',
        Sulaymaniyah: 'gov.Sulaymaniyah',
        Duhok: 'gov.Duhok',
        Kirkuk: 'gov.Kirkuk',
        Anbar: 'gov.Anbar',
        Babil: 'gov.Babil',
        Karbala: 'gov.Karbala',
        Qadisiyah: 'gov.Qadisiyah',
        Wasit: 'gov.Wasit',
        'Salah Al-Din': 'gov.SalahAlDin',
        Diyala: 'gov.Diyala',
        Maysan: 'gov.Maysan',
        Muthanna: 'gov.Muthanna',
        'Dhi Qar': 'gov.DhiQar',

        'No Formal Education': 'edu.NoFormalEducation',
        'Primary School': 'edu.PrimarySchool',
        'Middle School': 'edu.MiddleSchool',
        'High School': 'edu.HighSchool',
        Diploma: 'edu.Diploma',
        'Bachelor’s Degree': 'edu.Bachelor',
        'Master’s Degree': 'edu.Master',
        PhD: 'edu.PhD',

        Student: 'job.Student',
        Employee: 'job.Employee',
        Unemployed: 'job.Unemployed',
    };

    function readLang() {
        var stored;
        try {
            stored = window.localStorage.getItem(STORAGE_KEY);
        } catch (error) {
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

    /** Localises one of the API's stored English enum values. Unknown values are
        returned unchanged rather than blanked. */
    function value(raw) {
        var key = VALUE_KEYS[raw];
        return key ? t(key) : raw;
    }

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
        /** BCP-47 tag for Intl / toLocaleString. */
        get locale() {
            return lang === 'ar' ? 'ar-IQ' : 'en-GB';
        },
        t: t,
        has: has,
        value: value,
        apply: apply,
        setLang: setLang,
        toggle: toggle,
        onChange: function (fn) {
            if (typeof fn === 'function') listeners.push(fn);
        },
    };

    applyDocumentLanguage();

    // This file is a plain script at the end of <body>, so the markup is already
    // parsed and can be translated straight away.
    apply(document);
    initToggles();
})();
