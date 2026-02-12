import React, { useState, useMemo } from 'react';
import { ChevronDown, BarChart2, Info } from 'lucide-react';
import { RevolutionData } from '../types';
import { EvolutionDiagramPanel } from './EvolutionDiagramPanel'; // Now a Modal
// Component handling ProductSidePanel logic is handled in App.tsx? 
// No, looking at App.tsx again, it renders ProductSidePanel OUTSIDE.
// So we just fire onModelClick.

interface RevolutionNotesPanelProps {
    data: RevolutionData[];
    selectedBrand: string;
    onModelClick: (modelId: string) => void;
}

// Category Configuration (Label + Color)
// Explicit Tailwind classes required for JIT
const CATEGORIES = [
    { id: 'Ergonomics', label: 'Ergonomics', color: 'border-l-green-500', dotColor: 'bg-green-500', lightColor: 'bg-green-50' },
    { id: 'Portable', label: 'Portable', color: 'border-l-indigo-500', dotColor: 'bg-indigo-500', lightColor: 'bg-indigo-50' },
    { id: 'Sliding', label: 'Sliding', color: 'border-l-blue-500', dotColor: 'bg-blue-500', lightColor: 'bg-blue-50' },
    { id: 'Cutting', label: 'Cutting', color: 'border-l-orange-500', dotColor: 'bg-orange-500', lightColor: 'bg-orange-50' },
    { id: 'Electronic', label: 'Electronic', color: 'border-l-amber-500', dotColor: 'bg-amber-500', lightColor: 'bg-amber-50' },
    { id: 'Visual', label: 'Visual', color: 'border-l-purple-500', dotColor: 'bg-purple-500', lightColor: 'bg-purple-50' },
    { id: 'Dust', label: 'Dust', color: 'border-l-teal-500', dotColor: 'bg-teal-500', lightColor: 'bg-teal-50' },
    { id: 'Durability', label: 'Durability', color: 'border-l-slate-500', dotColor: 'bg-slate-500', lightColor: 'bg-slate-50' },
    { id: 'Safety', label: 'Safety', color: 'border-l-red-500', dotColor: 'bg-red-500', lightColor: 'bg-red-50' },
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];

interface NoteBarProps {
    year: string;
    category: CategoryId;
    content: string;
    colorClass: string;
    highlightColor: string; // Passed explicitly
    selectedBrand: string;
    isHighlighted: boolean; // Controls background color
    onModelClick: (modelId: string) => void;
}

