/**
 * usePushNotifications — registers the SW, subscribes, and sends the
 * subscription to the API so the server can deliver pushes.
 *
 * Usage:
 *   const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications();
 *
 * Server must expose:
 *   GET  /api/push/vapid-key  → { publicKey: string }
 *   POST /api/push/subscribe  → { subscription: PushSubscription }
 *   POST /api/push/unsubscribe
 */

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api-fetch";

export interface PushState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications(): PushState {
  const [isSupported] = useState(
    () =>
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register service worker once on mount
  useEffect(() => {
    if (!isSupported) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then(async (reg) => {
        const existing = await reg.pushManager.getSubscription();
        setIsSubscribed(!!existing);
      })
      .catch((e) => {
        console.warn("[push] SW registration failed:", e);
      });
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported) { setError("Push notifications not supported"); return; }
    setIsLoading(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Permissão negada para notificações push.");
        return;
      }

      const reg = await navigator.serviceWorker.ready;

      // Fetch VAPID public key from backend
      let vapidKey = "";
      try {
        const { publicKey } = await apiFetch("/api/push/vapid-key");
        vapidKey = publicKey;
      } catch {
        setError("Servidor não configurado para push. Tente mais tarde.");
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      await apiFetch("/api/push/subscribe", {
        method: "POST",
        body: JSON.stringify(subscription.toJSON()),
      });

      setIsSubscribed(true);
    } catch (e: any) {
      setError(e?.message ?? "Falha ao ativar notificações push.");
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
        await apiFetch("/api/push/unsubscribe", {
          method: "POST",
          body: JSON.stringify(existing.toJSON()),
        }).catch(() => {});
      }
      setIsSubscribed(false);
    } catch (e: any) {
      setError(e?.message ?? "Falha ao desativar notificações push.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isSupported, isSubscribed, isLoading, error, subscribe, unsubscribe };
}
