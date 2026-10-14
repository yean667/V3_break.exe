/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { BreakReason, BreakRecord, ActiveBreak, TodayStats, CharacterConfig, Theme } from './types';
import { REASON_CONFIGS, getBlobSpeech, COMPLETION_CELEBRATIONS } from './utils/quotes';
import {
  loadHistory,
  saveHistory,
  loadActiveBreak,
  saveActiveBreak,
  calculateTodayStats,
  getTodayKey,
} from './utils/storage';
import { loadSavedCharacter, saveCharacter } from './utils/characters';
import { sound } from './utils/audio';
import { alarmEngine } from './utils/alarmEngine';
import { DancingBlob } from './components/DancingBlob';
import {
  BlobAvatar,
  PeekingBlob,
  BooksStackDoodle,
  CurvedArrowLeft,
  CurvedArrowRight,
  RadiatingTicks,
} from './components/DoodleIcons';
import { ReasonIcon } from './components/ReasonIcons';
import { TodayDamage } from './components/TodayDamage';
import { BreakHistory } from './components/BreakHistory';
import { CharacterCustomizerModal } from './components/CharacterCustomizerModal';
import { CustomCursor } from './components/CustomCursor';
import { Footer } from './components/Footer';

const TARGET_PRESETS = [
  { mins: 0, label: 'Free Vibe' },
  { mins: 5, label: '5m Quick' },
  { mins: 10, label: '10m Coffee' },
  { mins: 13, label: '13m Target 🌸' },
  { mins: 15, label: '15m Stretch' },
  { mins: 25, label: '25m Long' },
];

