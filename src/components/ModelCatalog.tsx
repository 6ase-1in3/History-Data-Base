import React from 'react';
import { ModelData } from '../types';
import clsx from 'clsx';

interface ModelCatalogProps {
    models: ModelData[];
    selectedModel: ModelData | null;
    onSelect: (model: ModelData) => void;
}

const ModelCatalog: React.FC<ModelCatalogProps> = ({ models, selectedModel, onSelect }) => {
    return (
        <div className="grid grid-cols-3 gap-2 auto-rows-max pb-2">
            {models.map((model) => (
                <div
                    key={model['Model #']}
                    className={clsx(
                        "cursor-pointer border p-1 flex flex-col items-center justify-between h-[110px] bg-white hover:shadow-sm transition-all duration-200",
                        selectedModel?.['Model #'] === model['Model #'] ? "border-blue-600 ring-1 ring-blue-600 shadow-md" : "border-gray-300 hover:border-gray-400"
                    )}
                    onClick={() => onSelect(model)}
                    title={`${model.Brand} ${model['Model #']}`}
                >
                    <div className="flex-1 w-full flex items-center justify-center p-1 overflow-hidden">
                        {model['Image URL'] ? (
                            <img src={model['Image URL']} alt={model['Model #']} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                        ) : (
                            <div className="text-gray-300 text-[10px]">No Image</div>
                        )}
                    </div>
                    <div className="w-full text-center text-[11px] font-medium leading-tight text-gray-700 bg-gray-50 py-1 border-t border-gray-100 truncate px-1">
                        {model['Model #']}
                    </div>
                </div>
            ))}
            {models.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-400 text-sm">
                    No models found.
                </div>
            )}
        </div>
    );
};

export default ModelCatalog;
