import React from 'react';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showWordmark = true,
  size = 'md',
}) => {
  const iconDimensions = {
    sm: { box: 28, stroke: 2 },
    md: { box: 34, stroke: 2.2 },
    lg: { box: 44, stroke: 2.5 },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric Emblem: Direction / Guidance Compass */}
      <div
        className="relative flex items-center justify-center rounded-xl bg-[#141716] text-[#FBFBF9] shadow-xs"
        style={{
          width: iconDimensions.box,
          height: iconDimensions.box,
        }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5 text-[#E6E4DD]"
        >
          {/* Subtle geometric grid backdrop */}
          <circle
            cx="16"
            cy="16"
            r="12"
            stroke="currentColor"
            strokeOpacity="0.22"
            strokeWidth="1.2"
          />
          {/* Ascending Compass Needle / North Pointer representing Guidance ('Saarthi') */}
          <path
            d="M16 6L20.5 16L16 13.5L11.5 16L16 6Z"
            fill="#166534"
          />
          {/* Wealth / Anchor Base ('Arth') */}
          <path
            d="M16 13.5L20.5 16L16 26L11.5 16L16 13.5Z"
            fill="#D97706"
            fillOpacity="0.85"
          />
          {/* Crisp Center Point */}
          <circle cx="16" cy="15" r="1.5" fill="#FBFBF9" />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col">
          <span className="font-bold tracking-tight text-[#141716] leading-none text-base sm:text-lg">
            ARTH-SAARTHI
          </span>
          <span className="text-[10px] tracking-widest text-[#59605C] uppercase font-medium mt-0.5">
            Financial Literacy & Risk
          </span>
        </div>
      )}
    </div>
  );
};
