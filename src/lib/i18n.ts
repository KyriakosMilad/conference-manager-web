import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import arAnalytics from '../locales/ar-EG/analytics.json'
import arAttendance from '../locales/ar-EG/attendance.json'
import arAuth from '../locales/ar-EG/auth.json'
import arCommon from '../locales/ar-EG/common.json'
import arConferences from '../locales/ar-EG/conferences.json'
import arContacts from '../locales/ar-EG/contacts.json'
import arGroups from '../locales/ar-EG/groups.json'
import arNav from '../locales/ar-EG/nav.json'
import arOrg from '../locales/ar-EG/org.json'
import arSessions from '../locales/ar-EG/sessions.json'
import arStaff from '../locales/ar-EG/staff.json'
import enAnalytics from '../locales/en/analytics.json'
import enAttendance from '../locales/en/attendance.json'
import enAuth from '../locales/en/auth.json'
import enCommon from '../locales/en/common.json'
import enConferences from '../locales/en/conferences.json'
import enContacts from '../locales/en/contacts.json'
import enGroups from '../locales/en/groups.json'
import enNav from '../locales/en/nav.json'
import enOrg from '../locales/en/org.json'
import enSessions from '../locales/en/sessions.json'
import enStaff from '../locales/en/staff.json'

export const namespaces = [
  'common',
  'auth',
  'nav',
  'conferences',
  'sessions',
  'groups',
  'contacts',
  'attendance',
  'analytics',
  'staff',
  'org',
] as const

function applyDocumentLanguage(lng: string) {
  if (typeof document === 'undefined') return
  const isArabic = lng.startsWith('ar')
  document.documentElement.dir = isArabic ? 'rtl' : 'ltr'
  document.documentElement.lang = isArabic ? 'ar' : 'en'
  document.title = isArabic ? 'مدير المؤتمرات' : 'Conference Manager'
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'ar-EG': {
        common: arCommon,
        auth: arAuth,
        nav: arNav,
        conferences: arConferences,
        sessions: arSessions,
        groups: arGroups,
        contacts: arContacts,
        attendance: arAttendance,
        analytics: arAnalytics,
        staff: arStaff,
        org: arOrg,
      },
      en: {
        common: enCommon,
        auth: enAuth,
        nav: enNav,
        conferences: enConferences,
        sessions: enSessions,
        groups: enGroups,
        contacts: enContacts,
        attendance: enAttendance,
        analytics: enAnalytics,
        staff: enStaff,
        org: enOrg,
      },
    },
    fallbackLng: 'ar-EG',
    supportedLngs: ['ar-EG', 'en'],
    ns: [...namespaces],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'cm.lang',
      caches: ['localStorage'],
    },
  })

applyDocumentLanguage(i18n.language || 'ar-EG')
i18n.on('languageChanged', applyDocumentLanguage)

export default i18n
