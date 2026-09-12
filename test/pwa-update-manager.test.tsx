// PWA-UPDATE-1. Behavioural coverage for PwaUpdateManager against a mocked
// @serwist/window, since jsdom has no real ServiceWorker lifecycle. The
// mock reproduces exactly the event/state shape the real Serwist class
// documents (a "waiting" event carrying `sw`, and that `sw` itself firing
// native "statechange" as its `.state` changes) — not a simplified stand-in.
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

class FakeServiceWorker extends EventTarget {
  state: string;
  constructor(initialState = "installed") {
    super();
    this.state = initialState;
  }
  setState(next: string) {
    this.state = next;
    this.dispatchEvent(new Event("statechange"));
  }
}

class FakeSerwist {
  static instances: FakeSerwist[] = [];
  listeners = new Map<string, Set<(e: any) => void>>();
  registerCalls = 0;
  messageSkipWaitingCalls = 0;
  updateCalls = 0;

  constructor(public scriptURL: string, public opts: unknown) {
    FakeSerwist.instances.push(this);
  }
  addEventListener(type: string, cb: (e: any) => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(cb);
  }
  dispatch(type: string, event: unknown) {
    for (const cb of this.listeners.get(type) ?? []) cb(event);
  }
  async register() {
    this.registerCalls++;
  }
  messageSkipWaiting() {
    this.messageSkipWaitingCalls++;
  }
  async update() {
    this.updateCalls++;
  }
}

vi.mock("@serwist/window", () => ({ Serwist: FakeSerwist }));

let reloadSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  FakeSerwist.instances.length = 0;
  vi.stubEnv("NODE_ENV", "production");
  Object.defineProperty(window.navigator, "serviceWorker", {
    value: {},
    configurable: true,
  });
  reloadSpy = vi.fn();
  Object.defineProperty(window, "location", {
    value: { ...window.location, reload: reloadSpy },
    writable: true,
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function renderManager() {
  const { default: PwaUpdateManager } = await import("@/app/(public)/_components/PwaUpdateManager");
  const utils = render(<PwaUpdateManager />);
  await waitFor(() => expect(FakeSerwist.instances.length).toBe(1));
  const instance = FakeSerwist.instances[0];
  await waitFor(() => expect(instance.registerCalls).toBe(1));
  return { instance, ...utils };
}

describe("PwaUpdateManager", () => {
  it("renders nothing on first install — no waiting event, no prompt", async () => {
    await renderManager();
    expect(screen.queryByText(/update available/i)).not.toBeInTheDocument();
  });

  it("shows the update prompt once a waiting worker is detected", async () => {
    const { instance } = await renderManager();
    const sw = new FakeServiceWorker("installed");
    act(() => instance.dispatch("waiting", { sw }));

    expect(await screen.findByText(/update available/i)).toBeInTheDocument();
    expect(screen.getByText(/a newer version of ap teacher desk is ready/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update now/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /later/i })).toBeInTheDocument();
  });

  it("does not register at all outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const { default: PwaUpdateManager } = await import("@/app/(public)/_components/PwaUpdateManager");
    render(<PwaUpdateManager />);
    await new Promise((r) => setTimeout(r, 20));
    expect(FakeSerwist.instances.length).toBe(0);
  });

  it('"Later" dismisses the prompt without sending skip-waiting', async () => {
    const user = userEvent.setup();
    const { instance } = await renderManager();
    act(() => instance.dispatch("waiting", { sw: new FakeServiceWorker() }));
    await screen.findByText(/update available/i);

    await user.click(screen.getByRole("button", { name: /later/i }));

    expect(screen.queryByText(/update available/i)).not.toBeInTheDocument();
    expect(instance.messageSkipWaitingCalls).toBe(0);
    expect(reloadSpy).not.toHaveBeenCalled();
  });

  it('"Update now" sends skip-waiting, waits for "activated", then reloads exactly once', async () => {
    const user = userEvent.setup();
    const { instance } = await renderManager();
    const sw = new FakeServiceWorker("installed");
    act(() => instance.dispatch("waiting", { sw }));
    await screen.findByText(/update available/i);

    await user.click(screen.getByRole("button", { name: /update now/i }));

    expect(instance.messageSkipWaitingCalls).toBe(1);
    expect(screen.getByRole("button", { name: /updating/i })).toBeDisabled();
    expect(reloadSpy).not.toHaveBeenCalled(); // not yet — only after "activated"

    act(() => sw.setState("activating"));
    expect(reloadSpy).not.toHaveBeenCalled(); // still not enough on its own

    act(() => sw.setState("activated"));
    await waitFor(() => expect(reloadSpy).toHaveBeenCalledTimes(1));
  });

  it("does not reload on a mere state change short of activated (e.g. redundant)", async () => {
    const user = userEvent.setup();
    const { instance } = await renderManager();
    const sw = new FakeServiceWorker("installed");
    act(() => instance.dispatch("waiting", { sw }));
    await screen.findByText(/update available/i);

    await user.click(screen.getByRole("button", { name: /update now/i }));
    act(() => sw.setState("redundant"));

    await screen.findByText(/could not be applied/i);
    expect(reloadSpy).not.toHaveBeenCalled();
  });

  it("ignores a second Update now click while already updating (idempotent)", async () => {
    const user = userEvent.setup();
    const { instance } = await renderManager();
    const sw = new FakeServiceWorker("installed");
    act(() => instance.dispatch("waiting", { sw }));
    await screen.findByText(/update available/i);

    const button = screen.getByRole("button", { name: /update now/i });
    await user.click(button);
    // Button is now disabled; a second click is a no-op via the disabled
    // attribute, but also guarded in code (isUpdatingRef) independent of it.
    await user.click(button).catch(() => {});

    expect(instance.messageSkipWaitingCalls).toBe(1);

    act(() => sw.setState("activated"));
    await waitFor(() => expect(reloadSpy).toHaveBeenCalledTimes(1));
  });

  it("the status region is announced politely, not as an interrupting alert", async () => {
    const { instance } = await renderManager();
    act(() => instance.dispatch("waiting", { sw: new FakeServiceWorker() }));
    const region = await screen.findByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
  });
});
