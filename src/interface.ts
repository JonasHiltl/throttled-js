import type { operations } from "./schema";

export type EmitOptions = {
  /**
   * How expensive the request is.
   * @default 1
   */
  cost?: number;
};

export type EmitResponse =
  operations["emit-event"]["responses"]["200"]["content"]["application/json"];

export interface EventEmitter {
  emit(identifier: string, opts: EmitOptions): Promise<EmitResponse>;
}
