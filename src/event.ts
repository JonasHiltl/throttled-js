import createClient from "openapi-fetch";
import type { operations, paths } from "./schema";
import type { EmitOptions, EmitResponse, EventEmitter } from "./interface";

type Client = ReturnType<typeof createClient<paths>>;

type RateLimitConfig = NonNullable<
  operations["emit-event"]["requestBody"]
>["content"]["application/json"]["rate"];

type QuotaLimitConfig = NonNullable<
  operations["emit-event"]["requestBody"]
>["content"]["application/json"]["quota"];

export type EventOptions = {
  apiKey: string;
  eventName: string;
  rateLimit?: RateLimitConfig;
  quotaLimit?: QuotaLimitConfig;
  /**
   * @default https://api.throttled.dev
   */
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
};

export const BASE_URL = "https://api.throttled.dev";

export class Event implements EventEmitter {
  private readonly opts: EventOptions;
  private readonly client: Client;

  constructor(opts: EventOptions) {
    this.opts = opts;
    this.client = createClient({
      baseUrl: opts.baseUrl ?? BASE_URL,
      headers: this.getHeaders(),
      ...(opts.fetch && { fetch: opts.fetch }),
    });
  }

  /**
   * Emits and checks the rate & quota limit of the identifier for this event.
   * First the rate limit is checked and only if the rate limit is passed the quota limit is checked.
   * @param identifier Identifier of your user who emitted the event, e.g their userId, email, ip or anything else.
   * @param opts
   */
  public async emit(
    identifier: string,
    opts: EmitOptions,
  ): Promise<EmitResponse> {
    const { data, error } = await this.client.POST("/events/{name}", {
      params: {
        path: {
          name: this.opts.eventName,
        },
      },
      body: {
        identifier,
        cost: opts.cost,
        rate: this.opts.rateLimit,
        quota: this.opts.quotaLimit,
      },
    });
    if (error) {
      throw new Error(`${error.status}: ${error.message}`);
    }
    return data;
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.opts.apiKey}`,
    };
  }
}
