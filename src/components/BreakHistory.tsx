import React, { useState } from 'react';
import { BreakRecord } from '../types';
import { ReasonIcon } from './ReasonIcons';
import { formatTimeString, formatDurationBadge } from '../utils/storage';
import { sound } from '../utils/audio';

interface BreakHistoryProps {
  records: BreakRecord[];
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  theme?: 'light' | 'dark';
}

export const BreakHistory: React.FC<BreakHistoryProps> = ({
  records,
  onDeleteRecord,
  onClearAll,
  theme = 'light',
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isDark = theme === 'dark';

  return (
    <div
      className={`rounded-[28px] p-5 shadow-xs relative flex flex-col flex-1 transition-colors duration-200 border ${
        isDark
          ? 'bg-[#2B2737] border-[#3D374D]'
          : 'bg-[#FFFDFB] border-[#ECE4DB]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative">
        <h2
          className={`text-xl md:text-2xl font-bold tracking-tight ${
            isDark ? 'text-[#F8F0F5]' : 'text-[#3A2C29]'
          }`}
        >
          break history
        </h2>

        {/* Action button ••• */}
        {records.length > 0 && (
          <div className="relative">
            <button
              onClick={() => {
                sound.playPop();
                setMenuOpen(!menuOpen);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer tracking-widest text-lg font-bold ${
                isDark
                  ? 'text-[#C5B8C8] hover:text-[#F8F0F5] hover:bg-[#353044]'
                  : 'text-[#9E8E8A] hover:text-[#3A2C29] hover:bg-[#F5EFE9]'
              }`}
              title="History options"
            >
              •••
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div
                className={`absolute right-0 top-10 w-44 rounded-2xl shadow-lg py-1.5 z-30 font-medium text-xs border ${
                  isDark
                    ? 'bg-[#2B2737] border-[#48405C] text-[#F8F0F5]'
                    : 'bg-white border-[#EAE1D7] text-[#5C4D4A]'
                }`}
              >
                <button
                  onClick={() => {
                    sound.playPop();
                    onClearAll();
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 cursor-pointer flex items-center gap-2 font-semibold transition-colors ${
                    isDark
                      ? 'hover:bg-[#3E2D3F] text-[#E9A9C4]'
                      : 'hover:bg-[#FFF2F5] text-rose-500'
                  }`}
                >
                  <span>🗑</span> Clear all history
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* History List / Empty State */}
      <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1 flex-1 flex flex-col">
        {records.length === 0 ? (
          <div className="py-10 px-4 text-center select-none my-auto flex flex-col items-center justify-center">
            {/* Cute Sleepy Daisy Illustration */}
            <div className="w-24 h-24 mb-3 relative flex items-center justify-center">
              {/* Soft background puddle */}
              <div
                className={`absolute inset-0 rounded-full blur-[1px] ${
                  isDark
                    ? 'bg-gradient-to-tr from-[#3D2C42]/60 via-[#2B2737] to-[#2B3B4F]/60'
                    : 'bg-gradient-to-tr from-[#FFE5EC]/70 via-[#FFF9F2] to-[#E0F2FE]/70'
                }`}
              />

              <svg
                viewBox="0 0 100 100"
                className="w-20 h-20 relative z-10 drop-shadow-xs"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Ground shadow / leaf base */}
                <ellipse
                  cx="50"
                  cy="86"
                  rx="22"
                  ry="5"
                  fill={isDark ? '#3D374D' : '#EAE0D6'}
                />

                {/* Curved little sleepy stem */}
                <path
                  d="M50 84 C48 70 53 58 50 48"
                  stroke={isDark ? '#F8F0F5' : '#3A2C29'}
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Leaf */}
                <path
                  d="M49 68 C42 66 38 60 40 55 C46 56 49 61 49 68 Z"
                  fill={isDark ? '#2E5A3D' : '#BBF7D0'}
                  stroke={isDark ? '#F8F0F5' : '#3A2C29'}
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M51 63 C58 62 63 56 62 50 C56 51 52 57 51 63 Z"
                  fill={isDark ? '#2E5A3D' : '#BBF7D0'}
                  stroke={isDark ? '#F8F0F5' : '#3A2C29'}
                  strokeWidth="2"
                  strokeLinejoin="round"
                />

                {/* Daisy Flower Head */}
                <g transform="rotate(-8 50 42)">
                  {/* Petals */}
                  <ellipse
                    cx="50"
                    cy="25"
                    rx="9"
                    ry="12"
                    fill={isDark ? '#E9A9C4' : '#FFCCD7'}
                    stroke={isDark ? '#201E2A' : '#3A2C29'}
                    strokeWidth="2.4"
                  />
                  <ellipse
                    cx="65"
                    cy="33"
                    rx="9"
                    ry="12"
                    fill={isDark ? '#A9CFF5' : '#BCE0FD'}
                    stroke={isDark ? '#201E2A' : '#3A2C29'}
                    strokeWidth="2.4"
                    transform="rotate(68 65 33)"
                  />
                  <ellipse
                    cx="60"
                    cy="52"
                    rx="9"
                    ry="12"
                    fill={isDark ? '#E9A9C4' : '#FFCCD7'}
                    stroke={isDark ? '#201E2A' : '#3A2C29'}
                    strokeWidth="2.4"
                    transform="rotate(136 60 52)"
                  />
                  <ellipse
                    cx="40"
                    cy="52"
                    rx="9"
                    ry="12"
                    fill={isDark ? '#A9CFF5' : '#BCE0FD'}
                    stroke={isDark ? '#201E2A' : '#3A2C29'}
                    strokeWidth="2.4"
                    transform="rotate(-136 40 52)"
                  />
                  <ellipse
                    cx="35"
                    cy="33"
                    rx="9"
                    ry="12"
                    fill={isDark ? '#E9A9C4' : '#FFD8E2'}
                    stroke={isDark ? '#201E2A' : '#3A2C29'}
                    strokeWidth="2.4"
                    transform="rotate(-68 35 33)"
                  />

                  {/* Core */}
                  <circle
                    cx="50"
                    cy="40"
                    r="14"
                    fill="#FEF08A"
                    stroke={isDark ? '#201E2A' : '#3A2C29'}
                    strokeWidth="2.6"
                  />

                  {/* Blush */}
                  <ellipse
                    cx="41"
                    cy="42"
                    rx="3.5"
                    ry="2"
                    fill={isDark ? '#E9A9C4' : '#FFAEC0'}
                  />
                  <ellipse
                    cx="59"
                    cy="42"
                    rx="3.5"
                    ry="2"
                    fill={isDark ? '#E9A9C4' : '#FFAEC0'}
                  />

                  {/* Sleepy eyes */}
                  <path
                    d="M42 38 Q45 35 48 38"
                    stroke="#3A2C29"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M52 38 Q55 35 58 38"
                    stroke="#3A2C29"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Smile */}
                  <path
                    d="M48 43 Q50 45 52 43"
                    stroke="#3A2C29"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>

                {/* Snoozes */}
                <text
                  x="72"
                  y="26"
                  fill={isDark ? '#A9CFF5' : '#7EB8F7'}
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="'Patrick Hand', cursive, sans-serif"
                >
                  z
                </text>
                <text
                  x="80"
                  y="18"
                  fill={isDark ? '#E9A9C4' : '#FFA8BA'}
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="'Patrick Hand', cursive, sans-serif"
                >
                  Z
                </text>
              </svg>
            </div>

            {/* Empty State Message */}
            <p
              className={`font-doodle text-base md:text-lg font-bold max-w-[280px] leading-snug ${
                isDark ? 'text-[#F8F0F5]' : 'text-[#5A4945]'
              }`}
            >
              “no breaks yet… your procrastination lore starts here 🌼”
            </p>
            <p
              className={`font-doodle text-xs md:text-sm mt-1.5 max-w-[260px] ${
                isDark ? 'text-[#C5B8C8]' : 'text-[#A08F8B]'
              }`}
            >
              ready when you need water, fresh air, or an academic pause ✨
            </p>
          </div>
        ) : (
          records.map((item) => (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`flex items-center gap-3 py-2 px-2.5 rounded-xl transition-colors group relative ${
                isDark
                  ? 'hover:bg-[#353044]'
                  : 'hover:bg-[#FAF4EE]'
              }`}
            >
              {/* Start Time */}
              <div
                className={`text-xs md:text-sm font-semibold w-16 md:w-20 shrink-0 ${
                  isDark ? 'text-[#C5B8C8]' : 'text-[#8C7A76]'
                }`}
              >
                {formatTimeString(item.startTime)}
              </div>

              {/* Duration Badge */}
              <div
                className={`shrink-0 font-bold text-xs md:text-sm px-2.5 py-0.5 rounded-full border ${
                  isDark
                    ? 'bg-[#433144] border-[#664361] text-[#E9A9C4]'
                    : 'bg-[#FFEBF0] text-[#E8556D] border-[#FFCCD7]'
                }`}
              >
                {formatDurationBadge(item.durationSeconds)}
              </div>

              {/* Reason Icon */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs border ${
                  isDark
                    ? 'bg-[#353044] border-[#48405C]'
                    : 'bg-white border-[#EAE2D8]'
                }`}
              >
                <ReasonIcon reason={item.reason} size={20} />
              </div>

              {/* Reason Title & Note */}
              <div className="min-w-0 flex-1">
                <div
                  className={`font-bold text-sm capitalize leading-snug ${
                    isDark ? 'text-[#F8F0F5]' : 'text-[#3A2C29]'
                  }`}
                >
                  {item.reason === 'brain'
                    ? 'brain not braining'
                    : item.reason === 'grass'
                    ? 'touching grass'
                    : item.reason === 'existing'
                    ? 'just existing'
                    : item.reason}
                </div>
                <div
                  className={`text-xs font-doodle truncate ${
                    isDark ? 'text-[#A9CFF5]' : 'text-[#7E6E6A]'
                  }`}
                >
                  {item.note || 'vibing...'}
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => {
                  sound.playPop();
                  onDeleteRecord(item.id);
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isDark
                    ? 'text-[#8E8094] hover:text-[#E9A9C4] hover:bg-[#483344]'
                    : 'text-[#B5A5A1] hover:text-rose-500 hover:bg-[#FFEAEF]'
                } ${
                  hoveredId === item.id ? 'opacity-100' : 'opacity-0 md:opacity-20'
                }`}
                title="Delete this break entry"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
