declare module 'node-cron' {
    import { EventEmitter } from 'events';
  
    export interface ScheduleOptions {
      scheduled?: boolean;
      timezone?: string;
      recoverMissedExecutions?: boolean;
      name?: string;
      runOnInit?: boolean;
    }
  
    export interface ScheduledTask extends EventEmitter {
      start(): void;
      stop(): void;
      now(): void;
    }
  
    export function schedule(cronExpression: string, func: () => void, options?: ScheduleOptions): ScheduledTask;
    export function validate(cronExpression: string): boolean;
    export function getTasks(): Map<string, ScheduledTask>;
  }