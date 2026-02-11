import Papa from 'papaparse';
import { MarketData, ModelData, SafetyData, RevolutionData } from '../types';

export const fetchMarketData = async (): Promise<MarketData[]> => {
    const response = await fetch('/data/MTS - Year_Timeline.csv');
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
    const response = await fetch('/data/MTS - Models_Data.csv');
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
    const response = await fetch('/data/MTS - Safety_Incidents_Timeline.csv');
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
    // Note: URL encoding for space in 'time record'
    const response = await fetch('/data/time%20record/master_matrix.csv');
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
