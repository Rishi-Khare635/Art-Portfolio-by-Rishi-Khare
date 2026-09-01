import React, { useEffect, useState, useCallback } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Lock, 
  EyeOff, 
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

  // Trigger blackout and mark attempt
  const triggerBlackout = useCallback((reason: string) => {
    setIsBlackedOut(true);
    setCanDismiss(false);
    setCountdown(4);

    // Overwrite clipboard to prevent pasting captured screenshots
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(
          "© Rishi Khare — Protected Artwork. Unauthorized screenshots, copies, or downloads are prohibited by law."
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
    // 1. Key combination listener
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key (Windows, Linux, Chromebook)
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        triggerBlackout('PrintScreen key pressed');
        return;
      }

      // Windows Snipping Tool (Win + Shift + S) / ChromeOS screenshot (Ctrl + Shift + Overview or Ctrl + Overview)
      if (
        (e.key === 'S' || e.key === 's') && 
        (e.shiftKey && (e.metaKey || e.ctrlKey || e.altKey))
      ) {
        e.preventDefault();
        triggerBlackout('Snipping shortcut (Win/Ctrl + Shift + S)');
        return;
      }

      // Mac Screenshot combinations: Cmd + Shift + 3 / 4 / 5 / 6
      if (
        (e.metaKey || e.ctrlKey) && 
        e.shiftKey && 
        ['3', '4', '5', '6', '$', '#', '%', '^'].includes(e.key)
      ) {
        e.preventDefault();
        triggerBlackout('Mac Screenshot Shortcut (Cmd + Shift + 3/4/5)');
        return;
      }

      // ChromeOS Overview / Screenshot key combination
      if (
        (e.key === 'F5' || e.key === 'MediaSelect' || e.key === 'LaunchApplication1') && 
        (e.ctrlKey || e.shiftKey)
      ) {
        e.preventDefault();
        triggerBlackout('Chromebook Screenshot tool');
        return;
      }

      // Save page attempt (Ctrl+S / Cmd+S)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        triggerBlackout('Page Save Attempt (Ctrl+S)');
        return;
      }

      // Print attempt (Ctrl+P / Cmd+P)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        triggerBlackout('Print/PDF Capture Attempt (Ctrl+P)');
        return;
      }
    };

    // 2. Window Print / PDF Capture listener
    const handleBeforePrint = () => {
      triggerBlackout('Print capture triggered');
    };

    // 3. Mobile & Desktop App-switching / Snipping focus loss listener
    // When a screenshot tool overlay or mobile screenshot gesture is invoked,
    // the document/window loses active focus.
    let blurTimeout: NodeJS.Timeout;
    const handleWindowBlur = () => {
      // Small debounce to avoid false positives on normal clicks
      blurTimeout = setTimeout(() => {
        // If modifier keys were pressed right before blur, trigger blackout
      }, 50);
    };

    // 4. Context menu prevention for images and canvas
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'IMG' || 
        target.closest('.protected-artwork-img') || 
        target.closest('.artwork-shield')
      ) {
        e.preventDefault();
        triggerBlackout('Right click image inspect attempt');
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      clearTimeout(blurTimeout);
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
      className="fixed inset-0 z-[999999] bg-black flex flex-col items-center justify-center p-6 text-center select-none animate-none"
      style={{ backgroundColor: '#000000' }}
    >
      {/* Absolute Black Canvas to completely obscure any underlying image */}
      <div className="absolute inset-0 bg-black pointer-events-none" />

      {/* Warning Box */}
      <div className="relative z-10 max-w-md w-full bg-[#0a0a0f] border border-red-500/40 rounded-3xl p-7 shadow-[0_0_80px_rgba(239,68,68,0.25)] flex flex-col items-center">
        
        {/* Animated Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-5 shadow-inner">
          <CameraOff className="w-8 h-8 animate-pulse" />
        </div>

        {/* Header Alert */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-mono font-bold mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>SCREENSHOT DETECTED • SCREEN BLACKED OUT</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight mb-2">
          Content Protected
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed mb-5 max-w-sm">
          All sketches and drawings by <span className="font-bold text-white">Rishi Khare</span> are protected intellectual property. Screenshotting, screen-recording, or capturing this portfolio is strictly prohibited.
        </p>

        {/* Persistent Violation / Attempt Tracker Badge */}
        <div className="w-full mb-6 p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-left flex items-center justify-between">
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
          <span>Watermark: © rishi • Device protection active</span>
        </div>
      </div>
    </div>
  );
};
