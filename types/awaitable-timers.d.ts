declare module 'awaitable-timers' {
    export function setImmediate(): Promise<void>;
    export function setTimeout(timeout: Number): Promise<void>;
    export function setInterval(interval: Number): Promise<void>
}