export default function App() {
  // Theme state: night mode ('dark') by default for all new users, persisted in localStorage
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('break_exe_theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
      return 'dark'; // Night mode is default for all new users
    } catch {
      return 'dark';
    }
  });

  // Sync theme with html/body classes and localStorage
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
      try {
        localStorage.setItem('break_exe_theme', theme);
      } catch {
        // ignore
      }
    }
  }, [theme]);

  const handleToggleTheme = (specificTheme?: Theme) => {
    sound.playPop();
    setTheme((prev) => (specificTheme ? specificTheme : prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';

  // Break state
  const [activeBreak, setActiveBreak] = useState<ActiveBreak | null>(() => loadActiveBreak());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [overdueSeconds, setOverdueSeconds] = useState<number>(0);
  const [isOverdue, setIsOverdue] = useState<boolean>(false);

  const [selectedReason, setSelectedReason] = useState<BreakReason>('phone');
  const [targetMinutes, setTargetMinutes] = useState<number>(() => {
    const loaded = loadActiveBreak();
    return loaded ? loaded.targetMinutes : 13;
  });
  const [explanationNote, setExplanationNote] = useState<string>('');

  // Bold synthesized break alarm state
  const [isAlarmRinging, setIsAlarmRinging] = useState<boolean>(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);
  const [welcomeBackToast, setWelcomeBackToast] = useState<string | null>(null);

  // Character companion state
  const [characterConfig, setCharacterConfig] = useState<CharacterConfig>(() => loadSavedCharacter());
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);

  // History and stats
  const [history, setHistory] = useState<BreakRecord[]>(() => loadHistory());
  const [stats, setStats] = useState<TodayStats>(() => calculateTodayStats(loadHistory()));

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sound.enabled);
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);
  const [endingSoonNotice, setEndingSoonNotice] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Sync sound controller
  useEffect(() => {
    sound.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Recalculate stats whenever history changes
  useEffect(() => {
    setStats(calculateTodayStats(history));
    saveHistory(history);
  }, [history]);

  // Subscribe to alarm engine status changes
  useEffect(() => {
    const unsubscribe = alarmEngine.subscribe(({ isActive, isBlockedByAutoplay }) => {
      setIsAlarmRinging(isActive);
      setAutoplayBlocked(isBlockedByAutoplay);
    });
    return unsubscribe;
  }, []);

  // Dismiss alarm handler: stops alarm immediately on first click/tap anywhere
  const handleDismissAlarm = useCallback(() => {
    alarmEngine.stop();
    setIsAlarmRinging(false);
    setAutoplayBlocked(false);

    // Persist that the alarm was dismissed for this session
    if (activeBreak) {
      const updated: ActiveBreak = {
        ...activeBreak,
        alarmDismissed: true,
      };
      setActiveBreak(updated);
      saveActiveBreak(updated);
    }

    // Show welcoming return message
    setWelcomeBackToast('finally, welcome back bestie 🌸');
    setTimeout(() => {
      setWelcomeBackToast(null);
    }, 5500);
  }, [activeBreak]);

  // Page-wide click/tap handler that immediately silences the alarm
  useEffect(() => {
    if (!isAlarmRinging) return;

    const onGlobalPointerDown = () => {
      handleDismissAlarm();
    };

    const onGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        handleDismissAlarm();
      }
    };

    window.addEventListener('click', onGlobalPointerDown, { capture: true });
    window.addEventListener('touchstart', onGlobalPointerDown, { capture: true });
    window.addEventListener('keydown', onGlobalKeyDown, { capture: true });

    return () => {
      window.removeEventListener('click', onGlobalPointerDown, { capture: true });
      window.removeEventListener('touchstart', onGlobalPointerDown, { capture: true });
      window.removeEventListener('keydown', onGlobalKeyDown, { capture: true });
    };
  }, [isAlarmRinging, handleDismissAlarm]);

  // Check on initial mount if refreshed break was already overdue
  useEffect(() => {
    const loaded = loadActiveBreak();
    if (loaded && loaded.targetMinutes > 0) {
      const targetEnd =
        loaded.targetEndTime || loaded.startTime + loaded.targetMinutes * 60 * 1000;
      const now = Date.now();
      if (now >= targetEnd && !loaded.alarmDismissed) {
        alarmEngine.start();
        setIsAlarmRinging(true);
      }
    }
  }, []);

  // Active break timer tick loop
  useEffect(() => {
    if (activeBreak) {
      const updateTimer = () => {
        const now = Date.now();
        const totalElapsed = Math.max(0, Math.floor((now - activeBreak.startTime) / 1000));
        setElapsedSeconds(totalElapsed);

        if (activeBreak.targetMinutes > 0) {
          const targetEnd =
            activeBreak.targetEndTime ||
            activeBreak.startTime + activeBreak.targetMinutes * 60 * 1000;
          const diffToTarget = Math.floor((targetEnd - now) / 1000);

          if (diffToTarget > 0) {
            setRemainingSeconds(diffToTarget);
            setIsOverdue(false);
            setOverdueSeconds(0);

            // Subtle reminder 30s before target end
            if (diffToTarget <= 30 && !activeBreak.notifiedAboutToEnd) {
              sound.playEndingSoonReminder();
              setEndingSoonNotice('break is wrapping up in ~30s... get ready ☕');

              const updatedActive = { ...activeBreak, notifiedAboutToEnd: true };
              setActiveBreak(updatedActive);
              saveActiveBreak(updatedActive);

              setTimeout(() => {
                setEndingSoonNotice(null);
              }, 5000);
            }
          } else {
            // Reached zero or overdue
            setRemainingSeconds(0);
            setIsOverdue(true);
            setOverdueSeconds(Math.abs(diffToTarget));

            // Play strong, punchy alarm sound repeatedly until dismissed
            if (!activeBreak.alarmDismissed && !alarmEngine.getStatus().isActive) {
              alarmEngine.start();
              setIsAlarmRinging(true);
            }
          }
        } else {
          setRemainingSeconds(0);
          setIsOverdue(false);
          setOverdueSeconds(0);
        }
      };

      updateTimer();
      intervalRef.current = window.setInterval(updateTimer, 1000);
      setSelectedReason(activeBreak.reason);
      setExplanationNote(activeBreak.note || '');
      setTargetMinutes(activeBreak.targetMinutes || 0);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setElapsedSeconds(0);
      setRemainingSeconds(0);
      setOverdueSeconds(0);
      setIsOverdue(false);
      setEndingSoonNotice(null);
      if (alarmEngine.getStatus().isActive) {
        alarmEngine.stop();
        setIsAlarmRinging(false);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeBreak]);

  // Format digital timer string MM:SS or HH:MM:SS
  const formatTimerDigits = (totalSec: number): string => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    const pad = (n: number) => String(n).padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  // Start Break action
  const handleStartBreak = () => {
    alarmEngine.primeUserGesture();
    sound.initCtx();
    sound.playStartChime();

    const now = Date.now();
    const targetEndTime =
      targetMinutes > 0 ? now + targetMinutes * 60 * 1000 : undefined;

    const newActive: ActiveBreak = {
      startTime: now,
      targetEndTime: targetEndTime,
      targetMinutes: targetMinutes,
      reason: selectedReason,
      note: explanationNote.trim(),
      notifiedAboutToEnd: false,
      alarmDismissed: false,
    };

    setActiveBreak(newActive);
    saveActiveBreak(newActive);
  };

  // End Break action
  const handleEndBreak = () => {
    if (!activeBreak) return;

    if (alarmEngine.getStatus().isActive) {
      alarmEngine.stop();
      setIsAlarmRinging(false);
    }

    sound.playEndChime();
    const now = Date.now();
    const duration = Math.max(1, Math.floor((now - activeBreak.startTime) / 1000));

    const defaultNote =
      REASON_CONFIGS.find((r) => r.id === activeBreak.reason)?.humorFallback ||
      'well deserved break';

    const finalNote = activeBreak.note || explanationNote.trim() || defaultNote;

    const newRecord: BreakRecord = {
      id: 'break-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      startTime: activeBreak.startTime,
      endTime: now,
      durationSeconds: duration,
      reason: activeBreak.reason,
      note: finalNote,
      dateKey: getTodayKey(),
    };

    const updatedHistory = [newRecord, ...history];
    setHistory(updatedHistory);
    setActiveBreak(null);
    saveActiveBreak(null);
    setExplanationNote('');
    setEndingSoonNotice(null);
    setIsOverdue(false);

    try {
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.65 },
        colors: isDark
          ? ['#E9A9C4', '#A9CFF5', '#FEF08A', '#F8F0F5', '#BBF7D0']
          : ['#FFA8BA', '#BCE0FD', '#FEF08A', '#F5E4F8', '#BBF7D0'],
      });
    } catch {
      // ignore
    }

    const randomMsg =
      COMPLETION_CELEBRATIONS[
        Math.floor(Math.random() * COMPLETION_CELEBRATIONS.length)
      ];
    setCelebrationToast(randomMsg);
    setTimeout(() => {
      setCelebrationToast(null);
    }, 4500);
  };

  const handleDeleteRecord = (id: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAll = () => {
    setHistory([]);
  };

  const handleSaveCharacter = (newConfig: CharacterConfig) => {
    setCharacterConfig(newConfig);
    saveCharacter(newConfig);
  };

  const blobInfo = activeBreak
    ? getBlobSpeech(elapsedSeconds, activeBreak.reason, isOverdue)
    : {
        main: 'vibing... (temporarily)',
        subtitle: 'your books can wait (again)',
        expression: 'dancing' as const,
      };

  const getDisplayDigits = (): string => {
    if (activeBreak) {
      if (activeBreak.targetMinutes > 0) {
        return formatTimerDigits(remainingSeconds);
      }
      return formatTimerDigits(elapsedSeconds);
    }
    if (targetMinutes > 0) {
      return formatTimerDigits(targetMinutes * 60);
    }
    return '00:00';
  };

  return (
    <div
      className={`min-h-screen p-3 sm:p-5 md:p-8 flex flex-col items-center justify-center relative transition-colors duration-200 ${
        isDark
          ? 'bg-[#201E2A] text-[#F8F0F5] selection:bg-[#E9A9C4] selection:text-[#201E2A]'
          : 'bg-[#FBF8F4] text-[#4A3E3D] selection:bg-[#FFE5EC] selection:text-[#E8556D]'
      }`}
    >
      {/* Daisy Cursor with Dark Mode Support */}
      <CustomCursor theme={theme} />

      {/* Break Expiry Alert: Strong, punchy & funny visual notification */}
      {isAlarmRinging && (
        <div
          onClick={handleDismissAlarm}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-lg p-4 rounded-3xl shadow-2xl flex items-center gap-3.5 animate-bounce cursor-pointer select-none border-2 transition-colors ${
            isDark
              ? 'bg-[#38293C] border-[#E9A9C4] text-[#F8F0F5]'
              : 'bg-[#FFF0F4] border-[#FFA8BA] text-[#3A2C29]'
          }`}
          role="alert"
          aria-live="assertive"
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-xs border ${
              isDark
                ? 'bg-[#4A334E] border-[#664368]'
                : 'bg-[#FFE4E9] border-[#FFCCD5]'
            }`}
          >
            🔔
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`font-display font-black text-xs sm:text-sm tracking-tight truncate ${
                  isDark ? 'text-[#E9A9C4]' : 'text-[#E8556D]'
                }`}
              >
                BESTIE, BREAK OVER. BACK TO BUSINESS 💀
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                  isDark
                    ? 'bg-[#502E44] text-[#E9A9C4]'
                    : 'bg-[#FFD6DF] text-[#D83B55]'
                }`}
              >
                Time&apos;s Up!
              </span>
            </div>
            <p
              className={`font-doodle text-xs sm:text-sm leading-tight mt-0.5 ${
                isDark ? 'text-[#F8F0F5]' : 'text-[#7D6B66]'
              }`}
            >
              {autoplayBlocked
                ? 'Tap anywhere on screen to enable alarm sound 🌸'
                : 'Click or tap anywhere on the screen to silence the alarm ✨'}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDismissAlarm();
            }}
            className={`px-3.5 py-1.5 rounded-xl font-display font-bold text-xs shadow-xs shrink-0 cursor-pointer transition-transform active:scale-95 ${
              isDark
                ? 'bg-[#E9A9C4] text-[#201E2A] hover:bg-[#DCA0B7]'
                : 'bg-[#FF6E85] text-white hover:bg-[#FA5B74]'
            }`}
            aria-label="Silence Alarm"
          >
            Silence 🌸
          </button>
        </div>
      )}

      {/* Return Welcome Toast */}
      {welcomeBackToast && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2.5 animate-bounce border-2 ${
            isDark
              ? 'bg-[#2B2737] border-[#E9A9C4] text-[#E9A9C4]'
              : 'bg-[#FFF5F7] border-[#FFA8BA] text-[#E8556D]'
          }`}
        >
          <BlobAvatar
            size={26}
            mood="happy"
            bodyColor={characterConfig.bodyColor}
            blushColor={characterConfig.blushColor}
            theme={theme}
          />
          <span className="font-doodle text-sm md:text-base font-bold">
            {welcomeBackToast}
          </span>
        </div>
      )}

      {/* Toast Notification (Break Completed) */}
      {celebrationToast && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce border-2 ${
            isDark
              ? 'bg-[#2B2737] border-[#E9A9C4] text-[#E9A9C4]'
              : 'bg-white border-[#FFA8BA] text-[#E8556D]'
          }`}
        >
          <BlobAvatar
            size={24}
            mood="happy"
            bodyColor={characterConfig.bodyColor}
            blushColor={characterConfig.blushColor}
            theme={theme}
          />
          <span className="font-doodle text-sm md:text-base font-bold">
            {celebrationToast}
          </span>
        </div>
      )}

      {/* Ending Soon Notice */}
      {endingSoonNotice && (
        <div
          className={`fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-md flex items-center gap-2 animate-pulse border ${
            isDark
              ? 'bg-[#3D2C28] border-[#A25E47] text-[#FBD38D]'
              : 'bg-[#FFF7ED] border-[#FDBA74] text-[#C2410C]'
          }`}
        >
          <span className="text-sm">🔔</span>
          <span className="font-doodle text-xs md:text-sm font-bold">
            {endingSoonNotice}
          </span>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-start">
        {/* ============================================================== */}
        {/* LEFT COLUMN: Main Break Card                                   */}
        {/* ============================================================== */}
        <div
          className={`lg:col-span-7 rounded-[32px] p-5 md:p-7 shadow-xs flex flex-col justify-between transition-colors duration-200 border ${
            isDark
              ? 'bg-[#2B2737] border-[#3D374D]'
              : 'bg-[#FFFDFB] border-[#ECE4DB]'
          }`}
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              {/* App Title & Subtitle */}
              <div className="flex items-center gap-2.5">
                <BlobAvatar
                  size={36}
                  mood={isOverdue ? 'happy' : activeBreak ? 'happy' : 'cheeky'}
                  bodyColor={characterConfig.bodyColor}
                  blushColor={characterConfig.blushColor}
                  theme={theme}
                />
                <div>
                  <h1
                    className={`text-2xl md:text-3xl font-black tracking-tight flex items-center gap-1.5 leading-none font-display ${
                      isDark ? 'text-[#F8F0F5]' : 'text-[#3A2C29]'
                    }`}
                  >
                    break.exe
                  </h1>
                  <p
                    className={`text-xs font-medium mt-1 ${
                      isDark ? 'text-[#C5B8C8]' : 'text-[#9E8E8A]'
                    }`}
                  >
                    because even robots need breaks
                  </p>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Cute Sun / Moon Theme Switcher Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleTheme()}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer text-sm shadow-2xs hover:scale-105 active:scale-95 ${
                    isDark
                      ? 'bg-[#353044] border-[#48405C] text-[#FEF08A] hover:bg-[#433B58]'
                      : 'bg-[#FAF4ED] border-[#EFE5DB] text-[#F59E0B] hover:bg-[#FFF8EE]'
                  }`}
                  title={
                    isDark
                      ? 'Switch to Pastel Daylight theme (Light)'
                      : 'Switch to Cozy Midnight-Plum theme (Dark)'
                  }
                  aria-label={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
                >
                  <span className="transform transition-transform duration-200">
                    {isDark ? '🌙' : '☀️'}
                  </span>
                </button>

                {/* Alarm Preview Test Button */}
                <button
                  type="button"
                  onClick={() => {
                    alarmEngine.primeUserGesture();
                    if (isAlarmRinging) {
                      handleDismissAlarm();
                    } else {
                      alarmEngine.start();
                      setIsAlarmRinging(true);
                    }
                  }}
                  className={`border rounded-full px-2.5 py-1 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer text-xs font-semibold ${
                    isAlarmRinging
                      ? isDark
                        ? 'bg-[#433144] border-[#E9A9C4] text-[#E9A9C4] animate-pulse'
                        : 'bg-[#FFE6EC] border-[#FFA8BA] text-[#E8556D] animate-pulse'
                      : isDark
                      ? 'bg-[#353044] border-[#48405C] text-[#C5B8C8] hover:text-[#F8F0F5] hover:border-[#6B5C82]'
                      : 'bg-[#FAF4ED] border-[#EFE5DB] text-[#6B5A56] hover:bg-[#FFF5F7] hover:border-[#FFA8BA]'
                  }`}
                  title="Test bold punchy alarm sound"
                >
                  <span>{isAlarmRinging ? '🛑' : '🔔'}</span>
                  <span className="font-doodle hidden sm:inline">
                    {isAlarmRinging ? 'Stop Alarm' : 'Test Alarm'}
                  </span>
                </button>

                {/* Customize Companion Button */}
                <button
                  onClick={() => {
                    sound.playPop();
                    setIsCustomizerOpen(true);
                  }}
                  className={`border rounded-full px-3 py-1 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer text-xs font-semibold ${
                    isDark
                      ? 'bg-[#353044] border-[#48405C] text-[#F8F0F5] hover:border-[#E9A9C4]'
                      : 'bg-[#FAF4ED] border-[#EFE5DB] text-[#6B5A56] hover:border-[#FFA8BA] hover:bg-[#FFF5F7]'
                  }`}
                  title="Customize your companion and sound settings"
                >
                  <span>✨</span>
                  <span className="font-doodle hidden sm:inline">{characterConfig.name}</span>
                  <span className="font-doodle sm:hidden">edit</span>
                </button>

                {/* Sound mute/unmute button */}
                <button
                  onClick={() => {
                    const newVal = !soundEnabled;
                    setSoundEnabled(newVal);
                    sound.setEnabled(newVal);
                    if (newVal) sound.playStartChime();
                  }}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer text-xs ${
                    soundEnabled
                      ? isDark
                        ? 'bg-[#353044] border-[#48405C] text-[#A9CFF5] hover:text-[#F8F0F5]'
                        : 'bg-[#FAF4ED] border-[#EFE5DB] text-[#7E6E6A] hover:text-[#3A2C29]'
                      : isDark
                      ? 'bg-[#201E2A] border-[#3D374D] text-[#8E8094]'
                      : 'bg-[#F2ECE6] border-[#DFD5CB] text-[#A89894]'
                  }`}
                  title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                >
                  {soundEnabled ? '🔔' : '🔕'}
                </button>
              </div>
            </div>

            {/* Inner Centerpiece Card (Dancing Blob & Digital Timer) */}
            <div
              className={`border rounded-[26px] p-5 md:p-6 my-4 relative overflow-hidden select-none transition-all duration-300 ${
                isOverdue
                  ? isDark
                    ? 'bg-[#3A2838] border-[#8A4A6B] shadow-sm'
                    : 'bg-[#FFF0F3] border-[#FFB6C4] shadow-sm'
                  : isDark
                  ? 'bg-[#353044] border-[#483E5C]'
                  : 'bg-[#FFF0F2] border-[#FFE1E6]'
              }`}
            >
              {/* Overdue Alert Banner inside card */}
              {isOverdue && (
                <div
                  className={`mb-2 border rounded-xl px-3 py-1 flex items-center justify-between text-xs font-display animate-pulse ${
                    isDark
                      ? 'bg-[#4B3046] border-[#E9A9C4] text-[#E9A9C4]'
                      : 'bg-[#FFE6EC] border-[#FFA8BA] text-[#E8556D]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>💀</span>
                    <span>BREAK OVER! +{formatTimerDigits(overdueSeconds)} overdue</span>
                  </div>
                  {isAlarmRinging && (
                    <span className="font-doodle text-[11px] opacity-90">
                      tap anywhere to silence 🌸
                    </span>
                  )}
                </div>
              )}

              {/* Top Digital Timer with Radiating Ticks */}
              <div className="flex items-center justify-center gap-3 md:gap-4 mb-2">
                <RadiatingTicks side="left" theme={theme} />
                <div
                  className={`text-5xl md:text-6xl font-black tracking-tight font-display drop-shadow-2xs transition-colors ${
                    isDark
                      ? isOverdue
                        ? 'text-[#F4A6BA]'
                        : 'text-[#E9A9C4]'
                      : isOverdue
                      ? 'text-[#E8556D]'
                      : 'text-[#EB5E6F]'
                  }`}
                >
                  {getDisplayDigits()}
                </div>
                <RadiatingTicks side="right" theme={theme} />
              </div>

              {/* Center Row: Left Quote + Dancing Blob + Right Books Doodle */}
              <div className="relative flex items-center justify-between py-1">
                {/* Left note with curved arrow */}
                <div className="w-24 md:w-32 flex flex-col items-center text-center">
                  <p
                    className={`font-doodle text-xs md:text-sm leading-tight ${
                      isDark ? 'text-[#C5B8C8]' : 'text-[#7D6B66]'
                    }`}
                  >
                    {blobInfo.main}
                  </p>
                  <CurvedArrowLeft className="mt-1" theme={theme} />
                </div>

                {/* The Adorable Dancing Character */}
                <div className="flex-1 flex justify-center">
                  <DancingBlob
                    isDancing={Boolean(activeBreak)}
                    expression={blobInfo.expression}
                    config={characterConfig}
                  />
                </div>

                {/* Right books doodle with curved arrow */}
                <div className="w-24 md:w-32 flex flex-col items-center text-center">
                  <p
                    className={`font-doodle text-xs md:text-sm leading-tight ${
                      isDark ? 'text-[#C5B8C8]' : 'text-[#7D6B66]'
                    }`}
                  >
                    {blobInfo.subtitle}
                  </p>
                  <div className="flex items-center justify-center mt-1">
                    <CurvedArrowRight className="mr-0.5" theme={theme} />
                    <BooksStackDoodle theme={theme} />
                  </div>
                </div>
              </div>

              {/* Status / Duration sub-badge */}
              {activeBreak && (
                <div className="mt-2 text-center flex flex-col items-center gap-1">
                  {activeBreak.targetMinutes > 0 ? (
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      <span
                        className={`font-doodle text-xs px-3 py-1 rounded-full border ${
                          isOverdue
                            ? isDark
                              ? 'bg-[#433144] border-[#E9A9C4] text-[#E9A9C4] font-bold'
                              : 'bg-[#FFE6EC] border-[#FFA8BA] text-[#E8556D] font-bold'
                            : isDark
                            ? 'bg-[#2B2737]/80 border-[#483E5C] text-[#E9A9C4]'
                            : 'bg-white/80 border-[#FFD5DC] text-[#C85567]'
                        }`}
                      >
                        {isOverdue
                          ? `target (${activeBreak.targetMinutes}m) reached • overdue: +${formatTimerDigits(overdueSeconds)}`
                          : `countdown: ${formatTimerDigits(remainingSeconds)} left (target: ${activeBreak.targetMinutes}m)`}
                      </span>
                      <span
                        className={`font-doodle text-[11px] px-2 py-0.5 rounded-full border ${
                          isDark
                            ? 'text-[#C5B8C8] bg-[#2B2737]/60 border-[#3D374D]'
                            : 'text-[#8F7F7B] bg-white/60 border-[#EAE2D8]'
                        }`}
                      >
                        total time: {formatTimerDigits(elapsedSeconds)}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={`font-doodle text-xs px-3 py-1 rounded-full border ${
                        isDark
                          ? 'bg-[#2B2737]/80 border-[#483E5C] text-[#E9A9C4]'
                          : 'bg-white/70 border-[#FFD5DC] text-[#C85567]'
                      }`}
                    >
                      free vibe stopwatch • {formatTimerDigits(elapsedSeconds)} elapsed
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Target Duration Selector & Custom Timer */}
            {!activeBreak && (
              <div
                className={`mb-4 rounded-2xl p-3.5 border transition-colors ${
                  isDark
                    ? 'bg-[#242230] border-[#3D374D]'
                    : 'bg-[#FAF7F3] border-[#EFE7DE]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <label
                    className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      isDark ? 'text-[#C5B8C8]' : 'text-[#6D5D59]'
                    }`}
                  >
                    <span>⏱️</span>
                    <span>Set Break Timer Length:</span>
                  </label>
                  <span
                    className={`font-doodle text-xs font-bold ${
                      isDark ? 'text-[#E9A9C4]' : 'text-[#E8556D]'
                    }`}
                  >
                    {targetMinutes === 0
                      ? 'free-form stopwatch'
                      : `timer: ${targetMinutes} min countdown 🔔`}
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex gap-1.5 overflow-x-auto pb-1.5">
                  {TARGET_PRESETS.map((t) => (
                    <button
                      key={t.mins}
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setTargetMinutes(t.mins);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        targetMinutes === t.mins
                          ? isDark
                            ? 'bg-[#433144] border-[#E9A9C4] text-[#E9A9C4] shadow-2xs scale-102'
                            : 'bg-[#FFE6EC] border-[#FFA8BA] text-[#E8556D] shadow-2xs scale-102'
                          : isDark
                          ? 'bg-[#353044] border-[#483E5C] text-[#C5B8C8] hover:text-[#F8F0F5] hover:bg-[#3E3550]'
                          : 'bg-white border-[#EAE2D8] text-[#6E5E5A] hover:bg-[#FFF5F7]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Custom Minutes Stepper */}
                <div
                  className={`flex items-center justify-between mt-2 pt-2 border-t ${
                    isDark ? 'border-[#3D374D]' : 'border-[#EAE2D8]/70'
                  }`}
                >
                  <span className={`text-xs font-medium ${isDark ? 'text-[#C5B8C8]' : 'text-[#7A6B67]'}`}>
                    Or custom duration:
                  </span>
                  <div
                    className={`flex items-center gap-2 rounded-xl px-2.5 py-1 shadow-2xs border ${
                      isDark
                        ? 'bg-[#353044] border-[#483E5C]'
                        : 'bg-white border-[#EAE2D8]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setTargetMinutes((prev) => Math.max(1, prev - 1));
                      }}
                      className={`w-6 h-6 rounded-lg text-sm font-bold flex items-center justify-center cursor-pointer transition-colors ${
                        isDark
                          ? 'bg-[#2B2737] hover:bg-[#433144] text-[#F8F0F5]'
                          : 'bg-[#FAF4ED] hover:bg-[#FFE6EC] text-[#554643]'
                      }`}
                      title="Decrease by 1 minute"
                    >
                      -
                    </button>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={180}
                        value={targetMinutes || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setTargetMinutes(isNaN(val) ? 0 : Math.max(1, Math.min(180, val)));
                        }}
                        className={`w-10 text-center font-display font-bold text-sm bg-transparent focus:outline-none ${
                          isDark ? 'text-[#E9A9C4]' : 'text-[#E8556D]'
                        }`}
                      />
                      <span className={`text-xs font-medium ${isDark ? 'text-[#C5B8C8]' : 'text-[#8F7F7B]'}`}>
                        min
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setTargetMinutes((prev) => Math.min(180, (prev || 0) + 1));
                      }}
                      className={`w-6 h-6 rounded-lg text-sm font-bold flex items-center justify-center cursor-pointer transition-colors ${
                        isDark
                          ? 'bg-[#2B2737] hover:bg-[#433144] text-[#F8F0F5]'
                          : 'bg-[#FAF4ED] hover:bg-[#FFE6EC] text-[#554643]'
                      }`}
                      title="Increase by 1 minute"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Break Reason Selection */}
            <div>
              <label
                className={`block text-sm md:text-base font-bold mb-2.5 font-display ${
                  isDark ? 'text-[#F8F0F5]' : 'text-[#3A2C29]'
                }`}
              >
                why are you taking a break?
              </label>

              {/* Reasons Pills Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {REASON_CONFIGS.map((r) => {
                  const isSelected = selectedReason === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      disabled={Boolean(activeBreak)}
                      onClick={() => {
                        sound.playPop();
                        setSelectedReason(r.id);
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl border text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                        activeBreak ? 'cursor-not-allowed opacity-90' : ''
                      } ${
                        isSelected
                          ? isDark
                            ? 'bg-[#433144] border-[#E9A9C4] text-[#E9A9C4] shadow-2xs'
                            : 'bg-[#FFF0F3] border-[#FFA8BA] text-[#E8556D] shadow-2xs'
                          : isDark
                          ? 'bg-[#353044] border-[#483E5C] text-[#F8F0F5] hover:bg-[#3D354E]'
                          : 'bg-white border-[#EAE2D8] text-[#554643] hover:bg-[#FDF9F6]'
                      }`}
                    >
                      <ReasonIcon reason={r.id} size={17} />
                      <span className="truncate">{r.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Optional Explanation Input with Peeking Blob */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-3">
                <input
                  type="text"
                  value={explanationNote}
                  disabled={Boolean(activeBreak)}
                  onChange={(e) => setExplanationNote(e.target.value)}
                  placeholder="any explanation? (optional)"
                  maxLength={60}
                  className={`flex-1 rounded-2xl px-4 py-2.5 text-xs md:text-sm transition-colors border disabled:opacity-75 ${
                    isDark
                      ? 'bg-[#353044] border-[#483E5C] text-[#F8F0F5] placeholder-[#8E8094] focus:outline-none focus:border-[#E9A9C4]'
                      : 'bg-white border-[#EAE2D8] text-[#4A3E3D] placeholder-[#A69793] focus:outline-none focus:border-[#FFA8BA] disabled:bg-[#FAF6F2]'
                  }`}
                />

                <div className="shrink-0 flex justify-end">
                  <PeekingBlob text="no judgment... ~ maybe" theme={theme} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button: Start or End Break */}
          <div className="mt-6">
            {!activeBreak ? (
              <button
                type="button"
                onClick={handleStartBreak}
                className={`w-full active:scale-[0.99] font-bold text-base md:text-lg py-3.5 px-6 rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 font-display ${
                  isDark
                    ? 'bg-[#E9A9C4] hover:bg-[#DCA0B7] text-[#201E2A] font-black'
                    : 'bg-[#FF6E85] hover:bg-[#FA5B74] text-white'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>
                  {targetMinutes > 0
                    ? `Start ${targetMinutes}m Break`
                    : 'Start Free Break'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEndBreak}
                className={`w-full font-bold text-base md:text-lg py-3.5 px-6 rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 font-display text-white ${
                  isOverdue
                    ? isDark
                      ? 'bg-[#E05A75] hover:bg-[#CC4B65] animate-bounce'
                      : 'bg-[#E8556D] hover:bg-[#D4445C] animate-bounce'
                    : isDark
                    ? 'bg-[#D95B75] hover:bg-[#C44E67] animate-pulse-glow'
                    : 'bg-[#FF6E85] hover:bg-[#FA5B74] animate-pulse-glow'
                }`}
              >
                <rect width="16" height="16" rx="3" className="fill-white" />
                <span>
                  {isOverdue ? 'End Break (You survived! 🎓)' : 'End Break'}
                </span>
              </button>
            )}

            {/* Bottom Sarcastic Caption */}
            <p
              className={`font-doodle text-xs md:text-sm mt-2.5 text-center select-none ${
                isDark ? 'text-[#C5B8C8]' : 'text-[#8F7F7B]'
              }`}
            >
              {isOverdue
                ? 'Break over! Bestie, back to business 💀'
                : 'come back soon... your future self is watching 👀'}
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: Today's Damage + Break History                   */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 flex flex-col gap-5 md:gap-6">
          {/* Top Card: today's damage */}
          <TodayDamage stats={stats} theme={theme} />

          {/* Bottom Card: break history */}
          <BreakHistory
            records={history}
            onDeleteRecord={handleDeleteRecord}
            onClearAll={handleClearAll}
            theme={theme}
          />
        </div>
      </div>

      {/* Creator Credits and Socials Footer */}
      <Footer theme={theme} />

      {/* Character Customizer & Sound Setup Modal */}
      <CharacterCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        currentConfig={characterConfig}
        onSave={handleSaveCharacter}
        soundEnabled={soundEnabled}
        onToggleSound={setSoundEnabled}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    </div>
  );
}
