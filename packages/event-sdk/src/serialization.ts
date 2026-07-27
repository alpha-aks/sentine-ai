import { hmacSha256 } from '@sentinel-ai/utils';
import { EventEnvelope } from './types';

export interface EventSerializer {
  serialize<T = any>(event: EventEnvelope<T>, secretKey?: string): string;
  deserialize<T = any>(data: string | Buffer, secretKey?: string): EventEnvelope<T>;
}

export class JsonEventSerializer implements EventSerializer {
  public serialize<T = any>(event: EventEnvelope<T>, secretKey?: string): string {
    if (!event || typeof event !== 'object') {
      throw new Error('Serialization failed: Event envelope must be an object');
    }
    if (!event.eventId || !event.eventType || !event.source) {
      throw new Error(
        'Serialization failed: Event missing required metadata (eventId, eventType, source)'
      );
    }

    const envelopeToSerialize: EventEnvelope<T> = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
      version: event.version || '1.0'
    };

    if (secretKey) {
      const canonicalData = `${envelopeToSerialize.eventId}:${envelopeToSerialize.eventType}:${envelopeToSerialize.timestamp}:${JSON.stringify(envelopeToSerialize.payload)}`;
      envelopeToSerialize.signature = hmacSha256(canonicalData, secretKey);
    }

    return JSON.stringify(envelopeToSerialize);
  }

  public deserialize<T = any>(data: string | Buffer, secretKey?: string): EventEnvelope<T> {
    if (!data) {
      throw new Error('Deserialization failed: Empty data input');
    }

    const jsonString = typeof data === 'string' ? data : data.toString('utf8');
    let envelope: EventEnvelope<T>;

    try {
      envelope = JSON.parse(jsonString);
    } catch {
      throw new Error('Deserialization failed: Invalid JSON string');
    }

    if (!envelope || typeof envelope !== 'object') {
      throw new Error('Deserialization failed: Decoded data is not an object');
    }

    if (!envelope.eventId || !envelope.eventType || !envelope.source || !envelope.payload) {
      throw new Error('Deserialization failed: Missing mandatory fields in event envelope');
    }

    if (secretKey) {
      if (!envelope.signature) {
        throw new Error(
          'Deserialization failed: Signature required but missing from event envelope'
        );
      }
      const canonicalData = `${envelope.eventId}:${envelope.eventType}:${envelope.timestamp}:${JSON.stringify(envelope.payload)}`;
      const expectedSignature = hmacSha256(canonicalData, secretKey);

      if (envelope.signature !== expectedSignature) {
        throw new Error(
          'Deserialization failed: HMAC signature verification failed (data tampered or corrupted)'
        );
      }
    }

    return envelope;
  }
}

export const defaultSerializer = new JsonEventSerializer();
