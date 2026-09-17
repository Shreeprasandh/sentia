export interface CountryCodeItem {
  code: string; // e.g. '+91'
  name: string; // e.g. 'India'
  iso: string;  // e.g. 'IN'
}

export const COUNTRY_CODES: CountryCodeItem[] = [
  { code: '+91', name: 'India', iso: 'IN' },
  { code: '+1', name: 'United States', iso: 'US' },
  { code: '+44', name: 'United Kingdom', iso: 'GB' },
  { code: '+971', name: 'United Arab Emirates', iso: 'AE' },
  { code: '+65', name: 'Singapore', iso: 'SG' },
  { code: '+61', name: 'Australia', iso: 'AU' },
  { code: '+49', name: 'Germany', iso: 'DE' },
  { code: '+33', name: 'France', iso: 'FR' },
  { code: '+81', name: 'Japan', iso: 'JP' },
  { code: '+86', name: 'China', iso: 'CN' },
  { code: '+966', name: 'Saudi Arabia', iso: 'SA' },
  { code: '+41', name: 'Switzerland', iso: 'CH' },
  { code: '+31', name: 'Netherlands', iso: 'NL' },
  { code: '+1', name: 'Canada', iso: 'CA' },
  { code: '+34', name: 'Spain', iso: 'ES' },
  { code: '+39', name: 'Italy', iso: 'IT' },
  { code: '+60', name: 'Malaysia', iso: 'MY' },
  { code: '+62', name: 'Indonesia', iso: 'ID' },
];
