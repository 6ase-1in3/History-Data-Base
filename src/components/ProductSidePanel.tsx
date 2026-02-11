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
    const panelClasses = `fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'
        }`;

    // Styling for overlay (optional, click to close)
    const overlayClasses = `fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
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
                <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Product Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Image Section */}
                    {model['Image URL'] && (
                        <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center p-4">
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
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
                                {model.Brand}
                            </span>
                            <span className="text-gray-500 text-sm">{model['Released Year']}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                            {model['Model #']}
                        </h1>
                        <p className="text-gray-600 mt-1 italic">
                            {model.Type}
                        </p>
                    </div>

                    {/* Highlights */}
                    {model['Positioning/Highlights'] && (
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r">
                            <h3 className="font-semibold text-amber-800 mb-1">Highlights</h3>
                            <p className="text-sm text-amber-900">
                                {model['Positioning/Highlights']}
                            </p>
                        </div>
                    )}

                    {/* Specs Grid */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-3 border-b pb-1">Specifications</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="block text-gray-500 text-xs">Blade Diameter</span>
                                <span className="font-medium text-gray-900">{model['Blade Diameter']}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 text-xs">RPM</span>
                                <span className="font-medium text-gray-900">{model.RPM}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 text-xs">Power</span>
                                <span className="font-medium text-gray-900">{model.Watt || model['Power Supply']}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 text-xs">Bevel Type</span>
                                <span className="font-medium text-gray-900">{model.Bevel}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 text-xs">Features</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {model.Laser && <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Laser</span>}
                                    {model['Soft Start'] && <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Soft Start</span>}
                                    {model.Others && <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">{model.Others}</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reference Links */}
                    {refUrls.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2 border-b pb-1">References</h3>
                            <ul className="space-y-2">
                                {refUrls.map((url, idx) => (
                                    <li key={idx}>
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-blue-600 hover:underline text-sm break-all"
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