const NoteBar: React.FC<NoteBarProps> = ({ category, content, colorClass, highlightColor, selectedBrand, isHighlighted, onModelClick }) => {
    const [isOpen, setIsOpen] = useState(true);

    const titleMatch = content.match(/«(.*?)(:|$)/);
    const mainTitle = titleMatch ? titleMatch[1] : `${category} Update`;

    const brandMatch = content.match(/【(.*?)】/);
    const noteBrand = brandMatch ? brandMatch[1] : '';

    // Brand Highlight (Standard)
    const isBrandHighlighted = selectedBrand !== 'Global' && noteBrand === selectedBrand;

    // Category Filter Highlight (User Request: "Indicator click -> Card bg change")
    // When filtered, apply a light background tint matching the category color
    // Extract base color from border class (e.g., 'border-l-red-500' -> 'bg-red-50')


    // Determine final background style (Brand highlight takes precedence for visibility)
    let containerStyle = 'bg-white';
    if (isBrandHighlighted) {
        containerStyle = 'ring-2 ring-yellow-400 bg-yellow-50';
    } else if (isHighlighted) {
        containerStyle = highlightColor;
    }

    const renderText = (text: string) => {
        const cleanText = text.replace(/[«»]/g, '');
        const parts = cleanText.split(/(\[.*?\]|〖.*?〗)/g);
        return parts.map((part, i) => {
            const match = part.match(/^[\[〖](.*?)[\]〗]$/);
            if (match) {
                const rawModelId = match[1];
                if (rawModelId.includes('/')) {
                    const models = rawModelId.split('/');
                    return (
                        <span key={i}>
                            {models.map((model, modelIndex) => (
                                <React.Fragment key={modelIndex}>
                                    {modelIndex > 0 && '/'}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onModelClick(model); }}
                                        className="text-blue-600 hover:text-blue-800 font-bold hover:underline px-0.5 rounded cursor-pointer"
                                        title="View Product Details"
                                    >
                                        {model}
                                    </button>
                                </React.Fragment>
                            ))}
                        </span>
                    );
                } else {
                    return (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); onModelClick(rawModelId); }}
                            className="text-blue-600 hover:text-blue-800 font-bold hover:underline px-0.5 rounded cursor-pointer"
                            title="View Product Details"
                        >
                            {rawModelId}
                        </button>
                    );
                }
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div className="mb-2">
            <div className={`${containerStyle} border text-left rounded-lg shadow-sm overflow-hidden ${colorClass} border-l-[6px] transition-all hover:shadow-md`}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 bg-transparent hover:bg-black/5 transition-colors text-left`}
                >
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                        <span className="text-sm font-black text-slate-700 uppercase tracking-widest mr-2">{category}</span>
                        <span className="font-medium text-slate-900">{mainTitle}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                    <div className="px-4 py-3 text-sm text-slate-700 bg-white/50 border-t border-slate-100 leading-relaxed">
                        {renderText(content)}
                    </div>
                )}
            </div>
        </div>
    );
};

export const RevolutionNotesPanel: React.FC<RevolutionNotesPanelProps> = ({ data, selectedBrand, onModelClick }) => {
    // State for filtering (Visibility)
    const [selectedCategories, setSelectedCategories] = useState<Set<CategoryId>>(
        new Set(CATEGORIES.map(c => c.id)) // Default select all (Show all)
    );

    // State for highlighting (Background Color)
    const [highlightedCategories, setHighlightedCategories] = useState<Set<CategoryId>>(
        new Set() // Default none highlighted (White background)
    );

    // Diagram Modal State
    const [diagramCategory, setDiagramCategory] = useState<string | null>(null);

    const toggleFilter = (id: CategoryId) => {
        const next = new Set(selectedCategories);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        // User requested ability to deselect all (to select just one), so we allow empty state.
        setSelectedCategories(next);
    };

    const selectAll = () => setSelectedCategories(new Set(CATEGORIES.map(c => c.id)));
    const clearAll = () => setSelectedCategories(new Set());

    const toggleHighlight = (id: CategoryId) => {
        const next = new Set(highlightedCategories);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setHighlightedCategories(next);
    };


    const yearEntries = useMemo(() => {
        return data.map(row => {
            const year = row.Year;
            if (!year) return null;
            const notes: { category: CategoryId; content: string; color: string }[] = [];
            CATEGORIES.forEach(cat => {
                const content = row[cat.id as keyof RevolutionData];
                if (content && content.trim() !== '' && selectedCategories.has(cat.id)) {
                    notes.push({ category: cat.id, content: content as string, color: cat.color });
                }
            });
            if (notes.length === 0) return null;
            return { year, notes };
        }).filter(entry => entry !== null);
    }, [data, selectedCategories]);

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-[var(--slate-50)] h-full">
            {/* Filter Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-10">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Filter Dimensions</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={selectAll}
                            className="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                            title="Select All Filters"
                        >
                            Select All
                        </button>
                        <button
                            onClick={clearAll}
                            className="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded transition-colors"
                            title="Clear All Filters"
                        >
                            Clear
                        </button>
                        <div className="w-px h-4 bg-slate-300 mx-1"></div>
                        <button
                            onClick={() => setDiagramCategory('Global')}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                            <Info size={14} />
                            <span>Overview Diagram</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map(cat => {
                        const isFiltered = selectedCategories.has(cat.id);
                        const isHighlighted = highlightedCategories.has(cat.id);

                        return (
                            <div
                                key={cat.id}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all"
                            >
                                {/* Toggle Button (Indicator -> Highlight) */}
                                <button
                                    onClick={() => toggleHighlight(cat.id)}
                                    className={`
                                        w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                                        ${isHighlighted ? `border-transparent ${cat.dotColor}` : 'border-slate-300 bg-slate-50 hover:border-slate-400'}
                                    `}
                                    title={`Highlight ${cat.label}`}
                                >
                                    {isHighlighted && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                </button>

                                {/* Label (Text -> Filter) */}
                                <button
                                    onClick={() => toggleFilter(cat.id)}
                                    className={`text-xs ml-1 px-2 py-1 rounded transition-all duration-200 ${selectedCategories.size < CATEGORIES.length && isFiltered
                                        ? 'bg-slate-800 text-white font-bold shadow-md transform scale-105'
                                        : 'text-slate-600 font-semibold hover:bg-slate-100'
                                        }`}
                                    title={`Filter by ${cat.label}`}
                                >
                                    {cat.label}
                                </button>

                                {/* Vertical Divider */}
                                <div className="w-px h-3 bg-slate-200 mx-1"></div>

                                {/* Chart Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDiagramCategory(cat.id);
                                    }}
                                    className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    title={`View ${cat.label} Diagram`}
                                >
                                    <BarChart2 size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-2 text-xs text-slate-400 text-right">
                    (Click filter to toggle • Click chart icon for diagram)
                </div>
            </div>

            {/* Timeline Scroll Area */}
            <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-12">
                    {yearEntries.map((entry, idx) => (
                        <div key={idx} className="relative">
                            <div className="flex items-center mb-4">
                                <div className="bg-[var(--slate-900)] text-white font-bold text-lg px-4 py-1.5 rounded-r-lg shadow-md -ml-6">
                                    {entry.year}
                                </div>
                                <div className="h-px bg-slate-300 flex-1 ml-4"></div>
                            </div>
                            <div className="pl-4 border-l-2 border-slate-200 ml-4 space-y-3">
                                {entry.notes.map((note, noteIdx) => {
                                    const catConfig = CATEGORIES.find(c => c.id === note.category);
                                    return (
                                        <NoteBar
                                            key={noteIdx}
                                            year={entry.year}
                                            category={note.category}
                                            content={note.content}
                                            colorClass={note.color}
                                            highlightColor={catConfig?.lightColor || 'bg-gray-50'}
                                            selectedBrand={selectedBrand}
                                            isHighlighted={highlightedCategories.has(note.category)}
                                            onModelClick={onModelClick}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    {yearEntries.length === 0 && (
                        <div className="text-center text-slate-400 py-20">No records found.</div>
                    )}
                </div>
            </div>

            {/* Diagram Modal */}
            <EvolutionDiagramPanel
                isOpen={!!diagramCategory}
                selectedCategory={diagramCategory || 'Global'}
                onClose={() => setDiagramCategory(null)}
            />
        </div>
    );
};
