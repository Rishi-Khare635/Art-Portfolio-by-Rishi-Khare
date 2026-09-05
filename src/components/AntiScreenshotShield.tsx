import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, AlertTriangle, EyeOff } from 'lucide-react';

const STORAGE_KEY_SCREENSHOT_ATTEMPTS = 'rishikhare_anti_screenshot_attempts_v1';

interface AntiScreenshotShieldProps {
  onAttemptDetected?: (count: number) => void;
}

export const AntiScreenshotShield: React.FC<AntiScreenshotShieldProps> = ({
  onAttemptDetected
}) => {
  const [isBlurred, setIsBlurred] = useState(false);
  const [attemptCount, setAttemptCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCREENSHOT_ATTEMPTS);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Track whether a modifier key sequence is actively held to avoid spamming attempt counter
  const isHeldRef = useRef(false);

  // Sync body class for deep DOM filter blur
  useEffect(() => {
    if (isBlurred) {
      document.body.classList.add('screen-blurred-active');
    } else {
      document.body.classList.remove('screen-blurred-active');
    }
    return () => {
      document.body.classList.remove('screen-blurred-active');
    };
  }, [isBlurred]);

  useEffect(() => {
    // Helper to activate blur and record attempts
    const activateBlur = () => {
      setIsBlurred(true);
      if (!isHeldRef.current) {
        isHeldRef.current = true;
        setAttemptCount(prev => {
          const next = prev + 1;
          try {
            localStorage.setItem(STORAGE_KEY_SCREENSHOT_ATTEMPTS, next.toString());
          } catch (e) {
            console.error(e);
          }
          if (onAttemptDetected) {
            onAttemptDetected(next);
          }
          return next;
        });

        // Neutralize clipboard if a screenshot was attempted
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(
              "⚠️ PROTECTED ARTWORK • © Rishi Khare — Unauthorized screenshots and captures are prohibited."
            ).catch(() => {});
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    // Helper to deactivate blur
    const deactivateBlur = () => {
      isHeldRef.current = false;
      setIsBlurred(false);
    };

    // Keydown Listener: If Command or Ctrl (or any key while Cmd/Ctrl is held) is pressed -> BLUR
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = 
        e.key === 'Meta' || 
        e.key === 'Control' || 
        e.key === 'OS' || 
        e.code === 'MetaLeft' || 
        e.code === 'MetaRight' || 
        e.code === 'ControlLeft' || 
        e.code === 'ControlRight' || 
        e.metaKey || 
        e.ctrlKey;

      const isPrintScreen = 
        e.key === 'PrintScreen' || 
        e.code === 'PrintScreen' || 
        e.keyCode === 44;

      if (isCmdOrCtrl || isPrintScreen) {
        activateBlur();
      }
    };

    // Keyup Listener: As soon as Command or Ctrl is released -> UNBLUR
    const handleKeyUp = (e: KeyboardEvent) => {
      // Check if both Command (Meta) and Control are released
      const isStillHeld = e.metaKey || e.ctrlKey;
      if (!isStillHeld) {
        deactivateBlur();
      }
    };

    // Mouse / Pointer check to recover if the OS swallowed a keyup event (e.g. after Mac screenshot tool closes)
    const handlePointerActivity = (e: MouseEvent) => {
      if (isHeldRef.current) {
        const metaHeld = e.getModifierState ? e.getModifierState('Meta') : e.metaKey;
        const ctrlHeld = e.getModifierState ? e.getModifierState('Control') : e.ctrlKey;
        if (!metaHeld && !ctrlHeld) {
          deactivateBlur();
        }
      }
    };

    // Window Focus / Blur
    // If the window loses focus while Cmd/Ctrl is down (e.g. Mac Cmd+Shift+4 crosshairs appear),
    // keep it blurred so the captured region is blurred!
    const handleWindowFocus = () => {
      // Once the window regains focus, check if keys are still down
      deactivateBlur();
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
    window.addEventListener('keyup', handleKeyUp, { capture: true, passive: false });
    window.addEventListener('mousemove', handlePointerActivity, { passive: true });
    window.addEventListener('mousedown', handlePointerActivity, { passive: true });
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('mousemove', handlePointerActivity);
      window.removeEventListener('mousedown', handlePointerActivity);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [onAttemptDetected]);

  if (!isBlurred) return null;

  return createPortal(
    <div 
      id="anti-screenshot-blur-overlay"
      className="fixed inset-0 z-[999999999] pointer-events-none select-none flex flex-col items-center justify-center p-6 text-center animate-none"
      style={{
        backdropFilter: 'blur(50px) brightness(0.4)',
        WebkitBackdropFilter: 'blur(50px) brightness(0.4)',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
      }}
    >
      <div className="relative flex flex-col items-center gap-3.5 px-7 py-6 rounded-3xl bg-black/85 border border-red-500/40 shadow-[0_0_80px_rgba(239,68,68,0.35)] max-w-sm backdrop-blur-2xl">
        <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner">
          <EyeOff className="w-7 h-7 animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-mono font-bold">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>COMMAND / CTRL KEY ACTIVE</span>
        </div>

        <h3 className="text-lg font-black text-white font-display tracking-tight">
          Screen Blurred
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          The entire portfolio is blurred while <span className="font-bold text-white">Command</span> or <span className="font-bold text-white">Control</span> is held. Release the key to restore the screen.
        </p>

        <div className="w-full mt-1 p-2.5 rounded-xl bg-red-950/50 border border-red-500/30 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-300 text-[11px] font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Recorded attempt</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 font-mono font-bold text-xs">
            #{attemptCount}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};
