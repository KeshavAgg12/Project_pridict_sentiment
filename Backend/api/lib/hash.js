import crypto from 'node:crypto'

// load_dataset.py ke make_hash jaisa hi:
// strip -> whitespace collapse -> lowercase -> "text|YYYY-MM-DD" -> sha256 hex
export function cleanText(text) {
  return String(text).trim().replace(/\s+/g, ' ')
}

export function makeHash(cleanedText, dateStr) {
  const key = `${cleanedText.toLowerCase()}|${dateStr}`
  return crypto.createHash('sha256').update(key, 'utf8').digest('hex')
}