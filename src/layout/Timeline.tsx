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
        <div className="bg-[var(--slate-900)] w-[110px] flex flex-col shrink-0 h-full">
            <div className="flex items-center justify-center h-[48px] border-b border-white/10 shrink-0">
                <button className="hover:opacity-70 transition-opacity p-2">
                    <ChevronUp className="w-5 h-5 text-white/60" strokeWidth={2} />
                </button>
            </div>

            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto scrollbar-dark flex flex-col items-center"
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
                                w-full h-[52px] flex items-center justify-center shrink-0 relative
                                border-b border-white/5
                                transition-all duration-200
                                ${isSelected
                                    ? 'bg-[var(--brand-blue)] text-white shadow-lg shadow-blue-500/20'
                                    : isAvailable
                                        ? 'text-white/70 hover:bg-white/5 hover:text-white'
                                        : 'text-white/20 cursor-not-allowed'
                                }
                            `}
                        >
                            <span className={`font-sans text-[16px] leading-none ${isSelected ? 'font-bold' : 'font-medium'}`}>
                                {year}
                            </span>
                            {count > 0 && (
                                <span className={`absolute right-2 text-[11px] font-medium
                                    ${isSelected
                                        ? 'bg-white/20 text-white px-1.5 py-0.5 rounded-full'
                                        : 'text-white/30'
                                    }`}
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center justify-center h-[48px] border-t border-white/10 shrink-0">
                <button className="hover:opacity-70 transition-opacity p-2">
                    <ChevronDown className="w-5 h-5 text-white/60" strokeWidth={2} />
                </button>
            </div>
        </div>
    );
};
