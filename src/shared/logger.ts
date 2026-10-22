export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const priorities: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

export class Logger {
  private readonly threshold: number

  constructor(level: LogLevel = 'info') {
    this.threshold = priorities[level]
  }

  debug(message: string): void {
    this.write('debug', message)
  }

  info(message: string): void {
    this.write('info', message)
  }

  warn(message: string): void {
    this.write('warn', message)
  }

  error(message: string): void {
    this.write('error', message)
  }

  private write(level: LogLevel, message: string): void {
    if (priorities[level] < this.threshold) return
    const line = `[${level}] ${message}`
    if (level === 'error') console.error(line)
    else if (level === 'warn') console.warn(line)
    else console.log(line)
  }
}
