export type GenericHandler = (payload: any, extra?: any) => void | Promise<void>;
export type WildcardHandler = (type: string, payload: any, extra?: any) => void | Promise<void>;

export class EventRegistry<TEventMap extends Record<string, any> = Record<string, any>> {
  private handlers: Map<string, Set<GenericHandler>> = new Map();
  private wildcardHandlers: Set<WildcardHandler> = new Set();

  public on<K extends keyof TEventMap>(
    type: K,
    handler: (payload: TEventMap[K], extra?: any) => void | Promise<void>
  ): () => void {
    const key = String(type);
    if (!this.handlers.has(key)) {
      this.handlers.set(key, new Set());
    }
    const set = this.handlers.get(key)!;
    set.add(handler);

    return () => this.off(type, handler);
  }

  public off<K extends keyof TEventMap>(
    type: K,
    handler: (payload: TEventMap[K], extra?: any) => void | Promise<void>
  ): void {
    const key = String(type);
    const set = this.handlers.get(key);
    if (set) {
      set.delete(handler);
      if (set.size === 0) {
        this.handlers.delete(key);
      }
    }
  }

  public onWildcard(handler: WildcardHandler): () => void {
    this.wildcardHandlers.add(handler);
    return () => {
      this.wildcardHandlers.delete(handler);
    };
  }

  public async emit<K extends keyof TEventMap>(
    type: K,
    payload: TEventMap[K],
    extra?: any
  ): Promise<void> {
    const key = String(type);
    const set = this.handlers.get(key);

    const promises: Promise<void>[] = [];

    if (set) {
      for (const handler of set) {
        try {
          const res = handler(payload, extra);
          if (res instanceof Promise) promises.push(res);
        } catch (err) {
          console.error(`[EventRegistry] Error in handler for event "${key}":`, err);
        }
      }
    }

    for (const wildcardHandler of this.wildcardHandlers) {
      try {
        const res = wildcardHandler(key, payload, extra);
        if (res instanceof Promise) promises.push(res);
      } catch (err) {
        console.error(`[EventRegistry] Error in wildcard handler for event "${key}":`, err);
      }
    }

    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }
  }

  public clear(): void {
    this.handlers.clear();
    this.wildcardHandlers.clear();
  }

  public listenerCount(type?: keyof TEventMap): number {
    if (!type) {
      let count = 0;
      for (const set of this.handlers.values()) {
        count += set.size;
      }
      return count + this.wildcardHandlers.size;
    }
    return (this.handlers.get(String(type))?.size || 0) + this.wildcardHandlers.size;
  }
}
