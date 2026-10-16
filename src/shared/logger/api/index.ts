export class Logger {
  static log(...args: unknown[]) {
    console.log(...args);
  }

  static warn(...data: string[]) {
    console.warn(...data);
  }
}
