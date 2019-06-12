/**
 * Valid event listener args.
 */
export type ValidArgs<T> = T extends any[] ? T : never;

/**
 * Event listener type.
 */
export type EventListener<T, K extends keyof T> = (
  ...args: ValidArgs<T[K]>
) => void;

/**
 * Valid `each` listener args.
 */
export type EachValidArgs<T> = {
  [K in keyof T]: { type: K, args: ValidArgs<T[K]> }
}[keyof T];

/**
 * Wildcard event listener type.
 */
export type EachEventListener<T> = (arg: EachValidArgs<T>) => void;

/**
 * Type-safe event emitter.
 */
export class Emitter<T> {
  _: Array<EachEventListener<T>> = [];
  $: { [K in keyof T]?: Array<EventListener<T, K>> } = Object.create(null);

  on<K extends keyof T>(type: K, callback: EventListener<T, K>) {
    (this.$[type] = this.$[type]! || []).push(callback);
  }

  off<K extends keyof T>(type: K, callback: EventListener<T, K>) {
    const stack = this.$[type];
    if (stack) stack.splice(stack.indexOf(callback) >>> 0, 1);
  }

  each(callback: EachEventListener<T>) {
    this._.push(callback);
  }

  none(callback: EachEventListener<T>) {
    this._.splice(this._.indexOf(callback) >>> 0, 1);
  }

  emit<K extends keyof T>(type: K, ...args: ValidArgs<T[K]>) {
    const stack = this.$[type];
    if (stack) stack.slice().forEach(fn => fn(...args));
    this._.slice().forEach(fn => fn({ type, args }));
  }
}

/**
 * Helper to listen to an event once only.
 */
export function once<T, K extends keyof T>(
  events: Emitter<T>,
  type: K,
  callback: EventListener<T, K>
) {
  function self(...args: ValidArgs<T[K]>) {
    events.off(type, self);
    return callback(...args);
  }
  events.on(type, self);
  return self;
}
