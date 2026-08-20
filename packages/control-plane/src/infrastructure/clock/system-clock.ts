import type { Clock } from '../../core/time/index.js';

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
