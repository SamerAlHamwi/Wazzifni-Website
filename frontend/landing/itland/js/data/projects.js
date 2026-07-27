/**
 * Featured projects — mirrored from the portfolio source of truth at
 * SamerAlHamwi-Portfolio-main/src/app/core/data/portfolio-data.ts (`projects`).
 *
 * The fields `name`, `image`, `type`, `tags`, `publishUrl`, `playStoreUrl` and
 * `appStoreUrl` are copied verbatim so the two stay consistent — when the
 * portfolio changes, re-copy them here rather than editing them by hand.
 *
 * `descriptionAr` / `typeAr` are additions for this Arabic page. Anything that
 * is missing falls back to the English original in js/data/transform.js, so a
 * newly copied record renders correctly before it has been translated.
 *
 * @typedef {object} RawProject
 * @property {string}   name
 * @property {string}   description   English copy from the portfolio.
 * @property {string}   [descriptionAr]
 * @property {string}   image         File name inside assets/images/projects/.
 * @property {string}   type          English project type from the portfolio.
 * @property {string}   [typeAr]
 * @property {string[]} tags
 * @property {string}   [publishUrl]  '#' in the portfolio means "not public".
 * @property {string}   [playStoreUrl]
 * @property {string}   [appStoreUrl]
 * @property {number}   [year]
 */

