/**
 * Company contact channels.
 *
 * NOTE: these are the Wazzifni channels already published on the main landing
 * page — IT Land Iraq does not have its own line/inbox wired up yet. They are
 * kept in one place so swapping them later is a single edit; nothing else in
 * the page hard-codes a phone number or an address.
 *
 * The rest of the page's copy (about, services, values) lives directly in
 * index.html: it is static, and keeping it in the markup is what makes the page
 * readable to crawlers and to visitors whose JS never loads.
 */
export const company = {
  name: 'IT Land Iraq',
  nameAr: 'آي تي لاند العراق',
  tagline: 'Building High-Quality Systems',
  taglineAr: 'نبني أنظمة عالية الجودة',

  /** Digits only, international format — used to build wa.me links. */
  whatsapp: '9647875005001',
  /** Display form of the same number. */
  phoneLabel: '07875005001',
  email: 'info@wazzifni.net',
  addressAr: 'النجف / شارع الحزام / مجاور مطعم بهار',
  mapUrl: 'https://maps.app.goo.gl/iyCbhZwp2L6yhNrN6?g_st=iw',
  workingHoursAr: 'الأحد - الخميس، 9:00 صباحاً - 5:00 مساءً',

  social: [
    {
      id: 'facebook',
      label: 'فيسبوك',
      url: 'https://www.facebook.com/share/14XfHdMCbR8/?mibextid=wwXIfr',
    },
    {
      id: 'instagram',
      label: 'انستغرام',
      url: 'https://www.instagram.com/wazzifni?igsh=MXN6ZzVoMWk2NjN5Yw%3D%3D&utm_source=qr',
    },
    { id: 'linkedin', label: 'لينكدإن', url: 'https://www.linkedin.com/company/wazzifni-iraq/' },
  ],
};

export default company;
