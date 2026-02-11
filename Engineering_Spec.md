# 🛠️ Engineering Specification: Timeline Project

## 1. System Architecture

### 1.1 Tech Stack
-   **Core**: React 18 (Vite), TypeScript.
-   **Styling**: Tailwind CSS (Utility-first).
-   **Icons**: `lucide-react`.
-   **Animation**: `framer-motion` (for transitions).
-   **Data Parsing**: `papaparse` (CSV handling).

### 1.2 Data Flow (Unidirectional)
1.  **Source**: CSV Files in `public/data/`.
2.  **Ingestion**: `src/utils/csv.ts` fetches and parses raw text.
3.  **State Management**: `useData` hook stores `marketData` and `modelData`.
4.  **Distribution**: `App.tsx` filters data (by Year/Brand) and passes props to Layout components.

---

## 2. File & Data Standards (Important)

### 2.1 File Storage Locations
All static assets and external data must follow this strict structure:

| **CSV Data** | `public/data/` | `MTS - [Type]_Data.csv` | `fetch('/data/...')` |
| **Product Images** | Remote URLs | N/A (Stored in CSV) | `<img src={url} />` |
| **Local Images** | `public/images/` | `[brand]_[model].webp` | `/images/...` |
| **Components** | `src/components/` | `PascalCase.tsx` | Import |
| **Layouts** | `src/layout/` | `PascalCase.tsx` | Import |

### 2.2 Data Pipeline (Source of Truth)
Currently, there is **no automatic sync** between the research folder (`Miter Saw/timeline`) and the app folder (`Timeline_Project/public/data`).

-   **Source of Truth**: `d:\OneDrive\Python_File\Miter Saw\timeline\` (Where research agents update data).
-   **App Asset**: `d:\OneDrive\Python_File\Miter Saw\Timeline_Project\public\data\` (Where the web app reads data).
-   **Management**: Data must be **manually copied** or synced via script from Source to App Asset to reflect changes.

### 2.3 Data Fetching Format (CSV)
The application relies on specific column names. **Do not change CSV headers** without updating `src/types/index.ts`.

**A. Models Data** (`MTS - Models_Data.csv`)
-   **Key Columns**:
    -   `Brand` (Filter Key)
    -   `Released Year` (Timeline Key)
    -   `Model #` (Display ID)
    -   `Image URL` (Visual)
    -   `Positioning/Highlights` (Description)
    -   `Watt`, `Bevel`, `Slide`, `Blade Diameter` (Specs)

**B. Market Data** (`MTS - Year_Timeline.csv`)
-   **Key Columns**:
    -   `Year` (Primary Key)
    -   `Brand` (Secondary Key - use 'Global' for general info)
    -   `Market_Notes` (Content)

### 2.3 brand-Specific Logic
-   **Filtering**: The `Brand` column in `Models_Data.csv` must match the `Brand` column in `Year_Timeline.csv` for the dynamic info link to work.
-   **Case Sensitivity**: All brand matches are **Case Sensitive** (e.g., "Bosch" != "bosch"). Proper capitalization is enforced in the CSV.

---

## 3. Code Standards

### 3.1 Component Structure
Components should generally follow this pattern:
```tsx
interface Props {
  data: DataType;
}

export const Component: React.FC<Props> = ({ data }) => {
  // Logic
  return (
    // JSX
  );
};
```

### 3.2 Error Handling
-   **Data Loading**: `App.tsx` handles `loading` and `error` states from `useData`.
-   **Missing Images**: `ModelCatalog` implements a fallback if `Image URL` is missing or broken.
-   **Empty Data**: `MarketInfo` displays a default message if no notes are found for a selected Brand/Year.

---

## 4. Updates & Maintenance
-   **Adding New Models**: Add a row to `public/data/MTS - Models_Data.csv`. No code change required.
-   **Adding New Years**: Add rows to both CSVs. The Timeline auto-detects years found in the data (Max limit set to 2025 in code, update `App.tsx` line 20 to extend).
