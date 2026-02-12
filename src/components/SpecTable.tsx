import React from 'react';
import { ModelData } from '../types';

interface SpecTableProps {
    model: ModelData | null;
}

const SpecRow: React.FC<{ label: string; value?: string | React.ReactNode; isEven: boolean }> = ({ label, value, isEven }) => (
    <>
        <span className={`text-slate-500 font-medium py-1 px-2 ${isEven ? 'bg-slate-50' : ''}`}>{label}</span>
        <span className={`font-semibold text-slate-900 truncate py-1 px-2 ${isEven ? 'bg-slate-50' : ''}`}>{value || '—'}</span>
    </>
);

const SpecTable: React.FC<SpecTableProps> = ({ model }) => {
    if (!model) {
        return (
            <div className="text-slate-400 italic mt-10 text-center">
                Select a model to view specifications
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-x-8 gap-y-0 text-[14px] font-sans">
            {/* Left Column Specs */}
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0 content-start">
                <SpecRow label="Model:" value={model['Model #']} isEven={false} />
                <SpecRow label="Brand:" value={model.Brand} isEven={true} />
                <SpecRow label="Bevel:" value={model.Bevel} isEven={false} />
                <SpecRow label="Slide:" value={model.Slide} isEven={true} />
                <SpecRow label="Power:" value={`${model.Watt || '—'} / ${model['Power Supply'] || '—'}`} isEven={false} />
            </div>

            {/* Right Column Specs */}
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0 content-start">
                <SpecRow label="Blade:" value={model['Blade Diameter']} isEven={false} />
                <SpecRow label="Measure:" value={model.Laser} isEven={true} />
                <SpecRow label="Soft Start:" value={model['Soft Start']} isEven={false} />
                <SpecRow label="Others:" value={model.Others} isEven={true} />
                <span className="text-slate-500 font-medium py-1 px-2">Ref:</span>
                <a
                    href={model['REF URL']}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline font-semibold truncate py-1 px-2"
                >
                    Source ↗
                </a>
            </div>
        </div>
    );
};

export default SpecTable;
