import { FramePayload } from '../types/vision.types';

export class FrameBuffer {
  private bufferSize = 10;
  // Map of candidateSessionId -> array of recent frame payloads
  private buffers = new Map<string, FramePayload[]>();

  public addFrame(sessionId: string, frame: FramePayload): void {
    let sessionBuffer = this.buffers.get(sessionId);
    if (!sessionBuffer) {
      sessionBuffer = [];
      this.buffers.set(sessionId, sessionBuffer);
    }

    sessionBuffer.push(frame);
    if (sessionBuffer.length > this.bufferSize) {
      sessionBuffer.shift();
    }
  }

  public getFrames(sessionId: string): FramePayload[] {
    return this.buffers.get(sessionId) || [];
  }

  public clearSession(sessionId: string): void {
    this.buffers.delete(sessionId);
  }
}
