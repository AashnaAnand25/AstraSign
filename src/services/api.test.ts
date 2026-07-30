import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchSpeechUrl, toAslGloss } from "./api";

/**
 * The case that matters: a static host (Aedify, Netlify, GitHub Pages) answers
 * unknown paths with index.html and a 200, so `response.ok` alone reports
 * success for a backend that isn't there. Without the content-type guard the
 * HTML body is handed to blob()/json() and the caller's fallback never fires.
 */
function stubFetch(init: {
  ok?: boolean;
  status?: number;
  contentType?: string | null;
  body?: string;
}) {
  const response = {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: "",
    headers: { get: (name: string) => (name.toLowerCase() === "content-type" ? init.contentType ?? null : null) },
    blob: async () => new Blob([init.body ?? ""]),
    json: async () => JSON.parse(init.body ?? "{}"),
  };
  vi.stubGlobal("fetch", vi.fn(async () => response as unknown as Response));
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("fetchSpeechUrl", () => {
  it("returns null when a static host answers /api/speak with HTML", async () => {
    stubFetch({ contentType: "text/html; charset=utf-8", body: "<!doctype html>" });
    expect(await fetchSpeechUrl("hello")).toBeNull();
  });

  it("returns an object URL for a real audio response", async () => {
    stubFetch({ contentType: "audio/mpeg", body: "ID3" });
    const url = await fetchSpeechUrl("hello");
    expect(url).toMatch(/^blob:/);
    if (url) URL.revokeObjectURL(url);
  });

  it("returns null on a backend error", async () => {
    stubFetch({ ok: false, status: 500, contentType: "application/json" });
    expect(await fetchSpeechUrl("hello")).toBeNull();
  });

  it("returns null on a network failure without throwing", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
    expect(await fetchSpeechUrl("hello")).toBeNull();
  });

  it("does not call the network for empty text", async () => {
    const spy = vi.fn();
    vi.stubGlobal("fetch", spy);
    expect(await fetchSpeechUrl("   ")).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("toAslGloss", () => {
  it("falls back to local rules when the host answers with HTML", async () => {
    stubFetch({ contentType: "text/html", body: "<!doctype html>" });
    expect(await toAslGloss("I am going to class")).toEqual(["ME", "GO", "CLASS"]);
  });

  it("uses the backend gloss when a real JSON response comes back", async () => {
    stubFetch({ contentType: "application/json", body: '{"asl_ordered":["ME","GO","SCHOOL"]}' });
    expect(await toAslGloss("I am going to school")).toEqual(["ME", "GO", "SCHOOL"]);
  });

  it("falls back locally when the backend returns an empty gloss", async () => {
    stubFetch({ contentType: "application/json", body: '{"asl_ordered":[]}' });
    expect(await toAslGloss("thank you")).toEqual(["THANK", "YOU"]);
  });

  it("returns an empty list for blank input", async () => {
    const spy = vi.fn();
    vi.stubGlobal("fetch", spy);
    expect(await toAslGloss("  ")).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });
});
