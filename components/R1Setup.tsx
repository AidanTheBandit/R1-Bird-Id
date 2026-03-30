'use client';

import { useEffect } from 'react';
import { syncFromR1Storage } from '@/lib/birdStore';

/**
 * Mount once in the root layout to:
 *  - Call ui.setupViewport() — proper viewport meta for the 240×282px R1 display
 *  - Call deviceControls.init() — wires PTT side button + scroll wheel (spacebar fallback in dev)
 *  - Sync r1-device storage → cookies on first load
 *
 * Individual pages register their own side-button handlers via deviceControls.on('sideButton', …).
 */
export function R1Setup() {
  useEffect(() => {
    async function init() {
      try {
        const { ui, deviceControls } = await import('r1-create');

        // Apply proper viewport scaling for the 240×282px R1 display
        ui.setupViewport();

        // Init hardware controls: PTT side button + scroll wheel + spacebar dev-fallback
        deviceControls.init({
          sideButtonEnabled: true,
          scrollWheelEnabled: true,
          keyboardFallback: true,
        });
      } catch {
        // Not running in an R1/browser environment that supports r1-create — silently skip
      }

      // Sync r1 device storage → cookies (no-op on non-R1 devices, runs once via module flag)
      await syncFromR1Storage();
    }

    init();
  }, []);

  return null;
}
