export interface Ok<T> {
  readonly isOk: true;
  readonly isErr: false;
  readonly value: T;
}

export interface Err<E> {
  readonly isOk: false;
  readonly isErr: true;
  readonly error: E;
}

export type Result<T, E = Error> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { isOk: true, isErr: false, value };
}

export function err<E>(error: E): Err<E> {
  return { isOk: false, isErr: true, error };
}
