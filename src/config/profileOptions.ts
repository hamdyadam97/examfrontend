/**
 * Fixed choices for the student profile. Must match backend apps/users/choices.py:
 * the value (English) is what the server stores, the label is what the student sees.
 */
export interface ProfileOption {
  value: string;
  ar: string;
  en: string;
}

export const SPECIALIZATIONS: ProfileOption[] = [
  { value: 'Medicine', ar: 'طب بشري', en: 'Medicine' },
  { value: 'Dentistry', ar: 'طب الأسنان', en: 'Dentistry' },
  { value: 'Pharmacy', ar: 'صيدلة', en: 'Pharmacy' },
  { value: 'Nursing', ar: 'تمريض', en: 'Nursing' },
  { value: 'Midwifery', ar: 'قبالة', en: 'Midwifery' },
  { value: 'Medical Laboratory', ar: 'مختبرات طبية', en: 'Medical Laboratory' },
  { value: 'Radiology', ar: 'أشعة وتصوير طبي', en: 'Radiology' },
  { value: 'Physiotherapy', ar: 'علاج طبيعي', en: 'Physiotherapy' },
  { value: 'Occupational Therapy', ar: 'علاج وظيفي', en: 'Occupational Therapy' },
  { value: 'Clinical Nutrition', ar: 'تغذية سريرية', en: 'Clinical Nutrition' },
  { value: 'Anesthesia Technology', ar: 'فني تخدير', en: 'Anesthesia Technology' },
  { value: 'Respiratory Therapy', ar: 'علاج تنفسي', en: 'Respiratory Therapy' },
  { value: 'Optometry', ar: 'بصريات', en: 'Optometry' },
  { value: 'Emergency Medical Services', ar: 'إسعاف وطوارئ', en: 'Emergency Medical Services' },
  { value: 'Other', ar: 'أخرى', en: 'Other' },
];

/** The 12 governorates of Jordan. */
export const GOVERNORATES: ProfileOption[] = [
  { value: 'Amman', ar: 'عمّان', en: 'Amman' },
  { value: 'Irbid', ar: 'إربد', en: 'Irbid' },
  { value: 'Zarqa', ar: 'الزرقاء', en: 'Zarqa' },
  { value: 'Balqa', ar: 'البلقاء', en: 'Balqa' },
  { value: 'Mafraq', ar: 'المفرق', en: 'Mafraq' },
  { value: 'Karak', ar: 'الكرك', en: 'Karak' },
  { value: 'Jerash', ar: 'جرش', en: 'Jerash' },
  { value: 'Ajloun', ar: 'عجلون', en: 'Ajloun' },
  { value: 'Madaba', ar: 'مأدبا', en: 'Madaba' },
  { value: 'Aqaba', ar: 'العقبة', en: 'Aqaba' },
  { value: "Ma'an", ar: 'معان', en: "Ma'an" },
  { value: 'Tafilah', ar: 'الطفيلة', en: 'Tafilah' },
];

export const optionLabel = (option: ProfileOption, language: string) => (language.startsWith('ar') ? option.ar : option.en);
