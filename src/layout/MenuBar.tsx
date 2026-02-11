import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface MenuBarProps {
    reportType: string;
    category: string;
    selectedBrand: string; // Changed from region
    brands: string[];      // New prop
    onReportTypeChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onBrandChange: (value: string) => void; // Changed from onRegionChange
}

function Dropdown({
    value,
    options,
    onChange
}: {
    value: string;
    options: string[];
    onChange: (value: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex flex-col items-center justify-center gap-1 px-4 py-2 hover:bg-[#c0c0c0] transition-colors"
            >
                <span className="font-sans font-black text-[24px] text-black whitespace-nowrap">
                    {value}
                </span>
                <ChevronDown className="w-5 h-5 text-[#FD0000]" strokeWidth={3} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 bg-white shadow-lg border border-gray-200 rounded-md overflow-hidden z-20 min-w-[150px]">
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                                className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-black font-sans"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export const MenuBar: React.FC<MenuBarProps> = ({
    reportType,
    category,
    selectedBrand,
    brands,
    onReportTypeChange,
    onCategoryChange,
    onBrandChange,
}) => {
    return (
        <div className="bg-[#d6d6d6] h-[94px] w-full relative flex items-center px-12 border-b border-[#d1d1d1] shrink-0">
            <div className="flex items-center gap-10">
                <Dropdown
                    value={reportType}
                    options={['Year Report', 'Time Notes', 'Time Line', 'Revolution']}
                    onChange={onReportTypeChange}
                />

                <div className="h-[44px] w-0 border-l-2 border-white" />

                <Dropdown
                    value={category}
                    options={['Miter Saw', 'Circular Saw', 'Table Saw', 'Band Saw']}
                    onChange={onCategoryChange}
                />

                <div className="h-[44px] w-0 border-l-2 border-white" />

                <Dropdown
                    value={selectedBrand}
                    options={['Global', ...brands]}
                    onChange={onBrandChange}
                />
            </div>
        </div>
    );
};

