import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { MarketData, SafetyData } from '../types';

interface TimeNotesPanelProps {
    marketData: MarketData[];
    safetyData: SafetyData[];
    selectedBrand: string;
}

/* ── Accordion bar ────────────────────────────────────────── */
interface NoteBarProps {
    label: string;
    content: string;
    variant: 'market' | 'tech' | 'issue';
}

const NoteBar: React.FC<NoteBarProps> = ({ label, content, variant }) => {
    const [open, setOpen] = useState(false);

    const bgClass = variant === 'issue'
        ? 'bg-red-500/90'
        : variant === 'market'
            ? 'bg-[var(--slate-700)]'
            : 'bg-[var(--slate-600)]';

    const borderClass = variant === 'market' ? 'border-l-4 border-l-blue-400'
        : variant === 'tech' ? 'border-l-4 border-l-emerald-400'
            : 'border-l-4 border-l-red-400';

    const hasContent = !!content && content.trim().length > 0;

    if (!hasContent) {
        return (
            <div className="mb-1.5">
                <div className={`${bgClass} ${borderClass} w-full flex items-center justify-between px-4 py-3 rounded-lg`}>
                    <span className="font-sans font-semibold text-[14px] text-white text-left flex-1">
                        {label}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-1.5">
            {/* collapsed bar */}
            <button
                onClick={() => setOpen(!open)}
                className={`${bgClass} ${borderClass} w-full flex items-center justify-between px-4 py-3 rounded-lg
                    transition-all hover:brightness-110`}
            >
                <span className="font-sans font-semibold text-[14px] text-white text-left flex-1">
                    {label}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-white/60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    strokeWidth={2.5}
                />
            </button>

            {/* expanded content */}
            {open && (
                <div className="bg-white border border-slate-200 px-5 py-4 text-[14px] leading-relaxed text-slate-700 font-sans whitespace-pre-wrap rounded-b-lg -mt-1">
                    {content}
                </div>
            )}
        </div>
    );
};

/* ── Main panel ───────────────────────────────────────────── */
export const TimeNotesPanel: React.FC<TimeNotesPanelProps> = ({
    marketData,
    safetyData,
    selectedBrand,
}) => {
    const [stepSize, setStepSize] = useState<1 | 5>(1);

    /* Build per-year aggregated data */
    const yearEntries = useMemo(() => {
        const filtered = selectedBrand === 'Global'
            ? marketData.filter(d => d.Brand === 'Global')
            : marketData.filter(d => d.Brand === selectedBrand);

        const yearSet = new Set<number>();
        filtered.forEach(d => {
            const y = parseInt(d.Year);
            if (!isNaN(y) && y <= 2025) yearSet.add(y);
        });

        const brandSafety = selectedBrand === 'Global'
            ? safetyData
            : safetyData.filter(d => d.Brand === selectedBrand);

        brandSafety.forEach(d => {
            const parts = d.Year.split('-').map(s => parseInt(s.trim()));
            parts.forEach(y => { if (!isNaN(y) && y >= 2000 && y <= 2025) yearSet.add(y); });
        });

        const years = Array.from(yearSet).sort((a, b) => a - b);

        const marketByYear: Record<number, MarketData> = {};
        filtered.forEach(d => {
            const y = parseInt(d.Year);
            if (!isNaN(y)) marketByYear[y] = d;
        });

        const safetyByYear: Record<number, SafetyData[]> = {};

        brandSafety.forEach(d => {
            const range = d.Year.split('-').map(s => parseInt(s.trim()));
            const startY = range[0];
            const endY = range.length > 1 ? range[range.length - 1] : startY;
            if (isNaN(startY)) return;
            for (let y = startY; y <= endY; y++) {
                if (!safetyByYear[y]) safetyByYear[y] = [];
                safetyByYear[y].push(d);
            }
        });

        return years.map(year => ({
            year,
            market: marketByYear[year],
            safety: safetyByYear[year] || [],
        }));
    }, [marketData, safetyData, selectedBrand]);

    /* Apply step filter */
    const displayEntries = useMemo(() => {
        if (stepSize === 1) return yearEntries;
        return yearEntries.filter(e => e.year % 5 === 0);
    }, [yearEntries, stepSize]);

    return (
        <div className="flex-1 overflow-y-auto bg-[var(--slate-50)] relative custom-scrollbar">
            {/* ── Top-right toggle ── */}
            <div className="sticky top-0 z-10 flex justify-end px-8 py-3 bg-[var(--slate-50)] border-b border-slate-200">
                <div className="flex items-center gap-2 font-sans text-[13px] text-slate-500 select-none">
                    <span className="font-medium">Display by</span>
                    <button
                        onClick={() => setStepSize(1)}
                        className={`px-2.5 py-1 rounded-full font-bold text-xs transition-all
                            ${stepSize === 1 ? 'bg-[var(--slate-900)] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        01
                    </button>
                    <span className="text-slate-300">/</span>
                    <button
                        onClick={() => setStepSize(5)}
                        className={`px-2.5 py-1 rounded-full font-bold text-xs transition-all
                            ${stepSize === 5 ? 'bg-[var(--slate-900)] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        05
                    </button>
                    <span className="font-medium ml-1">years</span>
                </div>
            </div>

            {/* ── Timeline rows ── */}
            <div className="relative pl-[160px] pr-8 pb-16">
                {/* Vertical line */}
                <div className="absolute left-[148px] top-0 bottom-0 w-[2px] bg-slate-300" />

                {displayEntries.map((entry) => {
                    // STRICT MAPPING
                    const marketTitle = entry.market?.['Market Ttile'] || '';
                    const techTitle = entry.market?.['Tech Title'] || '';
                    const marketNotes = entry.market?.Market_Notes || '';
                    const techNotes = entry.market?.Tech_Notes || '';

                    const hasMarket = !!marketTitle || !!marketNotes;
                    const hasTech = !!techTitle || !!techNotes;
                    const hasIssue = entry.safety.length > 0;

                    return (
                        <div key={entry.year} className="relative mb-12">
                            {/* Year label + dot */}
                            <div className="absolute left-[-162px] top-0 flex items-center gap-4">
                                <span className="font-sans font-extrabold text-[28px] text-slate-900 w-[120px] text-right tracking-tight">
                                    {entry.year}
                                </span>
                                <div className="w-[28px] flex items-center justify-center">
                                    <div className="w-3 h-3 bg-[var(--brand-blue)] rounded-full shadow-sm shadow-blue-300" />
                                </div>
                            </div>

                            {/* Note bars */}
                            <div className="ml-4 max-w-[800px]">
                                {hasMarket && (
                                    <NoteBar
                                        label={marketTitle || 'Market Note'}
                                        content={marketNotes}
                                        variant="market"
                                    />
                                )}
                                {hasTech && (
                                    <NoteBar
                                        label={techTitle || 'Tech Note'}
                                        content={techNotes}
                                        variant="tech"
                                    />
                                )}
                                {hasIssue && entry.safety.map((s, i) => (
                                    <NoteBar
                                        key={i}
                                        label={`${s.Title}${s.Brand ? ' — ' + s.Brand : ''}`}
                                        content={s.Safety_Incidents_Notes}
                                        variant="issue"
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