/** @type {RawProject[]} */
export const projects = [
  {
    name: 'Wazzifni - وظفني',
    description:
      'Wazzifni Portal: An integrated application for job searching in Iraq. It provides a comprehensive platform that connects job seekers with employers, facilitating the recruitment process through modern digital solutions.',
    descriptionAr:
      'منصة توظيف متكاملة للسوق العراقي تربط الباحثين عن عمل بأصحاب العمل، وتدير دورة التوظيف كاملة من نشر الوظيفة حتى التعاقد عبر حلول رقمية حديثة.',
    image: 'wazzifni-logo.png',
    publishUrl: 'https://play.google.com/store/apps/details?id=com.wazzifni.iraq',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.wazzifni.iraq',
    appStoreUrl: 'https://apps.apple.com/pl/app/wazzifni-وظفني/id6743117085',
    type: 'Mobile App',
    typeAr: 'تطبيق موبايل',
    tags: ['Flutter', 'Iraq Market', 'Recruitment', 'Job Search'],
  },
  {
    name: 'Iqraa',
    description:
      "Iqraa – your ultimate mobile learning companion. It is designed to provide students with a seamless and interactive educational experience. Whether you're at home or on the move, our platform brings high-quality education right to your fingertips.",
    descriptionAr:
      'رفيق التعلّم عبر الهاتف: تجربة تعليمية تفاعلية وسلسة تضع محتوى عالي الجودة بين يدي الطالب في المنزل أو أثناء التنقل.',
    image: 'iqraa-logo.png',
    publishUrl: '#',
    type: 'Mobile App',
    typeAr: 'تطبيق موبايل',
    tags: ['Flutter', 'Education', 'Interactive Learning'],
  },
  {
    name: 'Tarasol X',
    description:
      'Tarasol X is an enterprise level, ad-hoc correspondence management system targeted for large organizations and governmental entities. Tarasol X enables organizations to go completely paper-free for their incoming and outgoing official correspondences. The system uses pre-defined templates for correspondences with robust encryption and security, as well as electronic and digital signatures.',
    descriptionAr:
      'نظام إدارة مراسلات بمستوى المؤسسات موجّه للجهات الحكومية والشركات الكبرى، ينقل المراسلات الرسمية الواردة والصادرة إلى بيئة بلا ورق مع قوالب جاهزة وتشفير قوي وتوقيع إلكتروني ورقمي.',
    image: 'tarasol-x-logo.png',
    publishUrl: 'https://play.google.com/store/apps/details?id=com.nvssoft.tarasolx',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.nvssoft.tarasolx',
    appStoreUrl: 'https://apps.apple.com/pl/app/tarasol-x/id6479357081',
    type: 'Mobile App',
    typeAr: 'تطبيق موبايل',
    tags: ['Flutter', 'Enterprise', 'NvsSoft', 'Security'],
  },
  {
    name: 'Tarasol Enterprise',
    description:
      'Tarasol Enterprise, an-hoc correspondence management system targeted for large organizations and governmental entities. Tarasol Enterprise enables organizations to go completely paper-free for their incoming and outgoing official correspondences. The system uses pre-defined templates for correspondences with robust encryption and security, as well as electronic and digital signatures.',
    descriptionAr:
      'النسخة المؤسسية من نظام تراسل لإدارة المراسلات الرسمية في المنظمات الكبيرة والجهات الحكومية، بأرشفة رقمية كاملة وصلاحيات دقيقة وتوقيع إلكتروني معتمد.',
    image: 'tarasol-ent-logo.png',
    publishUrl: 'https://play.google.com/store/apps/details?id=com.nvssoft.tarasolenterprise',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.nvssoft.tarasolenterprise',
    appStoreUrl: 'https://apps.apple.com/pl/app/tarasol-enterprise/id6756568765',
    type: 'Mobile App',
    typeAr: 'تطبيق موبايل',
    tags: ['Flutter', 'Enterprise', 'NvsSoft', 'Security'],
  },
  {
    name: 'ArcMate X',
    description:
      'ArcMate X provides the capability to open, browse, search, and retrieve documents and files stored in ArcMate Enterprise Repositories.',
    descriptionAr:
      'واجهة موبايل لمستودعات ArcMate المؤسسية: فتح وتصفّح وبحث واسترجاع الوثائق والملفات المؤرشفة من أي مكان.',
    image: 'arcmate-x-logo.png',
    publishUrl: 'https://play.google.com/store/apps/details?id=com.nvs.arcmatex.arcmate_x',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.nvs.arcmatex.arcmate_x',
    appStoreUrl: 'https://apps.apple.com/pl/app/arcmate-x/id6746095308',
    type: 'Mobile App',
    typeAr: 'تطبيق موبايل',
    tags: ['Flutter', 'Enterprise', 'NvsSoft', 'Document Management'],
  },
  {
    name: 'KeyFinder',
    description:
      'Developed an app for selling and renting homes and cars without commission. Available on Google Play and App Store.',
    descriptionAr:
      'تطبيق لبيع وتأجير العقارات والسيارات بدون عمولة، مع خرائط تفاعلية وبحث متقدّم وتواصل مباشر بين الطرفين.',
    image: 'keyfinder-logo.png',
    publishUrl: 'https://play.google.com/store/apps/details?id=net.keyfinder',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=net.keyfinder',
    appStoreUrl: 'http://apps.apple.com/pl/app/finder-u/id6736408637',
    type: 'Mobile App',
    typeAr: 'تطبيق موبايل',
    tags: ['Flutter', 'Dart', 'Firebase', 'Maps'],
  },
  {
    name: 'KeyFinder Business',
    description:
      'Built a business app for real estate offices offering dedicated services like painting, tiling, and car maintenance. Available on Google Play and App Store.',
    descriptionAr:
      'تطبيق أعمال لمكاتب العقارات ومزوّدي الخدمات — دهان، تبليط، صيانة سيارات — مع إدارة الطلبات وحجز المواعيد.',
    image: 'keyfinder-biz-logo.png',
    publishUrl: 'https://play.google.com/store/apps/details?id=net.keyfinder.services',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=net.keyfinder.services',
    appStoreUrl: 'https://apps.apple.com/pl/app/finder-business/id6736620277',
    type: 'Mobile App',
    typeAr: 'تطبيق موبايل',
    tags: ['Flutter', 'Business Solution', 'Service Booking'],
  },
  {
    name: 'Signo',
    description:
      'Created an app to assist the deaf and mute in conducting transactions in Kuwait via video calls with specialized translators. Available on Google Play and App Store.',
    descriptionAr:
      'تطبيق يخدم الصمّ وضعاف النطق في الكويت لإنجاز معاملاتهم عبر مكالمات فيديو مباشرة مع مترجمي لغة إشارة مختصين.',
    image: 'signo-logo.png',
    publishUrl: 'https://play.google.com/store/apps/details?id=com.itland.metasign',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.itland.metasign',
    appStoreUrl: 'https://apps.apple.com/pl/app/signo-application/id1642515920',
    type: 'Mobile App',
    typeAr: 'تطبيق موبايل',
    tags: ['Flutter', 'Agora', 'Video Call', 'Accessibility'],
  },
  {
    name: 'Gomovaro',
    description:
      'Designed an app for the UAE market to facilitate moving home furniture and belongings. Available on Google Play and App Store.',
    descriptionAr:
      'تطبيق للسوق الإماراتي ينظّم نقل الأثاث والأمتعة المنزلية: طلب الخدمة، تسعير فوري، ومتابعة حالة النقل.',
    image: 'gomovaro-logo.png',
    publishUrl: 'https://apps.apple.com/pl/app/go-movaro/id6471915960',
    appStoreUrl: 'https://apps.apple.com/pl/app/go-movaro/id6471915960',
    type: 'Mobile App',
    typeAr: 'تطبيق موبايل',
    tags: ['Flutter', 'Logistics', 'UAE Market'],
  },
  {
    name: 'Soubol',
    description:
      'Developed an assistant app for the Syrian Virtual University to display teaching materials, courses, and certificates. Available on Google Play.',
    descriptionAr:
      'تطبيق مساعد لطلاب الجامعة الافتراضية السورية لعرض المقررات والمواد التعليمية والشهادات ومتابعة الخطة الدراسية.',
    image: 'soubol-logo.png',
    publishUrl: '#',
    type: 'Mobile App',
    typeAr: 'تطبيق موبايل',
    tags: ['Flutter', 'Education', 'SVU'],
  },
  {
    name: 'جرعة شفاء',
    description:
      'Created an AI-powered app to assist psychiatric patients by analyzing speech and interacting through choices and voice commands. Available on Google Play and App Store.',
    descriptionAr:
      'تطبيق مدعوم بالذكاء الاصطناعي لمساندة مرضى الصحة النفسية عبر تحليل الكلام والتفاعل بالأوامر الصوتية والخيارات الموجّهة.',
    image: 'shafaa-logo.png',
    publishUrl: 'https://play.google.com/store/apps/details?id=com.arabert.peat',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.arabert.peat',
    appStoreUrl: 'https://apps.apple.com/pl/app/جرعة-شفاء/id6472448936',
    type: 'Mobile App',
    typeAr: 'تطبيق موبايل',
    tags: ['Flutter', 'AI', 'Speech Analysis', 'Healthcare'],
  },
];

export default projects;
