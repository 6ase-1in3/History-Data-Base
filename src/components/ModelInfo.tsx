import React from 'react';

interface ModelInfoProps {
    description?: string;
}

export const ModelInfo: React.FC<ModelInfoProps> = ({ description }) => {
    return (
        <div className="font-sans text-[16px] leading-relaxed text-gray-800 whitespace-pre-line">
            {description || "Internal positioning and highlight data is currently unavailable for this model."}
        </div>
    );
};
