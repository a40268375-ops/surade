import { useState, useEffect } from "react";

/**
 * LoadingManager
 *
 * Pengelola status loading global anti-stuck & anti-lag.
 * Dilengkapi dengan safety auto-timeout (maksimal 2.5 detik)
 * sehingga dipastikan tidak akan pernah muter terus-menerus atau nyangkut.
 */
class LoadingManager {
  constructor() {
    this.activeSources = new Set();
    this.listeners = new Set();
    this.stopTimeout = null;
    this.safetyTimer = null;
    this.isLoading = false;
  }

  start(sourceId = "default") {
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = null;
    }

    this.activeSources.add(sourceId);

    if (!this.isLoading) {
      this.isLoading = true;
      this.notify();
    }

    // Safety Auto-Timeout: Maksimal 2.5 detik
    // Jika ada request API lambat / nyangkut di background, paksa stop agar tab tidak muter terus
    if (this.safetyTimer) clearTimeout(this.safetyTimer);
    this.safetyTimer = setTimeout(() => {
      if (this.isLoading) {
        this.forceStopAll();
      }
    }, 2500);
  }

  stop(sourceId = "default", delay = 100) {
    this.activeSources.delete(sourceId);

    if (this.activeSources.size === 0) {
      if (this.stopTimeout) clearTimeout(this.stopTimeout);
      this.stopTimeout = setTimeout(() => {
        if (this.activeSources.size === 0 && this.isLoading) {
          this.isLoading = false;
          if (this.safetyTimer) {
            clearTimeout(this.safetyTimer);
            this.safetyTimer = null;
          }
          this.notify();
        }
      }, delay);
    }
  }

  forceStopAll() {
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = null;
    }
    if (this.safetyTimer) {
      clearTimeout(this.safetyTimer);
      this.safetyTimer = null;
    }
    this.activeSources.clear();
    if (this.isLoading) {
      this.isLoading = false;
      this.notify();
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.isLoading);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.listeners.forEach((fn) => {
      try {
        fn(this.isLoading);
      } catch (e) {
        // Safe catch
      }
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("surade:loading-change", {
          detail: { isLoading: this.isLoading },
        })
      );
    }
  }
}

export const loadingManager = new LoadingManager();

if (typeof window !== "undefined") {
  window.__SURADE_LOADING_MANAGER__ = loadingManager;
}

export function useGlobalLoading() {
  const [isLoading, setIsLoading] = useState(loadingManager.isLoading);

  useEffect(() => {
    return loadingManager.subscribe(setIsLoading);
  }, []);

  return isLoading;
}

export default loadingManager;
