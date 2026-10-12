export type AttendanceSheet = {
  conference: string
  columns: string[]
  rows: string[][]
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

/** Turn the conference attendance sheet into a CSV file body. */
export function attendanceSheetToCsv(data: AttendanceSheet): string {
  const lines = [
    data.columns.map(escapeCsvCell).join(','),
    ...data.rows.map((row) => data.columns.map((_, index) => escapeCsvCell(row[index] ?? '')).join(',')),
  ]
  return `${lines.join('\n')}\n`
}

export function sanitizeFilename(name: string): string {
  const cleaned = name.trim().replace(/[^\w\-]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  return cleaned || 'export'
}

export function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function downloadAttendanceCsv(data: AttendanceSheet) {
  const base = sanitizeFilename(data.conference)
  downloadTextFile(`${base}-attendance.csv`, `\uFEFF${attendanceSheetToCsv(data)}`, 'text/csv;charset=utf-8')
}
