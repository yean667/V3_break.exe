import React from 'react';

interface FooterProps {
  theme?: 'light' | 'dark';
}

export const Footer: React.FC<FooterProps> = ({ theme = 'light' }) => {
  const isDark = theme === 'dark';

  return (
    <footer className="w-full mt-8 pt-4 pb-6 flex flex-col items-center justify-center text-center select-none">
      {/* Creator Credit with Animated Heart & Sparkle */}
      <div
        className={`flex items-center gap-1.5 font-doodle text-sm md:text-base font-medium group ${
          isDark ? 'text-[#C5B8C8]' : 'text-[#6E5D59]'
        }`}
      >
        <span>built with</span>
        <span
          className={`inline-block animate-pulse text-base transform group-hover:scale-125 transition-transform duration-200 ${
            isDark ? 'text-[#E9A9C4]' : 'text-[#FF6E85]'
          }`}
          aria-hidden="true"
        >
          ♡
        </span>
        <span>by</span>
        <span className={`font-bold relative ${isDark ? 'text-[#F8F0F5]' : 'text-[#3A2C29]'}`}>
          Aru
          <span
            className={`inline-block ml-1 text-xs animate-pulse ${
              isDark ? 'text-[#A9CFF5]' : 'text-[#93C5FD]'
            }`}
          >
            ✨
          </span>
        </span>
      </div>

      {/* Social Links */}
      <div className="flex items-center gap-3 mt-2.5">
        {/* Instagram Link */}
        <a
          href="https://www.instagram.com/mrprofessorirl/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Aru on Instagram (opens in new tab)"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs hover:shadow-xs transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer group border ${
            isDark
              ? 'bg-[#2B2737] hover:bg-[#3D2C40] border-[#3D374D] hover:border-[#E9A9C4] text-[#C5B8C8] hover:text-[#E9A9C4]'
              : 'bg-white/80 hover:bg-[#FFEBF0] border-[#ECE2D8] hover:border-[#FFA8BA] text-[#665450] hover:text-[#E8556D]'
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`group-hover:rotate-6 transition-transform ${
              isDark ? 'text-[#E9A9C4]' : 'text-[#E8556D]'
            }`}
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
          <span className="font-display">Instagram</span>
        </a>

        <span className={`text-xs ${isDark ? 'text-[#48405C]' : 'text-[#D5C9BE]'}`} aria-hidden="true">
          •
        </span>

        {/* Discord Server Link */}
        <a
          href="https://discord.gg/zBjefVmTN"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Discord Server (opens in new tab)"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs hover:shadow-xs transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer group border ${
            isDark
              ? 'bg-[#2B2737] hover:bg-[#2A374A] border-[#3D374D] hover:border-[#A9CFF5] text-[#C5B8C8] hover:text-[#A9CFF5]'
              : 'bg-white/80 hover:bg-[#EBF5FE] border-[#ECE2D8] hover:border-[#93C5FD] text-[#665450] hover:text-[#2563EB]'
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`group-hover:-rotate-6 transition-transform ${
              isDark ? 'text-[#A9CFF5]' : 'text-[#3B82F6]'
            }`}
          >
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          <span className="font-display">Discord Server</span>
        </a>
      </div>
    </footer>
  );
};
