import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface MenuBarProps {
    reportType: string;
    category: string;
    selectedBrand: string;
    brands: string[];
    onReportTypeChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onBrandChange: (value: string) => void;
}

function Dropdown({
    value,
    options,
    onChange,
    isOpen,
    onToggle,
}: {
    value: string;
    options: string[];
    onChange: (value: string) => void;
    isOpen: boolean;
    onToggle: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div className="relative z-50" ref={ref}>
            <button
                onClick={onToggle}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition-all duration-200 group"
            >
                <span className="font-semibold text-[15px] text-white whitespace-nowrap tracking-wide">
                    {value}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-blue-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    strokeWidth={2.5}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white shadow-xl border border-slate-200 rounded-xl overflow-hidden z-20 min-w-[180px] py-1">
                    {options.map((option) => (
                        <button
                            key={option}
                            onClick={() => {
                                onChange(option);
                            }}
                            className={`block w-full px-4 py-2.5 text-left text-sm font-medium transition-colors
                                ${option === value
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export const MenuBar: React.FC<MenuBarProps> = ({
    reportType,
    category,
    selectedBrand,
    brands,
    onReportTypeChange,
    onCategoryChange,
    onBrandChange,
}) => {
    const [openId, setOpenId] = useState<string | null>(null);
    const barRef = useRef<HTMLDivElement>(null);

    // Close on any click outside the MenuBar
    useEffect(() => {
        if (!openId) return;
        const handler = (e: MouseEvent) => {
            if (barRef.current && !barRef.current.contains(e.target as Node)) {
                setOpenId(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [openId]);

    const toggle = (id: string) => setOpenId(prev => prev === id ? null : id);
    const select = (id: string, value: string, cb: (v: string) => void) => {
        cb(value);
        setOpenId(null);
    };

    return (
        <div ref={barRef} className="bg-[var(--slate-900)] h-[64px] w-full relative flex items-center justify-between px-8 shadow-lg shrink-0">
            {/* Left: App Title */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-extrabold text-sm">M</span>
                </div>
                <span className="text-white font-bold text-lg tracking-tight hidden sm:inline">MTS Database</span>
            </div>

            {/* Center: Controls */}
            <div className="flex items-center gap-1">
                <Dropdown
                    value={reportType}
                    options={['Revolution', 'Year Report', 'Time Notes', 'Time Line']}
                    onChange={(v) => select('report', v, onReportTypeChange)}
                    isOpen={openId === 'report'}
                    onToggle={() => toggle('report')}
                />

                <div className="h-5 w-px bg-white/20 mx-1" />

                <Dropdown
                    value={category}
                    options={['Miter Saw', 'Circular Saw', 'Table Saw', 'Band Saw']}
                    onChange={(v) => select('category', v, onCategoryChange)}
                    isOpen={openId === 'category'}
                    onToggle={() => toggle('category')}
                />

                <div className="h-5 w-px bg-white/20 mx-1" />

                <Dropdown
                    value={selectedBrand}
                    options={['Global', ...brands]}
                    onChange={(v) => select('brand', v, onBrandChange)}
                    isOpen={openId === 'brand'}
                    onToggle={() => toggle('brand')}
                />
            </div>

            {/* Right: Spacer (future use: settings/avatar) */}
            <div className="w-[120px]" />
        </div>
    );
};
