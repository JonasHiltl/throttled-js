import { describe, expect, it, vi } from "vitest";
import { Event } from "./event";

describe("Event", async () => {
  it("Should send options emit", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({})));
    const event = new Event({
      apiKey: "thd_xxx",
      eventName: "test",
      fetch: mockFetch,
    });

    await event.emit("user_xxx", {
      cost: 10,
    });
    expect(mockFetch).toBeCalledTimes(1);
    const req: Request = mockFetch.mock.calls[0][0];
    expect(req.url).toMatch(/events\/test/);
    expect(await req.json()).toStrictEqual({
      identifier: "user_xxx",
      cost: 10,
    });
  });
});
