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
        <div className="grid grid-cols-3 gap-2.5 auto-rows-max pb-2">
            {models.map((model) => (
                <div
                    key={model['Model #']}
                    className={clsx(
                        "cursor-pointer border p-1.5 flex flex-col items-center justify-between h-[115px] rounded-lg transition-all duration-200",
                        selectedModel?.['Model #'] === model['Model #']
                            ? "border-blue-500 ring-2 ring-blue-500/30 shadow-md bg-white"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                    )}
                    onClick={() => onSelect(model)}
                    title={`${model.Brand} ${model['Model #']}`}
                >
                    <div className="flex-1 w-full flex items-center justify-center p-1 overflow-hidden">
                        {model['Image URL'] ? (
                            <img src={model['Image URL']} alt={model['Model #']} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                        ) : (
                            <div className="text-slate-300 text-[10px]">No Image</div>
                        )}
                    </div>
                    <div className="w-full text-center text-[11px] font-semibold leading-tight text-slate-700 bg-slate-50 py-1.5 border-t border-slate-100 truncate px-1 rounded-b-md">
                        {model['Model #']}
                    </div>
                </div>
            ))}
            {models.length === 0 && (
                <div className="col-span-full text-center py-8 text-slate-400 text-sm">
                    No models found.
                </div>
            )}
        </div>
    );
};

export default ModelCatalog;
