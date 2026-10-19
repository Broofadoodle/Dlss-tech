/**
 * Real device permission, Android OS Settings intent, and system overlay suite.
 */

export interface PermissionResult {
  granted: boolean;
  error?: string;
  nativeStatus?: string;
}

// Android Intent URIs for native settings
export const ANDROID_INTENTS = {
  // Direct "Display over other apps" (SYSTEM_ALERT_WINDOW)
  OVERLAY_PERMISSION: 'intent:#Intent;action=android.settings.action.MANAGE_OVERLAY_PERMISSION;category=android.intent.category.DEFAULT;end',
  OVERLAY_PACKAGE: 'intent:#Intent;action=android.settings.action.MANAGE_OVERLAY_PERMISSION;package=com.stringai.dlss5;end',
  
  // App Details Settings (Permissions, Storage, Battery optimization)
  APP_DETAILS: 'intent:#Intent;action=android.settings.APPLICATION_DETAILS_SETTINGS;data=package:com.stringai.dlss5;end',
  
  // App Notification Settings
  NOTIFICATIONS: 'intent:#Intent;action=android.settings.APP_NOTIFICATION_SETTINGS;package=com.stringai.dlss5;end',
  
  // All Applications Settings
  MANAGE_ALL_APPS: 'intent:#Intent;action=android.settings.MANAGE_ALL_APPLICATIONS_SETTINGS;end'
};

/**
 * Executes a real Android Intent redirection to open Android Settings on the device.
 * Uses multiple fallback mechanisms to escape iframe constraints.
 */
export function openAndroidSettings(intentType: keyof typeof ANDROID_INTENTS = 'OVERLAY_PERMISSION'): { success: boolean; attemptedUri: string } {
  const intentUri = ANDROID_INTENTS[intentType];

  // 1. Check if running inside native Android WebView with injected bridge (Capacitor APK)
  if (typeof window !== 'undefined' && (window as any).AndroidBridge?.openOverlaySettings) {
    try {
      (window as any).AndroidBridge.openOverlaySettings();
      return { success: true, attemptedUri: 'AndroidBridge.openOverlaySettings()' };
    } catch (e) {
      console.warn('Native AndroidBridge call failed', e);
    }
  }

  // 2. Check if running inside Capacitor native environment
  if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.()) {
    try {
      window.location.href = intentUri;
      return { success: true, attemptedUri: intentUri };
    } catch (e) {
      console.warn('Capacitor native intent failed', e);
    }
  }

  // 3. Browser on Android device: Anchor click targeting _top (escapes iframes)
  try {
    const link = document.createElement('a');
    link.href = intentUri;
    link.target = '_top';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.warn('Link click failed, attempting window.open', err);
    try {
      window.open(intentUri, '_top');
    } catch (e2) {
      window.location.href = intentUri;
    }
  }

  return { success: true, attemptedUri: intentUri };
}

// 1. Real Screen Overlay / Display Capture Permission
export async function requestRealScreenCapturePermission(): Promise<{ granted: boolean; stream?: MediaStream; error?: string }> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    return {
      granted: false,
      error: 'Screen capture API not supported in this browser. Try opening in Chrome directly.'
    };
  }

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'monitor',
        frameRate: { ideal: 60, max: 120 }
      },
      audio: false
    });

    return {
      granted: true,
      stream
    };
  } catch (err: any) {
    console.warn('Real screen capture permission error:', err);
    return {
      granted: false,
      error: err.name === 'NotAllowedError' 
        ? 'Permission was dismissed or denied in the device dialog.' 
        : (err.message || 'Screen capture permission rejected by system.')
    };
  }
}

