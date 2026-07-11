/* extraGO Service Worker — Push Notification Handler
 * Handles web push notifications and offline caching basics.
 * VAPID key is configured server-side; this worker just processes incoming events.
 */

const SW_VERSION = "extrag0-sw-v1";

// ── Install & Activate ────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  self.skipWaiting(); // activate immediately
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// ── Push Events ───────────────────────────────────────────────────────────────

self.addEventListener("push", (event) => {
  let data = { title: "extraGO", body: "Nova notificação", url: "/" };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    // Non-JSON payload, use defaults
  }

  const options = {
    body: data.body,
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    data: { url: data.url ?? "/" },
    vibrate: [200, 100, 200],
    tag: data.tag ?? "extrag0-notification",
    renotify: true,
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── Notification Click ────────────────────────────────────────────────────────

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url ?? "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        // Focus existing window if open
        const existing = clients.find(
          (c) => c.url.includes(targetUrl) && "focus" in c
        );
        if (existing) return existing.focus();

        // Open a new window otherwise
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// ── Fetch (passthrough, no caching for now) ───────────────────────────────────

self.addEventListener("fetch", (event) => {
  // Let all requests pass through to the network for now.
  // Add offline caching strategy here in a future iteration.
});
