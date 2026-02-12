import React from 'react';

interface ModelInfoProps {
    description?: string;
}

export const ModelInfo: React.FC<ModelInfoProps> = ({ description }) => {
    return (
        <div className="font-sans text-[14px] leading-relaxed text-slate-700 whitespace-pre-line">
            {description || (
                <span className="text-slate-400 italic">Select a model to view highlights.</span>
            )}
        </div>
    );
};
