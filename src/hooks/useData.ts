import { useState, useEffect } from 'react';
import { fetchMarketData, fetchModelData, fetchSafetyData, fetchRevolutionData } from '../utils/csv';
import { MarketData, ModelData, SafetyData, RevolutionData } from '../types';

interface UseDataResult {
    marketData: MarketData[];
    modelData: ModelData[];
    safetyData: SafetyData[];
    revolutionData: RevolutionData[];
    loading: boolean;
    error: Error | null;
}

export const useData = (): UseDataResult => {
    const [marketData, setMarketData] = useState<MarketData[]>([]);
    const [modelData, setModelData] = useState<ModelData[]>([]);
    const [safetyData, setSafetyData] = useState<SafetyData[]>([]);
    const [revolutionData, setRevolutionData] = useState<RevolutionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [market, models, safety, rev] = await Promise.all([
                    fetchMarketData(),
                    fetchModelData(),
                    fetchSafetyData(),
                    fetchRevolutionData(),
                ]);
                setMarketData(market);
                setModelData(models);
                setSafetyData(safety);
                setRevolutionData(rev);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return { marketData, modelData, safetyData, revolutionData, loading, error };
};
