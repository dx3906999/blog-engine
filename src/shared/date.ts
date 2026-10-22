import { BuildError } from './errors.ts'

const TIMEZONE_SUFFIX = /(?:z|[+-]\d{2}:\d{2})$/i

export function parseDate(value: string, field: string, file?: string): Date {
  if (!TIMEZONE_SUFFIX.test(value)) {
    throw new BuildError(
      `${field} must include a timezone offset, for example 2026-10-22T10:00:00+08:00`,
      {
        code: 'CONTENT',
        file,
        hint: `got "${value}"`,
      },
    )
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new BuildError(`${field} is not a valid date`, {
      code: 'CONTENT',
      file,
      hint: `got "${value}"`,
    })
  }
  return date
}

export function formatDate(
  date: Date,
  lang: string,
  timeZone: string,
  style: 'short' | 'long' = 'long',
): string {
  const options: Intl.DateTimeFormatOptions =
    style === 'short'
      ? { year: 'numeric', month: '2-digit', day: '2-digit', timeZone }
      : { year: 'numeric', month: 'short', day: 'numeric', timeZone }
  return new Intl.DateTimeFormat(lang, options).format(date)
}

export function isoDate(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).format(date)
}

export function yearOf(date: Date, timeZone: string): string {
  return isoDate(date, timeZone).slice(0, 4)
}

export function rfc3339(date: Date): string {
  return date.toISOString()
}

export function readingMinutes(text: string): number {
  const cjk = (text.match(/[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) ?? []).length
  const latin = text
    .replace(/[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.ceil(cjk / 400 + latin / 200))
}
