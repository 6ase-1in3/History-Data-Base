import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { ModelData } from '../types';

interface ProductSidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    model: ModelData | null;
}

export const ProductSidePanel: React.FC<ProductSidePanelProps> = ({ isOpen, onClose, model }) => {
    // Styling for the panel container
    const panelClasses = `fixed top-0 right-0 h-full w-[420px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto custom-scrollbar ${isOpen ? 'translate-x-0' : 'translate-x-full'
        }`;

    // Styling for overlay
    const overlayClasses = `fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`;

    if (!model) return null;

    // Parse URL for simplified display
    const refUrls = model['REF URL'] ? model['REF URL'].split(';') : [];

    return (
        <>
            {/* Overlay */}
            <div className={overlayClasses} onClick={onClose} />

            {/* Side Panel */}
            <div className={panelClasses}>
                {/* Header / Close Button */}
                <div className="sticky top-0 bg-[var(--slate-900)] z-10 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Product Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-white/60" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Image Section */}
                    {model['Image URL'] && (
                        <div className="w-full aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center p-4">
                            <img
                                src={model['Image URL']}
                                alt={model['Model #']}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    {/* Title Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                {model.Brand}
                            </span>
                            <span className="text-slate-500 text-sm">{model['Released Year']}</span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 leading-tight tracking-tight">
                            {model['Model #']}
                        </h1>
                        <p className="text-slate-500 mt-1 italic text-sm">
                            {model.Type}
                        </p>
                    </div>

                    {/* Highlights */}
                    {model['Positioning/Highlights'] && (
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                            <h3 className="font-semibold text-amber-800 mb-1 text-sm">Highlights</h3>
                            <p className="text-sm text-amber-900 leading-relaxed">
                                {model['Positioning/Highlights']}
                            </p>
                        </div>
                    )}

                    {/* Specs Grid */}
                    <div>
                        <h3 className="font-semibold text-slate-800 mb-3 border-b border-slate-200 pb-2 text-sm uppercase tracking-wider">Specifications</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-slate-50 rounded-lg p-3">
                                <span className="block text-slate-500 text-xs font-medium">Blade Diameter</span>
                                <span className="font-semibold text-slate-900 mt-0.5 block">{model['Blade Diameter'] || '—'}</span>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3">
                                <span className="block text-slate-500 text-xs font-medium">RPM</span>
                                <span className="font-semibold text-slate-900 mt-0.5 block">{model.RPM || '—'}</span>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3">
                                <span className="block text-slate-500 text-xs font-medium">Power</span>
                                <span className="font-semibold text-slate-900 mt-0.5 block">{model.Watt || model['Power Supply'] || '—'}</span>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3">
                                <span className="block text-slate-500 text-xs font-medium">Bevel Type</span>
                                <span className="font-semibold text-slate-900 mt-0.5 block">{model.Bevel || '—'}</span>
                            </div>
                            <div className="col-span-2 bg-slate-50 rounded-lg p-3">
                                <span className="block text-slate-500 text-xs font-medium mb-1.5">Features</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {model.Laser && <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-700">Laser</span>}
                                    {model['Soft Start'] && <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-700">Soft Start</span>}
                                    {model.Others && <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-700">{model.Others}</span>}
                                    {!model.Laser && !model['Soft Start'] && !model.Others && <span className="text-slate-400 text-xs italic">None listed</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reference Links */}
                    {refUrls.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-2 border-b border-slate-200 pb-2 text-sm uppercase tracking-wider">References</h3>
                            <ul className="space-y-2">
                                {refUrls.map((url, idx) => (
                                    <li key={idx}>
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline text-sm break-all"
                                        >
                                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                            {url}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
