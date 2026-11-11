/** Registration and SMS codes work only for Jordanian mobile numbers (+962 7X XXX XXXX). */
export const JORDAN_DIAL = '+962';
export const JORDAN_COUNTRY = 'JO';

/** Digits of a local Jordanian mobile without the leading 0 or country code (e.g. "791234567"). */
export function normalizeJordanMobile(input: string): string {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('00962')) digits = digits.slice(5);
  else if (digits.startsWith('962')) digits = digits.slice(3);
  return digits.replace(/^0+/, '');
}

export function isJordanMobile(input: string): boolean {
  return /^7[789]\d{7}$/.test(normalizeJordanMobile(input));
}
