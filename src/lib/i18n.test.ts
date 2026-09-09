import { describe, expect, it } from 'vitest'

import i18n from './i18n'

describe('i18n', () => {
  it('defaults to Egyptian Arabic', () => {
    expect(i18n.language === 'ar-EG' || i18n.options.fallbackLng).toBeTruthy()
    expect(i18n.t('appName')).toBe('مدير المؤتمرات')
    expect(i18n.t('confirmDelete')).toContain('مش هيمسح نهائي')
    expect(i18n.t('scanTitle', { ns: 'attendance' })).toBe('امسح الكود')
  })

  it('switches to English', async () => {
    await i18n.changeLanguage('en')
    expect(i18n.t('appName')).toBe('Conference Manager')
    expect(i18n.t('scanTitle', { ns: 'attendance' })).toBe('Scan a code')
    await i18n.changeLanguage('ar-EG')
  })
})
