import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MarketData, SafetyData } from '../types';

interface TimelinePanelProps {
    marketData: MarketData[];
    safetyData: SafetyData[];
    selectedBrand: string;
}

/* ── Card item type ──────────────────────────────────────── */
interface CardItem {
    title: string;
    content: string;
    variant: 'market' | 'tech' | 'issue';
}

/* ── Expanded card overlay ───────────────────────────────── */
interface ExpandedCardProps {
    title: string;
    content: string;
    variant: 'market' | 'tech' | 'issue';
    onClose: () => void;
}

const ExpandedCard: React.FC<ExpandedCardProps> = ({ title, content, variant, onClose }) => {
    const bg = variant === 'issue' ? 'bg-[#f5d0c5]' : 'bg-[#f0f0f0]';
    const headerBg = variant === 'issue' ? 'bg-[#f28b82]' : 'bg-[#d0d0d0]';
    const headerText = variant === 'issue' ? 'text-white' : 'text-black';
    const tagLabel = variant === 'issue' ? 'Issue Note' : variant === 'tech' ? 'Tech Note' : 'Market Note';

    return (
        <div className={`${bg} rounded-md shadow-xl border border-gray-300 w-[500px] max-h-[500px] overflow-hidden flex flex-col`}>
            <div className={`${headerBg} px-4 py-3 flex items-center justify-between`}>
                <span className={`font-sans font-bold text-[15px] ${headerText}`}>{tagLabel}</span>
                <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
                    <ChevronUp className="w-5 h-5" strokeWidth={2.5} />
                </button>
            </div>
            <div className="px-4 pt-3 pb-1">
                <h3 className="font-sans font-bold text-[16px] text-black">{title}</h3>
            </div>
            <div className="px-4 pb-4 overflow-y-auto flex-1">
                <p className="font-sans text-[13px] leading-relaxed text-gray-700 whitespace-pre-wrap">{content}</p>
            </div>
        </div>
    );
};

/* ── Mini card label ─────────────────────────────────────── */
interface CardLabelProps {
    label: string;
    variant: 'market' | 'tech' | 'issue';
    position: 'above' | 'below';
    onClick: () => void;
    isActive: boolean;
    cardWidth: number;
    yearWidth: number;
    isClosest: boolean;
}

const CardLabel: React.FC<CardLabelProps> = ({ label, variant, position, onClick, isActive, cardWidth, yearWidth, isClosest }) => {
    const bg = variant === 'issue' ? 'bg-[#f28b82]' : 'bg-[#e0e0e0]';
    const textColor = variant === 'issue' ? 'text-white' : 'text-black';
    const borderClass = variant === 'market' ? 'border-l-4 border-l-blue-500'
        : variant === 'tech' ? 'border-l-4 border-l-green-500'
            : '';

    // Arrow should be at the center of the year column
    const arrowLeft = yearWidth / 2 - 6; // 6 = half of arrow width (12px)

    return (
        <div className={`flex flex-col ${position === 'above' ? 'mb-0' : 'mt-0'}`}
            style={{ width: cardWidth }}
        >
            {/* Arrow pointing up (below cards) */}
            {position === 'below' && isClosest && (
                <div style={{ paddingLeft: arrowLeft }}>
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-400" />
                </div>
            )}

            <button
                onClick={onClick}
                className={`${bg} ${borderClass} flex items-center justify-between px-3 py-2 rounded-sm
                    transition-all hover:brightness-95 cursor-pointer
                    ${isActive ? 'ring-2 ring-black ring-offset-1' : ''}`}
                style={{ width: cardWidth }}
            >
                <span className={`font-sans font-bold text-[11px] ${textColor} text-left flex-1`}>
                    {label}
                </span>
                <ChevronDown
                    className={`w-3.5 h-3.5 ml-1 flex-shrink-0 ${variant === 'issue' ? 'text-white' : 'text-[#FD0000]'}
                        transition-transform ${isActive ? 'rotate-180' : ''}`}
                    strokeWidth={2.5}
                />
            </button>

            {/* Arrow pointing down (above cards) */}
            {position === 'above' && isClosest && (
                <div style={{ paddingLeft: arrowLeft }}>
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-400" />
                </div>
            )}
        </div>
    );
};

