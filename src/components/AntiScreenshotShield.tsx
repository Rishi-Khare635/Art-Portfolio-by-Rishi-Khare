import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Lock, 
  CameraOff, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

const STORAGE_KEY_SCREENSHOT_ATTEMPTS = 'rishikhare_anti_screenshot_attempts_v1';
const STORAGE_KEY_LAST_ATTEMPT = 'rishikhare_last_screenshot_timestamp';

interface AntiScreenshotShieldProps {
  onAttemptDetected?: (count: number) => void;
}

export const AntiScreenshotShield: React.FC<AntiScreenshotShieldProps> = ({
  onAttemptDetected
}) => {
  const [isBlackedOut, setIsBlackedOut] = useState(false);
  const [attemptCount, setAttemptCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCREENSHOT_ATTEMPTS);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [countdown, setCountdown] = useState<number>(4);
  const [canDismiss, setCanDismiss] = useState<boolean>(false);
  const isAltDown = useRef(false);
  const isCtrlDown = useRef(false);
  const isMetaDown = useRef(false);
  const isShiftDown = useRef(false);

  // Trigger blackout and mark attempt
  const triggerBlackout = useCallback((reason: string) => {
    setIsBlackedOut(true);
    setCanDismiss(false);
    setCountdown(4);

    // Overwrite clipboard immediately to neutralize captured screenshots
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(
          "⚠️ PROTECTED ARTWORK • © Rishi Khare — Unauthorized screenshots, copies, or downloads are prohibited by law."
        ).catch(() => {});
      }
    } catch (e) {
      console.error(e);
    }

    setAttemptCount(prev => {
      const next = prev + 1;
      try {
        localStorage.setItem(STORAGE_KEY_SCREENSHOT_ATTEMPTS, next.toString());
        localStorage.setItem(STORAGE_KEY_LAST_ATTEMPT, Date.now().toString());
      } catch (err) {
        console.error(err);
      }
      if (onAttemptDetected) {
        onAttemptDetected(next);
      }
      return next;
    });
  }, [onAttemptDetected]);

  // Countdown timer when blackout is active
  useEffect(() => {
    if (!isBlackedOut) return;

    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else {
      setCanDismiss(true);
    }

    return () => clearTimeout(timer);
  }, [isBlackedOut, countdown]);

  // Detect Screenshot Actions across Laptops, Desktops, Chromebooks, and Phones
  useEffect(() => {
    // 1. Key tracking (keydown & keyup)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') isAltDown.current = true;
      if (e.key === 'Control') isCtrlDown.current = true;
      if (e.key === 'Meta' || e.key === 'OS' || e.key === 'Super') isMetaDown.current = true;
      if (e.key === 'Shift') isShiftDown.current = true;

      // PrintScreen key (Windows, Linux, Chromebook keyboards)
      if (
        e.key === 'PrintScreen' || 
        e.code === 'PrintScreen' || 
        e.keyCode === 44 || 
        e.which === 44
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackout('PrintScreen key pressed');
        return;
      }

      // Windows Snipping Tool (Win + Shift + S) or Ctrl + Shift + S
      if (
        (e.key === 'S' || e.key === 's' || e.code === 'KeyS' || e.keyCode === 83) && 
        (e.shiftKey && (e.metaKey || e.ctrlKey || isMetaDown.current || isCtrlDown.current))
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackout('Snipping shortcut (Win/Ctrl + Shift + S)');
        return;
      }

      // Mac Screenshot combinations: Cmd + Shift + 3 / 4 / 5 / 6 / $ / # / % / ^
      if (
        (e.metaKey || e.ctrlKey || isMetaDown.current) && 
        (e.shiftKey || isShiftDown.current) && 
        ['3', '4', '5', '6', '$', '#', '%', '^', 'Digit3', 'Digit4', 'Digit5', 'Digit6'].includes(e.key || e.code)
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackout('Mac Screenshot Shortcut (Cmd + Shift + 3/4/5)');
        return;
      }

      // ChromeOS Overview / Screenshot key combination (Ctrl + F5 / Window Switcher or Ctrl + Shift + F5)
      if (
        (e.key === 'F5' || e.code === 'F5' || e.key === 'MediaSelect' || e.key === 'LaunchApplication1') && 
        (e.ctrlKey || e.shiftKey || isCtrlDown.current || isShiftDown.current)
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackout('Chromebook Screenshot tool (Ctrl + Switcher)');
        return;
      }

      // Save page attempt (Ctrl+S / Cmd+S)
      if ((e.ctrlKey || e.metaKey || isCtrlDown.current || isMetaDown.current) && (e.key === 's' || e.key === 'S' || e.code === 'KeyS')) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackout('Page Save Attempt (Ctrl+S)');
        return;
      }

      // Print attempt (Ctrl+P / Cmd+P)
      if ((e.ctrlKey || e.metaKey || isCtrlDown.current || isMetaDown.current) && (e.key === 'p' || e.key === 'P' || e.code === 'KeyP')) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackout('Print/PDF Capture Attempt (Ctrl+P)');
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Catch PrintScreen on keyup as many OSes only dispatch on keyup
      if (
        e.key === 'PrintScreen' || 
        e.code === 'PrintScreen' || 
        e.keyCode === 44 || 
        e.which === 44
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackout('PrintScreen keyup');
      }

      if (e.key === 'Alt') isAltDown.current = false;
      if (e.key === 'Control') isCtrlDown.current = false;
      if (e.key === 'Meta' || e.key === 'OS' || e.key === 'Super') isMetaDown.current = false;
      if (e.key === 'Shift') isShiftDown.current = false;
    };

    // 2. Window Print / PDF Capture listener
    const handleBeforePrint = (e: Event) => {
      e.preventDefault();
      triggerBlackout('Print capture triggered');
    };

    // 3. Focus & Visibility Loss detection:
    // On Phones (Power + VolDown gesture), Windows Snipping overlay, macOS screenshot area selection,
    // Chromebook screenshot overlay, or screen recording overlays, the browser window loses focus / triggers blur or visibilitychange
    // while modifier keys or screenshot actions are invoked.
    const handleVisibilityOrBlur = () => {
      if (document.visibilityState === 'hidden') {
        // If hidden or switched during a modifier or gesture
        if (isMetaDown.current || isCtrlDown.current || isShiftDown.current || isAltDown.current) {
          triggerBlackout('Overlay screen capture triggered');
        }
      }
    };

    // 4. Context menu prevention for images and dashboard canvas
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'IMG' || 
        target.closest('.protected-artwork-img') || 
        target.closest('.artwork-shield') ||
        target.closest('#artwork-modal-container')
      ) {
        e.preventDefault();
        triggerBlackout('Image save context menu triggered');
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
    window.addEventListener('keyup', handleKeyUp, { capture: true, passive: false });
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('blur', handleVisibilityOrBlur);
    document.addEventListener('visibilitychange', handleVisibilityOrBlur);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('blur', handleVisibilityOrBlur);
      document.removeEventListener('visibilitychange', handleVisibilityOrBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [triggerBlackout]);

  const handleDismiss = () => {
    if (!canDismiss) return;
    setIsBlackedOut(false);
  };

  if (!isBlackedOut) return null;

  return (
    <div 
      id="anti-screenshot-blackout-shield"
      className="fixed inset-0 z-[999999] bg-black flex flex-col items-center justify-center p-6 text-center select-none"
      style={{ backgroundColor: '#000000', opacity: 1 }}
    >
      {/* Absolute Solid Black Backdrop covering the entire viewport */}
      <div className="absolute inset-0 bg-black pointer-events-none" style={{ backgroundColor: '#000000' }} />

      {/* Warning Box */}
      <div className="relative z-10 max-w-md w-full bg-[#0a0a0f] border border-red-500/40 rounded-3xl p-7 shadow-[0_0_90px_rgba(239,68,68,0.35)] flex flex-col items-center">
        
        {/* Animated Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mb-5 shadow-inner">
          <CameraOff className="w-8 h-8 animate-pulse" />
        </div>

        {/* Header Alert */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-mono font-bold mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>SCREENSHOT DETECTED • BLACKOUT ACTIVE</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight mb-2">
          Artwork Protected
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed mb-5 max-w-sm">
          All sketches, drawings, and artwork by <span className="font-bold text-white">Rishi Khare</span> are protected intellectual property. Screenshotting, saving, or recording this portfolio is strictly prohibited.
        </p>

        {/* Persistent Violation / Attempt Tracker Badge */}
        <div className="w-full mb-6 p-3.5 rounded-2xl bg-red-950/50 border border-red-500/30 text-left flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-white">
                Attempt Flag Count
              </div>
              <div className="text-[10px] text-slate-400">
                {attemptCount === 1 
                  ? 'First attempt recorded for this session' 
                  : `Marked: ${attemptCount} repeated screenshot attempts`}
              </div>
            </div>
          </div>
          <div className="px-3 py-1 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-mono font-black text-sm">
            #{attemptCount}
          </div>
        </div>

        {/* Action Button with Cooldown */}
        <button
          id="anti-screenshot-dismiss-btn"
          onClick={handleDismiss}
          disabled={!canDismiss}
          className={`w-full py-3 px-5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            canDismiss
              ? 'bg-white hover:bg-slate-100 text-slate-900 shadow-xl active:scale-[0.98] cursor-pointer'
              : 'bg-white/10 text-slate-400 border border-white/10 cursor-not-allowed'
          }`}
        >
          {canDismiss ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>I Understand • Return to Portfolio</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 animate-spin text-red-400" />
              <span>Blackout locked ({countdown}s)</span>
            </>
          )}
        </button>

        <div className="mt-4 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>Watermark: © rishi • Full portfolio protected</span>
        </div>
      </div>
    </div>
  );
};
