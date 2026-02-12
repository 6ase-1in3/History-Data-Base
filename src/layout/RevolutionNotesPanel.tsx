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
    { id: 'Safety', label: 'Safety', color: 'border-l-red-500', dotColor: 'bg-red-500', lightColor: 'bg-red-50' },
    { id: 'Sliding', label: 'Sliding', color: 'border-l-blue-500', dotColor: 'bg-blue-500', lightColor: 'bg-blue-50' },
    { id: 'Ergonomics', label: 'Ergonomics', color: 'border-l-green-500', dotColor: 'bg-green-500', lightColor: 'bg-green-50' },
    { id: 'Cutting', label: 'Cutting', color: 'border-l-orange-500', dotColor: 'bg-orange-500', lightColor: 'bg-orange-50' },
    { id: 'Visual', label: 'Visual', color: 'border-l-purple-500', dotColor: 'bg-purple-500', lightColor: 'bg-purple-50' },
    { id: 'Durability', label: 'Durability', color: 'border-l-slate-500', dotColor: 'bg-slate-500', lightColor: 'bg-slate-50' },
    { id: 'Dust', label: 'Dust', color: 'border-l-teal-500', dotColor: 'bg-teal-500', lightColor: 'bg-teal-50' },
    { id: 'Electronic', label: 'Electronic', color: 'border-l-amber-500', dotColor: 'bg-amber-500', lightColor: 'bg-amber-50' },
    { id: 'Portable', label: 'Portable', color: 'border-l-indigo-500', dotColor: 'bg-indigo-500', lightColor: 'bg-indigo-50' },
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];

interface NoteBarProps {
    year: string;
    category: CategoryId;
    content: string;
    colorClass: string;
    highlightColor: string; // Passed explicitly
    selectedBrand: string;
    isFiltered: boolean; // New prop
    onModelClick: (modelId: string) => void;
}

const NoteBar: React.FC<NoteBarProps> = ({ category, content, colorClass, highlightColor, selectedBrand, isFiltered, onModelClick }) => {
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
    } else if (isFiltered) {
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
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{category}</span>
                        <span>{mainTitle}</span>
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
    // State for filtering
    const [selectedCategories, setSelectedCategories] = useState<Set<CategoryId>>(
        new Set(CATEGORIES.map(c => c.id)) // Default select all
    );

    // Diagram Modal State
    const [diagramCategory, setDiagramCategory] = useState<string | null>(null);

    const toggleCategory = (id: CategoryId) => {
        const next = new Set(selectedCategories);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        if (next.size === 0) {
            setSelectedCategories(new Set(CATEGORIES.map(c => c.id)));
            return;
        }
        setSelectedCategories(next);
    };

    const handleCategoryClick = (id: CategoryId) => {
        // Restore: Toggle by default (User wants multi-select easy access)
        // If user wants "Focus", they can click others off, or we provide a "Focus" action elsewhere?
        // Actually, let's just use toggle.
        toggleCategory(id);
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
                        const isSelected = selectedCategories.has(cat.id);
                        return (
                            <div
                                key={cat.id}
                                className={`
                                    flex items-center rounded-full border transition-all overflow-hidden
                                    ${isSelected
                                        ? 'bg-gray-800 text-white border-gray-800 shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                    }
                                `}
                            >
                                {/* Main Filter Button */}
                                <button
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className="px-3 py-1.5 text-xs font-semibold flex items-center hover:bg-opacity-80 transition-colors"
                                >
                                    {/* Explicit dot color to fix missing indicators */}
                                    <span className={`w-2 h-2 rounded-full mr-2 ${cat.dotColor}`}></span>
                                    {cat.label}
                                </button>

                                {/* Divider */}
                                <div className={`w-px h-4 ${isSelected ? 'bg-gray-600' : 'bg-gray-200'}`}></div>

                                {/* Diagram Button (Small Internal Button) */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDiagramCategory(cat.id);
                                    }}
                                    className={`
                                        px-2 py-1.5 flex items-center justify-center hover:bg-opacity-80 transition-colors
                                        ${isSelected ? 'hover:bg-gray-700 text-blue-300' : 'hover:bg-gray-100 text-gray-400 hover:text-blue-600'}
                                    `}
                                    title={`View ${cat.label} Evolution Diagram`}
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
                                            isFiltered={selectedCategories.size < CATEGORIES.length}
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
