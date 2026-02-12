import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, Monitor } from 'lucide-react';

interface EvolutionDiagramPanelProps {
    selectedCategory: string;
    isOpen: boolean;
    onClose: () => void;
}

const VIDEO_MAP: Record<string, string> = {
    'Safety': '003 斜切鋸安規演進與技術標準史話.mp4',
    'Sliding': '001 斜切鋸前置導軌與機械臂設計演變全錄.mp4',
    'Ergonomics': '009 斜斷機人體工學與安全設計發展史.mp4',
    'Cutting': '006 斜切鋸切削規格演進與機構安全設計指南.mp4',
    'Visual': '007 斜切鋸視覺導引系統：雷射與陰影線的演進史.mp4',
    'Durability': '008 斜切鋸耐久度設計與演進史.mp4',
    'Dust': '004 斜切鋸集塵設計演進與安全規範報告.mp4',
    'Electronic': '005 斜切鋸軟啟動與電子煞車技術演進史.mp4',
    'Portable': '002 便攜式斜切鋸設計演進與安規里程碑.mp4',
};

const IMAGE_MAP: Record<string, string> = {
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

    // Determine availability
    const videoFilename = VIDEO_MAP[selectedCategory];
    const imageFilename = IMAGE_MAP[selectedCategory] || IMAGE_MAP['Global'];

    // Check if we effectively have both (assuming mapped files exist if key exists)
    // Note: IMAGE_MAP has fallback, so hasImage is always true if Global exists.
    const hasVideo = !!videoFilename;
    const hasImage = !!imageFilename;

    // View Mode State (User Request: "Priority display image")
    const [mediaType, setMediaType] = useState<'video' | 'image'>('image');

    // Sync state with props - Default to Image
    useEffect(() => {
        if (hasImage) {
            setMediaType('image');
        } else if (hasVideo) {
            setMediaType('video');
        }
    }, [selectedCategory, hasImage, hasVideo]);

    const base = import.meta.env.BASE_URL || '/';
    const videoUrl = videoFilename ? `${base}data/time record/Movie/${videoFilename}`.replace(/\/+/g, '/') : null;
    const imageUrl = `${base}data/time record/Miter_Saw_Design_Evolution_Pages/${encodeURIComponent(imageFilename)}`.replace(/\/+/g, '/').replace(':/', '://');

    const title = selectedCategory === 'Global' ? 'Design Evolution Overview' : `${selectedCategory} Evolution History`;

    // Prevent body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setViewMode('fit');
            setScale(1);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleZoomIn = () => { setScale(p => Math.min(3, p + 0.25)); setViewMode('custom'); };
    const handleZoomOut = () => { setScale(p => Math.max(0.25, p - 0.25)); setViewMode('custom'); };
    const handleFit = () => { setViewMode('fit'); setScale(1); };
    const handleActualSize = () => { setViewMode('custom'); setScale(1); };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8" onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-2xl w-full h-full max-w-[95vw] max-h-[90vh] flex flex-col overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-[var(--slate-900)] flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <Monitor size={18} className="text-blue-400" />
                            {title}
                        </h3>

                        {/* Media Toggle Switch */}
                        {hasVideo && hasImage && (
                            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 space-x-1">
                                <button
                                    onClick={() => setMediaType('image')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${mediaType === 'image' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                >
                                    <span>Image</span>
                                </button>
                                <button
                                    onClick={() => setMediaType('video')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${mediaType === 'video' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                >
                                    <span>Video</span>
                                </button>
                            </div>
                        )}
                        {!hasVideo && <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">Image Only</span>}
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Toolbar - Only show for Image Mode */}
                {mediaType === 'image' && (
                    <div className="flex items-center justify-center gap-2 py-2 bg-slate-100 border-b border-slate-200 flex-shrink-0">
                        <button onClick={handleFit} className={`p-1.5 rounded-full flex items-center gap-1 text-xs font-semibold border transition-colors ${viewMode === 'fit' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                            <Monitor size={14} /> Fit Screen
                        </button>
                        <div className="h-4 w-px bg-slate-300 mx-1"></div>
                        <button onClick={handleZoomOut} className="p-1.5 rounded-full hover:bg-white text-slate-500 transition-colors"><ZoomOut size={16} /></button>
                        <span className="text-xs font-mono w-12 text-center text-slate-500">{viewMode === 'fit' ? 'Auto' : `${Math.round(scale * 100)}%`}</span>
                        <button onClick={handleZoomIn} className="p-1.5 rounded-full hover:bg-white text-slate-500 transition-colors"><ZoomIn size={16} /></button>
                        <div className="h-4 w-px bg-slate-300 mx-1"></div>
                        <button onClick={handleActualSize} className={`p-1.5 rounded-full hover:bg-white text-slate-500 text-xs font-semibold transition-colors ${viewMode === 'custom' && scale === 1 ? 'bg-blue-50 text-blue-600' : ''}`}>1:1</button>
                    </div>
                )}

                {/* Content Container */}
                <div className="flex-1 overflow-auto bg-slate-200 flex items-center justify-center custom-scrollbar relative">
                    {mediaType === 'video' && videoUrl ? (
                        <video
                            src={videoUrl}
                            controls
                            autoPlay
                            className="max-w-full max-h-full rounded shadow-lg bg-black"
                            style={{ maxHeight: '100%' }}
                        >
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <img
                            src={imageUrl}
                            alt={title}
                            className={`transition-all duration-200 ease-out shadow-md bg-white ${viewMode === 'fit' ? 'max-w-full max-h-full object-contain' : 'max-w-none transform-gpu'}`}
                            style={viewMode === 'custom' ? { width: `${scale * 100}%`, height: 'auto' } : {}}
                            draggable={false}
                        />
                    )}
                </div>

                {/* Footer Hint */}
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-400 text-center flex-shrink-0">
                    {mediaType === 'video'
                        ? `Playing: ${videoFilename} (Source: Movie)`
                        : (viewMode === 'fit' ? 'Click 1:1 or Zoom keys to inspect details' : 'Scroll to pan • Click outside to close')}
                </div>
            </div>
        </div>
    );
};
