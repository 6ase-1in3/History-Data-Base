export interface MarketData {
    Year: string;
    Title: string;
    Market_Notes: string;
    Tech_Notes: string;
    Brand: string;
    'Market Ttile'?: string; // CSV header has typo
    'Tech Title'?: string;
}

export interface SafetyData {
    Year: string;
    Title: string;
    Safety_Incidents_Notes: string;
    Brand: string;
    Model: string;
}

export interface ModelData {
    Image: string;
    "Blade Range": string;
    Total: string;
    "Update Date": string;
    "Image URL": string;
    "Released Year": string;
    "Model #": string;
    Brand: string;
    Type: string;
    Bevel: string;
    Slide: string;
    "Blade Diameter": string;
    Watt: string;
    RPM: string;
    "Power Supply": string;
    "Soft Start": string;
    Laser: string;
    Others: string;
    Price: string;
    "REF URL": string;
    "Positioning/Highlights"?: string;
}

export interface TimelineYear {
    year: number;
    marketData?: MarketData;
    models: ModelData[];
}

export interface RevolutionData {
    Year: string;
    Safety: string;
    Sliding: string;
    Ergonomics: string;
    Cutting: string;
    Visual: string;
    Durability: string;
    Dust: string;
    Electronic: string;
    Portable: string;
}

