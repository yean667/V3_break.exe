import React, { useState } from 'react';
import { CharacterConfig, CharacterModel, CharacterAccessory, Theme } from '../types';
import {
  CHARACTER_PRESETS,
  BODY_COLOR_PALETTES,
  HEADPHONE_PALETTES,
  ACCESSORY_OPTIONS,
} from '../utils/characters';
import { DancingBlob } from './DancingBlob';
import { sound } from '../utils/audio';
import { alarmEngine } from '../utils/alarmEngine';

interface CharacterCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: CharacterConfig;
  onSave: (config: CharacterConfig) => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  theme?: Theme;
  onToggleTheme?: (theme: Theme) => void;
}

export const CharacterCustomizerModal: React.FC<CharacterCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSave,
  soundEnabled,
  onToggleSound,
  theme = 'light',
  onToggleTheme,
}) => {
  const [tempConfig, setTempConfig] = useState<CharacterConfig>(currentConfig);
  const [activeTab, setActiveTab] = useState<'character' | 'sounds' | 'theme'>('character');
  const [volume, setVolume] = useState<number>(() => sound.volume);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState<boolean>(false);

  if (!isOpen) return null;
  const isDark = theme === 'dark';

  const handleSelectPreset = (preset: CharacterConfig) => {
    sound.playPop();
    setTempConfig({ ...preset });
  };

  const handleSelectModel = (model: CharacterModel) => {
    sound.playPop();
    setTempConfig((prev) => ({ ...prev, model }));
  };

  const handleSelectBodyColor = (hex: string) => {
    sound.playPop();
    setTempConfig((prev) => ({ ...prev, bodyColor: hex }));
  };

  const handleSelectHeadphoneColor = (hex: string) => {
    sound.playPop();
    setTempConfig((prev) => ({ ...prev, headphoneColor: hex }));
  };

  const handleSelectAccessory = (acc: CharacterAccessory) => {
    sound.playPop();
    setTempConfig((prev) => ({ ...prev, accessory: acc }));
  };

  const handleSave = () => {
    sound.playEndChime();
    onSave(tempConfig);
    onClose();
  };

  const handleTestAlarm = () => {
    alarmEngine.primeUserGesture();
    if (isAlarmPlaying) {
      alarmEngine.stop();
      setIsAlarmPlaying(false);
    } else {
      alarmEngine.start();
      setIsAlarmPlaying(true);
      setTimeout(() => {
        alarmEngine.stop();
        setIsAlarmPlaying(false);
      }, 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/45 backdrop-blur-xs animate-fadeIn">
      <div
        className={`rounded-[32px] w-full max-w-lg p-5 md:p-6 shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden transition-colors duration-200 border ${
          isDark
            ? 'bg-[#2B2737] border-[#3D374D] text-[#F8F0F5]'
            : 'bg-[#FFFDFB] border-[#ECE4DB] text-[#3A2C29]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between pb-3 border-b ${
            isDark ? 'border-[#3D374D]' : 'border-[#F0E8DF]'
          }`}
        >
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 font-display">
              <span>✨</span> companion & settings
            </h2>
            <p className={`text-xs font-medium ${isDark ? 'text-[#C5B8C8]' : 'text-[#8F7F7B]'}`}>
              customize your little desk friend, themes, and sound effects
            </p>
          </div>
          <button
            onClick={() => {
              sound.playPop();
              if (isAlarmPlaying) {
                alarmEngine.stop();
              }
              onClose();
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-colors ${
              isDark
                ? 'bg-[#353044] text-[#C5B8C8] hover:bg-[#483E5C]'
                : 'bg-[#FAF4ED] text-[#7E6E6A] hover:bg-[#F2E8DE]'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div
          className={`flex gap-1.5 my-3 p-1 rounded-2xl ${
            isDark ? 'bg-[#201E2A]' : 'bg-[#F5EFE9]'
          }`}
        >
          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('character');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'character'
                ? isDark
                  ? 'bg-[#353044] text-[#F8F0F5] shadow-xs'
                  : 'bg-white text-[#3A2C29] shadow-xs'
                : isDark
                ? 'text-[#C5B8C8] hover:text-[#F8F0F5]'
                : 'text-[#8C7B76] hover:text-[#3A2C29]'
            }`}
          >
            🎨 Character
          </button>
          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('sounds');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'sounds'
                ? isDark
                  ? 'bg-[#353044] text-[#F8F0F5] shadow-xs'
                  : 'bg-white text-[#3A2C29] shadow-xs'
                : isDark
                ? 'text-[#C5B8C8] hover:text-[#F8F0F5]'
                : 'text-[#8C7B76] hover:text-[#3A2C29]'
            }`}
          >
            🎵 Sound & Alarm
          </button>
          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('theme');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'theme'
                ? isDark
                  ? 'bg-[#353044] text-[#F8F0F5] shadow-xs'
                  : 'bg-white text-[#3A2C29] shadow-xs'
                : isDark
                ? 'text-[#C5B8C8] hover:text-[#F8F0F5]'
                : 'text-[#8C7B76] hover:text-[#3A2C29]'
            }`}
          >
            {isDark ? '🌙 Theme' : '☀️ Theme'}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {activeTab === 'character' && (
            <>
              {/* Live Preview Box */}
              <div
                className={`rounded-2xl p-3 flex flex-col items-center justify-center relative select-none border transition-colors ${
                  isDark
                    ? 'bg-[#353044] border-[#483E5C]'
                    : 'bg-[#FFF0F2] border-[#FFE1E6]'
                }`}
              >
                <span
                  className={`absolute top-2 left-3 font-doodle text-xs font-bold ${
                    isDark ? 'text-[#E9A9C4]' : 'text-[#E8556D]'
                  }`}
                >
                  live preview:
                </span>
                <div className="scale-90">
                  <DancingBlob
                    isDancing={true}
                    expression="dancing"
                    config={tempConfig}
                  />
                </div>
                <div
                  className={`font-doodle text-xs -mt-1 ${
                    isDark ? 'text-[#C5B8C8]' : 'text-[#7A6A66]'
                  }`}
                >
                  (click to squish and hear giggle! :3)
                </div>
              </div>

              {/* 1. Pre-designed Characters */}
              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    isDark ? 'text-[#F8F0F5]' : 'text-[#3A2C29]'
                  }`}
                >
                  1. Choose a Pre-designed Companion
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CHARACTER_PRESETS.map((preset) => {
                    const isSelected =
                      tempConfig.model === preset.model &&
                      tempConfig.bodyColor === preset.bodyColor;
                    return (
                      <button
                        key={preset.name}
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? isDark
                              ? 'bg-[#433144] border-[#E9A9C4] ring-2 ring-[#E9A9C4]/30'
                              : 'bg-[#FFF0F3] border-[#FFA8BA] ring-2 ring-[#FFA8BA]/30'
                            : isDark
                            ? 'bg-[#353044] border-[#483E5C] hover:bg-[#3D354E]'
                            : 'bg-white border-[#EAE2D8] hover:bg-[#FDF9F6]'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-full border border-black/15 flex items-center justify-center text-xs shrink-0"
                          style={{ backgroundColor: preset.bodyColor }}
                        >
                          {preset.model === 'bunny'
                            ? '🐰'
                            : preset.model === 'slime'
                            ? '💧'
                            : preset.model === 'bear'
                            ? '🐻'
                            : preset.model === 'cloud'
                            ? '☁️'
                            : '🍡'}
                        </div>
                        <div className="min-w-0">
                          <div
                            className={`text-xs font-bold truncate ${
                              isDark ? 'text-[#F8F0F5]' : 'text-[#3A2C29]'
                            }`}
                          >
                            {preset.name}
                          </div>
                          <div
                            className={`text-[10px] capitalize truncate ${
                              isDark ? 'text-[#C5B8C8]' : 'text-[#8C7C78]'
                            }`}
                          >
                            {preset.model}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Character Model Shape */}
              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                    isDark ? 'text-[#F8F0F5]' : 'text-[#3A2C29]'
                  }`}
                >
                  2. Companion Shape
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['blob', 'slime', 'bunny', 'bear', 'cloud'] as CharacterModel[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => handleSelectModel(m)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${
                        tempConfig.model === m
                          ? isDark
                            ? 'bg-[#2E3C4E] border-[#A9CFF5] text-[#A9CFF5]'
                            : 'bg-[#E9F3FC] border-[#B5D7F8] text-[#2563EB]'
                          : isDark
                          ? 'bg-[#353044] border-[#483E5C] text-[#C5B8C8] hover:bg-[#3D354E]'
                          : 'bg-white border-[#EAE2D8] text-[#6B5B57] hover:bg-[#FAF4EE]'
                      }`}
                    >
                      {m === 'blob'
                        ? '🍡 Dumpling'
                        : m === 'slime'
                        ? '💧 Droplet'
                        : m === 'bunny'
                        ? '🐰 Bunny'
                        : m === 'bear'
                        ? '🐻 Bear'
                        : '☁️ Cloud'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Body Color Palette */}
              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                    isDark ? 'text-[#F8F0F5]' : 'text-[#3A2C29]'
                  }`}
                >
                  3. Body Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {BODY_COLOR_PALETTES.map((color) => {
                    const isSelected =
                      tempConfig.bodyColor.toLowerCase() === color.hex.toLowerCase();
                    return (
                      <button
                        key={color.name}
                        onClick={() => handleSelectBodyColor(color.hex)}
                        title={color.name}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium cursor-pointer transition-all ${
                          isSelected
                            ? isDark
                              ? 'border-[#E9A9C4] ring-2 ring-[#E9A9C4]/40 bg-[#353044]'
                              : 'border-[#3A2C29] ring-2 ring-[#FFA8BA] bg-white'
                            : isDark
                            ? 'border-[#483E5C] bg-[#353044] hover:border-[#6B5C82]'
                            : 'border-[#E2D8CC] bg-white hover:border-[#B5A59E]'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className={`text-[11px] ${isDark ? 'text-[#F8F0F5]' : 'text-[#524340]'}`}>
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Headphone Color */}
              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                    isDark ? 'text-[#F8F0F5]' : 'text-[#3A2C29]'
                  }`}
                >
                  4. Accent / Headphone Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {HEADPHONE_PALETTES.map((color) => {
                    const isSelected =
                      tempConfig.headphoneColor.toLowerCase() === color.hex.toLowerCase();
                    return (
                      <button
                        key={color.name}
                        onClick={() => handleSelectHeadphoneColor(color.hex)}
                        title={color.name}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium cursor-pointer transition-all ${
                          isSelected
                            ? isDark
                              ? 'border-[#E9A9C4] ring-2 ring-[#E9A9C4]/40 bg-[#353044]'
                              : 'border-[#3A2C29] ring-2 ring-[#FFA8BA] bg-white'
                            : isDark
                            ? 'border-[#483E5C] bg-[#353044] hover:border-[#6B5C82]'
                            : 'border-[#E2D8CC] bg-white hover:border-[#B5A59E]'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className={`text-[11px] ${isDark ? 'text-[#F8F0F5]' : 'text-[#524340]'}`}>
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Accessories */}
              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                    isDark ? 'text-[#F8F0F5]' : 'text-[#3A2C29]'
                  }`}
                >
                  5. Cute Accessory
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ACCESSORY_OPTIONS.map((acc) => {
                    const isSelected = tempConfig.accessory === acc.id;
                    return (
                      <button
                        key={acc.id}
                        onClick={() => handleSelectAccessory(acc.id)}
                        className={`py-1.5 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          isSelected
                            ? isDark
                              ? 'bg-[#433144] border-[#E9A9C4] text-[#E9A9C4]'
                              : 'bg-[#FFF0F3] border-[#FFA8BA] text-[#E8556D]'
                            : isDark
                            ? 'bg-[#353044] border-[#483E5C] text-[#C5B8C8] hover:bg-[#3D354E]'
                            : 'bg-white border-[#EAE2D8] text-[#6B5A56] hover:bg-[#FAF4EE]'
                        }`}
                      >
                        <span>{acc.icon}</span>
                        <span>{acc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'sounds' && (
            <div className="space-y-3.5">
              {/* Master Mute / Unmute */}
              <div
                className={`border rounded-2xl p-4 flex items-center justify-between ${
                  isDark
                    ? 'bg-[#353044] border-[#483E5C]'
                    : 'bg-white border-[#EAE2D8]'
                }`}
              >
                <div>
                  <div
                    className={`font-bold text-sm flex items-center gap-1.5 ${
                      isDark ? 'text-[#F8F0F5]' : 'text-[#3A2C29]'
                    }`}
                  >
                    <span>{soundEnabled ? '🔔' : '🔕'}</span> Sound Effects
                  </div>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-[#C5B8C8]' : 'text-[#8A7A76]'}`}>
                    Chimes, clicks, and break expiry alert
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newVal = !soundEnabled;
                    onToggleSound(newVal);
                    sound.setEnabled(newVal);
                    if (newVal) sound.playStartChime();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    soundEnabled
                      ? isDark
                        ? 'bg-[#2E3C4E] text-[#A9CFF5] border border-[#A9CFF5]/40'
                        : 'bg-[#E9F3FC] text-[#2563EB] border border-[#BCE0FD]'
                      : isDark
                      ? 'bg-[#201E2A] text-[#8E8094] border border-[#3D374D]'
                      : 'bg-[#F5EFEA] text-[#8C7A76] border border-[#E3D9CF]'
                  }`}
                >
                  {soundEnabled ? 'Enabled' : 'Muted'}
                </button>
              </div>

              {/* Volume Slider */}
              <div
                className={`border rounded-2xl p-4 ${
                  isDark
                    ? 'bg-[#353044] border-[#483E5C]'
                    : 'bg-white border-[#EAE2D8]'
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span
                    className={`text-xs font-bold ${
                      isDark ? 'text-[#F8F0F5]' : 'text-[#3A2C29]'
                    }`}
                  >
                    Master Audio Volume
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      isDark ? 'text-[#E9A9C4]' : 'text-[#8A7A76]'
                    }`}
                  >
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    sound.setVolume(v);
                    alarmEngine.setVolume(v);
                  }}
                  className="w-full accent-[#FF6E85] cursor-pointer"
                />
                <div
                  className={`flex justify-between text-[10px] mt-1 font-doodle ${
                    isDark ? 'text-[#C5B8C8]' : 'text-[#A89894]'
                  }`}
                >
                  <span>gentle</span>
                  <span>balanced</span>
                  <span>punchy</span>
                </div>
              </div>

              {/* Bold Punchy Break Expiry Alarm Feature Card */}
              <div
                className={`border rounded-2xl p-4 ${
                  isDark
                    ? 'bg-[#433144] border-[#664361]'
                    : 'bg-[#FFF0F4] border-[#FFA8BA]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <div
                      className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        isDark ? 'text-[#E9A9C4]' : 'text-[#E8556D]'
                      }`}
                    >
                      <span>🔔</span> Break Expiry Alarm (Synthesized)
                    </div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        isDark ? 'text-[#F8F0F5]' : 'text-[#7D6B66]'
                      }`}
                    >
                      Deep notification punch + crisp double-bell + upbeat motif
                    </div>
                  </div>
                  <button
                    onClick={handleTestAlarm}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      isAlarmPlaying
                        ? 'bg-[#E05A75] text-white animate-pulse'
                        : isDark
                        ? 'bg-[#E9A9C4] text-[#201E2A] hover:bg-[#DCA0B7]'
                        : 'bg-[#FF6E85] text-white hover:bg-[#FA5B74]'
                    }`}
                  >
                    {isAlarmPlaying ? 'Stop 🛑' : 'Test Alarm ▶'}
                  </button>
                </div>
                <p
                  className={`text-[11px] font-doodle mt-1 ${
                    isDark ? 'text-[#C5B8C8]' : 'text-[#8F7F7B]'
                  }`}
                >
                  Plays repeatedly when the timer reaches zero until you click anywhere on screen!
                </p>
              </div>

              {/* Test Other Sound Effects */}
              <div
                className={`border rounded-2xl p-4 ${
                  isDark
                    ? 'bg-[#201E2A] border-[#3D374D]'
                    : 'bg-[#FAF7F2] border-[#EBE3D8]'
                }`}
              >
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    isDark ? 'text-[#F8F0F5]' : 'text-[#3A2C29]'
                  }`}
                >
                  Test Other Audio Cues
                </label>
                <div className="space-y-2">
                  <div
                    className={`flex items-center justify-between p-2 rounded-xl border ${
                      isDark
                        ? 'bg-[#2B2737] border-[#48405C]'
                        : 'bg-white border-[#EDE5DC]'
                    }`}
                  >
                    <div>
                      <div className={`text-xs font-bold ${isDark ? 'text-[#F8F0F5]' : 'text-[#3A2C29]'}`}>
                        Start Break Chime
                      </div>
                      <div className={`text-[11px] ${isDark ? 'text-[#C5B8C8]' : 'text-[#8A7A76]'}`}>
                        Ascending kalimba notes
                      </div>
                    </div>
                    <button
                      onClick={() => sound.playStartChime()}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer border ${
                        isDark
                          ? 'bg-[#433144] text-[#E9A9C4] border-[#664361]'
                          : 'bg-[#FFF0F3] text-[#E8556D] border-[#FFA8BA]'
                      }`}
                    >
                      ▶ Play
                    </button>
                  </div>

                  <div
                    className={`flex items-center justify-between p-2 rounded-xl border ${
                      isDark
                        ? 'bg-[#2B2737] border-[#48405C]'
                        : 'bg-white border-[#EDE5DC]'
                    }`}
                  >
                    <div>
                      <div className={`text-xs font-bold ${isDark ? 'text-[#F8F0F5]' : 'text-[#3A2C29]'}`}>
                        End Break Chord
                      </div>
                      <div className={`text-[11px] ${isDark ? 'text-[#C5B8C8]' : 'text-[#8A7A76]'}`}>
                        Warm welcoming chord
                      </div>
                    </div>
                    <button
                      onClick={() => sound.playEndChime()}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer border ${
                        isDark
                          ? 'bg-[#2E4238] text-[#4ADE80] border-[#3E5F4F]'
                          : 'bg-[#EDFBEF] text-[#16A34A] border-[#BBF7D0]'
                      }`}
                    >
                      ▶ Play
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-4">
              <div
                className={`border rounded-2xl p-4 ${
                  isDark
                    ? 'bg-[#353044] border-[#483E5C]'
                    : 'bg-white border-[#EAE2D8]'
                }`}
              >
                <h3 className="text-sm font-bold mb-1 font-display">
                  Theme Appearance
                </h3>
                <p className={`text-xs mb-3 ${isDark ? 'text-[#C5B8C8]' : 'text-[#8A7A76]'}`}>
                  Choose between the cute daylight pastel theme or the cozy midnight-plum night theme.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {/* Light Theme Option */}
                  <button
                    onClick={() => {
                      sound.playPop();
                      if (onToggleTheme) onToggleTheme('light');
                    }}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      theme === 'light'
                        ? 'bg-[#FFF0F3] border-[#FFA8BA] ring-2 ring-[#FFA8BA]/40'
                        : isDark
                        ? 'bg-[#201E2A] border-[#3D374D] hover:border-[#6B5C82]'
                        : 'bg-white border-[#EAE2D8] hover:bg-[#FAF4EE]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">☀️</span>
                      <span className="font-bold text-xs text-[#3A2C29]">
                        Pastel Daylight
                      </span>
                    </div>
                    <div className="flex gap-1 mb-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#FBF8F4] border border-[#D5C9BE]" />
                      <span className="w-4 h-4 rounded-full bg-[#FFA8BA]" />
                      <span className="w-4 h-4 rounded-full bg-[#BCE0FD]" />
                    </div>
                    <p className="text-[10px] text-[#7E6E6A]">
                      Soft pastel pink, baby blue & warm cream
                    </p>
                  </button>

                  {/* Dark Theme Option */}
                  <button
                    onClick={() => {
                      sound.playPop();
                      if (onToggleTheme) onToggleTheme('dark');
                    }}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      theme === 'dark'
                        ? 'bg-[#433144] border-[#E9A9C4] ring-2 ring-[#E9A9C4]/40'
                        : isDark
                        ? 'bg-[#201E2A] border-[#3D374D] hover:border-[#6B5C82]'
                        : 'bg-white border-[#EAE2D8] hover:bg-[#FAF4EE]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">🌙</span>
                      <span
                        className={`font-bold text-xs ${
                          isDark ? 'text-[#F8F0F5]' : 'text-[#3A2C29]'
                        }`}
                      >
                        Midnight Plum
                      </span>
                    </div>
                    <div className="flex gap-1 mb-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#201E2A] border border-[#48405C]" />
                      <span className="w-4 h-4 rounded-full bg-[#E9A9C4]" />
                      <span className="w-4 h-4 rounded-full bg-[#A9CFF5]" />
                    </div>
                    <p
                      className={`text-[10px] ${
                        isDark ? 'text-[#C5B8C8]' : 'text-[#7E6E6A]'
                      }`}
                    >
                      Cozy midnight-plum, dusty pink & muted blue
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          className={`pt-3 border-t flex gap-2 justify-end mt-2 ${
            isDark ? 'border-[#3D374D]' : 'border-[#F0E8DF]'
          }`}
        >
          <button
            onClick={() => {
              sound.playPop();
              setTempConfig(CHARACTER_PRESETS[0]);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              isDark
                ? 'text-[#C5B8C8] hover:bg-[#353044]'
                : 'text-[#8C7A76] hover:bg-[#FAF4EE]'
            }`}
          >
            Reset Default
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-2 rounded-xl text-xs md:text-sm font-bold shadow-xs transition-all cursor-pointer font-display ${
              isDark
                ? 'bg-[#E9A9C4] text-[#201E2A] hover:bg-[#DCA0B7]'
                : 'bg-[#FF6E85] text-white hover:bg-[#FA5B74]'
            }`}
          >
            Save Settings ✨
          </button>
        </div>
      </div>
    </div>
  );
};
