export class AsyncQueue<T> {
  private queue: T[] = [];
  private pendingResolvers: (() => void)[] = [];

  enqueue(item: T): void {
    this.queue.push(item);
    if (this.pendingResolvers.length > 0) {
      const resolve = this.pendingResolvers.shift();
      resolve?.();
    }
  }

  async dequeue(): Promise<T> {
    if (this.queue.length > 0) {
      return this.queue.shift()!;
    }
    return new Promise((resolve) =>
      this.pendingResolvers.push(() => resolve(this.queue.shift()!))
    );
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }
}
