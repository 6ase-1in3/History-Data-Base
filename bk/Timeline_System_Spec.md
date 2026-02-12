# Timeline Project System Specification

## 1. Data Source
- **Source File**: `PT_List - 「MTS_List HSTY」的副本_Updated.csv` (uploaded to Google Sheets)
- **Sheet Name**: `Models_Data` (Assumption: User imports CSV to this sheet)

### CSV Column Mapping
| CSV Header | Internal Key | Frontend Field | Notes |
| :--- | :--- | :--- | :--- |
| `Released Year` | `year` | `year` | Used for grouping timeline nodes |
| `Brand` | `brand` | `brand` | |
| `Model #` | `model` | `model` | |
| `Image URL` | `image` | `image` | Fallback logic required if empty |
| `Key Innovation/Significance`| `desc` | `desc` | Primary description text |
| `REF URL` | `ref` | `ref` | **New Field**: Semicolon-separated URLs |
| `Type` | `specs.type` | `specs.type` | e.g. "1.Benchtop" |
| `Blade Diameter` | `specs.blade` | `specs.blade` | |
| `Watt` / `Power Supply` | `specs.motor` | `specs.motor` | Combine values (e.g. "1800W (Corded)") |
| `Key Innovation/Significance`| `specs.feature`| `specs.feature`| Same as desc, or extraction from `Others` |

### Spec Mapping Logic (New Visualization Features)
1. **Bevel** (Source: `Bevel`)
   - `Single`, `Dual`, `No` -> Map directly.
2. **Measure** (Source: `Laser`)
   - Contains "Laser" or "Dual laser" -> `Laser`
   - Contains "Shadow" -> `LED`
   - Empty or "-" -> `None`
3. **Power Supply** (Source: `Power Supply`)
   - Contains "Corded" -> `Corded`
   - Contains "Cordless" -> `Cordless` (Extract Voltage: 18V, 36V, 54V, 60V, FlexVolt...)
4. **Blade Diameter** (Source: `Blade Range` & `Blade Diameter`)
   - Preferred: Use `Blade Range` column directly (matches User's 6 categories).
   - Fallback: Map `Blade Diameter` number to range.

## 2. API Contract (Google Apps Script)
**Endpoint**: `doGet(e)`
**Parameter**: `action=getTimelineData`

### Response Schema (JSON)
```json
[
  {
    "year": 2007,
    "title": "Era Title", // Optional, from Year_Timeline sheet
    "description": "Market Summary", // Optional
    "models": [
      {
        "id": "unique_id_generated",
        "brand": "Bosch",
        "model": "GCM 12 SD",
        "image": "https://...",
        "desc": "First Axial-Glide system...",
        "specs": {
          "type": "Benchtop",
          "blade": "305mm",
          "motor": "1800W",
          "feature": "Axial-Glide"
        },
        "ref": "https://..."
      }
    ]
  }
]
```

## 3. Frontend Requirements
- **Async Loading**: `timelineData` must be fetched asynchronously.
- **Loading State**: Show spinner/skeleton while fetching.
- **Error Handling**: Graceful fallback if GAS is unreachable.
- **Specs Display**: `side-panel` must parse and display `specs` object values.
- **Reference Link**: `side-panel` must allow clicking to external source.
- **Reference Link**: `side-panel` must allow clicking to external source.

## 4. Layout & Interaction Logic
### Timeline Spacing Algorithm
- **Goal**: Consistent spacing ($X$) between nodes within the same years.
- **Year Width Calculation**:
  $$
  Width_{Year} = (N_{models} - 1) \times ZoomLevel
  $$
  - If $N=1$, Width = 0 (single point).
  - If $N=5$, Width = $4 \times ZoomLevel$.
  - Padding is added between years to prevent collision.

### Image Naming Convention
To ensure images auto-load correctly from `assets/`:
- **Format**: `{Brand}_{Model}_{Year}.jpg` (or .png)
- **Sanitization**: Spaces replaced by `_`, special chars removed.
- **Examples**:
    - `Makita_LS1019_2017.jpg`
    - `Bosch_GCM12SD_2010.jpg`
