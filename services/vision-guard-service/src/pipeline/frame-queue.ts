import { FramePayload } from '../types/vision.types';

export class FrameQueue {
  private queue: FramePayload[] = [];
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  public enqueue(frame: FramePayload): boolean {
    if (this.queue.length >= this.maxSize) {
      return false;
    }
    this.queue.push(frame);
    return true;
  }

  public dequeue(): FramePayload | null {
    return this.queue.shift() || null;
  }

  public size(): number {
    return this.queue.length;
  }

  public clear(): void {
    this.queue = [];
  }
}