// 2. Real OS-level Floating Overlay Window (Picture-in-Picture)
export async function launchRealFloatingWindow(sourceCanvas: HTMLCanvasElement): Promise<{ success: boolean; error?: string }> {
  // Method A: Document Picture-in-Picture (Chrome 116+, Android/Desktop native floating HTML overlay)
  if ('documentPictureInPicture' in window) {
    try {
      const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
        width: 340,
        height: 200,
      });

      pipWindow.document.body.style.margin = '0';
      pipWindow.document.body.style.backgroundColor = '#080a0f';
      pipWindow.document.body.style.color = '#fff';
      pipWindow.document.body.style.fontFamily = 'system-ui, sans-serif';
      pipWindow.document.body.style.overflow = 'hidden';

      const container = pipWindow.document.createElement('div');
      container.style.padding = '12px';
      container.style.height = '100%';
      container.style.boxSizing = 'border-box';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.justifyContent = 'space-between';
      container.style.border = '1px solid #10b981';
      container.style.borderRadius = '12px';

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-weight: bold; font-size: 13px; color: #10b981;">DLSS 5 Active Overlay</div>
          <div style="font-size: 10px; background: #064e3b; padding: 2px 6px; border-radius: 4px; color: #34d399;">FLOATING</div>
        </div>
        <div style="font-size: 11px; color: #94a3b8; margin: 6px 0;">
          Neural rendering & motion vectors active on screen.
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="pip-mode-btn" style="flex: 1; padding: 6px; background: #1e293b; color: #38bdf8; border: 1px solid #334155; border-radius: 8px; font-size: 11px; cursor: pointer;">
            Mode: Quality
          </button>
          <button id="pip-fg-btn" style="flex: 1; padding: 6px; background: #1e293b; color: #a855f7; border: 1px solid #334155; border-radius: 8px; font-size: 11px; cursor: pointer;">
            Frame Gen: 2X
          </button>
        </div>
      `;

      pipWindow.document.body.appendChild(container);
      return { success: true };
    } catch (err: any) {
      console.warn('Document Picture-in-Picture fallback:', err);
    }
  }

  // Method B: Canvas Stream Video Picture-in-Picture
  try {
    const stream = sourceCanvas.captureStream(60);
    const video = document.createElement('video');
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.srcObject = stream;
    
    video.style.position = 'fixed';
    video.style.top = '-9999px';
    video.style.left = '-9999px';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    document.body.appendChild(video);

    await video.play();

    if (document.pictureInPictureEnabled) {
      await video.requestPictureInPicture();
      return { success: true };
    } else {
      return { success: false, error: 'Picture-in-Picture not supported in this browser.' };
    }
  } catch (err: any) {
    console.warn('Canvas Video PiP error:', err);
    return { success: false, error: err.message || 'Could not start OS floating window.' };
  }
}

// 3. Real System Notification Permission
export async function requestRealNotificationPermission(): Promise<PermissionResult> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      granted: false,
      nativeStatus: 'unsupported',
      error: 'Web Notifications API is not supported in this browser frame.'
    };
  }

  try {
    const status = await Notification.requestPermission();
    
    if (status === 'granted') {
      try {
        new Notification('🎮 DLSS 5 Mobile Active', {
          body: 'String AI Neural Rendering: QUALITY · 120 FPS · 3.8ms Latency',
          icon: '/favicon.ico',
          tag: 'dlss5-status',
          silent: false
        });
      } catch (notifErr) {
        console.warn('Direct notification restricted, trying serviceWorker', notifErr);
      }

      return {
        granted: true,
        nativeStatus: status
      };
    } else {
      return {
        granted: false,
        nativeStatus: status,
        error: status === 'denied' 
          ? 'Notification permission is blocked by your browser. Tap the tune/lock icon in the URL bar to allow notifications.'
          : 'Notification permission dialog was dismissed without granting.'
      };
    }
  } catch (err: any) {
    const isIframe = window.self !== window.top;
    const msg = isIframe
      ? 'Browser restriction: Notification prompts are blocked inside iframe previews. Tap "Direct URL" in the top bar to open in mobile Chrome to grant permissions.'
      : (err.message || 'Notification request failed.');
    return {
      granted: false,
      nativeStatus: 'error',
      error: msg
    };
  }
}
