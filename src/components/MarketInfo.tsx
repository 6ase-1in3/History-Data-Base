import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MarketInfoProps {
    year: number;
    notes?: string;
    techNotes?: string;
}

const CollapsibleSection: React.FC<{ title: string; content?: string; defaultOpen?: boolean }> = ({ title, content, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    if (!content) return null;

    return (
        <div className="mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center w-full text-left font-bold text-black text-lg mb-2 focus:outline-none hover:text-gray-600 transition-colors"
            >
                <div className={`transform transition-transform duration-200 mr-2 ${isOpen ? 'rotate-90' : ''}`}>
                    ▶
                </div>
                {title}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="text-black text-[16px] leading-relaxed whitespace-pre-line font-sans pl-6 border-l-2 border-gray-200">
                            {content}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MarketInfo: React.FC<MarketInfoProps> = ({ year, notes, techNotes }) => {
    return (
        <div className="h-full overflow-hidden relative">
            <div className="h-full overflow-y-auto pr-4 scrollbar-thin">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={year}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <CollapsibleSection title="市場動態 (Market Info)" content={notes} defaultOpen={true} />
                        <CollapsibleSection title="技術特點 (Tech Notes)" content={techNotes} defaultOpen={false} />

                        {!notes && !techNotes && (
                            <div className="text-gray-500 italic">No data available for {year}.</div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MarketInfo;
