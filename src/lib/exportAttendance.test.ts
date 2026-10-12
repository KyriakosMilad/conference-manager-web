import { describe, expect, it } from 'vitest'

import { attendanceSheetToCsv, sanitizeFilename } from './exportAttendance'
import type { AttendanceSheet } from './exportAttendance'

describe('attendanceSheetToCsv', () => {
  it('writes columns and escapes commas and quotes', () => {
    const data: AttendanceSheet = {
      conference: 'Summit',
      columns: ['name', 'phone', 'Opening', 'total'],
      rows: [['Ada, "Lovelace"', '111', 'X', '0%']],
    }
    const csv = attendanceSheetToCsv(data)
    expect(csv).toBe('name,phone,Opening,total\n"Ada, ""Lovelace""",111,X,0%\n')
  })
})

describe('sanitizeFilename', () => {
  it('keeps a safe basename', () => {
    expect(sanitizeFilename('My Summit 2026!')).toBe('My_Summit_2026')
  })
})
