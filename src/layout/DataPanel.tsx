import React from 'react';
import { ModelData, MarketData } from '../types';
import MarketInfo from '../components/MarketInfo';
import ModelCatalog from '../components/ModelCatalog';
import SpecTable from '../components/SpecTable';
import { ModelInfo } from '../components/ModelInfo';

interface DataPanelProps {
    year: number;
    marketData?: MarketData;
    models: ModelData[];
    selectedModel: ModelData | null;
    onSelectModel: (model: ModelData) => void;
    selectedBrand: string;
}

export const DataPanel: React.FC<DataPanelProps> = ({
    year,
    marketData,
    models,
    selectedModel,
    onSelectModel,
    selectedBrand
}) => {
    return (
        <div className="flex-1 overflow-hidden bg-white flex h-full font-sans">
            {/* Left Main Content */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200">
                {/* Row 1: Market Info */}
                <section className="h-[200px] border-b border-slate-200 overflow-hidden shrink-0">
                    <div className="h-full px-6 py-4 overflow-y-auto">
                        <MarketInfo
                            year={year}
                            notes={marketData?.Market_Notes}
                            techNotes={marketData?.Tech_Notes}
                        />
                    </div>
                </section>

                {/* Row 2: [Red: Catalog] + [Green: SPEC + Purple: Info] */}
                <div className="flex-1 flex overflow-hidden min-h-0">
                    {/* [Red] Model Catalog - Full Height */}
                    <section className="w-[350px] flex flex-col border-r border-slate-200 overflow-hidden shrink-0">
                        <div className="flex justify-between items-center px-4 py-3 bg-[var(--slate-700)] sticky top-0 z-10 shrink-0">
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Model Catalog</h2>
                            <span className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full font-semibold">{models.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar bg-slate-50/50">
                            <ModelCatalog
                                models={models}
                                selectedModel={selectedModel}
                                onSelect={onSelectModel}
                            />
                        </div>
                    </section>

                    {/* [Green + Purple] Center Stack */}
                    <section className="flex-1 flex flex-col overflow-hidden min-w-0">
                        {/* [Green] SPEC - Flexible Top */}
                        <div className="flex-1 flex flex-col overflow-hidden border-b border-slate-200">
                            <div className="px-4 py-3 bg-[var(--slate-700)] sticky top-0 z-10 shrink-0">
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Specifications</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                <SpecTable model={selectedModel} />
                            </div>
                        </div>

                        {/* [Purple] Model Info - Fixed Bottom */}
                        <div className="h-[200px] flex flex-col overflow-hidden shrink-0 bg-white">
                            <div className="px-4 py-3 bg-[var(--slate-700)] sticky top-0 z-10 shrink-0">
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Highlights</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                <ModelInfo description={selectedModel?.["Positioning/Highlights"]} />
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* [Blue] Right Column: Logo + Preview */}
            <div className="w-[300px] flex flex-col shrink-0">
                {/* Logo (Top) */}
                <div className="h-[200px] bg-slate-50 flex items-center justify-center p-6 border-b border-slate-200 shrink-0">
                    <div className="bg-white p-4 flex items-center justify-center w-full h-full shadow-sm border border-slate-100 rounded-lg">
                        {selectedBrand === 'Global' ? (
                            <span className="text-xl font-extrabold text-slate-800 tracking-tight text-center">GLOBAL</span>
                        ) : (
                            <img
                                src={`${import.meta.env.BASE_URL || '/'}logos/${selectedBrand}.png`.replace(/\/+/g, '/').replace(':/', '://')}
                                alt={`${selectedBrand} Logo`}
                                className="max-h-[100px] max-w-full object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                        )}
                        <span className="hidden text-xl font-extrabold text-slate-800 tracking-tight">{selectedBrand}</span>
                    </div>
                </div>

                {/* Preview Image (Bottom - Full Remaining Height) */}
                <section className="flex-1 flex flex-col overflow-hidden bg-white">
                    <div className="px-4 py-3 bg-[var(--slate-700)] shrink-0">
                        <h2 className="text-sm font-bold text-white text-center uppercase tracking-wider">Preview</h2>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0 p-4">
                        {selectedModel?.['Image URL'] ? (
                            <img
                                src={selectedModel['Image URL']}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain mix-blend-multiply"
                            />
                        ) : (
                            <div className="flex flex-col items-center text-slate-300 gap-3">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border-2 border-slate-100">
                                    <span className="text-slate-300 text-2xl">?</span>
                                </div>
                                <span className="text-sm font-medium">Select a model</span>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};
