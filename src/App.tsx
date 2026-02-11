import { useState, useMemo, useEffect } from 'react';
import { useData } from './hooks/useData';
import { MenuBar } from './layout/MenuBar';
import { Timeline } from './layout/Timeline';
import { DataPanel } from './layout/DataPanel';
import { TimeNotesPanel } from './layout/TimeNotesPanel';
import { TimelinePanel } from './layout/TimelinePanel';
import { RevolutionNotesPanel } from './layout/RevolutionNotesPanel';
import { ProductSidePanel } from './components/ProductSidePanel';
import { ModelData } from './types';
import { Loader2 } from 'lucide-react';

function App() {
    const { marketData, modelData, safetyData, revolutionData, loading, error } = useData();

    const [reportType, setReportType] = useState('Year Report');
    const [category, setCategory] = useState('Miter Saw');
    const [selectedBrand, setSelectedBrand] = useState('Global');

    const [selectedYear, setSelectedYear] = useState<number>(2025);
    const [selectedModel, setSelectedModel] = useState<ModelData | null>(null);
    const [sidePanelModel, setSidePanelModel] = useState<ModelData | null>(null);

    // Derive unique years
    const years = useMemo(() => {
        const marketYears = marketData.map(d => parseInt(d.Year)).filter(y => !isNaN(y));
        const modelYears = modelData.map(d => parseInt(d['Released Year'])).filter(y => !isNaN(y));
        const allYears = Array.from(new Set([...marketYears, ...modelYears]))
            .filter(y => y <= 2025) // Explicitly exclude 2026 as requested
            .sort((a, b) => b - a);
        return allYears.length > 0 ? allYears : [2025, 2024, 2023];
    }, [marketData, modelData]);

    // Ensure selected year is valid
    useEffect(() => {
        if (years.length > 0) {
            if (!selectedYear || !years.includes(selectedYear)) {
                setSelectedYear(years[0]);
            }
        }
    }, [years, selectedYear]);

    // Filter models by Year first
    const modelsByYear = useMemo(() => {
        return modelData.filter(d => parseInt(d['Released Year']) === selectedYear);
    }, [modelData, selectedYear]);

    // Extract available brands from ALL data (not just current year)
    const availableBrands = useMemo(() => {
        // Get all unique brands from the full dataset
        const brands = Array.from(new Set(modelData.map(m => m.Brand))).filter(Boolean).sort();

        // Fallback: If data is empty (e.g. loading), show common brands
        if (brands.length === 0) {
            return ['Bosch', 'DeWalt', 'Delta', 'Einhell', 'Festool', 'Kobalt', 'Makita', 'Metabo', 'MetaboHPT', 'Milwaukee', 'Ridgid', 'Scheppach'];
        }
        return brands;
    }, [modelData]);

    // Filter models by Brand
    const filteredModels = useMemo(() => {
        if (selectedBrand === 'Global') return modelsByYear;
        return modelsByYear.filter(d => d.Brand === selectedBrand);
    }, [modelsByYear, selectedBrand]);

    // Calculate model counts per year based on selected Brand
    const countsByYear = useMemo(() => {
        const counts: Record<number, number> = {};
        const relevantModels = selectedBrand === 'Global'
            ? modelData
            : modelData.filter(m => m.Brand === selectedBrand);

        relevantModels.forEach(model => {
            const y = parseInt(model['Released Year']);
            if (!isNaN(y)) {
                counts[y] = (counts[y] || 0) + 1;
            }
        });
        return counts;
    }, [modelData, selectedBrand]);

    const currentMarketData = useMemo(() => {
        const yearData = marketData.filter(d => parseInt(d.Year) === selectedYear);

        if (selectedBrand === 'Global') {
            return yearData.find(d => d.Brand === 'Global') || yearData[0];
        } else {
            // Try to find specific brand data, fallback to Global if missing
            return yearData.find(d => d.Brand === selectedBrand) ||
                yearData.find(d => d.Brand === 'Global');
        }
    }, [marketData, selectedYear, selectedBrand]);

    // Reset brand selection when year changes (optional, but good UX if brand isn't available)
    // Or keep it if we want "Persistent Filter". Let's keep it for now unless brand doesn't exist.
    useEffect(() => {
        if (selectedBrand !== 'Global' && !availableBrands.includes(selectedBrand)) {
            setSelectedBrand('Global');
        }
    }, [availableBrands, selectedBrand]);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-white text-gray-500 font-sans">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <span>Loading...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-red-50 text-red-500 font-sans">
                <span>Error: {error.message}</span>
            </div>
        );
    }

    const renderContent = () => {
        switch (reportType) {
            case 'Time Notes':
                return (
                    <TimeNotesPanel
                        marketData={marketData}
                        safetyData={safetyData}
                        selectedBrand={selectedBrand}
                    />
                );
            case 'Time Line':
                return (
                    <TimelinePanel
                        marketData={marketData}
                        safetyData={safetyData}
                        selectedBrand={selectedBrand}
                    />
                );
            case 'Revolution':
                return (
                    <RevolutionNotesPanel
                        data={revolutionData}
                        selectedBrand={selectedBrand}
                        onModelClick={(modelId) => {
                            // Find model by Model # logic
                            // Normalize somewhat? Or exact match?
                            // Try exact match first
                            const found = modelData.find(m => m['Model #'] === modelId);
                            // Also try removing brackets if they leaked in? No, logic handles it.
                            // Maybe trim?
                            if (found) {
                                setSidePanelModel(found);
                            } else {
                                console.warn('Model not found:', modelId);
                            }
                        }}
                    />
                );
            default: // 'Year Report'
                return (
                    <div className="flex flex-1 overflow-hidden">
                        <Timeline
                            selectedYear={selectedYear}
                            onYearSelect={(year) => {
                                setSelectedYear(year);
                                setSelectedModel(null);
                            }}
                            availableYears={years}
                            counts={countsByYear}
                        />

                        <DataPanel
                            year={selectedYear}
                            marketData={currentMarketData}
                            models={filteredModels}
                            selectedModel={selectedModel}
                            onSelectModel={setSelectedModel}
                            selectedBrand={selectedBrand}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-white">
            <MenuBar
                reportType={reportType}
                category={category}
                selectedBrand={selectedBrand}
                brands={availableBrands}
                onReportTypeChange={setReportType}
                onCategoryChange={setCategory}
                onBrandChange={setSelectedBrand}
            />

            {renderContent()}

            <ProductSidePanel
                isOpen={!!sidePanelModel}
                onClose={() => setSidePanelModel(null)}
                model={sidePanelModel}
            />
        </div>
    );
}

export default App;