/* ── Main Panel ──────────────────────────────────────────── */
export const TimelinePanel: React.FC<TimelinePanelProps> = ({
    marketData,
    safetyData,
    selectedBrand,
}) => {
    const [stepSize, setStepSize] = useState<1 | 5>(1);
    const [activeCard, setActiveCard] = useState<{ year: number; cardIdx: number } | null>(null);
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const scrollRef = useRef<HTMLDivElement>(null);

    /* Build per-year data */
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

        return years.map(year => {
            const m = marketByYear[year];
            const cards: CardItem[] = [];

            // Market title
            const marketTitle = m?.['Market Ttile'] || '';
            if (marketTitle) {
                cards.push({ title: marketTitle, content: m?.Market_Notes || '', variant: 'market' });
            }
            // Tech title
            const techTitle = m?.['Tech Title'] || '';
            if (techTitle) {
                cards.push({ title: techTitle, content: m?.Tech_Notes || '', variant: 'tech' });
            }
            // Issue titles — mixed in, not separated
            const safety = safetyByYear[year] || [];
            safety.forEach(s => {
                cards.push({
                    title: `${s.Title}${s.Brand ? ' — ' + s.Brand : ''}`,
                    content: s.Safety_Incidents_Notes || '',
                    variant: 'issue',
                });
            });

            return { year, cards };
        });
    }, [marketData, safetyData, selectedBrand]);

    /* Step filter */
    const displayEntries = useMemo(() => {
        if (stepSize === 1) return yearEntries;
        return yearEntries.filter(e => e.year % stepSize === 0);
    }, [yearEntries, stepSize]);

    useEffect(() => { setActiveCard(null); }, [selectedBrand, stepSize]);
    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollLeft = 0; }, [selectedBrand, stepSize]);

    const handleCardToggle = useCallback((year: number, cardIdx: number) => {
        setActiveCard(prev =>
            prev && prev.year === year && prev.cardIdx === cardIdx ? null : { year, cardIdx }
        );
    }, []);

    const YEAR_WIDTH = 220;  // node spacing
    const CARD_WIDTH = 420;  // card width (overflows column, OK due to alternating)

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2.0));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#f1f1f1] relative">
            {/* Toggle & Zoom */}
            <div className="flex justify-end px-8 py-3 bg-[#f1f1f1] shrink-0 z-10">
                <div className="flex items-center gap-4">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2 select-none">
                        <span className="font-sans text-[14px] text-gray-600 font-medium">Zoom ({(zoomLevel * 100).toFixed(0)}%)</span>
                        <button
                            onClick={handleZoomOut}
                            className="w-6 h-6 flex items-center justify-center rounded bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 shadow-sm"
                            title="Zoom Out"
                        >
                            -
                        </button>
                        <button
                            onClick={handleZoomIn}
                            className="w-6 h-6 flex items-center justify-center rounded bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 shadow-sm"
                            title="Zoom In"
                        >
                            +
                        </button>
                    </div>

                    <div className="w-[1px] h-4 bg-gray-300 mx-2" />

                    {/* Display by */}
                    <div className="flex items-center gap-2 font-sans text-[14px] text-gray-600 select-none">
                        <span className="font-medium">Display by</span>
                        <button
                            onClick={() => setStepSize(1)}
                            className={`px-2 py-0.5 rounded font-bold transition-colors
                            ${stepSize === 1 ? 'bg-black text-white' : 'text-[#FD0000] hover:bg-gray-200'}`}
                        >01</button>
                        <span>/</span>
                        <button
                            onClick={() => setStepSize(5)}
                            className={`px-2 py-0.5 rounded font-bold transition-colors
                            ${stepSize === 5 ? 'bg-black text-white' : 'text-black hover:bg-gray-200'}`}
                        >05</button>
                        <span className="font-medium ml-1">years</span>
                    </div>
                </div>
            </div>

            {/* Scrollable timeline */}
            <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-hidden px-8">
                <div
                    className="relative flex flex-col"
                    style={{
                        minWidth: displayEntries.length * YEAR_WIDTH + 80,
                        height: '100%',
                        zoom: zoomLevel
                    }}
                >
                    {/* ── ABOVE row: odd years show cards here ── */}
                    <div className="flex items-end flex-1 pb-1" style={{ minHeight: 180 }}>
                        {displayEntries.map((entry) => {
                            const isOdd = entry.year % 2 !== 0;
                            return (
                                <div
                                    key={`above-${entry.year}`}
                                    className="flex flex-col items-start justify-end gap-1 overflow-visible"
                                    style={{ width: YEAR_WIDTH, flexShrink: 0 }}
                                >
                                    {isOdd && entry.cards.map((card, i) => (
                                        <CardLabel
                                            key={i}
                                            label={card.title}
                                            variant={card.variant}
                                            position="above"
                                            isActive={activeCard?.year === entry.year && activeCard?.cardIdx === i}
                                            onClick={() => handleCardToggle(entry.year, i)}
                                            cardWidth={CARD_WIDTH}
                                            yearWidth={YEAR_WIDTH}
                                            isClosest={i === entry.cards.length - 1}
                                        />
                                    ))}
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Horizontal axis + year dots ── */}
                    <div className="relative shrink-0" style={{ height: 56 }}>
                        <div
                            className="absolute top-[18px] left-0 h-[2px] bg-gray-400"
                            style={{ width: displayEntries.length * YEAR_WIDTH }}
                        />
                        <div className="flex">
                            {displayEntries.map((entry) => (
                                <div
                                    key={`dot-${entry.year}`}
                                    className="flex flex-col items-center"
                                    style={{ width: YEAR_WIDTH, flexShrink: 0 }}
                                >
                                    <div className="w-[12px] h-[12px] bg-black rounded-full relative z-[2]"
                                        style={{ marginTop: 12 }}
                                    />
                                    <span className="font-sans font-bold text-[18px] text-black mt-0.5 select-none">
                                        {entry.year}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── BELOW row: even years show cards here ── */}
                    <div className="flex items-start flex-1 pt-1" style={{ minHeight: 180 }}>
                        {displayEntries.map((entry) => {
                            const isEven = entry.year % 2 === 0;
                            return (
                                <div
                                    key={`below-${entry.year}`}
                                    className="flex flex-col items-start gap-1 overflow-visible"
                                    style={{ width: YEAR_WIDTH, flexShrink: 0 }}
                                >
                                    {isEven && entry.cards.map((card, i) => (
                                        <CardLabel
                                            key={i}
                                            label={card.title}
                                            variant={card.variant}
                                            position="below"
                                            isActive={activeCard?.year === entry.year && activeCard?.cardIdx === i}
                                            onClick={() => handleCardToggle(entry.year, i)}
                                            cardWidth={CARD_WIDTH}
                                            yearWidth={YEAR_WIDTH}
                                            isClosest={i === 0}
                                        />
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Expanded card modal ── */}
            {activeCard && (() => {
                const entry = displayEntries.find(e => e.year === activeCard.year);
                if (!entry) return null;
                const card = entry.cards[activeCard.cardIdx];
                if (!card) return null;

                return (
                    <>
                        <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setActiveCard(null)} />
                        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                            <ExpandedCard
                                title={card.title}
                                content={card.content}
                                variant={card.variant}
                                onClose={() => setActiveCard(null)}
                            />
                        </div>
                    </>
                );
            })()}
        </div>
    );
};
