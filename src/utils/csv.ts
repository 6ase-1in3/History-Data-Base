import Papa from 'papaparse';
import { MarketData, ModelData, SafetyData, RevolutionData } from '../types';

// Helper function to get the correct path with base URL
const getDataPath = (path: string) => {
    const base = import.meta.env.BASE_URL || '/';
    return `${base}${path}`.replace(/\/+/g, '/');
};

export const fetchMarketData = async (): Promise<MarketData[]> => {
    const response = await fetch(getDataPath('data/MTS - Year_Timeline_ZH.csv'));
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data as MarketData[]),
            error: (error: Error) => reject(error),
        });
    });
};

export const fetchModelData = async (): Promise<ModelData[]> => {
    // Note: Model data likely stays the same or should we check for ZH? User didn't provide Models_Data_ZH.
    // Assuming Models_Data is universal or user only wanted Market/Safety updated.
    // Spec says: "integrate Chinese CSV data ... Year Timeline and Safety Incidents CSV files".
    // It implies Models Data remains as is (specs are often universal).
    const response = await fetch(getDataPath('data/MTS - Models_Data.csv'));
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data as ModelData[]),
            error: (error: Error) => reject(error),
        });
    });
};

export const fetchSafetyData = async (): Promise<SafetyData[]> => {
    const response = await fetch(getDataPath('data/MTS - Safety_Incidents_Timeline_ZH.csv'));
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data as SafetyData[]),
            error: (error: Error) => reject(error),
        });
    });
};

export const fetchRevolutionData = async (): Promise<RevolutionData[]> => {
    // New ZH matrix
    const response = await fetch(getDataPath('data/master_matrix_ZH.csv'));
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data as RevolutionData[]),
            error: (error: Error) => reject(error),
        });
    });
};
