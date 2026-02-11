import React, { useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TimelineProps {
    selectedYear: number;
    onYearSelect: (year: number) => void;
    availableYears: number[];
    counts?: Record<number, number>;
}

export const Timeline: React.FC<TimelineProps> = ({ selectedYear, onYearSelect, availableYears, counts }) => {
    const activeRef = useRef<HTMLButtonElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to selected year
    useEffect(() => {
        if (activeRef.current && containerRef.current) {
            const container = containerRef.current;
            const active = activeRef.current;
            const top = active.offsetTop - container.offsetTop - (container.clientHeight / 2) + (active.clientHeight / 2);
            container.scrollTo({ top, behavior: 'smooth' });
        }
    }, [selectedYear]);

    // Generate full range of years for visual continuity, e.g., from max available year down to 2005
    const maxYear = Math.max(...availableYears);
    const minYear = 2005;
    const allYears = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

    return (
        <div className="bg-[#f1f1f1] w-[120px] flex flex-col shrink-0 border-r border-[#d1d1d1] h-full">
            <div className="flex items-center justify-center h-[60px] border-b border-[#d1d1d1] shrink-0">
                <button className="hover:opacity-70 transition-opacity">
                    <ChevronUp className="w-6 h-6 text-black" strokeWidth={2} />
                </button>
            </div>

            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto scrollbar-hide flex flex-col items-center"
            >
                {allYears.map((year) => {
                    const isSelected = year === selectedYear;
                    const isAvailable = availableYears.includes(year);
                    const count = counts?.[year] || 0;

                    return (
                        <button
                            key={year}
                            ref={isSelected ? activeRef : null}
                            onClick={() => isAvailable && onYearSelect(year)}
                            disabled={!isAvailable}
                            className={`
                w-full h-[60px] flex items-center justify-center shrink-0 relative
                border-b border-[#d1d1d1]
                transition-colors
                ${isSelected ? 'bg-[#edc098] text-black' : 'bg-white text-black hover:bg-gray-50'}
                ${!isAvailable && 'opacity-50 cursor-not-allowed bg-[#e0e0e0]'}
              `}
                        >
                            <span className={`font-sans text-[20px] leading-none ${isSelected ? 'font-bold' : 'font-normal'}`}>
                                {year}
                            </span>
                            {count > 0 && (
                                <span className={`absolute right-3 text-[14px] font-sans ${isSelected ? 'text-black font-bold' : 'text-[#888888] font-normal'}`}>
                                    ({count})
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center justify-center h-[60px] border-t border-[#d1d1d1] shrink-0">
                <button className="hover:opacity-70 transition-opacity">
                    <ChevronDown className="w-6 h-6 text-black" strokeWidth={2} />
                </button>
            </div>
        </div>
    );
};
