import React from 'react';
import { ModelData } from '../types';

interface SpecTableProps {
    model: ModelData | null;
}

const SpecTable: React.FC<SpecTableProps> = ({ model }) => {
    if (!model) {
        return (
            <div className="text-gray-400 italic mt-10">
                Select a model to view specifications
            </div>
        );
    }

    const specs = [
        { label: "Model", value: model['Model #'] },
        { label: "Brand", value: model.Brand },
        { label: "Bevel", value: model.Bevel },
        { label: "Slide", value: model.Slide },
        { label: "Power", value: `${model.Watt} / ${model['Power Supply']}` },
        { label: "Blade", value: model['Blade Diameter'] },
        { label: "Measure", value: model.Laser }, // Renamed from Laser to Measure to match reference
        { label: "Soft Start", value: model['Soft Start'] },
        { label: "Others", value: model.Others },
    ];

    return (
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[15px] font-sans">
            {/* Left Column Specs */}
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 content-start">
                <React.Fragment>
                    <span className="text-gray-600 font-medium">Model:</span>
                    <span className="font-bold text-gray-900 truncate">{model['Model #']}</span>
                </React.Fragment>
                <React.Fragment>
                    <span className="text-gray-600 font-medium">Brand:</span>
                    <span className="font-bold text-gray-900 truncate">{model.Brand}</span>
                </React.Fragment>
                <React.Fragment>
                    <span className="text-gray-600 font-medium">Bevel:</span>
                    <span className="font-bold text-gray-900 truncate">{model.Bevel}</span>
                </React.Fragment>
                <React.Fragment>
                    <span className="text-gray-600 font-medium">Slide:</span>
                    <span className="font-bold text-gray-900 truncate">{model.Slide}</span>
                </React.Fragment>
                <React.Fragment>
                    <span className="text-gray-600 font-medium">Power:</span>
                    <span className="font-bold text-gray-900 truncate">{model.Watt} / {model['Power Supply']}</span>
                </React.Fragment>
            </div>

            {/* Right Column Specs */}
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 content-start">
                <React.Fragment>
                    <span className="text-gray-600 font-medium">Blade:</span>
                    <span className="font-bold text-gray-900 truncate">{model['Blade Diameter']}</span>
                </React.Fragment>
                <React.Fragment>
                    <span className="text-gray-600 font-medium">Measure:</span>
                    <span className="font-bold text-gray-900 truncate">{model.Laser}</span>
                </React.Fragment>
                <React.Fragment>
                    <span className="text-gray-600 font-medium">Soft Start:</span>
                    <span className="font-bold text-gray-900 truncate">{model['Soft Start']}</span>
                </React.Fragment>
                <React.Fragment>
                    <span className="text-gray-600 font-medium">Others:</span>
                    <span className="font-bold text-gray-900 truncate">{model.Others}</span>
                </React.Fragment>
                <React.Fragment>
                    <span className="text-gray-600 font-medium">Ref:</span>
                    <a
                        href={model['REF URL']}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-bold truncate"
                    >
                        Source ↗
                    </a>
                </React.Fragment>
            </div>
        </div>
    );
};

export default SpecTable;
