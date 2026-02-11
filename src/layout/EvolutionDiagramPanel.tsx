import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, Maximize, Monitor } from 'lucide-react';

interface EvolutionDiagramPanelProps {
    selectedCategory: string;
    isOpen: boolean;
    onClose: () => void;
}

const CATEGORY_MAP: Record<string, string> = {
    'Safety': '003 斜切鋸安規演進與技術標準史話.jpg',
    'Sliding': '001 斜切鋸前置導軌與機械臂設計演變全錄.jpg',
    'Ergonomics': '009 斜斷機人體工學與安全設計發展史.jpg',
    'Cutting': '006 斜切鋸切削規格演進與機構安全設計指南.jpg',
    'Visual': '007 斜切鋸視覺導引系統：雷射與陰影線的演進史.jpg',
    'Durability': '008 斜切鋸耐久度設計與演進史.jpg',
    'Dust': '004 斜切鋸集塵設計演進與安全規範報告.jpg',
    'Electronic': '005 斜切鋸軟啟動與電子煞車技術演進史.jpg',
    'Portable': '002 便攜式斜切鋸設計演進與安規里程碑.jpg',
    'Global': '0000.jpg',
};

export const EvolutionDiagramPanel: React.FC<EvolutionDiagramPanelProps> = ({ selectedCategory, isOpen, onClose }) => {
    const [viewMode, setViewMode] = useState<'fit' | 'custom'>('fit');
    const [scale, setScale] = useState(1);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Reset zoom on open
            setViewMode('fit');
            setScale(1);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const fileName = CATEGORY_MAP[selectedCategory] || CATEGORY_MAP['Global'];
    const imageUrl = `/data/time record/Miter_Saw_Design_Evolution_Pages/${encodeURIComponent(fileName)}`;
    const title = selectedCategory === 'Global' ? 'Design Evolution Overview' : `${selectedCategory} Evolution History`;

    const handleZoomIn = () => {
        setScale(prev => Math.min(3, prev + 0.25));
        setViewMode('custom');
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(0.25, prev - 0.25));
        setViewMode('custom');
    };

    const handleFit = () => {
        setViewMode('fit');
        setScale(1); // Reset scale mainly for internal consistency
    };

    const handleActualSize = () => {
        setViewMode('custom');
        setScale(1);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8" onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-2xl w-full h-full max-w-[95vw] max-h-[90vh] flex flex-col overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full bg-blue-500`}></span>
                        {title}
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-center gap-2 py-2 bg-gray-100 border-b border-gray-200 shadow-inner flex-shrink-0">
                    <button
                        onClick={handleFit}
                        className={`p-1.5 rounded flex items-center gap-1 text-xs font-semibold border ${viewMode === 'fit' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                        title="Fit to Screen"
                    >
                        <Monitor size={14} /> Fit Screen
                    </button>
                    <div className="h-4 w-px bg-gray-300 mx-1"></div>
                    <button onClick={handleZoomOut} className="p-1.5 rounded hover:bg-white text-gray-600" title="Zoom Out">
                        <ZoomOut size={16} />
                    </button>
                    <span className="text-xs font-mono w-12 text-center text-gray-500">
                        {viewMode === 'fit' ? 'Auto' : `${Math.round(scale * 100)}%`}
                    </span>
                    <button onClick={handleZoomIn} className="p-1.5 rounded hover:bg-white text-gray-600" title="Zoom In">
                        <ZoomIn size={16} />
                    </button>
                    <div className="h-4 w-px bg-gray-300 mx-1"></div>
                    <button
                        onClick={handleActualSize}
                        className={`p-1.5 rounded hover:bg-white text-gray-600 text-xs font-semibold ${viewMode === 'custom' && scale === 1 ? 'bg-blue-50 text-blue-600' : ''}`}
                        title="Actual Size (100%)"
                    >
                        1:1
                    </button>
                </div>

                {/* Image Container */}
                <div className="flex-1 overflow-auto bg-gray-200 flex items-center justify-center custom-scrollbar relative">
                    <img
                        src={imageUrl}
                        alt={title}
                        className={`
                   transition-all duration-200 ease-out shadow-md bg-white
                   ${viewMode === 'fit' ? 'max-w-full max-h-full object-contain' : 'max-w-none transform-gpu'}
               `}
                        style={viewMode === 'custom' ? { width: `${scale * 100}%`, height: 'auto' } : {}}
                        draggable={false}
                    />
                </div>

                {/* Footer Hint */}
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-slate-400 text-center flex-shrink-0">
                    {viewMode === 'fit' ? 'Click 1:1 or Zoom keys to inspect details' : 'Scroll to pan • Click outside to close'}
                </div>
            </div>
        </div>
    );
};
